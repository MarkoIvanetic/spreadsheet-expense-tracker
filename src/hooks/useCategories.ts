import { useQuery } from "@tanstack/react-query";
import { Category } from "@/types";
import { fetchCategoriesWithLocalStorage } from "@/utils/apiLocal";

export const useCategories = () => {
  return useQuery<Array<Category>>({
    queryKey: ["api/data"],
    queryFn: fetchCategoriesWithLocalStorage,
    initialData: () => {
      const localData = localStorage.getItem("api/data");
      return localData ? JSON.parse(localData) : [];
    },
  });
};

export const getCategoriesLocal = () => {
  const localData = localStorage.getItem("api/data");
  const returnData = localData ? JSON.parse(localData) : [];

  return returnData as Array<Category>;
};
