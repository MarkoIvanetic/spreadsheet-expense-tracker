import { getCategoriesLocal } from "@/hooks/useCategories";
import { NotificationData } from "@/types";
import { matchingData } from "@/utils/localData";

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
 * Calculates the Levenshtein distance between two strings.
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Calculates similarity between two strings (0-1, where 1 is identical).
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLength;
};

/**
 * Finds the most similar string from a list of strings.
 * @param target - The string to compare against the list.
 * @param options - The list of strings to compare.
 * @returns The index of the most similar string from the list.
 */
export const findBestMatchIndex = (
  target: string,
  options: string[]
): number => {
  if (options.length === 0) return -1;

  let bestIndex = 0;
  let bestSimilarity = calculateSimilarity(target, options[0]);

  for (let i = 1; i < options.length; i++) {
    const similarity = calculateSimilarity(target, options[i]);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestIndex = i;
    }
  }

  return bestIndex;
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
