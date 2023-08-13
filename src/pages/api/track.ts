import { NextApiRequest, NextApiResponse } from "next";

import {
  findFirstEmptyCellInColumn,
  getJwtClient,
  getLastSheetName,
} from "@/utils/api";
import { google } from "googleapis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { category, value, description } = JSON.parse(req.body);

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

    const sheetRange = `${lastSheetName}!A${firstEmptyRowIndex}:C${firstEmptyRowIndex}`;

    const { data } = await sheets.spreadsheets.values.update({
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      valueInputOption: "USER_ENTERED",
      range: sheetRange,
      requestBody: { values: [[category, value, description]] },
    });

    return res.send({ status: 200, message: data });
  } else {
    return res.send({ status: 500, message: "Unhadled method!" });
  }
}
