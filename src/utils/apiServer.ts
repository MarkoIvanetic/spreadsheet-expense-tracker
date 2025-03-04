import { google, sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";
import trackerConfig from "../../tracker.config";
import { BudgetData, CategoryData } from "@/types";
import { config } from "@/app.config";

export function parseCurrencyStringToNumber(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]+/g, ""));
}

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
    return 1;
  }

  return getData.values.length + 1;
}

export async function getJwtClient() {
  const jwtClient = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    undefined,
    process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  jwtClient.authorize(function (err) {
    if (err) {
      console.log("❌ Error authenticating:", err);
      return;
    } else {
      console.log("✅ Successfully connected!");
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
    range: config.CATEGORY_DATA_RANGE,
  });

  if (!getData.values) return null;

  return getData.values;
}

export const getSheetData = async () => {
  let jwtClient = await getJwtClient();

  let spreadsheetId = process.env.SPREADSHEET_ID || "";

  let sheets = google.sheets("v4");

  const data = await getCategoryData(spreadsheetId, jwtClient, sheets);

  return data;
};

export const fetcher = async (url: string, options?: Record<any, any>) => {
  const res = await fetch(url, options);
  const data = await res.json();

  if (res.status !== 200) {
    throw new Error(data.message);
  }
  return data;
};
export async function getSheetIdByName(
  spreadsheetId: string,
  jwtClient: any,
  sheets: any,
  sheetName: string
) {
  const { data } = await sheets.spreadsheets.get({
    auth: jwtClient,
    spreadsheetId,
  });
  const sheet = data.sheets.find((s: any) => s.properties.title === sheetName);
  return sheet.properties.sheetId;
}

export async function getBudgetData(
  spreadsheetId: string
): Promise<BudgetData | null> {
  try {
    const jwtClient: JWT = await getJwtClient();
    const sheets: sheets_v4.Sheets = google.sheets("v4");

    // Get the last sheet name
    const lastSheetName = await getLastSheetName(
      spreadsheetId,
      jwtClient,
      sheets
    );

    // Specify the ranges to fetch the values from specific cells
    const budgetRange = `${lastSheetName}!${config.BUDGET_RANGE_SUFFIX}`;
    const expenseRange = `${lastSheetName}!${config.EXPENSE_RANGE_SUFFIX}`;

    // Fetch budget data (K8:K9)
    const budgetDataResponse = await sheets.spreadsheets.values.get({
      auth: jwtClient,
      spreadsheetId,
      range: budgetRange,
    });

    if (!budgetDataResponse.data.values) {
      console.error("No data found in the given budget range.");
      return null;
    }

    // Fetch expense data (G20:G21)
    const expenseDataResponse = await sheets.spreadsheets.values.get({
      auth: jwtClient,
      spreadsheetId,
      range: expenseRange,
    });

    if (!expenseDataResponse.data.values) {
      console.error("No data found in the given expense range.");
      return null;
    }

    // Extracting values and formatting them properly as numbers
    const necessitiesBudget = parseCurrencyStringToNumber(
      budgetDataResponse.data.values[0][0]
    ); // K8
    const wantsBudget = parseCurrencyStringToNumber(
      budgetDataResponse.data.values[1][0]
    ); // K9
    const totalExpenses = parseCurrencyStringToNumber(
      expenseDataResponse.data.values[0][0]
    ); // G10
    const necessitiesExpense = parseCurrencyStringToNumber(
      expenseDataResponse.data.values[1][0]
    ); // G20
    const wantsExpense = parseCurrencyStringToNumber(
      expenseDataResponse.data.values[2][0]
    ); // G21

    return {
      totalExpenses,
      necessitiesBudget,
      wantsBudget,
      necessitiesExpense,
      wantsExpense,
    };
  } catch (error: any) {
    console.error("Error fetching budget data:", error.message);
    return null;
  }
}

// Helper function to fetch all rows from a sheet
export async function getAllRows(
  spreadsheetId: string,
  jwtClient: any,
  sheets: any,
  sheetName: string
) {
  const range = `${sheetName}!A:D`;
  const { data } = await sheets.spreadsheets.values.get({
    auth: jwtClient,
    spreadsheetId,
    range,
  });
  return data.values
    ? data.values.map((row: Array<string>, index: number) => {
        let formattedRow: Array<string> = row;
        formattedRow[1] = formattedRow[1].replace(/[^0-9.]/g, "");
        return { id: index + 1, row: formattedRow };
      })
    : [];
}

// Helper function to delete a row by row index
export async function deleteRow(
  spreadsheetId: string,
  jwtClient: any,
  sheets: any,
  sheetName: string,
  rowIndex: number
) {
  const requests = [
    {
      deleteDimension: {
        range: {
          sheetId: await getSheetIdByName(
            spreadsheetId,
            jwtClient,
            sheets,
            sheetName
          ),
          dimension: "ROWS",
          startIndex: rowIndex - 1, // Google Sheets API is zero-based
          endIndex: rowIndex, // End index is exclusive
        },
      },
    },
  ];
  await sheets.spreadsheets.batchUpdate({
    auth: jwtClient,
    spreadsheetId,
    requestBody: {
      requests,
    },
  });
}

export async function updateSheet(
  spreadsheetId: string,
  jwtClient: JWT,
  sheets: sheets_v4.Sheets,
  values: (string | number)[][],
  sheetName?: string
) {
  // const jwtClient = await getJwtClient();
  // const spreadsheetId = process.env.SPREADSHEET_ID || "";
  // const sheets = google.sheets("v4");

  console.log("📄 Starting updateSheet function...");
  console.log("📊 Spreadsheet ID:", spreadsheetId);
  console.log("📝 Sheet Name:", sheetName);

  const lastSheetName =
    sheetName || (await getLastSheetName(spreadsheetId, jwtClient, sheets));
  console.log("📋 Last Sheet Name:", lastSheetName);

  const firstEmptyRowIndex = await findFirstEmptyCellInColumn(
    spreadsheetId,
    jwtClient,
    sheets,
    `${lastSheetName}!A:A`
  );
  console.log("📈 First Empty Row Index:", firstEmptyRowIndex);

  const sheetRange = `${lastSheetName}!A${firstEmptyRowIndex}:D${firstEmptyRowIndex}`;
  console.log("📌 Sheet Range:", sheetRange);

  const { data } = await sheets.spreadsheets.values.update({
    auth: jwtClient,
    spreadsheetId,
    valueInputOption: "USER_ENTERED",
    range: sheetRange,
    requestBody: {
      values,
    },
  });

  console.log("✅ Update successful:", data);
  return data;
}

export async function addUnverifiedExpense(
  values: (string | number)[][]
): Promise<void> {
  console.log("🟢 Starting addUnverifiedExpense function...");

  let jwtClient: JWT;
  try {
    jwtClient = await getJwtClient();
  } catch (error) {
    console.log("❌ Error getting JWT client:", error);
    throw error;
  }

  const spreadsheetId = process.env.SPREADSHEET_ID || "";
  const sheets = google.sheets("v4");

  try {
    const data = await updateSheet(
      spreadsheetId,
      jwtClient,
      sheets,
      values,
      trackerConfig.unverifiedSheetName
    );
    console.log("✅ Expense added successfully:", data);
  } catch (error) {
    console.log("❌ Error adding expense:", error);
    throw error;
  }
}

export const fetchCategoryData = async (): Promise<CategoryData[]> => {
  const jwtClient = await getJwtClient();
  const spreadsheetId = process.env.SPREADSHEET_ID || "";
  const sheets = google.sheets("v4");

  const data = (await getCategoryData(spreadsheetId, jwtClient, sheets)) || [];

  const formattedData = data.map((item: any) => {
    return {
      name: item[0],
      color: item[1],
      id: item[2],
    };
  });

  return formattedData;
};

export function formatDateTimeForSheets(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
