import { NextApiRequest, NextApiResponse } from "next";

import { fetchCategoryData } from "@/utils/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const formattedData = await fetchCategoryData();

      return res.status(200).json(formattedData);
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Error fetching category data.",
        error: error.message,
      });
    }
  } else {
    return res
      .status(405)
      .json({ status: 405, message: "Method not allowed." });
  }
}
