// src/pages/api/track.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getJwtClient, updateSheet } from "@/utils/api";
import { google } from "googleapis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { category, value, description, date } = JSON.parse(req.body);

    const jwtClient = await getJwtClient();
    const spreadsheetId = process.env.SPREADSHEET_ID || "";
    const sheets = google.sheets("v4");

    const data = await updateSheet(spreadsheetId, jwtClient, sheets, [
      [category, value, description, date],
    ]);

    return res.send({ status: 200, message: data });
  } else {
    return res.send({ status: 500, message: "Unhandled method!" });
  }
}
