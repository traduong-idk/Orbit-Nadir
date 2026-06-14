"use client";

/**
 * Tab 4 — Supplier Master
 * Central supplier database with inline stage editing, filters, and stats.
 */

import { useState, useMemo } from "react";
import { Plus, Download, Search, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  PageHeader,
  StageBadge,
  PrimaryButton,
  SecondaryButton,
  Checkbox,
} from "./ui";
import { exportToXlsx } from "@/lib/utils";

const STAGES = ["New", "Contacted", "Qualified", "Rejected"];
const SOURCES = ["Supplier Discovery", "Clean Data", "Vet Company", "Manual"];

export default function SupplierMaster() {
  const { suppliers, addSupplier, updateSupplier } = useApp();

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    website: "",
    contact: "",
    taxCode: "",
    stage: "New",
  });

  /** Filter suppliers by search and dropdown filters */
  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      if (search && !s.companyName.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (stageFilter && s.stage !== stageFilter) return false;
      if (sourceFilter && s.source !== sourceFilter) return false;
      if (dateFilter && s.firstSeen !== dateFilter) return false;
      return true;
    });
  }, [suppliers, search, stageFilter, sourceFilter, dateFilter]);

  /** Stats counts by stage */
  const stats = useMemo(() => {
    const counts = { total: suppliers.length, New: 0, Contacted: 0, Qualified: 0, Rejected: 0 };
    suppliers.forEach((s) => {
      if (counts[s.stage] !== undefined) counts[s.stage]++;
    });
    return counts;
  }, [suppliers]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    if (!form.companyName.trim()) return;
    addSupplier({
      companyName: form.companyName,
      website: form.website,
      contact: form.contact,
      taxCode: form.taxCode,
      stage: form.stage,
      source: "Manual",
    });
    setForm({ companyName: "", website: "", contact: "", taxCode: "", stage: "New" });
    setShowModal(false);
  };

  const handleExport = async () => {
    const rows = selected.size > 0
      ? filtered.filter((r) => selected.has(r.id))
      : filtered;

    await exportToXlsx(rows, [
      { header: "Company Name", accessor: (r) => r.companyName },
      { header: "Source", accessor: (r) => r.source },
      { header: "Stage", accessor: (r) => r.stage },
      { header: "Tax Code", accessor: (r) => r.taxCode },
      { header: "Contact", accessor: (r) => r.contact },
      { header: "First Seen", accessor: (r) => r.firstSeen },
      { header: "Last Updated", accessor: (r) => r.lastUpdated },
    ], "supplier-master.xlsx");

    await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tab: "master", rows }),
    });
  };

  const STAT_COLORS = {
    total: "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
    New: "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
    Contacted: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
    Qualified: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
    Rejected: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
  };

  return (
    <div>
      <PageHeader
        title="Supplier master"
        subtitle="Central supplier database"
      />

      {/* Top bar — search, filters, actions */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto"
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="input-field w-auto"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="">All sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          className="input-field w-auto"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          title="Date added filter"
        />
        <SecondaryButton onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </SecondaryButton>
        <PrimaryButton onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add supplier
        </PrimaryButton>
      </div>

      {/* Supplier table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-10">
                <Checkbox
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={() => {
                    if (selected.size === filtered.length) setSelected(new Set());
                    else setSelected(new Set(filtered.map((r) => r.id)));
                  }}
                />
              </th>
              <th>#</th>
              <th>Company name</th>
              <th>Source</th>
              <th>Stage</th>
              <th>Tax code</th>
              <th>Contact</th>
              <th>First seen</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.id}>
                <td>
                  <Checkbox
                    checked={selected.has(row.id)}
                    onChange={() => toggleSelect(row.id)}
                  />
                </td>
                <td>{i + 1}</td>
                <td className="font-medium">{row.companyName}</td>
                <td>{row.source}</td>
                <td>
                  {/* Inline editable stage dropdown */}
                  <select
                    className="rounded border-0 bg-transparent text-sm focus:ring-1 focus:ring-indigo-500"
                    value={row.stage}
                    onChange={(e) => updateSupplier(row.id, { stage: e.target.value })}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td>{row.taxCode || "—"}</td>
                <td>{row.contact || "—"}</td>
                <td>{row.firstSeen}</td>
                <td>{row.lastUpdated}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400">
                  No suppliers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-5 gap-4">
        {[
          { key: "total", label: "Total suppliers" },
          { key: "New", label: "New" },
          { key: "Contacted", label: "Contacted" },
          { key: "Qualified", label: "Qualified" },
          { key: "Rejected", label: "Rejected" },
        ].map((stat) => (
          <div
            key={stat.key}
            className={`rounded-lg border p-4 ${STAT_COLORS[stat.key]}`}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {stats[stat.key]}
            </p>
          </div>
        ))}
      </div>

      {/* Add supplier modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add supplier
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                className="input-field"
                placeholder="Company name"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Contact"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Tax code"
                value={form.taxCode}
                onChange={(e) => setForm({ ...form, taxCode: e.target.value })}
              />
              <select
                className="input-field"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <SecondaryButton onClick={() => setShowModal(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
