import { useStats } from "@/hooks/useStats";
import { Category } from "@/types";

import { useState } from "react";

const fetcher = async (url: string, options: Record<any, any>) => {
  const res = await fetch(url, options);
  const data = await res.json();

  if (res.status !== 200) {
    throw new Error(data.message);
  }
  return data;
};

export function useSaveExpense() {
  const [isLoading, setIsLoading] = useState(false);
  const [reset, setReset] = useState(0);
  const [stats, setStats] = useStats();

  const saveExpense = async (
    category: Category,
    description: string,
    expense: number
  ) => {
    setIsLoading(true);

    await fetcher("api/track", {
      method: "POST",
      body: JSON.stringify({
        category: category.name,
        description: description || "",
        date: new Date().toISOString(),
        value: expense,
      }),
    });

    setIsLoading(false);

    setStats({
      ...stats,
      [category.id]: (stats[category.id] || 0) + 1,
    });

    setReset((x) => x + 1);
  };

  return { isLoading, saveExpense, reset };
}
