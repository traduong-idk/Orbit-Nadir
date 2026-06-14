"use client";

/**
 * Main layout wrapper — sidebar + white/dark main content area.
 */

import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
