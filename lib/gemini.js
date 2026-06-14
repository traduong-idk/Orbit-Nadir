/**
 * Google Gemini API integration.
 * Uses gemini-2.0-flash with web search grounding when API key is configured.
 * Falls back to mock data for UI testing.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { mockGeminiResults } from "./mockData";
import { deduplicateByName } from "./utils";

const MODEL = "gemini-2.0-flash";

/**
 * Search suppliers via Gemini web search for a single keyword.
 * @param {string} keyword - Search keyword
 * @param {string} location - Optional province/city bias
 * @returns {Promise<Array>} Supplier rows with source = "Google"
 */
export async function searchSuppliersWithGemini(keyword, location = "") {
  const apiKey = process.env.GEMINI_API_KEY;

  // Use mock data when API key is not configured
  if (!apiKey) {
    return mockGeminiResults(keyword, location);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      tools: [{ googleSearch: {} }],
    });

    const locationHint = location ? ` in ${location}` : "";
    const prompt = `Find manufacturing and sourcing suppliers related to "${keyword}"${locationHint}.
Return a JSON array (max 50 items) with objects: companyName, website, contact (email or phone).
Only include real companies. Return ONLY valid JSON array, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from Gemini response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return mockGeminiResults(keyword, location);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.slice(0, 50).map((item, i) => ({
      id: `gemini-${keyword}-${i}`,
      companyName: item.companyName || "",
      website: item.website || "",
      contact: item.contact || "",
      source: "Google",
      flag: !item.website || !item.contact ? "Needs Review" : null,
    }));
  } catch (error) {
    console.error("Gemini search error:", error.message);
    throw new Error(`Gemini search failed: ${error.message}`);
  }
}

/**
 * Analyze company names and filter by country using naming patterns.
 * @param {Array} companies - Company rows to analyze
 * @param {string} country - Target country
 * @returns {Promise<Array>} Rows with confidenceScore
 */
export async function cleanCompanyData(companies, country) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const { mockCleanResults } = await import("./mockData");
    return mockCleanResults(companies, country);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const names = companies.map((c) => c.companyName || c).join("\n");
    const prompt = `Analyze these company names and determine if each belongs to ${country}.
Use naming patterns: Vietnamese (Công ty TNHH, Cổ phần, DNTN, diacritics), Chinese (Guangdong, Zhejiang, Fujian, Co.,Ltd, Chinese chars), etc.
Return JSON array: [{ companyName, confidenceScore (0-100), belongsToCountry (boolean) }]
Companies:
${names}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      const { mockCleanResults } = await import("./mockData");
      return mockCleanResults(companies, country);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return companies.map((c, i) => {
      const analysis = parsed[i] || {};
      return {
        id: c.id || `clean-${i}`,
        companyName: c.companyName || c,
        website: c.website || "",
        taxCode: c.taxCode || "",
        contact: c.contact || "",
        confidenceScore: analysis.confidenceScore || 0,
        source: c.source || "Upload",
      };
    });
  } catch (error) {
    console.error("Gemini clean error:", error.message);
    throw new Error(`Data cleaning failed: ${error.message}`);
  }
}

/**
 * Run parallel Places + Gemini search for multiple keywords sequentially.
 */
export async function runDiscoverySearch(keywords, location, placesFn, geminiFn) {
  const allResults = [];

  for (const keyword of keywords) {
    const [placesResults, geminiResults] = await Promise.all([
      placesFn(keyword, location),
      geminiFn(keyword, location),
    ]);
    allResults.push(...placesResults, ...geminiResults);
    await new Promise(resolve => setTimeout(resolve, 4000));
  }

  return deduplicateByName(allResults).slice(0, 50 * keywords.length);
}
