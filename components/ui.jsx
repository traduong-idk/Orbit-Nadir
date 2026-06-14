"use client";

/**
 * Reusable UI primitives: badges, buttons, loading spinner, error alert.
 */

import { Loader2 } from "lucide-react";

const BADGE_STYLES = {
  blue: "badge-blue",
  purple: "badge-purple",
  gray: "badge-gray",
  green: "badge-green",
  red: "badge-red",
  amber: "badge-amber",
};

export function Badge({ children, color = "gray" }) {
  return (
    <span className={`badge ${BADGE_STYLES[color] || BADGE_STYLES.gray}`}>
      {children}
    </span>
  );
}

export function SourceBadge({ source }) {
  const color = source === "Places API" ? "blue" : "purple";
  return <Badge color={color}>{source}</Badge>;
}

export function StageBadge({ stage }) {
  const colors = {
    New: "gray",
    Contacted: "blue",
    Qualified: "green",
    Rejected: "red",
  };
  return <Badge color={colors[stage] || "gray"}>{stage}</Badge>;
}

export function ConfidenceBadge({ score }) {
  let color = "red";
  if (score >= 90) color = "green";
  else if (score >= 70) color = "amber";
  return <Badge color={color}>{score}%</Badge>;
}

export function PrimaryButton({ children, loading, disabled, className = "", ...props }) {
  return (
    <button
      className={`btn-primary ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, loading, disabled, className = "", ...props }) {
  return (
    <button
      className={`btn-secondary ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
      {message}
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}

export function SubTabs({ tabs, active, onChange }) {
  return (
    <div className="mb-4 flex gap-1 border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition ${
            active === tab.id
              ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Checkbox({ checked, onChange, indeterminate }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate;
      }}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
    />
  );
}
