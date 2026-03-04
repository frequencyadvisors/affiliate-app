"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrandShell, type BrandScreen } from "@/components/brand/brand-shell";
import { PublisherShell, type PublisherScreen } from "@/components/publisher/publisher-shell";

const PUBLISHER_SCREENS: PublisherScreen[] = [
  "earnings",
  "detail",
  "dispute-wizard",
  "disputes",
  "dispute-detail",
  "my-programs",
  "discover",
  "program-detail",
  "program-joined",
  "enrolled-program-detail"
];

const BRAND_SCREENS: BrandScreen[] = [
  "all-programs",
  "program-detail",
  "queue",
  "disputes",
  "dispute-detail",
  "publishers",
  "detail",
  "create-program"
];

export function AppShell() {
  const searchParams = useSearchParams();
  const requestedViewMode = searchParams.get("view") === "brand" ? "brand" : "publisher";
  const [viewMode, setViewMode] = useState<"publisher" | "brand">(requestedViewMode);

  const requestedPublisherScreen = useMemo(() => {
    const screen = searchParams.get("screen");
    return screen && PUBLISHER_SCREENS.includes(screen as PublisherScreen) ? (screen as PublisherScreen) : undefined;
  }, [searchParams]);

  const requestedBrandScreen = useMemo(() => {
    const screen = searchParams.get("screen");
    return screen && BRAND_SCREENS.includes(screen as BrandScreen) ? (screen as BrandScreen) : undefined;
  }, [searchParams]);
  const requestedProgram = searchParams.get("program") || undefined;

  useEffect(() => {
    setViewMode(requestedViewMode);
  }, [requestedViewMode]);

  if (viewMode === "brand") {
    return <BrandShell viewMode={viewMode} setViewMode={setViewMode} initialScreen={requestedBrandScreen} initialProgram={requestedProgram} />;
  }

  return <PublisherShell viewMode={viewMode} setViewMode={setViewMode} initialScreen={requestedPublisherScreen} />;
}
