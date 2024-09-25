// src/pages/api/trackexternal.ts

import {
  addUnverifiedExpense,
  formatDateTimeForSheets,
} from "@/utils/apiServer";
import { performManualCategoryMatching } from "@/utils/misc";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

interface NotificationData {
  price: string;
  vendor: string;
}

function extractPriceAndVendor(
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

    console.log("vendor:", vendor);

    // Get category from new API endpoint
    try {
      // TODO: skip because its slow

      // const response = await axios.post(
      //   `${process.env.API_HOST}/api/detectCategory`,
      //   {
      //     vendor,
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     timeout: 30000, // Set timeout to 30 seconds
      //   }
      // );

      // if (response.status !== 200) {
      //   throw new Error("Failed to detect category");
      // }

      // const { category } = response.data;

      const category =
        performManualCategoryMatching(vendor, price) || "❓No idea";

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
