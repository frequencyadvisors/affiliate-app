"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandShell, type BrandScreen } from "@/components/brand/brand-shell";
import { PublisherShell, type PublisherScreen } from "@/components/publisher/publisher-shell";
import { CaptureModeWrapper } from "@/components/capture/capture-mode-wrapper";
import { DEMO_SHARED_COMMISSION_ID, DEMO_SHARED_PROGRAM_NAME } from "@/lib/mock-data";
import {
  BRAND_CAPTURE_SCREENS,
  PUBLISHER_CAPTURE_SCREENS,
  resolveCaptureModeConfig,
  resolveScreenForView,
  resolveViewModeFromParams
} from "@/lib/capture-pipeline";

const PUBLISHER_SCREENS: PublisherScreen[] = PUBLISHER_CAPTURE_SCREENS;
const BRAND_SCREENS: BrandScreen[] = BRAND_CAPTURE_SCREENS;
const DEFAULT_BRAND_SCREEN: BrandScreen = "all-programs";
const DEFAULT_PUBLISHER_SCREEN: PublisherScreen = "earnings";
const DEFAULT_BRAND_PROGRAM = "all";
const DEFAULT_BRAND_BUSINESS_UNIT = "all";
const DEFAULT_BRAND_CREATOR = "SnackScope";

function getCurrentSearchParams() {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }

  return new URLSearchParams(window.location.search);
}

export function AppShell() {
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => getCurrentSearchParams());
  const requestedViewMode = resolveViewModeFromParams(searchParams);
  const captureConfig = resolveCaptureModeConfig(searchParams);
  const [viewMode, setViewMode] = useState<"publisher" | "brand">(requestedViewMode);

  useEffect(() => {
    const syncFromLocation = () => setSearchParams(getCurrentSearchParams());

    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, []);

  const requestedPublisherScreen = useMemo(() => {
    const screen = resolveScreenForView(searchParams, "publisher");
    return screen && PUBLISHER_SCREENS.includes(screen as PublisherScreen) ? (screen as PublisherScreen) : undefined;
  }, [searchParams]);

  const requestedBrandScreen = useMemo(() => {
    const screen = resolveScreenForView(searchParams, "brand");
    return screen && BRAND_SCREENS.includes(screen as BrandScreen) ? (screen as BrandScreen) : undefined;
  }, [searchParams]);
  const requestedProgram = searchParams.get("program") || undefined;
  const requestedCommission = searchParams.get("commission") || undefined;
  const requestedCreator = searchParams.get("creator") || undefined;
  const requestedBusinessUnit = searchParams.get("businessUnit") || undefined;

  useEffect(() => {
    setViewMode(requestedViewMode);
  }, [requestedViewMode]);

  return (
    <CaptureModeWrapper config={captureConfig}>
      {viewMode === "brand" ? (
        <BrandShell
          viewMode={viewMode}
          setViewMode={setViewMode}
          initialScreen={requestedBrandScreen ?? DEFAULT_BRAND_SCREEN}
          initialProgram={requestedProgram ?? DEFAULT_BRAND_PROGRAM}
          initialCommissionId={requestedCommission ?? DEMO_SHARED_COMMISSION_ID}
          initialCreator={requestedCreator ?? DEFAULT_BRAND_CREATOR}
          initialBusinessUnitId={requestedBusinessUnit ?? DEFAULT_BRAND_BUSINESS_UNIT}
        />
      ) : (
        <PublisherShell
          viewMode={viewMode}
          setViewMode={setViewMode}
          initialScreen={requestedPublisherScreen ?? DEFAULT_PUBLISHER_SCREEN}
          initialProgram={requestedProgram ?? DEMO_SHARED_PROGRAM_NAME}
          initialCommissionId={requestedCommission ?? DEMO_SHARED_COMMISSION_ID}
        />
      )}
    </CaptureModeWrapper>
  );
}
