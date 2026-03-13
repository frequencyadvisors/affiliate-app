"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { Bell, Building2, ChevronDown, ChevronUp, Grip, Settings, User } from "lucide-react";
import { ViewSwitcher } from "@/components/view-switcher";
import { BRAND_PROGRAMS_DATA, COMMISSIONS, getProgramHierarchyByProgramId, getProgramHierarchyByProgramName } from "@/lib/mock-data";
import { AllProgramsGrid } from "@/components/brand/all-programs-grid";
import { BrandProgramDetail } from "@/components/brand/brand-program-detail";
import { CommissionQueue } from "@/components/brand/commission-queue";
import { CommissionDetailBrand } from "@/components/brand/commission-detail-brand";
import { DisputeInbox } from "@/components/brand/dispute-inbox";
import { PublishersList } from "@/components/brand/publishers-list";
import { CreateProgram, CreateProgramDraft } from "@/components/brand/create-program";
import { BusinessUnitsManager } from "@/components/brand/business-units-manager";
import { CreatorInsights } from "@/components/brand/creator-insights";
import { FigmaCaptureButton } from "@/components/capture/figma-capture-button";
import { buildAppNavigationHref } from "@/lib/app-navigation";

export type BrandScreen = "all-programs" | "program-detail" | "queue" | "disputes" | "dispute-detail" | "publishers" | "business-units" | "detail" | "create-program" | "creator-detail";
type BrandNavigationState = {
  screen?: BrandScreen;
  program?: "all" | string;
  commissionId?: string;
  creator?: string;
  businessUnitId?: "all" | string;
};

function getScrollStateKey(screen: BrandScreen, program: "all" | string) {
  if (screen === "program-detail") {
    return `${screen}:${program}`;
  }

  return screen;
}

const brandEyeIcon = "/assets/nav/brand/eye.svg";
const brandWordmark = "/assets/nav/brand/wordmark.svg";
const navAllProgramsIcon = "/assets/nav/brand/all-programs.svg";
const navCommissionsIcon = "/assets/nav/brand/commissions.svg";
const navDisputesIcon = "/assets/nav/brand/disputes.svg";
const CONTENT_FADE_MS = 200;

function navButton(active: boolean) {
  return [
    "group flex h-10 w-full flex-col items-start overflow-hidden px-[13px] py-[5px] text-left",
    active
      ? "border-l-4 border-black bg-[var(--nav)] hover:border-black/30"
      : "bg-[var(--nav)] hover:bg-[var(--nav)]"
  ].join(" ");
}

