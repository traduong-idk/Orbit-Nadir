/**
 * Mock data for UI testing before live API connections.
 * Each tab has pre-populated sample rows matching business rules.
 */

export const MOCK_DISCOVERY_RESULTS = [
  {
    id: "d1",
    companyName: "Saigon Precision Manufacturing Co.",
    website: "https://saigonprecision.vn",
    contact: "contact@saigonprecision.vn",
    source: "Places API",
    flag: null,
  },
  {
    id: "d2",
    companyName: "Dong Nai Industrial Supplies",
    website: "",
    contact: "+84 251 382 4455",
    source: "Places API",
    flag: "Needs Review",
  },
  {
    id: "d3",
    companyName: "Guangdong Hardware Co.,Ltd",
    website: "https://gdhardware.cn",
    contact: "",
    source: "Google",
    flag: "Needs Review",
  },
  {
    id: "d4",
    companyName: "Công ty TNHH Thép Việt Nam",
    website: "https://thepvietnam.vn",
    contact: "sales@thepvietnam.vn",
    source: "Google",
    flag: null,
  },
  {
    id: "d5",
    companyName: "Hai Phong Marine Equipment",
    website: "https://hpmarine.vn",
    contact: "info@hpmarine.vn",
    source: "Places API",
    flag: null,
  },
];

export const MOCK_CLEAN_DATA_RESULTS = [
  {
    id: "c1",
    companyName: "Công ty TNHH Thép Việt Nam",
    website: "https://thepvietnam.vn",
    taxCode: "0312456789",
    contact: "sales@thepvietnam.vn",
    confidenceScore: 95,
    source: "Supplier Discovery",
  },
  {
    id: "c2",
    companyName: "Saigon Precision Manufacturing Co.",
    website: "https://saigonprecision.vn",
    taxCode: "0315678901",
    contact: "contact@saigonprecision.vn",
    confidenceScore: 88,
    source: "Supplier Discovery",
  },
  {
    id: "c3",
    companyName: "Guangdong Hardware Co.,Ltd",
    website: "https://gdhardware.cn",
    taxCode: "",
    contact: "",
    confidenceScore: 45,
    source: "Supplier Discovery",
  },
  {
    id: "c4",
    companyName: "Dong Nai Industrial Supplies",
    website: "",
    taxCode: "3600123456",
    contact: "+84 251 382 4455",
    confidenceScore: 72,
    source: "Supplier Discovery",
  },
];

export const MOCK_VET_INPUT = [
  {
    id: "v1",
    companyName: "Công ty TNHH Thép Việt Nam",
    taxCode: "0312456789",
    source: "Clean Data",
  },
  {
    id: "v2",
    companyName: "Saigon Precision Manufacturing Co.",
    taxCode: "0315678901",
    source: "Clean Data",
  },
  {
    id: "v3",
    companyName: "Unknown Trading LLC",
    taxCode: "",
    source: "Clean Data",
  },
];

export const MOCK_VET_RESULTS = [
  {
    id: "vr1",
    companyName: "Công ty TNHH Thép Việt Nam",
    taxCode: "0312456789",
    matchedCodes: ["2592", "2511"],
    result: "Matched",
    review: null,
  },
  {
    id: "vr2",
    companyName: "Saigon Precision Manufacturing Co.",
    taxCode: "0315678901",
    matchedCodes: ["2592"],
    result: "Matched",
    review: null,
  },
  {
    id: "vr3",
    companyName: "Unknown Trading LLC",
    taxCode: "",
    matchedCodes: [],
    result: "Not found",
    review: "Needs Review",
  },
];

export const MOCK_SUPPLIER_MASTER = [
  {
    id: "s1",
    companyName: "Công ty TNHH Thép Việt Nam",
    source: "Vet Company",
    stage: "Qualified",
    taxCode: "0312456789",
    contact: "sales@thepvietnam.vn",
    firstSeen: "2025-11-12",
    lastUpdated: "2026-01-20",
  },
  {
    id: "s2",
    companyName: "Saigon Precision Manufacturing Co.",
    source: "Supplier Discovery",
    stage: "Contacted",
    taxCode: "0315678901",
    contact: "contact@saigonprecision.vn",
    firstSeen: "2025-12-01",
    lastUpdated: "2026-02-15",
  },
  {
    id: "s3",
    companyName: "Hai Phong Marine Equipment",
    source: "Supplier Discovery",
    stage: "New",
    taxCode: "",
    contact: "info@hpmarine.vn",
    firstSeen: "2026-03-01",
    lastUpdated: "2026-03-01",
  },
  {
    id: "s4",
    companyName: "Dong Nai Industrial Supplies",
    source: "Clean Data",
    stage: "Rejected",
    taxCode: "3600123456",
    contact: "+84 251 382 4455",
    firstSeen: "2026-01-05",
    lastUpdated: "2026-02-28",
  },
];

/** Simulated Places API results for a keyword */
export function mockPlacesResults(keyword, location) {
  return [
    {
      id: `p-${keyword}-1`,
      companyName: `${keyword} Manufacturing Ltd`,
      website: `https://${keyword.replace(/\s/g, "").toLowerCase()}.vn`,
      contact: `info@${keyword.replace(/\s/g, "").toLowerCase()}.vn`,
      source: "Places API",
      flag: null,
      location,
    },
    {
      id: `p-${keyword}-2`,
      companyName: `${location || "Regional"} ${keyword} Co.`,
      website: "",
      contact: "+84 28 1234 5678",
      source: "Places API",
      flag: "Needs Review",
      location,
    },
  ];
}

/** Simulated Gemini web search results for a keyword */
export function mockGeminiResults(keyword, location) {
  const loc = location ? ` in ${location}` : "";
  return [
    {
      id: `g-${keyword}-1`,
      companyName: `${keyword} Global Trading${loc}`,
      website: `https://${keyword.replace(/\s/g, "")}-global.com`,
      contact: `sales@${keyword.replace(/\s/g, "")}-global.com`,
      source: "Google",
      flag: null,
      location,
    },
  ];
}

/** Simulated clean data confidence scores by country */
export function mockCleanResults(companies, country) {
  const baseScores = {
    Vietnam: [95, 88, 72, 45],
    China: [92, 85, 60, 30],
    Taiwan: [90, 80, 55, 25],
    "South Korea": [88, 78, 50, 20],
    Japan: [87, 75, 48, 18],
    others: [70, 60, 40, 15],
  };
  const scores = baseScores[country] || baseScores.others;

  return companies.map((c, i) => ({
    id: `clean-${i}`,
    companyName: c.companyName || c,
    website: c.website || "",
    taxCode: c.taxCode || "",
    contact: c.contact || "",
    confidenceScore: scores[i % scores.length],
    source: c.source || "Upload",
  }));
}

/** Simulated masothue.com vet results */
export function mockVetResults(companies, codes, matchAll) {
  return companies.slice(0, 50).map((c, i) => {
    const found = i < companies.length - 1;
    const matchedCodes = found ? codes.slice(0, matchAll ? codes.length : 1) : [];
    return {
      id: `vet-${i}`,
      companyName: c.companyName,
      taxCode: c.taxCode || (found ? `031000000${i}` : ""),
      matchedCodes,
      result: found && matchedCodes.length > 0 ? "Matched" : "Not found",
      review: found ? null : "Needs Review",
    };
  });
}
