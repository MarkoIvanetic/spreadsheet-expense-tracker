// utils/chatGPT.ts

import { OpenAI } from "openai";
import { fetchWithCache } from "./cache";

// UNUSED - switched to free bard

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function recognizeCategory(promptText: string): Promise<string> {
  try {
    const categories = await fetchWithCache(`${process.env.API_HOST}/api/data`);
    const categoryList = categories
      .map((item: { name: string }) => item.name)
      .join(", ");

    console.log("categoryList:", categoryList);

    const prompt = `Here is a list of possible categories: ${categoryList}. Please recognize the category for the following text and return only the category name: ${promptText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
    });

    const category = response.choices[0]?.message?.content?.trim();

    return category || "Unknown";
  } catch (error) {
    console.error("Error recognizing category:", error);
    return "Unknown";
  }
}
