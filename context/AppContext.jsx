"use client";

/**
 * Global app state for inter-tab data transfer and supplier master persistence.
 * Tabs communicate via context: Discovery → Clean → Vet → Master.
 */

import { createContext, useContext, useState, useCallback } from "react";
import {
  MOCK_DISCOVERY_RESULTS,
  MOCK_CLEAN_DATA_RESULTS,
  MOCK_VET_INPUT,
  MOCK_VET_RESULTS,
  MOCK_SUPPLIER_MASTER,
} from "@/lib/mockData";
import { formatDate, uid } from "@/lib/utils";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState("discovery");

  // Tab 1 state
  const [discoveryResults, setDiscoveryResults] = useState(MOCK_DISCOVERY_RESULTS);

  // Tab 2 state
  const [cleanDataResults, setCleanDataResults] = useState(MOCK_CLEAN_DATA_RESULTS);
  const [cleanDataSource, setCleanDataSource] = useState({
    tab: "Supplier Discovery",
    count: MOCK_DISCOVERY_RESULTS.length,
  });

  // Tab 3 state
  const [vetInput, setVetInput] = useState(MOCK_VET_INPUT);
  const [vetResults, setVetResults] = useState(MOCK_VET_RESULTS);

  // Tab 4 state
  const [suppliers, setSuppliers] = useState(MOCK_SUPPLIER_MASTER);

  /** Transfer discovery/clean results to Vet Company input (Tab 3) */
  const transferToVet = useCallback((rows) => {
    const mapped = rows.map((r) => ({
      id: r.id || uid(),
      companyName: r.companyName,
      taxCode: r.taxCode || "",
      source: r.source || "Transfer",
    }));
    setVetInput(mapped);
    setActiveTab("vet");
  }, []);

  /** Copy rows to Supplier Master with Stage = New */
  const copyToMaster = useCallback((rows, sourceTab) => {
    const today = formatDate();
    const newSuppliers = rows.map((r) => ({
      id: uid(),
      companyName: r.companyName,
      source: sourceTab,
      stage: "New",
      taxCode: r.taxCode || "",
      contact: r.contact || "",
      firstSeen: today,
      lastUpdated: today,
    }));

    setSuppliers((prev) => {
      const existing = new Set(prev.map((s) => s.companyName.toLowerCase()));
      const unique = newSuppliers.filter(
        (s) => !existing.has(s.companyName.toLowerCase())
      );
      return [...prev, ...unique];
    });
    setActiveTab("master");
  }, []);

  /** Feed discovery results into Clean Data tab */
  const transferToClean = useCallback((rows, sourceLabel) => {
    setCleanDataSource({ tab: sourceLabel, count: rows.length });
    setActiveTab("clean");
  }, []);

  /** Add or update a supplier in master */
  const addSupplier = useCallback((supplier) => {
    const today = formatDate();
    setSuppliers((prev) => [
      ...prev,
      {
        ...supplier,
        id: uid(),
        firstSeen: today,
        lastUpdated: today,
      },
    ]);
  }, []);

  /** Update supplier stage or fields inline */
  const updateSupplier = useCallback((id, updates) => {
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...updates, lastUpdated: formatDate() }
          : s
      )
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        discoveryResults,
        setDiscoveryResults,
        cleanDataResults,
        setCleanDataResults,
        cleanDataSource,
        setCleanDataSource,
        vetInput,
        setVetInput,
        vetResults,
        setVetResults,
        suppliers,
        setSuppliers,
        transferToVet,
        copyToMaster,
        transferToClean,
        addSupplier,
        updateSupplier,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
