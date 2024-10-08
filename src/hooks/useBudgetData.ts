import { BudgetData } from "@/types";
import { useQuery } from "@tanstack/react-query";

// Define the fetch function for the budget data
const fetchBudgetData = async (): Promise<BudgetData> => {
  const response = await fetch("/api/budget");
  if (!response.ok) {
    throw new Error("Error fetching budget data");
  }
  return response.json();
};

// Create a custom hook that uses useQuery to fetch the budget data
export const useBudgetData = () => {
  return useQuery<BudgetData>({
    queryKey: ["api/budget"],
    queryFn: fetchBudgetData,
  });
};
