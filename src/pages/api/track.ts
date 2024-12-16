// src/pages/api/track.ts

import { NextApiRequest, NextApiResponse } from "next";
import {
  formatDateTimeForSheets,
  getJwtClient,
  updateSheet,
} from "@/utils/apiServer";
import { google } from "googleapis";
import { config } from "@/app.config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { category, value, description, date } = JSON.parse(req.body);

    const jwtClient = await getJwtClient();
    const spreadsheetId = process.env.SPREADSHEET_ID || "";
    const sheets = google.sheets("v4");

    const formattedDate = formatDateTimeForSheets(new Date(date));

    const data = await updateSheet(
      spreadsheetId,
      jwtClient,
      sheets,
      [
        // FRANKA: [formattedDate, value, category, "", "", description],
        [formattedDate, value, category, "", "", "", "", description],
      ],
      // FRANKA: config.ACTIVE_SHEET_NAME. others skip param
      config.ACTIVE_SHEET_NAME
    );

    return res.send({ status: 200, message: data });
  } else {
    return res.send({ status: 500, message: "Unhandled method!" });
  }
}
