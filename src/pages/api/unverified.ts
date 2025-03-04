import { NextApiRequest, NextApiResponse } from "next";
import {
  deleteRow,
  getAllRows,
  getJwtClient,
  updateSheet,
} from "@/utils/apiServer";
import { google } from "googleapis";
import trackerConfig from "../../../tracker.config";

interface RequestContext {
  req: NextApiRequest;
  res: NextApiResponse;
  spreadsheetId: string;
  jwtClient: any;
  sheets: any;
  sheetName: string;
}

const createErrorResponse = (
  status: number,
  message: string,
  error?: string
) => ({
  status,
  message,
  error: error || null,
});

// Utility function to handle GET requests
async function handleGetRequest(context: RequestContext) {
  const { res, spreadsheetId, jwtClient, sheets, sheetName } = context;
  try {
    const rows = await getAllRows(spreadsheetId, jwtClient, sheets, sheetName);

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    return res.status(200).json(rows);
  } catch (error: any) {
    return res
      .status(500)
      .json(
        createErrorResponse(
          500,
          "Error fetching data from sheet.",
          error.message
        )
      );
  }
}

// Utility function to handle POST requests
async function handlePostRequest(context: RequestContext) {
  const { req, res, spreadsheetId, jwtClient, sheets, sheetName } = context;
  const { values, category, value, description, date } = req.body;

  if (!values && (!category || !value || !description || !date)) {
    return res
      .status(400)
      .json(
        createErrorResponse(
          400,
          "Either values or category, value, description, and date are required."
        )
      );
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Belgrade",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));

  const constructedValues = values || [
    [category, value, description, formattedDate],
  ];

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
    return res
      .status(500)
      .json(
        createErrorResponse(500, "Error adding data to sheet.", error.message)
      );
  }
}

// Utility function to handle DELETE requests
async function handleDeleteRequest(context: RequestContext) {
  const { res, spreadsheetId, jwtClient, sheets, sheetName } = context;
  const { rowIndices } = context.req.body; // Expecting an array of row indices
  console.log("rowIndices:", typeof context.req.body);
  if (!Array.isArray(rowIndices) || rowIndices.length === 0) {
    return res
      .status(400)
      .json(createErrorResponse(400, "rowIndices must be a non-empty array."));
  }

  try {
    // Sort indices in descending order to avoid shifting issues when deleting rows
    const sortedIndices = rowIndices.sort((a, b) => b - a);

    for (const rowIndex of sortedIndices) {
      await deleteRow(spreadsheetId, jwtClient, sheets, sheetName, rowIndex);
    }

    return res.status(200).json({ message: "Rows deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json(
        createErrorResponse(
          500,
          "Error deleting rows from sheet.",
          error.message
        )
      );
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sheetName = trackerConfig.unverifiedSheetName;
  let jwtClient;
  try {
    jwtClient = await getJwtClient();
  } catch (error: any) {
    return res
      .status(500)
      .json(
        createErrorResponse(
          500,
          "Error authenticating with Google API.",
          error.message
        )
      );
  }

  const spreadsheetId = process.env.SPREADSHEET_ID || "";
  const sheets = google.sheets("v4");

  console.log(`[${req.method}] - body: ${JSON.stringify(req.body)}`);

  const context: RequestContext = {
    req,
    res,
    spreadsheetId,
    jwtClient,
    sheets,
    sheetName,
  };

  switch (req.method) {
    case "GET":
      await handleGetRequest(context);
      break;
    case "POST":
      await handlePostRequest(context);
      break;
    case "DELETE":
      await handleDeleteRequest(context);
      break;
    default:
      return res
        .status(405)
        .json(createErrorResponse(405, "Method not allowed."));
  }
}
