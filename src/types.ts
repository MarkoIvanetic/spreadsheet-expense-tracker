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

export interface Category {
  id: string;
  name: string;
  color: string;
}
