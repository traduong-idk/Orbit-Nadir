"use client";

/**
 * Sidebar — dark navy navigation with logo, 4 nav items, and theme toggle.
 * Width: 220px, full height. Active item highlighted in indigo.
 */

import Image from "next/image";
import { Search, Sparkles, ShieldCheck, Database, Moon, Sun } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

const NAV_ITEMS = [
  { id: "discovery", label: "Supplier Discovery", icon: Search },
  { id: "clean", label: "Clean Data", icon: Sparkles },
  { id: "vet", label: "Vet Company", icon: ShieldCheck },
  { id: "master", label: "Supplier Master", icon: Database },
];

export default function Sidebar() {
  const { activeTab, setActiveTab } = useApp();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className="flex h-screen w-[220px] shrink-0 flex-col bg-[#0f1829] text-white"
      style={{ width: 220 }}
    >
      {/* Logo + company name */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-indigo-600">
          <Image
            src="/logo.png"
            alt="Orbit Nadir logo"
            width={36}
            height={36}
            className="rounded"
            onError={(e) => {
              e.currentTarget.src = "/logo.svg";
            }}
          />
        </div>
        <span className="text-sm font-bold tracking-wide">ORBIT NADIR</span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Light/Dark mode toggle */}
      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center justify-between">
          <Moon className="h-4 w-4 text-gray-400" />
          <button
            onClick={toggleTheme}
            className="relative h-6 w-11 rounded-full bg-gray-600 transition"
            aria-label="Toggle theme"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                theme === "dark" ? "left-5" : "left-0.5"
              }`}
            />
          </button>
          <Sun className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </aside>
  );
}
