/**
 * Google Places API integration.
 * Text search with optional location bias for province/city filtering.
 * Falls back to mock data when API key is not configured.
 */

import { mockPlacesResults } from "./mockData";

/**
 * Search suppliers via Google Places Text Search API.
 * @param {string} keyword - Search keyword
 * @param {string} location - Optional province/city for location bias
 * @returns {Promise<Array>} Supplier rows with source = "Places API"
 */
export async function searchPlaces(keyword, location = "") {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return mockPlacesResults(keyword, location);
  }

  try {
    const query = location ? `${keyword} ${location}` : keyword;
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", query);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Places API error: ${data.status}`);
    }

    const results = (data.results || []).slice(0, 50);

    // Fetch details for website/contact when available
    const enriched = await Promise.all(
      results.map(async (place, i) => {
        let website = "";
        let contact = place.formatted_phone_number || "";

        if (place.place_id) {
          try {
            const detailUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
            detailUrl.searchParams.set("place_id", place.place_id);
            detailUrl.searchParams.set("fields", "website,formatted_phone_number");
            detailUrl.searchParams.set("key", apiKey);
            const detailRes = await fetch(detailUrl.toString());
            const detailData = await detailRes.json();
            website = detailData.result?.website || "";
            contact = detailData.result?.formatted_phone_number || contact;
          } catch {
            // Continue without details
          }
        }

        return {
          id: `places-${place.place_id || i}`,
          companyName: place.name || "",
          website,
          contact,
          source: "Places API",
          flag: !website || !contact ? "Needs Review" : null,
        };
      })
    );

    return enriched;
  } catch (error) {
    console.error("Places search error:", error.message);
    throw new Error(`Places search failed: ${error.message}`);
  }
}
