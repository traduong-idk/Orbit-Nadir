"use client";

/**
 * Tab 2 — Clean Data
 * Standardize supplier info using Gemini country pattern recognition.
 * Confidence score colors: ≥90% green, 70–89% amber, <70% red.
 */

import { useState } from "react";
import { ArrowRight, Download, Upload, Play } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  PageHeader,
  SubTabs,
  ConfidenceBadge,
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

const COUNTRIES = [
  "Vietnam",
  "China",
  "Taiwan",
  "South Korea",
  "Japan",
  "others",
];

export default function CleanData() {
  const {
    discoveryResults,
    cleanDataResults,
    setCleanDataResults,
    cleanDataSource,
    transferToVet,
  } = useApp();

  const [inputTab, setInputTab] = useState("previous");
  const [country, setCountry] = useState("Vietnam");
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(new Set());

  /** Run Gemini cleaning on discovery results or pasted text */
  const handleClean = async () => {
    setError("");
    setLoading(true);

    const companies =
      inputTab === "previous"
        ? discoveryResults
        : pasteText
            .split("\n")
            .filter(Boolean)
            .map((name, i) => ({
              id: `paste-${i}`,
              companyName: name.trim(),
              source: "Upload",
            }));

    if (companies.length === 0) {
      setError("No companies to clean. Run a search first or paste company names.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companies, country }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cleaning failed");
      setCleanDataResults(data.results);
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
    if (selected.size === cleanDataResults.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(cleanDataResults.map((r) => r.id)));
    }
  };

  const getSelectedRows = () =>
    selected.size > 0
      ? cleanDataResults.filter((r) => selected.has(r.id))
      : cleanDataResults;

  const handleExport = async () => {
    const rows = getSelectedRows();
    await exportToXlsx(rows, [
      { header: "Company Name", accessor: (r) => r.companyName },
      { header: "Website", accessor: (r) => r.website },
      { header: "Tax Code", accessor: (r) => r.taxCode },
      { header: "Contact", accessor: (r) => r.contact },
      { header: "Confidence Score", accessor: (r) => `${r.confidenceScore}%` },
      { header: "Source", accessor: (r) => r.source || "" },
    ], "clean-data.xlsx");

    await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tab: "clean", rows }),
    });
  };

  return (
    <div>
      <PageHeader
        title="Clean data"
        subtitle="Standardize supplier information"
      />

      <SubTabs tabs={INPUT_TABS} active={inputTab} onChange={setInputTab} />

      {/* From previous tab — source card flow */}
      {inputTab === "previous" && (
        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {cleanDataSource.tab}
            </p>
            <p className="text-xs text-gray-500">{cleanDataSource.count} results</p>
          </div>
          <span className="text-gray-400">→</span>
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-6 py-4 dark:border-indigo-800 dark:bg-indigo-900/20">
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
              Clean & enrich
            </p>
            <PrimaryButton
              className="mt-2"
              onClick={handleClean}
              loading={loading}
            >
              <Play className="h-4 w-4" />
              Start cleaning
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Upload / paste sub-tab */}
      {inputTab === "upload" && (
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Upload PDF or image, or paste company names below
            </p>
            <input type="file" className="mt-4 text-sm" accept=".pdf,.png,.jpg,.jpeg" />
          </div>
          <textarea
            className="input-field min-h-[120px]"
            placeholder="Paste company names, one per line"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          <PrimaryButton onClick={handleClean} loading={loading}>
            <Play className="h-4 w-4" />
            Start cleaning
          </PrimaryButton>
        </div>
      )}

      {/* Country selector */}
      <div className="mb-6 mt-4">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Country
        </label>
        <select
          className="input-field max-w-xs"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <ErrorMessage message={error} />

      {/* Results table */}
      {cleanDataResults.length > 0 && (
        <div className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {cleanDataResults.length} results
            </p>
            <div className="flex gap-2">
              <SecondaryButton onClick={() => transferToVet(getSelectedRows())}>
                <ArrowRight className="h-4 w-4" />
                Transfer to vet company
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
                      checked={selected.size === cleanDataResults.length}
                      indeterminate={
                        selected.size > 0 && selected.size < cleanDataResults.length
                      }
                      onChange={toggleAll}
                    />
                  </th>
                  <th>#</th>
                  <th>Company name</th>
                  <th>Website</th>
                  <th>Tax code</th>
                  <th>Contact</th>
                  <th>Confidence score</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {cleanDataResults.map((row, i) => (
                  <tr key={row.id}>
                    <td>
                      <Checkbox
                        checked={selected.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                      />
                    </td>
                    <td>{i + 1}</td>
                    <td className="font-medium">{row.companyName}</td>
                    <td>{row.website || "—"}</td>
                    <td>{row.taxCode || "—"}</td>
                    <td>{row.contact || "—"}</td>
                    <td><ConfidenceBadge score={row.confidenceScore} /></td>
                    <td>
                      <Badge color="gray">{row.source}</Badge>
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
