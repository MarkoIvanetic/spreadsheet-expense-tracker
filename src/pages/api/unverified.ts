import { NextApiRequest, NextApiResponse } from "next";
import {
  deleteRow,
  getAllRows,
  getJwtClient,
  updateSheet,
} from "@/utils/apiServer";
import { google } from "googleapis";
import trackerConfig from "../../../tracker.config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sheetName = trackerConfig.unverifiedSheetName;
  const jwtClient = await getJwtClient();
  const spreadsheetId = process.env.SPREADSHEET_ID || "";
  const sheets = google.sheets("v4");

  console.log(`[${req.method}] - body: ${JSON.stringify(req.body)}`);

  if (req.method === "GET") {
    try {
      const rows = await getAllRows(
        spreadsheetId,
        jwtClient,
        sheets,
        sheetName
      );
      return res.status(200).json(rows);
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Error fetching data from sheet.",
        error: error.message,
      });
    }
  } else if (req.method === "POST") {
    const { values, category, value, description, date } = req.body;
    if (!values && (!category || !value || !description || !date)) {
      return res.status(400).json({
        status: 400,
        message:
          "Either values or category, value, description, and date are required.",
      });
    }

    const constructedValues = values || [[category, value, description, date]];

    try {
      await updateSheet(
        spreadsheetId,
        jwtClient,
        sheets,
        constructedValues,
        sheetName
      );
      return res.status(200).json({ message: "Data added successfully" });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Error adding data to sheet.",
        error: error.message,
      });
    }
  } else if (req.method === "DELETE") {
    const { rowIndex } = JSON.parse(req.body);
    if (rowIndex === undefined) {
      return res
        .status(400)
        .json({ status: 400, message: "Row index is required." });
    }

    try {
      await deleteRow(spreadsheetId, jwtClient, sheets, sheetName, rowIndex);
      return res.status(200).json({ message: "Row deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({
        status: 500,
        message: "Error deleting row from sheet.",
        error: error.message,
      });
    }
  } else {
    return res
      .status(405)
      .json({ status: 405, message: "Method not allowed." });
  }
}
