import { GoogleGenAI, Type } from "@google/genai";
import { createHash } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

import { CATEGORY_KEYS, EXTRACTION_PROMPT } from "@/utils/geminiPrompt";
import { stripStatementText } from "@/utils/statementStrip";
import {
  GeminiImportEntry,
  GeminiImportResult,
  ImportFilePayload,
} from "@/types/import";
import { categoriesLocal } from "@/utils/localData";

// base64 payloads are ~33% larger than the files themselves
export const config = {
  api: { bodyParser: { sizeLimit: "15mb" } },
  // must exceed GEMINI_TIMEOUT_MS below, or the platform kills the
  // function before the model has a chance to time out on its own
  maxDuration: 60,
};

const MIN_TEXT_LENGTH = 100; // below this the PDF is likely scanned → send bytes

// Gemini extraction can be slow for large/scanned statements — give it room,
// but stay under `maxDuration` so the client timeout fires before the platform
// kills the whole function.
const GEMINI_TIMEOUT_MS = 55_000;

// --- extraction cache: same files + month + model within 10 minutes is
// served from memory instead of re-billing Gemini (e.g. retry after a
// failure in a later import step). Module-scope, so it survives requests
// in dev and warm serverless containers.
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 20;
const extractionCache = new Map<
  string,
  { result: GeminiImportResult; expiresAt: number }
>();

const cacheKeyFor = (
  files: ImportFilePayload[],
  statementMonth: string,
  model: string,
): string => {
  const hash = createHash("sha256");
  hash.update(statementMonth).update(model);
  files.forEach((f) => hash.update(f.name).update(f.base64));
  return hash.digest("hex");
};

const pruneCache = () => {
  const now = Date.now();
  extractionCache.forEach((entry, key) => {
    if (entry.expiresAt <= now) extractionCache.delete(key);
  });
  // drop oldest entries if something ever grows the map unexpectedly
  while (extractionCache.size > CACHE_MAX_ENTRIES) {
    const oldest = extractionCache.keys().next().value;
    if (!oldest) break;
    extractionCache.delete(oldest);
  }
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    entries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, enum: CATEGORY_KEYS },
          value: { type: Type.NUMBER },
          description: { type: Type.STRING },
          date: { type: Type.STRING }, // YYYY-MM-DD
          direction: { type: Type.STRING, enum: ["debit", "credit"] },
          type: {
            type: Type.STRING,
            enum: [
              "expense",
              "income",
              "transfer",
              "refund",
              "fee",
              "cash_withdrawal",
              "unknown",
            ],
          },
          currency: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          needsReview: { type: Type.BOOLEAN },
          reviewReason: { type: Type.STRING, nullable: true },
          sourceFingerprint: { type: Type.STRING },
        },
        required: [
          "category",
          "value",
          "description",
          "date",
          "direction",
          "type",
          "currency",
          "confidence",
          "needsReview",
          "sourceFingerprint",
        ],
      },
    },
    warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: {
      type: Type.OBJECT,
      properties: {
        transactionsFound: { type: Type.NUMBER },
        currenciesFound: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["transactionsFound", "currenciesFound"],
    },
  },
  required: ["entries", "warnings", "summary"],
};

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

// A 504 DEADLINE_EXCEEDED from Gemini is transient — the model was still
// generating when Google cut the connection. Retry a couple of times with
// backoff before giving up.
const isRetryableGeminiError = (error: any): boolean => {
  const msg = String(error?.message ?? "");
  return (
    error?.status === 504 ||
    error?.code === 504 ||
    /DEADLINE_EXCEEDED|deadline expired|UNAVAILABLE|503/i.test(msg)
  );
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Stage 1 — deterministic, no AI, no tokens: turn each uploaded file into the
 * smallest possible prompt part (slimmed table text; raw bytes only as a
 * fallback for scanned PDFs).
 */
const fileToPart = async (
  file: ImportFilePayload,
): Promise<{ part: GeminiPart; note: string }> => {
  // CSV / plain text: never send as a document
  if (file.mimeType.startsWith("text/") || /\.csv$/i.test(file.name)) {
    const text = Buffer.from(file.base64, "base64").toString("utf-8");
    return {
      part: { text: `--- Statement: ${file.name} (csv) ---\n${text}` },
      note: `${file.name}: csv, ${text.length} chars`,
    };
  }

  if (file.mimeType === "application/pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(
      new Uint8Array(Buffer.from(file.base64, "base64")),
    );
    const { text } = await extractText(pdf, { mergePages: true });

    // scanned PDF (no text layer) → let Gemini vision read the bytes
    if (text.trim().length < MIN_TEXT_LENGTH) {
      return {
        part: { inlineData: { mimeType: file.mimeType, data: file.base64 } },
        note: `${file.name}: no text layer, sent as PDF bytes`,
      };
    }

    const { kind, stripped } = stripStatementText(text);
    return {
      part: {
        text: `--- Statement: ${file.name} (${kind}) ---\n${stripped}`,
      },
      note: `${file.name}: ${kind}, ${text.length} -> ${stripped.length} chars`,
    };
  }

  // unknown binary type — pass through as bytes
  return {
    part: { inlineData: { mimeType: file.mimeType, data: file.base64 } },
    note: `${file.name}: unknown type, sent as bytes`,
  };
};

