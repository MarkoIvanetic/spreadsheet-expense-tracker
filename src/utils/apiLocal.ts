import { Category } from "@/types";

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
    body: JSON.stringify({ rowIndex: id }),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
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
