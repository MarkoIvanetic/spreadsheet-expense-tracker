// utils/cache.ts
import cacheData from "memory-cache";

export async function fetchWithCache(
  url: string,
  options?: RequestInit
): Promise<any> {
  const value = cacheData.get(url);
  if (value) {
    return value;
  } else {
    const hours = 24 * 7;
    const res = await fetch(url, options);
    const data = await res.json();
    cacheData.put(url, data, hours * 1000 * 60 * 60);
    return data;
  }
}