/** Never insert raw model output anywhere — coerce/flag anything off. */
const sanitizeEntries = (entries: GeminiImportEntry[]): GeminiImportEntry[] =>
  entries
    .filter(
      (e) =>
        e &&
        Number.isFinite(e.value) &&
        e.value > 0 &&
        typeof e.description === "string" &&
        e.description.trim().length > 0,
    )
    .map((e) => {
      const validCategory = e.category in categoriesLocal;
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(e.date);
      const flagged = !validCategory || !validDate;

      return {
        ...e,
        category: validCategory ? e.category : "no_idea",
        confidence: Math.min(1, Math.max(0, e.confidence ?? 0)),
        needsReview: e.needsReview || flagged,
        reviewReason: flagged
          ? e.reviewReason || "Invalid category or date from model"
          : (e.reviewReason ?? null),
      };
    });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: 405, message: "Method not allowed. Only POST." });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res
      .status(500)
      .json({ status: 500, message: "GEMINI_API_KEY is not configured." });
  }

  try {
    const { files, statementMonth } = req.body as {
      files: ImportFilePayload[];
      statementMonth: string; // "YYYY-MM"
    };

    if (!Array.isArray(files) || files.length === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "No statement files provided." });
    }
    if (!/^\d{4}-\d{2}$/.test(statementMonth || "")) {
      return res.status(400).json({
        status: 400,
        message: "statementMonth must be in YYYY-MM format.",
      });
    }

    const model = process.env.GEMINI_IMPORT_MODEL || "gemini-flash-latest";

    // serve identical requests from the 10-minute cache — no Gemini call
    const cacheKey = cacheKeyFor(files, statementMonth, model);
    const cached = extractionCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.status(200).json({
        ...cached.result,
        warnings: [...cached.result.warnings, "served from 10-minute cache"],
      });
    }

    // Stage 1: deterministic strip (cheap, no tokens)
    const prepared = await Promise.all(files.map(fileToPart));

    // Stage 2: Gemini classifies + normalizes the slimmed rows.
    // Stream the response: the non-streaming endpoint has a fixed server-side
    // deadline that large/scanned statements blow past (504 DEADLINE_EXCEEDED),
    // whereas streaming keeps the connection alive as tokens are produced.
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const request = {
      model,
      contents: [
        {
          role: "user",
          parts: [
            { text: EXTRACTION_PROMPT(statementMonth) },
            ...prepared.map(({ part }) => part),
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0, // deterministic extraction
        httpOptions: { timeout: GEMINI_TIMEOUT_MS },
      },
    };

    const MAX_ATTEMPTS = 3;
    let text = "";
    for (let attempt = 1; ; attempt++) {
      try {
        const stream = await ai.models.generateContentStream(request);
        let acc = "";
        for await (const chunk of stream) {
          acc += chunk.text ?? "";
        }
        text = acc;
        break;
      } catch (error: any) {
        if (attempt >= MAX_ATTEMPTS || !isRetryableGeminiError(error)) throw error;
        console.warn(
          `Gemini attempt ${attempt} failed (${error?.message}), retrying...`,
        );
        await sleep(1000 * attempt); // linear backoff: 1s, 2s
      }
    }

    const raw = JSON.parse(text || "{}") as GeminiImportResult;
    const entries = sanitizeEntries(raw.entries ?? []);

    const result: GeminiImportResult = {
      entries,
      warnings: [
        ...(raw.warnings ?? []),
        ...prepared.map(({ note }) => note), // strip stats, useful for debugging
      ],
      summary: raw.summary ?? {
        transactionsFound: entries.length,
        currenciesFound: [],
      },
    };

    pruneCache();
    extractionCache.set(cacheKey, {
      result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Gemini import failed:", error?.message);
    return res.status(500).json({
      status: 500,
      message: "AI extraction failed.",
      error: error?.message ?? "Unknown error",
    });
  }
}
