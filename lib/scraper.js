/**
 * masothue.com scraper for company vetting.
 * Looks up registered business line codes and compares against input codes.
 * Falls back to mock data when scraping is unavailable.
 */

import { mockVetResults } from "./mockData";

const MASOTHUE_BASE = "https://masothue.com";

/**
 * Scrape masothue.com for a company name and extract business line codes.
 * @param {string} companyName - Company to look up
 * @returns {Promise<object>} { found, taxCode, businessLineCodes }
 */
export async function scrapeMasothue(companyName) {
  try {
    const searchUrl = `${MASOTHUE_BASE}/Search/?q=${encodeURIComponent(companyName)}`;
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "OrbitNadir/1.0 (internal sourcing tool)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { found: false, taxCode: "", businessLineCodes: [] };
    }

    const html = await response.text();

    // Extract tax code pattern (10-13 digit Vietnamese tax IDs)
    const taxMatch = html.match(/Mã số thuế[:\s]*(\d{10,13})/i);
    const taxCode = taxMatch ? taxMatch[1] : "";

    // Extract business line codes (VSIC/sector codes, typically 4 digits)
    const codeMatches = html.match(/\b\d{4}\b/g) || [];
    const businessLineCodes = [...new Set(codeMatches)].slice(0, 20);

    const found = !!taxCode || businessLineCodes.length > 0;

    return { found, taxCode, businessLineCodes };
  } catch (error) {
    console.error(`masothue scrape error for "${companyName}":`, error.message);
    return { found: false, taxCode: "", businessLineCodes: [] };
  }
}

/**
 * Vet multiple companies against business line codes.
 * @param {Array} companies - Max 50 companies
 * @param {Array<string>} codes - Business line codes to match
 * @param {boolean} matchAll - true = match all codes, false = match any
 * @returns {Promise<Array>} Vet result rows
 */
export async function vetCompanies(companies, codes, matchAll = true) {
  const limited = companies.slice(0, 50);

  // Use mock when no companies or in dev without network
  if (!process.env.GEMINI_API_KEY && limited.length > 0) {
    return mockVetResults(limited, codes, matchAll);
  }

  const results = [];

  for (const company of limited) {
    const scraped = await scrapeMasothue(company.companyName);
    const registeredCodes = scraped.businessLineCodes;

    let matchedCodes = [];
    if (codes.length > 0 && registeredCodes.length > 0) {
      if (matchAll) {
        const allMatch = codes.every((c) => registeredCodes.includes(c));
        matchedCodes = allMatch ? codes.filter((c) => registeredCodes.includes(c)) : [];
      } else {
        matchedCodes = codes.filter((c) => registeredCodes.includes(c));
      }
    }

    const matched = matchedCodes.length > 0;
    results.push({
      id: company.id || `vet-${results.length}`,
      companyName: company.companyName,
      taxCode: scraped.taxCode || company.taxCode || "",
      matchedCodes,
      result: matched ? "Matched" : "Not found",
      review: !scraped.found ? "Needs Review" : null,
    });
  }

  return results;
}
