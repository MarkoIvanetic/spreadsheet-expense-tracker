// src/pages/api/trackexternal.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getJwtClient, updateSheet } from "@/utils/api";
import { recognizeCategory } from "@/utils/chatGPT";
import { google } from "googleapis";

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

    // Get category from ChatGPT
    const category = await recognizeCategory(text);

    const jwtClient = await getJwtClient();
    const spreadsheetId = process.env.SPREADSHEET_ID || "";
    const sheets = google.sheets("v4");

    const data = await updateSheet(spreadsheetId, jwtClient, sheets, [
      [category, price, `Auto: ${vendor}`, new Date().toDateString()],
    ]);

    return res.send({ status: 200, message: data });
  } else {
    return res.send({ status: 500, message: "Unhandled method!" });
  }
}
