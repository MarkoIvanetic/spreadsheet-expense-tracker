// src/pages/api/detectCategory.ts

import { NextApiRequest, NextApiResponse } from "next";
import { fetchWithCache } from "../../utils/cache";

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.BARD_API_KEY);

async function recognizeCategory(promptText: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Please recognize this category and return only category name value: ${promptText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    return text.trim() || "Unknown";
  } catch (error) {
    console.error("Error recognizing category:", error);
    return "Unknown";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { vendor } = req.body;

    console.log("process.env.BARD_API_KEY:", process.env.BARD_API_KEY);

    if (!vendor) {
      return res.status(400).send({
        status: 400,
        message: "Text is required.",
      });
    }

    const categories = await fetchWithCache(`${process.env.API_HOST}/api/data`);

    const categoryList = categories
      .map((item: { name: string }) => item.name)
      .join(", ");

    try {
      const prompt = `I want to categorise my expenses. I live in Croatia, please match the vendor to the possible category. Here is a list of possible categories: ${categoryList}. Please recognize the category from this vendor and return only the category name: ${vendor}`;

      const category = await recognizeCategory(prompt);

      return res.status(200).json({ category });
    } catch (error: any) {
      return res.status(500).send({
        status: 500,
        message: error.message,
      });
    }
  } else {
    return res.status(405).send({
      status: 405,
      message: "Method not allowed.",
    });
  }
}
