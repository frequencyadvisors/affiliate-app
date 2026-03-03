"use client";

import { useState } from "react";
import { BrandShell } from "@/components/brand/brand-shell";
import { PublisherShell } from "@/components/publisher/publisher-shell";

export function AppShell() {
  const [viewMode, setViewMode] = useState<"publisher" | "brand">("publisher");

  if (viewMode === "brand") {
    return <BrandShell viewMode={viewMode} setViewMode={setViewMode} />;
  }

  return <PublisherShell viewMode={viewMode} setViewMode={setViewMode} />;
}
