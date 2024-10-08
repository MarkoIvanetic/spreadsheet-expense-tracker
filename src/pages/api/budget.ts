import { getBudgetData } from "@/utils/apiServer";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const spreadsheetId = process.env.SPREADSHEET_ID || "";
      const budgetData = await getBudgetData(spreadsheetId);

      if (!budgetData) {
        return res
          .status(404)
          .json({ status: 404, message: "No budget data found." });
      }

      return res.status(200).json(budgetData);
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Error fetching budget data.",
        error: error.message,
      });
    }
  } else {
    return res
      .status(405)
      .json({ status: 405, message: "Method not allowed." });
  }
}
