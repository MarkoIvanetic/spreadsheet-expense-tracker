import { categoriesLocal } from "@/utils/localData";

export type ImportCategoryKey = keyof typeof categoriesLocal;

export type ImportTransactionType =
  | "expense"
  | "income"
  | "transfer"
  | "refund"
  | "fee"
  | "cash_withdrawal"
  | "unknown";

export interface GeminiImportEntry {
  // --- maps directly to the sheet row ---
  category: ImportCategoryKey; // key from categoriesLocal, "no_idea" as fallback
  value: number; // positive absolute amount
  description: string; // merchant / original description
  date: string; // ISO YYYY-MM-DD

  // --- review-screen metadata only (never written to the sheet) ---
  direction: "debit" | "credit";
  type: ImportTransactionType;
  currency: string; // ISO 4217, normally EUR
  confidence: number; // 0..1
  needsReview: boolean;
  reviewReason: string | null;
  sourceFingerprint: string; // for duplicate detection
}

export interface GeminiImportResult {
  entries: GeminiImportEntry[];
  warnings: string[];
  summary: {
    transactionsFound: number;
    currenciesFound: string[];
  };
}

export interface ImportFilePayload {
  name: string;
  mimeType: string; // "application/pdf" | "text/csv"
  base64: string; // raw base64, no data: prefix
}
