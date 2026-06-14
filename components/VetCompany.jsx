"use client";

/**
 * Tab 3 — Vet Company
 * Two-column layout: companies to vet (left) + industry classification (right).
 * Scrapes masothue.com and matches business line codes.
 */

import { useState } from "react";
import { X, Copy, Download, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  PageHeader,
  SubTabs,
  Badge,
  PrimaryButton,
  SecondaryButton,
  ErrorMessage,
  Checkbox,
} from "./ui";
import { exportToXlsx } from "@/lib/utils";

const INPUT_TABS = [
  { id: "previous", label: "From previous tab" },
  { id: "upload", label: "Upload file / type" },
];

export default function VetCompany() {
  const { vetInput, setVetInput, vetResults, setVetResults, copyToMaster } = useApp();

  const [inputTab, setInputTab] = useState("previous");
  const [pasteText, setPasteText] = useState("");
  const [source, setSource] = useState("masothue.com");
  const [codeInput, setCodeInput] = useState("");
  const [codes, setCodes] = useState(["2592", "2511"]);
  const [matchAll, setMatchAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(new Set());

  /** Add a business line code tag */
  const addCode = () => {
    const trimmed = codeInput.trim();
    if (trimmed && !codes.includes(trimmed)) {
      setCodes((prev) => [...prev, trimmed]);
    }
    setCodeInput("");
  };

  /** Remove a code tag */
  const removeCode = (code) => {
    setCodes((prev) => prev.filter((c) => c !== code));
  };

  /** Run vetting via masothue.com scraper */
  const handleCheck = async () => {
    setError("");

    let companies = vetInput;
    if (inputTab === "upload" && pasteText) {
      companies = pasteText
        .split("\n")
        .filter(Boolean)
        .map((name, i) => ({
          id: `upload-${i}`,
          companyName: name.trim(),
          taxCode: "",
          source: "Upload",
        }));
      setVetInput(companies);
    }

    if (companies.length === 0) {
      setError("No companies to vet. Transfer from a previous tab or upload.");
      return;
    }

    if (companies.length > 50) {
      setError("Maximum 50 companies per run.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companies, codes, matchAll }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Vetting failed");
      setVetResults(data.results);
      setSelected(new Set());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === vetResults.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(vetResults.map((r) => r.id)));
    }
  };

  const getSelectedRows = () =>
    selected.size > 0
      ? vetResults.filter((r) => selected.has(r.id))
      : vetResults;

  const handleExport = async () => {
    const rows = getSelectedRows();
    await exportToXlsx(rows, [
      { header: "Company Name", accessor: (r) => r.companyName },
      { header: "Tax Code", accessor: (r) => r.taxCode },
      { header: "Matched Codes", accessor: (r) => (r.matchedCodes || []).join(", ") },
      { header: "Result", accessor: (r) => r.result },
      { header: "Review", accessor: (r) => r.review || "" },
    ], "vet-company.xlsx");

    await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tab: "vet", rows }),
    });
  };

  return (
    <div>
      <PageHeader
        title="Vet company"
        subtitle="Verify company legitimacy and match with business line code"
      />

      {/* Two-column input layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left panel — companies to vet */}
        <div>
          <SubTabs tabs={INPUT_TABS} active={inputTab} onChange={setInputTab} />

          {inputTab === "upload" && (
            <textarea
              className="input-field mb-4 min-h-[100px]"
              placeholder="Paste company names, one per line"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
          )}

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Company name</th>
                  <th>Tax code</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {vetInput.map((row, i) => (
                  <tr key={row.id}>
                    <td>{i + 1}</td>
                    <td className="font-medium">{row.companyName}</td>
                    <td>{row.taxCode || "—"}</td>
                    <td><Badge color="gray">{row.source}</Badge></td>
                  </tr>
                ))}
                {vetInput.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No companies loaded. Transfer from a previous tab.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel — industry classification */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Source
            </label>
            <select className="input-field" value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="masothue.com">masothue.com</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Business line code
            </label>
            <div className="flex gap-2">
              <input
                className="input-field"
                placeholder="e.g. 2592"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCode()}
              />
              <SecondaryButton onClick={addCode}>Add</SecondaryButton>
            </div>
            {/* Removable code tags */}
            <div className="mt-2 flex flex-wrap gap-2">
              {codes.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                >
                  {code}
                  <button onClick={() => removeCode(code)} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Match condition toggle */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Match condition
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={matchAll}
                  onChange={() => setMatchAll(true)}
                  className="text-indigo-600"
                />
                Match all codes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={!matchAll}
                  onChange={() => setMatchAll(false)}
                  className="text-indigo-600"
                />
                Match any code
              </label>
            </div>
          </div>

          <PrimaryButton className="w-full" onClick={handleCheck} loading={loading}>
            <ShieldCheck className="h-4 w-4" />
            Check
          </PrimaryButton>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* Vet results table */}
      {vetResults.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{vetResults.length} results</p>
            <div className="flex gap-2">
              <SecondaryButton
                onClick={() => copyToMaster(getSelectedRows(), "Vet Company")}
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
                      checked={selected.size === vetResults.length}
                      indeterminate={
                        selected.size > 0 && selected.size < vetResults.length
                      }
                      onChange={toggleAll}
                    />
                  </th>
                  <th>#</th>
                  <th>Company name</th>
                  <th>Tax code</th>
                  <th>Matched codes</th>
                  <th>Result</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {vetResults.map((row, i) => (
                  <tr key={row.id}>
                    <td>
                      <Checkbox
                        checked={selected.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                      />
                    </td>
                    <td>{i + 1}</td>
                    <td className="font-medium">{row.companyName}</td>
                    <td>{row.taxCode || "—"}</td>
                    <td>{(row.matchedCodes || []).join(", ") || "—"}</td>
                    <td>
                      <Badge color={row.result === "Matched" ? "green" : "red"}>
                        {row.result}
                      </Badge>
                    </td>
                    <td>
                      {row.review && <Badge color="amber">{row.review}</Badge>}
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
