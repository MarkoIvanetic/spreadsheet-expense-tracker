import { NextApiRequest, NextApiResponse } from "next";

import { google, sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";

async function findFirstEmptyCellInColumn(
  spreadsheetId: string,
  jwtClient: JWT,
  sheets: sheets_v4.Sheets,
  range: string
) {
  const { data: getData } = await sheets.spreadsheets.values.get({
    auth: jwtClient,
    spreadsheetId,
    range,
  });

  if (!getData.values) return null;

  const firstEmptyRowIndex = getData.values.length + 1;

  return firstEmptyRowIndex;
}

async function getCategoryData(
  spreadsheetId: string,
  jwtClient: JWT,
  sheets: sheets_v4.Sheets
) {
  const { data: getData } = await sheets.spreadsheets.values.get({
    auth: jwtClient,
    spreadsheetId,
    range: "Data!A:A",
  });

  if (!getData.values) return null;

  return getData.values.flat().slice(1);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    let jwtClient = new google.auth.JWT(
      process.env.CLIENT_EMAIL,
      undefined,
      //   secretKey.private_key,
      process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    //authenticate request
    jwtClient.authorize(function (err) {
      if (err) {
        console.log(err);
        return;
      } else {
        console.log("Successfully connected!");
      }
    });

    const { category, value, description } = JSON.parse(req.body);

    //Google Sheets API
    // let spreadsheetId = "1D7tOO2KwqZR0LbD8YkFqT1VSUzFgiqZ8hxS6081x_8c";
    let spreadsheetId = process.env.SPREADSHEET_ID || "";

    let sheets = google.sheets("v4");

    const ss = await sheets.spreadsheets.get({
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
    });

    const lastSheetName =
      ss.data.sheets?.[ss.data.sheets?.length - 1]?.properties?.title;

    const firstEmptyRowIndex = await findFirstEmptyCellInColumn(
      spreadsheetId,
      jwtClient,
      sheets,
      `${lastSheetName}!A:A`
    );

    getCategoryData(spreadsheetId, jwtClient, sheets);

    let sheetRange = `${lastSheetName}!A${firstEmptyRowIndex}:C${firstEmptyRowIndex}`;

    const { data } = await sheets.spreadsheets.values.update({
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      valueInputOption: "USER_ENTERED",
      range: sheetRange,
      requestBody: { values: [[category, value, description]] },
    });
    console.log("data:", data);
    return res.send({ status: 200, message: data });
  } else {
    return res.send({ status: 500, message: "Unhadled method!" });
  }
}
