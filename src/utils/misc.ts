import { getCategoriesLocal } from "@/hooks/useCategories";
import { NotificationData } from "@/types";
import { matchingData } from "@/utils/localData";
import stringSimilarity from "string-similarity";

export const generateArray = (n: number) => {
  return Array.from(Array(n));
};

var emojiRegex = /\p{Emoji}/u;

export function getFirstEmoji(str: string | undefined) {
  if (!str) {
    return null;
  }

  var match = str.match(emojiRegex);

  if (match) {
    return match[0];
  } else {
    return null;
  }
}

export const focusInputById = (id: string): void => {
  const element = document.getElementById(id) as HTMLInputElement | null;
  if (element) {
    element.focus();
  } else {
    console.warn(`Element with id '${id}' not found.`);
  }
};

/**
 * Finds the most similar string from a list of strings.
 * @param target - The string to compare against the list.
 * @param options - The list of strings to compare.
 * @returns The most similar string from the list.
 */
export const findBestMatchIndex = (
  target: string,
  options: string[]
): number => {
  const bestMatch = stringSimilarity.findBestMatch(target, options);
  return bestMatch.bestMatchIndex;
};

export const findBestCategoryMatchByName = (categoryName: string) => {
  const categories = getCategoriesLocal();

  const allCategoryNames = categories.map((category) => category.name);

  const bestMatchCategoryIndex = findBestMatchIndex(
    categoryName,
    allCategoryNames
  );

  const category = categories[bestMatchCategoryIndex];

  return category;
};

export const performManualCategoryMatching = (
  expenseDescription: string,
  price?: string
) => {
  console.log("matching...");

  const lowerCaseDescription = expenseDescription.toLowerCase();

  for (const data of matchingData) {
    const isMatch = data.includes.some((cat) => {
      return (
        cat.toLowerCase().includes(lowerCaseDescription) ||
        lowerCaseDescription.includes(cat.toLowerCase())
      );
    });

    if (isMatch) {
      return data.category;
    }
  }

  return null;
};

export function extractPriceAndVendor(
  notificationText: string
): NotificationData | undefined {
  const priceRegex = /(\d+(\.\d{1,2})?)/;
  const vendorRegex = /at\s+(\w+)/;

  const priceMatch = notificationText.match(priceRegex);
  const vendorMatch = notificationText.match(vendorRegex);

  if (priceMatch && vendorMatch) {
    return {
      price: priceMatch[0],
      vendor: vendorMatch[1],
    };
  }

  return undefined;
}

export const wait = (n: number = 300): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, n));
};
