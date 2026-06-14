/**
 * Shared utility helpers for Orbit Nadir.
 */

/** Format a date as YYYY-MM-DD for table display */
export function formatDate(date = new Date()) {
  return date.toISOString().split("T")[0];
}

/** Deduplicate supplier rows by company name (case-insensitive) */
export function deduplicateByName(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = (row.companyName || "").toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Parse comma-separated keywords, max 3 */
export function parseKeywords(input) {
  return input
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 3);
}

/** Download rows as .xlsx file in the browser */
export async function exportToXlsx(rows, columns, filename) {
  const XLSX = await import("xlsx");
  const data = rows.map((row, i) => {
    const obj = { "#": i + 1 };
    columns.forEach((col) => {
      obj[col.header] = col.accessor(row);
    });
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, filename);
}

/** Generate a simple unique id */
export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Check if row needs review flag (missing website or contact) */
export function needsReview(row) {
  return !row.website || !row.contact;
}
