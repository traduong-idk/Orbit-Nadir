export const runtime = 'edge';
/**
 * API route — Supplier Discovery search.
 * Runs Places API + Gemini web search in parallel per keyword, merges and deduplicates.
 */

import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/places";
import { searchSuppliersWithGemini } from "@/lib/gemini";
import { runDiscoverySearch } from "@/lib/gemini";
import { needsReview } from "@/lib/utils";

export async function POST(request) {
  try {
    const { keywords, location } = await request.json();

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: "Keywords required" }, { status: 400 });
    }

    if (keywords.length > 3) {
      return NextResponse.json({ error: "Maximum 3 keywords per search" }, { status: 400 });
    }

    const results = await runDiscoverySearch(
      keywords,
      location || "",
      searchPlaces,
      searchSuppliersWithGemini
    );

    // Apply Needs Review flag for missing website or contact
    const flagged = results.map((r) => ({
      ...r,
      flag: needsReview(r) ? "Needs Review" : r.flag || null,
    }));

    return NextResponse.json({ results: flagged });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
