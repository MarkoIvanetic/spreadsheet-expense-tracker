import { useLocalStorage } from "./useLocalStorage";

export const useStats = () => {
  return useLocalStorage<Record<string, any>>("stats", {});
};
