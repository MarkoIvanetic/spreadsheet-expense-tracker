import { NextApiRequest, NextApiResponse } from "next";

import { google, sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";

async function getCategoryData(
  spreadsheetId: string,
  jwtClient: JWT,
  sheets: sheets_v4.Sheets
) {
  const { data: getData } = await sheets.spreadsheets.values.get({
    auth: jwtClient,
    spreadsheetId,
    range: "Data!A:B",
  });

  if (!getData.values) return null;

  return getData.values.slice(2);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("req.method:", req.method);

  if (req.method === "GET") {
    let jwtClient = new google.auth.JWT(
      process.env.CLIENT_EMAIL,
      undefined,
      //   secretKey.private_key,
      process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    //authenticate request
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        console.log(err);
        return;
      } else {
        console.log("Successfully connected!");
      }
    });

    //Google Sheets API
    // let spreadsheetId = "1D7tOO2KwqZR0LbD8YkFqT1VSUzFgiqZ8hxS6081x_8c";
    let spreadsheetId = process.env.SPREADSHEET_ID || "";

    let sheets = google.sheets("v4");

    const data = await getCategoryData(spreadsheetId, jwtClient, sheets);
    console.log("data:", data);
    return res.status(200).json(data);
  } else {
    return res.send({ status: 500, message: "Unhadled method!" });
  }
}
