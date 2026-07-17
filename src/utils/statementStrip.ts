// Server-side statement slimming: reduce extracted PDF text to just the
// transaction table(s) before sending it to Gemini. Pure string functions —
// no Node APIs — so they are unit-testable anywhere.
//
// NOTE: unpdf/pdf.js returns each page as one flat, space-joined string, so
// the strippers first re-insert line breaks at known row markers and only
// then filter the resulting lines.

export type StatementKind = "revolut" | "pbz" | "unknown";

export const detectStatementKind = (text: string): StatementKind => {
  if (/Revolut Bank UAB/i.test(text)) return "revolut";
  if (/PRIVREDNA BANKA ZAGREB|NOVI SALDO|Tekući račun/i.test(text))
    return "pbz";
  return "unknown";
};

// deterministic privacy scrubbing — do not rely on the model for this
const maskSensitive = (line: string): string =>
  line
    // IBANs (with or without spaces): HR48 2340 0093 2193 9240 8 / LT7232...
    .replace(/\b[A-Z]{2}\d{2}[ ]?[\d ]{10,30}\d\b/g, "[IBAN]")
    // masked card numbers: 416598******1000
    .replace(/\b\d{4,6}\*{4,8}\d{4}\b/g, "[CARD]");

/**
 * Revolut EUR statement. Re-break the flat text before every transaction
 * date ("Jul 1, 2026 ...") and every To:/From:/Reference:/Card: marker,
 * then keep only transaction rows (date + € amount) and their
 * To:/From:/Reference: continuation lines. Page chrome, the legal
 * paragraph, the balance summary and Card: lines are dropped.
 */
const stripRevolut = (text: string): string => {
  const out: string[] = [];

  // period header, e.g. "Account transactions from July 1, 2026 to July 17, 2026"
  const period = text.match(/Account transactions from [A-Z][a-z]+ \d{1,2}, \d{4} to [A-Z][a-z]+ \d{1,2}, \d{4}/);
  if (period) out.push(period[0]);
  out.push("Date | Description | Money out | Money in | Balance");

  const lines = text
    // break before transaction dates ("Jul 1, 2026" — short month names only,
    // so "July 1, 2026" inside the period header does not split)
    .replace(/(?=[A-Z][a-z]{2} \d{1,2}, \d{4})/g, "\n")
    // break before continuation markers (colon required — "Reference: From
    // Gordan B" must not split at the bare "From") and page chrome anchors
    .replace(/(?=(To|From|Reference|Card): )/g, "\n")
    .replace(/(?=IBAN\s|BIC\s)/g, "\n")
    .replace(/(?=EUR Statement)/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    // page chrome starts with the generated-on date and carries the bank name
    if (/Revolut Bank UAB|Report lost or stolen/.test(line)) continue;
    if (/^Card:|^IBAN|^BIC/.test(line)) continue;

    // transaction rows: start with a date and contain at least one € amount
    if (/^[A-Z][a-z]{2} \d{1,2}, \d{4}\s/.test(line) && line.includes("€")) {
      out.push(maskSensitive(line));
      continue;
    }

    // merchant / direction continuation lines
    if (/^(To|From|Reference):/.test(line)) {
      out.push(maskSensitive(line));
      continue;
    }
  }

  return out.join("\n");
};

/**
 * PBZ (Privredna banka Zagreb) izvod. Slice the flat text between
 * "STANJE PRETHODNOG IZVJEŠĆA" (opening balance) and "NOVI SALDO"
 * (closing balance), re-break before every "DD.MM." transaction date and
 * every chrome anchor, then drop the chrome lines.
 */
const stripPBZ = (text: string): string => {
  const startMatch = text.match(/STANJE PRETHODNOG IZVJEŠĆA[^\d]*[\d.,]+\s?[\d.,]*/);
  const startIdx = startMatch
    ? text.indexOf(startMatch[0]) + startMatch[0].length
    : 0;
  const endIdx = text.indexOf("NOVI SALDO");

  const region = text.slice(startIdx, endIdx === -1 ? undefined : endIdx);

  const chrome = [
    /^Eventualni gubitak/,
    // footer only (mixed case) — ALL-CAPS "PRIVREDNA BANKA ZAGREB" can be a
    // real counterparty on a transaction row and must survive
    /^Privredna banka Zagreb/,
    /^Radnička cesta/,
    /^Zatezna kamatna/,
    /^Obavijest o poslovanju/,
    /^Poruke i novine/i,
    /^Stranica/,
    /^Datum\s+Referenca/,
    /^Tekući račun/,
    /^Izvadak br/,
    /^Razdoblje/,
    /^Intesa Sanpaolo/,
    /^SLUŠAMO/,
    /^\d{2}\/\d{2}$/, // stray page numbers like "02/02"
  ];

  const lines = region
    // break before transaction dates "01.06. " (not "31.05.2026.")
    .replace(/(?<!\d)(?=\d{2}\.\d{2}\.(?!\d))/g, "\n")
    // break before chrome anchors so they become their own (droppable) lines
    .replace(
      /(?=Eventualni gubitak|Privredna banka Zagreb|Radnička cesta|Zatezna kamatna|Obavijest o poslovanju|Stranica|Datum\s+Referenca|Tekući račun|Izvadak br|Razdoblje|Intesa Sanpaolo|SLUŠAMO)/g,
      "\n"
    )
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return lines
    .filter((l) => !chrome.some((re) => re.test(l)))
    .map(maskSensitive)
    .join("\n");
};

/**
 * Slim a statement's extracted text down to its transaction table.
 * Unknown formats pass through (masked) so the model still gets a chance.
 */
export const stripStatementText = (
  text: string
): { kind: StatementKind; stripped: string } => {
  const kind = detectStatementKind(text);

  const stripped =
    kind === "revolut"
      ? stripRevolut(text)
      : kind === "pbz"
      ? stripPBZ(text)
      : maskSensitive(text.replace(/\s+/g, " ").trim());

  return { kind, stripped };
};
