/**
 * Google Sheets API integration with service account authentication.
 * Appends rows to dedicated sheet tabs without overwriting existing data.
 */

import { google } from "googleapis";

const SHEET_TABS = {
  discovery: "Supplier Discovery",
  clean: "Clean Data",
  vet: "Vet Company",
  master: "Supplier Master",
};

/**
 * Create authenticated Google Sheets client from env vars or credentials.json.
 */
function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    return null;
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return { sheets: google.sheets({ version: "v4", auth }), sheetId };
}

/**
 * Append rows to a specific sheet tab.
 * @param {string} tabKey - Key from SHEET_TABS
 * @param {Array<Array>} rows - 2D array of cell values
 * @returns {Promise<object>} API response or mock success
 */
export async function appendToSheet(tabKey, rows) {
  const client = getSheetsClient();
  const tabName = SHEET_TABS[tabKey];

  if (!client) {
    console.log(`[Mock Sheets] Would append ${rows.length} rows to "${tabName}"`);
    return { mock: true, tab: tabName, rowsAppended: rows.length };
  }

  const { sheets, sheetId } = client;

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `'${tabName}'!A:Z`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: rows },
  });

  return response.data;
}

/**
 * Convert supplier rows to sheet-ready format for each tab.
 */
export function formatRowsForSheet(tabKey, rows) {
  switch (tabKey) {
    case "discovery":
      return rows.map((r, i) => [
        i + 1,
        r.companyName,
        r.website,
        r.contact,
        r.source,
        r.flag || "",
      ]);
    case "clean":
      return rows.map((r, i) => [
        i + 1,
        r.companyName,
        r.website,
        r.taxCode,
        r.contact,
        `${r.confidenceScore}%`,
        r.source || "",
      ]);
    case "vet":
      return rows.map((r, i) => [
        i + 1,
        r.companyName,
        r.taxCode,
        (r.matchedCodes || []).join(", "),
        r.result,
        r.review || "",
      ]);
    case "master":
      return rows.map((r, i) => [
        i + 1,
        r.companyName,
        r.source,
        r.stage,
        r.taxCode,
        r.contact,
        r.firstSeen,
        r.lastUpdated,
      ]);
    default:
      return rows.map((r) => Object.values(r));
  }
}

export { SHEET_TABS };
