interface Config {
  // Data range for category retrieval.
  CATEGORY_DATA_RANGE: string;
  // Suffix of the budget data range.
  BUDGET_RANGE_SUFFIX: string;
  // Suffix of the expense data range.
  EXPENSE_RANGE_SUFFIX: string;
  // Suffix of the all rows data range.
  ALL_ROWS_RANGE_SUFFIX: string;
}

export const config: Config = {
  CATEGORY_DATA_RANGE: "Data!A:C",
  BUDGET_RANGE_SUFFIX: "K8:K9",
  EXPENSE_RANGE_SUFFIX: "G19:G21",
  ALL_ROWS_RANGE_SUFFIX: "A:D",
};
