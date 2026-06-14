"use client";

/**
 * Tab 1 — Supplier Discovery
 * Search suppliers via Places API + Gemini web search in parallel.
 * Supports keyword (max 3), file upload, and URL input sub-tabs.
 */

import { useState } from "react";
import { Upload, Search, ArrowRight, Copy, Download } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  PageHeader,
  SubTabs,
  SourceBadge,
  Badge,
  PrimaryButton,
  SecondaryButton,
  ErrorMessage,
  Checkbox,
} from "./ui";
import { parseKeywords, exportToXlsx } from "@/lib/utils";

const INPUT_TABS = [
  { id: "keyword", label: "Keyword" },
  { id: "upload", label: "Upload File" },
  { id: "url", label: "URL" },
];

export default function SupplierDiscovery() {
  const { discoveryResults, setDiscoveryResults, transferToVet, copyToMaster } = useApp();

  const [inputTab, setInputTab] = useState("keyword");
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(new Set());

  /** Run search — calls API route which merges Places + Gemini results */
  const handleSearch = async () => {
    setError("");
    const keywords = parseKeywords(keyword);
    if (keywords.length === 0) {
      setError("Enter at least one keyword (max 3, comma-separated).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setDiscoveryResults(data.results);
      setSelected(new Set());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /** Toggle row selection */
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** Select/deselect all rows */
  const toggleAll = () => {
    if (selected.size === discoveryResults.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(discoveryResults.map((r) => r.id)));
    }
  };

  const getSelectedRows = () =>
    selected.size > 0
      ? discoveryResults.filter((r) => selected.has(r.id))
      : discoveryResults;

  /** Export to .xlsx and Google Sheets */
  const handleExport = async () => {
    const rows = getSelectedRows();
    await exportToXlsx(rows, [
      { header: "Company Name", accessor: (r) => r.companyName },
      { header: "Website", accessor: (r) => r.website },
      { header: "Contact", accessor: (r) => r.contact },
      { header: "Source", accessor: (r) => r.source },
      { header: "Flag", accessor: (r) => r.flag || "" },
    ], "supplier-discovery.xlsx");

    await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tab: "discovery", rows }),
    });
  };

  return (
    <div>
      <PageHeader
        title="Supplier discovery"
        subtitle="Discover suppliers from multiple sources"
      />

      <SubTabs tabs={INPUT_TABS} active={inputTab} onChange={setInputTab} />

      {/* Keyword sub-tab */}
      {inputTab === "keyword" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              className="input-field flex-1"
              placeholder="Enter keywords (comma-separated, max 3)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <SecondaryButton>
              <Upload className="h-4 w-4" />
              Upload file
            </SecondaryButton>
            <PrimaryButton onClick={handleSearch} loading={loading}>
              <Search className="h-4 w-4" />
              Search
            </PrimaryButton>
          </div>
          <input
            className="input-field max-w-md"
            placeholder="e.g. Ho Chi Minh City, Binh Duong, Hai Phong"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      )}

      {/* Upload sub-tab */}
      {inputTab === "upload" && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Drop a file here or click to upload (CSV, XLSX)
          </p>
          <input type="file" className="mt-4 text-sm" accept=".csv,.xlsx,.xls" />
        </div>
      )}

      {/* URL sub-tab */}
      {inputTab === "url" && (
        <div className="space-y-3">
          <input
            className="input-field"
            placeholder="Paste a URL to scrape supplier list"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <PrimaryButton disabled={!urlInput}>Fetch from URL</PrimaryButton>
        </div>
      )}

      <ErrorMessage message={error} />

      {/* Results table */}
      {discoveryResults.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {discoveryResults.length} results
            </p>
            <div className="flex gap-2">
              <SecondaryButton onClick={() => transferToVet(getSelectedRows())}>
                <ArrowRight className="h-4 w-4" />
                Transfer to vet company
              </SecondaryButton>
              <SecondaryButton
                onClick={() => copyToMaster(getSelectedRows(), "Supplier Discovery")}
              >
                <Copy className="h-4 w-4" />
                Copy to supplier master
              </SecondaryButton>
              <SecondaryButton onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </SecondaryButton>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <Checkbox
                      checked={selected.size === discoveryResults.length}
                      indeterminate={
                        selected.size > 0 && selected.size < discoveryResults.length
                      }
                      onChange={toggleAll}
                    />
                  </th>
                  <th>#</th>
                  <th>Company name</th>
                  <th>Website</th>
                  <th>Contact</th>
                  <th>Source</th>
                  <th>Flag</th>
                </tr>
              </thead>
              <tbody>
                {discoveryResults.map((row, i) => (
                  <tr key={row.id}>
                    <td>
                      <Checkbox
                        checked={selected.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                      />
                    </td>
                    <td>{i + 1}</td>
                    <td className="font-medium">{row.companyName}</td>
                    <td>
                      {row.website ? (
                        <a
                          href={row.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          {row.website}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td>{row.contact || <span className="text-gray-400">—</span>}</td>
                    <td><SourceBadge source={row.source} /></td>
                    <td>
                      {row.flag && <Badge color="amber">{row.flag}</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
