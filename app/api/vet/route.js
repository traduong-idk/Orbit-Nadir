export const runtime = 'edge';
/**
 * API route — Vet Company check.
 * Scrapes masothue.com and compares business line codes.
 */

import { NextResponse } from "next/server";
import { vetCompanies } from "@/lib/scraper";

export async function POST(request) {
  try {
    const { companies, codes, matchAll } = await request.json();

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json({ error: "Companies required" }, { status: 400 });
    }

    if (companies.length > 50) {
      return NextResponse.json({ error: "Maximum 50 companies per run" }, { status: 400 });
    }

    const results = await vetCompanies(companies, codes || [], matchAll !== false);

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