export function BrandShell({
  viewMode,
  setViewMode,
  initialScreen,
  initialProgram,
  initialCommissionId,
  initialCreator,
  initialBusinessUnitId
}: {
  viewMode: "publisher" | "brand";
  setViewMode: (v: "publisher" | "brand") => void;
  initialScreen: BrandScreen;
  initialProgram: string;
  initialCommissionId: string;
  initialCreator: string;
  initialBusinessUnitId: string;
}) {
  const [screen, setScreen] = useState<BrandScreen>(initialScreen);
  const [activeProgram, setActiveProgram] = useState<"all" | string>(initialProgram);
  const [activeBusinessUnitId, setActiveBusinessUnitId] = useState<"all" | string>(initialBusinessUnitId);
  const [activeCommissionId, setActiveCommissionId] = useState<string>(initialCommissionId);
  const [activeCreator, setActiveCreator] = useState<string>(initialCreator);
  const [createdPrograms, setCreatedPrograms] = useState<(CreateProgramDraft & { status: "draft" | "active" })[]>([]);
  const [createProgramStep, setCreateProgramStep] = useState(0);
  const [showAllProgramsInRail, setShowAllProgramsInRail] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const programRailContentRef = useRef<HTMLDivElement>(null);
  const contentFadeFrameRef = useRef<number | null>(null);
  const contentFadeTimeoutRef = useRef<number | null>(null);
  const scrollPositionsRef = useRef<Record<string, number>>({});
  const [programRailHeight, setProgramRailHeight] = useState(0);

  useEffect(() => {
    if (contentFadeTimeoutRef.current !== null) {
      window.clearTimeout(contentFadeTimeoutRef.current);
      contentFadeTimeoutRef.current = null;
    }
    if (contentFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(contentFadeFrameRef.current);
      contentFadeFrameRef.current = null;
    }
    setIsContentVisible(true);
    setScreen(initialScreen);
  }, [initialScreen]);

  useEffect(() => {
    setActiveProgram(initialProgram);
  }, [initialProgram]);

  useEffect(() => {
    setActiveCommissionId(initialCommissionId);
  }, [initialCommissionId]);

  useEffect(() => {
    setActiveCreator(initialCreator);
  }, [initialCreator]);

  useEffect(() => {
    setActiveBusinessUnitId(initialBusinessUnitId);
  }, [initialBusinessUnitId]);

  const restoreScrollPosition = useEffectEvent((nextScreen: BrandScreen, nextProgram: "all" | string) => {
    const scrollTop = scrollPositionsRef.current[getScrollStateKey(nextScreen, nextProgram)] ?? 0;
    contentRef.current?.scrollTo({ top: scrollTop, left: 0, behavior: "auto" });
  });

  const pushNavigationState = useEffectEvent((overrides: BrandNavigationState = {}) => {
    const nextScreen = overrides.screen ?? screen;
    const nextProgram = overrides.program ?? activeProgram;
    const nextCommissionId = overrides.commissionId ?? activeCommissionId;
    const nextCreator = overrides.creator ?? activeCreator;
    const nextBusinessUnitId = overrides.businessUnitId ?? activeBusinessUnitId;
    const nextHref = buildAppNavigationHref({
      view: "brand",
      screen: nextScreen,
      program: nextProgram !== "all" ? nextProgram : undefined,
      commission: nextScreen === "detail" ? nextCommissionId : undefined,
      creator: nextScreen === "creator-detail" ? nextCreator : undefined,
      businessUnit: nextBusinessUnitId !== "all" ? nextBusinessUnitId : undefined
    });

    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentHref !== nextHref) {
      window.history.pushState(window.history.state, "", nextHref);
    }
  });

  const replaceNavigationState = useEffectEvent((overrides: BrandNavigationState = {}) => {
    const nextScreen = overrides.screen ?? screen;
    const nextProgram = overrides.program ?? activeProgram;
    const nextCommissionId = overrides.commissionId ?? activeCommissionId;
    const nextCreator = overrides.creator ?? activeCreator;
    const nextBusinessUnitId = overrides.businessUnitId ?? activeBusinessUnitId;
    const nextHref = buildAppNavigationHref({
      view: "brand",
      screen: nextScreen,
      program: nextProgram !== "all" ? nextProgram : undefined,
      commission: nextScreen === "detail" ? nextCommissionId : undefined,
      creator: nextScreen === "creator-detail" ? nextCreator : undefined,
      businessUnit: nextBusinessUnitId !== "all" ? nextBusinessUnitId : undefined
    });

    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentHref !== nextHref) {
      window.history.replaceState(window.history.state, "", nextHref);
    }
  });

  const transitionToScreen = useEffectEvent((nextScreen: BrandScreen, prepare?: () => void, force = false, overrides: BrandNavigationState = {}) => {
    scrollPositionsRef.current[getScrollStateKey(screen, activeProgram)] = contentRef.current?.scrollTop ?? 0;
    const nextProgram = overrides.program ?? activeProgram;
    replaceNavigationState();

    if (contentFadeTimeoutRef.current !== null) {
      window.clearTimeout(contentFadeTimeoutRef.current);
      contentFadeTimeoutRef.current = null;
    }
    if (contentFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(contentFadeFrameRef.current);
      contentFadeFrameRef.current = null;
    }

    if (nextScreen === screen && !force) {
      prepare?.();
      setIsContentVisible(true);
      pushNavigationState({ ...overrides, screen: nextScreen });
      restoreScrollPosition(nextScreen, nextProgram);
      return;
    }

    setIsContentVisible(false);
    contentFadeTimeoutRef.current = window.setTimeout(() => {
      prepare?.();
      if (nextScreen !== screen) {
        setScreen(nextScreen);
      }
      pushNavigationState({ ...overrides, screen: nextScreen });
      restoreScrollPosition(nextScreen, nextProgram);
      contentFadeFrameRef.current = window.requestAnimationFrame(() => {
        setIsContentVisible(true);
        contentFadeFrameRef.current = null;
      });
      contentFadeTimeoutRef.current = null;
    }, CONTENT_FADE_MS);
  });

  useEffect(() => {
    return () => {
      if (contentFadeTimeoutRef.current !== null) {
        window.clearTimeout(contentFadeTimeoutRef.current);
      }
      if (contentFadeFrameRef.current !== null) {
        window.cancelAnimationFrame(contentFadeFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (screen !== "create-program") {
      setCreateProgramStep(0);
    }
  }, [screen]);

  useEffect(() => {
    if (screen !== "program-detail") {
      setShowAllProgramsInRail(false);
    }
  }, [screen]);

  useEffect(() => {
    restoreScrollPosition(screen, activeProgram);
  }, [screen, activeProgram, restoreScrollPosition]);

  const selectedProgram = activeProgram !== "all" ? (BRAND_PROGRAMS_DATA[activeProgram] || createdPrograms.find((p) => p.programName === activeProgram)) : null;
  const activeCommission = COMMISSIONS.find((c) => c.id === activeCommissionId) || COMMISSIONS[0];
  const isProgramsSectionActive = screen === "all-programs" || screen === "program-detail";

  const programsForRail = useMemo(() => {
    const normalizedPrograms = [
      ...Object.values(BRAND_PROGRAMS_DATA).map((program) => ({
        programName: program.programName,
        businessUnitId: program.businessUnitId,
        businessUnitName: program.businessUnitName,
        status: program.status
      })),
      ...createdPrograms
        .filter((program) => !BRAND_PROGRAMS_DATA[program.programName])
        .map((program) => ({
          programName: program.programName,
          businessUnitId: "drafts",
          businessUnitName: "Drafts",
          status: program.status
        }))
    ];

    return normalizedPrograms
      .map((program) => ({
        programName: program.programName,
        businessUnitName: program.businessUnitName,
        status: program.status,
        commissionCount: COMMISSIONS.filter((commission) => commission.programName === program.programName).length
      }))
      .sort((a, b) => {
        if (b.commissionCount !== a.commissionCount) return b.commissionCount - a.commissionCount;
        return a.programName.localeCompare(b.programName);
      });
  }, [createdPrograms]);

  const shouldShowProgramRailList = screen === "program-detail" && activeProgram !== "all";
  const visibleProgramsForRail = shouldShowProgramRailList && !showAllProgramsInRail ? programsForRail.slice(0, 10) : programsForRail;
  const canExpandProgramRailList = programsForRail.length > 10;

  useEffect(() => {
    if (!programRailContentRef.current) return;

    const measure = () => {
      setProgramRailHeight(programRailContentRef.current?.scrollHeight ?? 0);
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(programRailContentRef.current);
    return () => observer.disconnect();
  }, [visibleProgramsForRail.length, canExpandProgramRailList, showAllProgramsInRail, activeProgram]);

  const crumbs = useMemo(() => {
    const list = [{ label: "Mr. Beast", onClick: () => transitionToScreen("all-programs", () => { setActiveProgram("all"); setActiveBusinessUnitId("all"); }, false, { program: "all", businessUnitId: "all" }) }];

    if (screen === "detail") {
      const hierarchy = getProgramHierarchyByProgramId(activeCommission.programId) || getProgramHierarchyByProgramName(activeCommission.programName);
      if (hierarchy) {
        return [
          { label: hierarchy.brand?.name || "Mr. Beast", onClick: () => transitionToScreen("all-programs", () => { setActiveProgram("all"); setActiveBusinessUnitId("all"); }, false, { program: "all", businessUnitId: "all" }) },
          { label: hierarchy.businessUnit?.name || "Business", onClick: () => transitionToScreen("all-programs", () => { setActiveBusinessUnitId(hierarchy.program.businessUnitId); setActiveProgram("all"); }, false, { program: "all", businessUnitId: hierarchy.program.businessUnitId }) },
          { label: hierarchy.program.programName, onClick: () => transitionToScreen("program-detail", () => { setActiveProgram(hierarchy.program.programName); }, true, { program: hierarchy.program.programName }) },
          { label: "Commission Detail", onClick: () => transitionToScreen("detail") }
        ];
      }
    }

    if (activeProgram !== "all") {
      const hierarchy = getProgramHierarchyByProgramName(activeProgram);
      if (hierarchy) {
        list.push({ label: hierarchy.businessUnit?.name || "Business", onClick: () => transitionToScreen("all-programs", () => { setActiveBusinessUnitId(hierarchy.program.businessUnitId); setActiveProgram("all"); }, false, { program: "all", businessUnitId: hierarchy.program.businessUnitId }) });
      }
      list.push({ label: activeProgram, onClick: () => transitionToScreen("program-detail", undefined, true, { program: activeProgram }) });
    }
    if (screen === "creator-detail") list.push({ label: activeCreator, onClick: () => transitionToScreen("creator-detail", undefined, false, { creator: activeCreator }) });
    if (screen === "disputes") list.push({ label: "Disputes", onClick: () => transitionToScreen("disputes") });
    return list;
  }, [screen, activeProgram, activeCommissionId, activeCommission.programId, activeCommission.programName, activeCreator, transitionToScreen]);

  function openCommission(id: string) {
    const selected = COMMISSIONS.find((c) => c.id === id);
    const hierarchy = selected
      ? (getProgramHierarchyByProgramId(selected.programId) || getProgramHierarchyByProgramName(selected.programName))
      : null;

    transitionToScreen("detail", () => {
      if (selected) {
        setActiveProgram(selected.programName);
        if (hierarchy) setActiveBusinessUnitId(hierarchy.program.businessUnitId);
      }
      setActiveCommissionId(id);
    }, false, {
      program: selected?.programName ?? activeProgram,
      commissionId: id,
      businessUnitId: hierarchy?.program.businessUnitId ?? activeBusinessUnitId
    });
  }

  function screenIntro() {
    if (screen === "queue") {
      return {
        title: "Commissions",
        subtitle: "Monitor verified, disputed, and unestablished creator influence across all programmes."
      };
    }
    if (screen === "disputes") {
      return {
        title: "Disputes",
        subtitle: "Track open cases, response quality, and resolution urgency."
      };
    }
    if (screen === "publishers") {
      return {
        title: "Creators",
        subtitle: "Monitor creator performance, conversion volume, and approval rates."
      };
    }
    return null;
  }

  const intro = screenIntro();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex h-full w-[226px] shrink-0 flex-col justify-between border-r-2 border-black bg-[var(--nav)]">
        <div className="flex min-h-px min-w-px flex-1 flex-col">
          <div className="flex h-[60px] items-center border-b-2 border-black px-2">
            <div className="flex h-9 items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-[211.99px] bg-black">
                <img src={brandEyeIcon} alt="" aria-hidden className="h-[16.34px] w-[31.052px]" />
              </div>
              <img src={brandWordmark} alt="FREEQ" className="h-[21.624px] w-[94.947px]" />
            </div>
          </div>

          <div className="flex min-h-px min-w-px flex-1 flex-col items-center justify-between py-[10px]">
            <nav className="w-full text-sm">
              <button className={navButton(isProgramsSectionActive)} onClick={() => transitionToScreen("all-programs", () => { setActiveProgram("all"); setActiveBusinessUnitId("all"); }, false, { program: "all", businessUnitId: "all" })}>
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", isProgramsSectionActive ? "opacity-100" : "opacity-50"].join(" ")}>
                    <img src={navAllProgramsIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", isProgramsSectionActive ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    All Programs
                  </span>
                </span>
              </button>
              <div
                aria-hidden={!shouldShowProgramRailList}
                className={[
                  "overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] motion-reduce:transition-none",
                  shouldShowProgramRailList ? "opacity-100 translate-y-0" : "pointer-events-none -translate-y-2 opacity-0"
                ].join(" ")}
                style={{ maxHeight: shouldShowProgramRailList ? programRailHeight : 0 }}
              >
                <div
                  ref={programRailContentRef}
                  className={[
                    "px-4 pb-3 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] motion-reduce:transition-none",
                    shouldShowProgramRailList ? "opacity-100 translate-y-0" : "-translate-y-1 opacity-0"
                  ].join(" ")}
                >
                  <div className="flex items-center justify-end px-2 py-1">
                    {canExpandProgramRailList && (
                      <button
                        type="button"
                        onClick={() => setShowAllProgramsInRail((current) => !current)}
                        className="inline-flex items-center gap-1 px-1 py-1 text-[11px] font-semibold text-[#04070f] transition-colors hover:text-[#04070f]/70"
                      >
                        {showAllProgramsInRail ? "Show less" : "See more"}
                        {showAllProgramsInRail ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>

                  <div className="mt-1 space-y-1 pl-[15px]">
                    {visibleProgramsForRail.map((program) => {
                      const isActive = program.programName === activeProgram;

                      return (
                        <button
                          key={program.programName}
                          type="button"
                          onClick={() => {
                            const hierarchy = getProgramHierarchyByProgramName(program.programName);
                            transitionToScreen("program-detail", () => {
                              setActiveProgram(program.programName);
                              if (hierarchy) setActiveBusinessUnitId(hierarchy.program.businessUnitId);
                            }, true, { program: program.programName, businessUnitId: hierarchy?.program.businessUnitId ?? activeBusinessUnitId });
                          }}
                          className={[
                            "flex w-full items-start justify-between gap-2 px-2 py-2 text-left transition-colors",
                            isActive ? "text-[#04070f]" : "text-[#04070f]/70 hover:text-[#04070f]"
                          ].join(" ")}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-normal leading-[17px]">{program.programName}</p>
                          </div>
                          <span className="shrink-0 text-[10px] font-semibold opacity-60">
                            {program.commissionCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button className={navButton(screen === "queue")} onClick={() => transitionToScreen("queue", () => { setActiveProgram("all"); setActiveBusinessUnitId("all"); }, false, { program: "all", businessUnitId: "all" })}>
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", screen === "queue" ? "opacity-100" : "opacity-50"].join(" ")}>
                    <img src={navCommissionsIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", screen === "queue" ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    Commissions
                  </span>
                </span>
              </button>
              <button className={navButton(screen === "disputes")} onClick={() => transitionToScreen("disputes")}>
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", screen === "disputes" ? "opacity-100" : "opacity-50"].join(" ")}>
                    <img src={navDisputesIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", screen === "disputes" ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    Disputes
                  </span>
                </span>
              </button>
              <button className={navButton(screen === "business-units")} onClick={() => transitionToScreen("business-units")}>
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", screen === "business-units" ? "opacity-100" : "opacity-50"].join(" ")}>
                    <Building2 className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", screen === "business-units" ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    Businesses
                  </span>
                </span>
              </button>
            </nav>

            <div className="w-full" />
          </div>
        </div>

        <div className="w-full pb-2">
          <div className="px-3 pb-2">
            <button className="flex w-full items-center gap-2 rounded-[6px] px-2 py-2 text-sm hover:bg-black/5"><Settings className="h-4 w-4" />Settings</button>
          </div>
          <div className="border-t px-3 pt-3 pb-3" style={{ borderTopColor: "rgba(0,0,0,0.10)" }}>
            <ViewSwitcher
              viewMode={viewMode}
              onChange={(v) => {
                setViewMode(v);
                transitionToScreen("all-programs", () => {
                  setActiveProgram("all");
                  setActiveBusinessUnitId("all");
                }, false, { program: "all", businessUnitId: "all" });
              }}
            />
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-[var(--background)]">
        <header className="flex h-[60px] shrink-0 items-center justify-between gap-2 border-b-2 border-black bg-[var(--background)] px-6 text-sm">
          <div className="flex items-center gap-2 text-[15px]">
            {screen === "create-program" ? (
              <>
                <span>New Program</span>
                <span>/</span>
                <span>{`Step ${createProgramStep + 1}`}</span>
              </>
            ) : (
              <>
                <button className="hover:underline" onClick={() => transitionToScreen("all-programs", () => { setActiveProgram("all"); setActiveBusinessUnitId("all"); }, false, { program: "all", businessUnitId: "all" })}>Mr. Beast</button>
                {screen === "all-programs" && <span>Overview</span>}
              </>
            )}
            {screen !== "all-programs" && screen !== "create-program" &&
              crumbs.slice(1).map((c, i) => (
                <div key={`${c.label}-${i}`} className="flex items-center gap-2">
                  <span>/</span>
                  <button className="hover:underline" onClick={c.onClick}>{c.label}</button>
                </div>
              ))
            }
          </div>
          <div className="flex items-center gap-4">
            <FigmaCaptureButton />
            <button className="relative">
              <Bell className="h-5 w-5" />
              <span
                className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full border-2 text-[11px] font-semibold"
                style={{ backgroundColor: "var(--primary)", borderColor: "var(--background)" }}
              >
                11
              </span>
            </button>
            <User className="h-5 w-5" />
            <Grip className="h-5 w-5" />
          </div>
        </header>
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div
            className={[
              screen === "program-detail" ? "pb-0" : "pb-[100px]",
              "transition-opacity duration-200 ease-out motion-reduce:transition-none",
              isContentVisible ? "opacity-100" : "opacity-0"
            ].join(" ")}
          >
            <div
              className={
                screen === "business-units"
                  ? "flex min-h-full w-full items-center justify-center px-8 py-8"
                  : screen === "program-detail" || screen === "all-programs" || screen === "creator-detail"
                    ? "w-full"
                    : "mx-auto w-full max-w-[1180px] px-8 py-8"
              }
            >
              {intro && (
                <div className="mb-[35px] flex h-[79.773px] w-full flex-col gap-2">
                  <div className="flex h-[50px] items-center">
                    <h1 className="font-[var(--font-jost)] text-[50px] font-semibold leading-[24px] tracking-[-0.2px] text-[#04070f]">
                      {intro.title}
                    </h1>
                  </div>
                  <p className="text-[16px] text-muted-foreground">{intro.subtitle}</p>
                </div>
              )}
              {screen === "all-programs" && (
                <AllProgramsGrid
                  businessUnitId={activeBusinessUnitId}
                  onOpenProgram={(p) => {
                    const hierarchy = getProgramHierarchyByProgramName(p);
                    transitionToScreen("program-detail", () => {
                      setActiveProgram(p);
                      if (hierarchy) setActiveBusinessUnitId(hierarchy.program.businessUnitId);
                    }, true, { program: p, businessUnitId: hierarchy?.program.businessUnitId ?? activeBusinessUnitId });
                  }}
                  onCreateProgram={() => transitionToScreen("create-program")}
                />
              )}
              {screen === "program-detail" && selectedProgram && "trustSummary" in selectedProgram && (
                <BrandProgramDetail
                  program={selectedProgram as any}
                  onOpenCommission={openCommission}
                  onOpenCreator={(name) => {
                    transitionToScreen("creator-detail", () => {
                      setActiveCreator(name);
                    }, false, { creator: name });
                  }}
                />
              )}
              {screen === "creator-detail" && <CreatorInsights creatorName={activeCreator} />}
              {screen === "queue" && (
                <CommissionQueue
                  programFilter={activeProgram}
                  onOpenCommission={openCommission}
                  showHeader={false}
                  showReliabilityEyebrow={false}
                  showRecordsIntro={false}
                  showFilteredSummaryCard={false}
                  showOverallSummaryLine
                />
              )}
              {screen === "detail" && <CommissionDetailBrand commission={activeCommission} />}
              {screen === "disputes" && <DisputeInbox onOpenCommission={openCommission} showListHeader={false} />}
              {screen === "publishers" && <PublishersList programFilter={activeProgram} showHeader={false} />}
              {screen === "business-units" && <BusinessUnitsManager />}
              {screen === "create-program" && (
                <CreateProgram
                  onStepChange={setCreateProgramStep}
                  onSaveDraft={(draft) => {
                    setCreatedPrograms((prev) => [...prev.filter((p) => p.programName !== draft.programName), { ...draft, status: "draft" }]);
                    setActiveProgram(draft.programName);
                  }}
                  onPublish={(draft) => {
                    transitionToScreen("all-programs", () => {
                      setCreatedPrograms((prev) => [...prev.filter((p) => p.programName !== draft.programName), { ...draft, status: "active" }]);
                      setActiveProgram(draft.programName);
                    }, false, { program: draft.programName });
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
