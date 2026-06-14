"use client";

/**
 * Main page — renders active tab based on sidebar navigation.
 * Each tab is a separate component file per code structure requirements.
 */

import { AppProvider, useApp } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Layout from "@/components/Layout";
import SupplierDiscovery from "@/components/SupplierDiscovery";
import CleanData from "@/components/CleanData";
import VetCompany from "@/components/VetCompany";
import SupplierMaster from "@/components/SupplierMaster";

function TabContent() {
  const { activeTab } = useApp();

  switch (activeTab) {
    case "discovery":
      return <SupplierDiscovery />;
    case "clean":
      return <CleanData />;
    case "vet":
      return <VetCompany />;
    case "master":
      return <SupplierMaster />;
    default:
      return <SupplierDiscovery />;
  }
}

export default function Home() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Layout>
          <TabContent />
        </Layout>
      </AppProvider>
    </ThemeProvider>
  );
}
