import { NextApiRequest, NextApiResponse } from "next";

import { getCategoryData, getJwtClient } from "@/utils/api";
import { google } from "googleapis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("req.method:", req.method);

  if (req.method === "GET") {
    let jwtClient = await getJwtClient();
    let spreadsheetId = process.env.SPREADSHEET_ID || "";

    let sheets = google.sheets("v4");

    const data =
      (await getCategoryData(spreadsheetId, jwtClient, sheets)) || [];

    const formattedData = data.map((item) => {
      return {
        name: item[0],
        color: item[1],
        id: item[2],
      };
    });

    return res.status(200).json(formattedData);
  } else {
    return res.send({ status: 500, message: "Unhadled method!" });
  }
}
