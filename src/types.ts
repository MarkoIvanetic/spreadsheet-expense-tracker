export interface NotificationData {
  price: string;
  vendor: string;
}

export interface RowData {
  id: number;
  row: [string, number, string, string];
}

export interface CategoryData {
  name: string;
  color: string;
  id: string;
}

export interface BudgetData {
  totalExpenses: number;
  necessitiesBudget: number;
  wantsBudget: number;
  necessitiesExpense: number;
  wantsExpense: number;
}

export interface NotificationData {
  price: string;
  vendor: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface TrackerContextProps {
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
  inputValue: number;
  setInputValue: (value: number) => void;
  description: string;
  setDescription: (desc: string) => void;
  selectedUnverifiedId: number | undefined;
  setSelectedUnverifiedExpenseId: (id: number | undefined) => void;
  removeUnverifiedExpense: (id: number) => void;
  resetInputs: () => void;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}
