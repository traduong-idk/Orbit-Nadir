export const runtime = 'edge';
/**
 * API route — Google Sheets export.
 * Appends rows to the dedicated sheet tab without overwriting existing data.
 */

import { NextResponse } from "next/server";
import { appendToSheet, formatRowsForSheet } from "@/lib/sheets";

export async function POST(request) {
  try {
    const { tab, rows } = await request.json();

    if (!tab || !rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Tab and rows required" }, { status: 400 });
    }

    const formatted = formatRowsForSheet(tab, rows);
    const result = await appendToSheet(tab, formatted);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
