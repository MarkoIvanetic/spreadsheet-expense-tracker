import { google, sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";

export async function findFirstEmptyCellInColumn(
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

  if (!getData.values || getData.values.length === 0) {
    return null;
  }

  return getData.values.length + 1;
}

export async function getJwtClient() {
  const jwtClient = new google.auth.JWT(
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

  return jwtClient as JWT;
}

export async function getLastSheetName(
  spreadsheetId: string,
  jwtClient: JWT,
  sheets: sheets_v4.Sheets
) {
  const sheetList = await sheets.spreadsheets.get({
    auth: jwtClient,
    spreadsheetId: spreadsheetId,
  });

  const lastSheetName =
    sheetList.data.sheets?.[sheetList.data.sheets?.length - 1]?.properties
      ?.title;

  return lastSheetName;
}

export async function getCategoryData(
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

  return getData.values;
}
