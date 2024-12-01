// src/pages/api/trackexternal.ts

import {
  addUnverifiedExpense,
  formatDateTimeForSheets,
} from "@/utils/apiServer";
import {
  extractPriceAndVendor,
  performManualCategoryMatching,
} from "@/utils/misc";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const text = req.body as string;

    const variables = extractPriceAndVendor(text);

    if (!variables) {
      return res.status(500).send({
        status: 500,
        message: "Could not extract price and vendor from the text.",
        received: req.body,
      });
    }

    const { price, vendor } = variables;

    try {
      const category =
        performManualCategoryMatching(vendor, price) || "❓No idea";

      console.log("Category matched:", category);

      const values = [
        [
          category,
          price,
          `Auto: ${vendor}`,
          formatDateTimeForSheets(new Date()),
        ],
      ];

      const data = await addUnverifiedExpense(values);

      return res.send({ status: 200, message: data });
    } catch (error: any) {
      return res.status(500).send({
        status: 500,
        message: "Error detecting category.",
        error: error.message,
      });
    }
  } else {
    return res.status(405).send({
      status: 405,
      message: "Method not allowed.",
    });
  }
}
