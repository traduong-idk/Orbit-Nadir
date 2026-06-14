/**
 * API route — Clean Data processing.
 * Uses Gemini to analyze company names and assign confidence scores by country.
 */

import { NextResponse } from "next/server";
import { cleanCompanyData } from "@/lib/gemini";

export async function POST(request) {
  try {
    const { companies, country } = await request.json();

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json({ error: "Companies required" }, { status: 400 });
    }

    if (!country) {
      return NextResponse.json({ error: "Country required" }, { status: 400 });
    }

    const results = await cleanCompanyData(companies, country);

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
