import { RowData } from "@/types";
import {
  findFirstEmptyCellInColumn,
  getJwtClient,
  getLastSheetName,
} from "@/utils/apiServer";
import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    throw new ApiError(405, "Method not allowed. Only POST is supported.");
  }

  try {
    const data: RowData[] = req.body;

    if (!Array.isArray(data)) {
      throw new ApiError(
        400,
        "Invalid data format. Expected an array of RowData."
      );
    }

    const rows = data.map(({ row }) => row);
    if (rows.length === 0) {
      throw new ApiError(400, "No rows provided for insertion.");
    }

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

    const endRowIndex = firstEmptyRowIndex + rows.length - 1;
    const sheetRange = `${lastSheetName}!A${firstEmptyRowIndex}:D${endRowIndex}`;

    const { data: responseData } = await sheets.spreadsheets.values.update({
      auth: jwtClient,
      spreadsheetId,
      valueInputOption: "USER_ENTERED",
      range: sheetRange,
      requestBody: {
        values: rows,
      },
    });

    res.status(200).send({
      status: 200,
      message: "Rows added successfully.",
      data: responseData,
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res
        .status(error.status)
        .send({ status: error.status, message: error.message });
    } else {
      res.status(500).send({
        status: 500,
        message: "An unexpected error occurred.",
        error: error.message,
      });
    }
  }
}
