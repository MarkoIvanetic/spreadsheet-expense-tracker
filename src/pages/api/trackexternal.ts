import { NextApiRequest, NextApiResponse } from "next";

import {
  findFirstEmptyCellInColumn,
  getJwtClient,
  getLastSheetName,
} from "@/utils/api";
import { google } from "googleapis";

interface NotificationData {
  price: string;
  vendor: string;
}

function extractPriceAndVendor(notificationText: string) {
  // Regex to match the price (supports both integer and decimal)
  const priceRegex = /(\d+(\.\d{1,2})?)/;
  // Regex to match the vendor (assuming it's the word after "at")
  const vendorRegex = /at\s+(\w+)/;

  const priceMatch = notificationText.match(priceRegex);
  const vendorMatch = notificationText.match(vendorRegex);

  if (priceMatch && vendorMatch) {
    return {
      price: priceMatch[0],
      vendor: vendorMatch[1],
    };
  }

  return undefined; // Return null if the pattern does not match
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const text = req.body as string;

    const variables = extractPriceAndVendor(text);

    let price;
    let vendor;

    if (variables) {
      price = variables.price;
      vendor = variables.vendor;
    } else {
      return res.send({
        status: 500,
        message: "Could not extract price and vendor from the text.",
        recieved: req.body,
      });
    }

    // category: category.name,
    // description: description || "",
    // date: new Date().toDateString(),
    // value: expense,

    const jwtClient = await getJwtClient();
    const spreadsheetId = process.env.SPREADSHEET_ID || "";
    const sheets = google.sheets("v4");

    const lastSheetName = await getLastSheetName(
      spreadsheetId,
      jwtClient,
      sheets
    );

    const firstEmptyRowIndex = await findFirstEmptyCellInColumn(
      spreadsheetId,
      jwtClient,
      sheets,
      `${lastSheetName}!A:A`
    );

    const sheetRange = `${lastSheetName}!A${firstEmptyRowIndex}:D${firstEmptyRowIndex}`;

    const { data } = await sheets.spreadsheets.values.update({
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      valueInputOption: "USER_ENTERED",
      range: sheetRange,
      requestBody: {
        values: [
          ["❓No idea", price, `Auto: ${vendor}`, new Date().toDateString()],
        ],
      },
    });

    return res.send({ status: 200, message: data });
  } else {
    return res.send({ status: 500, message: "Unhadled method!" });
  }
}
