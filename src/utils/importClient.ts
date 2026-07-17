// Client-side helpers for the AI bank-statement import.
// (Kept separate from apiServer.ts so googleapis never enters the bundle.)

import {
  GeminiImportEntry,
  GeminiImportResult,
  ImportFilePayload,
} from "@/types/import";
import { categoriesLocal } from "@/utils/localData";

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    // strip the "data:...;base64," prefix
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const extractStatements = async (
  files: File[],
  statementMonth: string
): Promise<GeminiImportResult> => {
  const payload: ImportFilePayload[] = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      base64: await fileToBase64(file),
    }))
  );

  const response = await fetch("/api/import/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files: payload, statementMonth }),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw {
      message: responseBody.message || "AI extraction failed.",
      error: responseBody.error || null,
    };
  }

  return responseBody as GeminiImportResult;
};

// client-safe copy of the sheet date format (DD/MM/YYYY HH:MM:SS);
// the original lives in apiServer.ts which must not be bundled client-side
export const formatDateForSheet = (isoDate: string): string => {
  const date = new Date(`${isoDate}T12:00:00`); // neutral midday, no TZ edge
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year} 12:00:00`;
};

// [category label, value, description, date] — same shape trackexternal writes
export const entryToSheetValues = (
  entry: GeminiImportEntry
): [string, number, string, string] => {
  // map the category key -> display label; anything unknown falls back to "No idea"
  const categoryLabel =
    categoriesLocal[entry.category] ?? categoriesLocal.no_idea;

  return [
    categoryLabel,
    entry.value,
    `AI: ${entry.description}`,
    formatDateForSheet(entry.date),
  ];
};

/**
 * Queue extracted entries into the unverified sheet — they show up in
 * "Pending auto expenses" for the normal review/confirm flow.
 */
export const addEntriesToUnverified = async (entries: GeminiImportEntry[]) => {
  const response = await fetch("api/unverified", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ values: entries.map(entryToSheetValues) }),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw {
      message: responseBody.message || "Failed to queue entries for review.",
      error: responseBody.error || null,
    };
  }

  return responseBody;
};
