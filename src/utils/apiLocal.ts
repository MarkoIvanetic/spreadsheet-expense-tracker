import { Category, RowData } from "@/types";
import { wait } from "@/utils/misc";

export const fetchUnverifiedData = async () => {
  const response = await fetch("api/unverified");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const deleteUnverifiedData = async (id: number) => {
  const response = await fetch("api/unverified", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rowIndices: [id] }),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const deleteBulkUnverifiedData = async (rowIndices: number[]) => {
  const response = await fetch("api/unverified", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rowIndices }),
  });

  const responseBody = await response.json();

  await wait(1200);

  if (!response.ok) {
    throw {
      message: responseBody.message || "Failed to delete bulk unverified data.",
      error: responseBody.error || null,
    };
  }

  return responseBody;
};

export const fetchCategoriesWithLocalStorage = async (): Promise<
  Array<Category>
> => {
  const localStorageKey = "api/data";

  // Check local storage first
  const localData = JSON.parse(localStorage.getItem(localStorageKey) || "[]");

  if (localData && localData.length > 0) {
    return localData as Array<Category>;
  }

  // Fetch from API if not in local storage
  const response = await fetch("api/data");
  if (!response.ok) {
    throw new Error("Failed to fetch data from API");
  }
  const data = (await response.json()) as Array<Category>;

  // Save the fetched data to local storage for future use
  localStorage.setItem(localStorageKey, JSON.stringify(data));

  return data;
};

export const addAllExpenses = async (rows: RowData[]) => {
  const response = await fetch("/api/trackbulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rows),
  });

  const responseBody = await response.json();

  await wait(500);

  if (!response.ok) {
    throw {
      message: responseBody.message || "Failed to add all expenses.",
      error: responseBody.error || null,
    };
  }

  return responseBody;
};
