"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bell, ChevronDown, ChevronUp, Grip, Sparkles, User } from "lucide-react";
import { ViewSwitcher } from "@/components/view-switcher";
import { COMMISSIONS, getAgeDays } from "@/lib/mock-data";
import { EarningsDashboard } from "@/components/publisher/earnings-dashboard";
import { CommissionDetail } from "@/components/publisher/commission-detail";
import { DisputeWizard } from "@/components/publisher/dispute-wizard";
import { DisputeResolution } from "@/components/publisher/dispute-resolution";
import { buildProgramData, MyPrograms } from "@/components/publisher/my-programs";
import { EnrolledProgramDetail } from "@/components/publisher/enrolled-program-detail";
import { DiscoverPrograms } from "@/components/publisher/discover-programs";
import { ProgramDetail } from "@/components/publisher/program-detail";
import { ProgramJoinConfirmation } from "@/components/publisher/program-join-confirmation";
import { FigmaCaptureButton } from "@/components/capture/figma-capture-button";
import { buildAppNavigationHref } from "@/lib/app-navigation";
const publisherBrandEyeIcon = "/assets/nav/publisher/eye.svg";
const publisherBrandWordmark = "/assets/nav/publisher/wordmark.svg";
const publisherNavEarningsIcon = "/assets/nav/publisher/earnings.svg";
const publisherNavMyProgramsIcon = "/assets/nav/publisher/my-programs.svg";
const publisherNavDisputesIcon = "/assets/nav/publisher/disputes.svg";
const publisherSettingsIcon = "/assets/nav/publisher/settings.svg";
const CONTENT_FADE_MS = 200;

export type PublisherScreen =
  | "earnings"
  | "detail"
  | "dispute-wizard"
  | "disputes"
  | "dispute-detail"
  | "my-programs"
  | "discover"
  | "program-detail"
  | "program-joined"
  | "enrolled-program-detail";

type PublisherNavigationState = {
  screen?: PublisherScreen;
  program?: string;
  commissionId?: string;
};

function getScrollStateKey(screen: PublisherScreen, program: string) {
  if (screen === "enrolled-program-detail" || screen === "program-detail" || screen === "program-joined") {
    return `${screen}:${program}`;
  }

  return screen;
}

function navButton(active: boolean) {
  return [
    "group flex h-10 w-full flex-col items-start overflow-hidden px-[13px] py-[5px] text-left",
    active
      ? "border-l-4 border-black bg-[var(--nav)] hover:border-black/30"
      : "bg-[var(--nav)] hover:bg-[var(--nav)]"
  ].join(" ");
}

export function PublisherShell({
  viewMode,
  setViewMode,
  initialScreen,
  initialProgram,
  initialCommissionId
}: {
  viewMode: "publisher" | "brand";
  setViewMode: (v: "publisher" | "brand") => void;
  initialScreen: PublisherScreen;
  initialProgram: string;
  initialCommissionId: string;
}) {
  const [screen, setScreen] = useState<PublisherScreen>(initialScreen);
  const [activeCommissionId, setActiveCommissionId] = useState(initialCommissionId);
  const [activeProgram, setActiveProgram] = useState(initialProgram);
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

  const restoreScrollPosition = useEffectEvent((nextScreen: PublisherScreen, nextProgram: string) => {
    const scrollTop = scrollPositionsRef.current[getScrollStateKey(nextScreen, nextProgram)] ?? 0;
    contentRef.current?.scrollTo({ top: scrollTop, left: 0, behavior: "auto" });
  });

  useEffect(() => {
    if (screen !== "enrolled-program-detail") {
      setShowAllProgramsInRail(false);
    }
  }, [screen]);

  useEffect(() => {
    restoreScrollPosition(screen, activeProgram);
  }, [screen, activeProgram, restoreScrollPosition]);

  const pushNavigationState = useEffectEvent((overrides: PublisherNavigationState = {}) => {
    const nextScreen = overrides.screen ?? screen;
    const nextProgram = overrides.program ?? activeProgram;
    const nextCommissionId = overrides.commissionId ?? activeCommissionId;
    const nextHref = buildAppNavigationHref({
      view: "publisher",
      screen: nextScreen,
      program: ["program-detail", "program-joined", "enrolled-program-detail", "detail", "dispute-wizard"].includes(nextScreen)
        ? nextProgram
        : undefined,
      commission: ["detail", "dispute-wizard"].includes(nextScreen) ? nextCommissionId : undefined
    });

    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentHref !== nextHref) {
      window.history.pushState(window.history.state, "", nextHref);
    }
  });

  const replaceNavigationState = useEffectEvent((overrides: PublisherNavigationState = {}) => {
    const nextScreen = overrides.screen ?? screen;
    const nextProgram = overrides.program ?? activeProgram;
    const nextCommissionId = overrides.commissionId ?? activeCommissionId;
    const nextHref = buildAppNavigationHref({
      view: "publisher",
      screen: nextScreen,
      program: ["program-detail", "program-joined", "enrolled-program-detail", "detail", "dispute-wizard"].includes(nextScreen)
        ? nextProgram
        : undefined,
      commission: ["detail", "dispute-wizard"].includes(nextScreen) ? nextCommissionId : undefined
    });

    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentHref !== nextHref) {
      window.history.replaceState(window.history.state, "", nextHref);
    }
  });

  const transitionToScreen = useEffectEvent((nextScreen: PublisherScreen, prepare?: () => void, overrides: PublisherNavigationState = {}) => {
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

    if (nextScreen === screen) {
      prepare?.();
      setIsContentVisible(true);
      pushNavigationState({ ...overrides, screen: nextScreen });
      restoreScrollPosition(nextScreen, nextProgram);
      return;
    }

    setIsContentVisible(false);
    contentFadeTimeoutRef.current = window.setTimeout(() => {
      prepare?.();
      setScreen(nextScreen);
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

  const commission = COMMISSIONS.find((c) => c.id === activeCommissionId) || COMMISSIONS[0];
  const stalePending = COMMISSIONS.some((c) => c.status === "pending" && getAgeDays(c.conversionTimestamp) > c.validationWindowDays);
  const programsForRail = useMemo(
    () =>
      buildProgramData()
        .map((program) => ({
          programName: program.programName,
          commissionCount: program.commissions
        }))
        .sort((a, b) => {
          if (b.commissionCount !== a.commissionCount) return b.commissionCount - a.commissionCount;
          return a.programName.localeCompare(b.programName);
        }),
    []
  );
  const shouldShowProgramRailList = screen === "enrolled-program-detail" && Boolean(activeProgram);
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
    if (screen === "detail") {
      return [
        { label: commission.programName, onClick: () => transitionToScreen("enrolled-program-detail", () => { setActiveProgram(commission.programName); }, { program: commission.programName }) },
        { label: "Commission Detail", onClick: () => transitionToScreen("detail") }
      ];
    }
    const list = [{ label: "Mr. Beast", onClick: () => transitionToScreen("earnings") }];
    if (["program-detail", "program-joined", "enrolled-program-detail"].includes(screen)) list.push({ label: activeProgram, onClick: () => transitionToScreen("program-detail") });
    if (screen === "disputes") list.push({ label: "Disputes", onClick: () => transitionToScreen("disputes") });
    return list;
  }, [screen, activeCommissionId, activeProgram, commission.programName, transitionToScreen]);

  function screenIntro() {
    if (screen === "earnings") {
      return {
        title: "Earnings",
        subtitle: "Track commission performance, conversion-stage movement, and payout outcomes."
      };
    }
    if (screen === "my-programs") {
      return {
        title: "My Programs",
        subtitle: "Review your active partnerships, performance, and program health."
      };
    }
    if (screen === "disputes") {
      return {
        title: "Disputes",
        subtitle: "Manage open cases, resolution status, and response timelines."
      };
    }
    if (screen === "discover") {
      return {
        title: "Discover Programs",
        subtitle: "Explore new partnerships with clear terms and payout expectations."
      };
    }
    return null;
  }

  const intro = screenIntro();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-[226px] shrink-0 flex-col justify-between border-r-2 border-black bg-[var(--nav)]">
        <div className="flex min-h-px min-w-px flex-1 flex-col">
          <div className="flex h-[60px] items-center border-b-2 border-black px-2">
            <div className="flex h-9 items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-[211.99px] bg-black">
                <img src={publisherBrandEyeIcon} alt="" aria-hidden className="h-[16.34px] w-[31.052px]" />
              </div>
              <img src={publisherBrandWordmark} alt="FREEQ" className="h-[21.624px] w-[94.947px]" />
            </div>
          </div>

          <div className="flex min-h-px min-w-px flex-1 flex-col justify-between py-[10px]">
            <nav className="w-full text-sm">
              <button className={navButton(screen === "earnings" || screen === "detail")} onClick={() => transitionToScreen("earnings")}>
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", screen === "earnings" || screen === "detail" ? "opacity-100" : "opacity-50"].join(" ")}>
                    <img src={publisherNavEarningsIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", screen === "earnings" || screen === "detail" ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    Earnings
                  </span>
                </span>
              </button>
              <button className={navButton(screen === "my-programs" || screen === "enrolled-program-detail")} onClick={() => transitionToScreen("my-programs")}>
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", screen === "my-programs" || screen === "enrolled-program-detail" ? "opacity-100" : "opacity-50"].join(" ")}>
                    <img src={publisherNavMyProgramsIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", screen === "my-programs" || screen === "enrolled-program-detail" ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    My Programs
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
                          onClick={() =>
                            transitionToScreen("enrolled-program-detail", () => {
                              setActiveProgram(program.programName);
                            }, { program: program.programName })
                          }
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
              <button
                className={navButton(screen === "discover" || screen === "program-detail" || screen === "program-joined")}
                onClick={() => transitionToScreen("discover")}
              >
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", screen === "discover" || screen === "program-detail" || screen === "program-joined" ? "opacity-100" : "opacity-50"].join(" ")}>
                    <Sparkles aria-hidden className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", screen === "discover" || screen === "program-detail" || screen === "program-joined" ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    Discover Programs
                  </span>
                </span>
              </button>
              <button className={navButton(screen === "disputes" || screen === "dispute-wizard")} onClick={() => transitionToScreen("disputes")}>
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", screen === "disputes" || screen === "dispute-wizard" ? "opacity-100" : "opacity-50"].join(" ")}>
                    <img src={publisherNavDisputesIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", screen === "disputes" || screen === "dispute-wizard" ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    Disputes
                  </span>
                </span>
              </button>
            </nav>

            <div className="flex-1" />
          </div>
        </div>

        <div className="w-full pb-2">
          <div className="px-3 pb-2">
            <button className="flex w-full items-center gap-2 rounded-[6px] px-2 py-2 text-sm hover:bg-black/5">
              <img src={publisherSettingsIcon} alt="" aria-hidden className="h-4 w-4" />
              Settings
            </button>
          </div>
          <div className="border-t px-3 pt-3 pb-3" style={{ borderTopColor: "rgba(0,0,0,0.10)" }}>
            <ViewSwitcher viewMode={viewMode} onChange={(v) => { setViewMode(v); transitionToScreen("earnings"); }} />
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-[var(--background)]">
        <header className="flex h-[60px] shrink-0 items-center justify-between gap-2 border-b-2 border-black bg-[var(--background)] px-6 text-sm">
          <div className="flex items-center gap-2 text-[15px]">
            {crumbs.map((c, i) => (
              <div key={c.label} className="flex items-center gap-2">
                <button onClick={c.onClick} className="hover:underline">{c.label}</button>
                {i < crumbs.length - 1 && <span className="opacity-30">/</span>}
              </div>
            ))}
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
        {screen === "earnings" && stalePending && (
          <div className="flex h-[46px] w-full items-center gap-2 border-b-2 border-black bg-status-pending-bg px-[13px] text-sm text-[#04070f]">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Pending Health Alert: at least one commission is past validation window.</span>
          </div>
        )}

        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div
            className={[
              screen === "program-detail" ? "pb-0" : "pb-[100px]",
              "transition-opacity duration-200 ease-out motion-reduce:transition-none",
              isContentVisible ? "opacity-100" : "opacity-0"
            ].join(" ")}
          >
            <div className={screen === "enrolled-program-detail" || screen === "my-programs" ? "w-full" : "mx-auto w-full max-w-[1180px] px-8 py-8"}>
              {intro && screen !== "my-programs" && (
                <div className="mb-[35px] flex h-[79.773px] w-full flex-col gap-2">
                  <div className="flex h-[50px] items-center">
                    <h1 className="font-[var(--font-jost)] text-[50px] font-semibold leading-[24px] tracking-[-0.2px] text-[#04070f]">
                      {intro.title}
                    </h1>
                  </div>
                  <p className="text-[16px] text-muted-foreground">{intro.subtitle}</p>
                </div>
              )}
              {screen === "earnings" && <EarningsDashboard onOpenCommission={(id) => { transitionToScreen("detail", () => { setActiveCommissionId(id); }, { commissionId: id }); }} />}
              {screen === "detail" && <CommissionDetail commission={commission} onDispute={(id) => { transitionToScreen("dispute-wizard", () => { setActiveCommissionId(id); }, { commissionId: id }); }} />}
              {screen === "dispute-wizard" && <DisputeWizard commissionId={activeCommissionId} onSubmit={() => transitionToScreen("disputes")} />}
              {screen === "disputes" && <DisputeResolution showListHeader={false} />}
              {screen === "my-programs" && <MyPrograms onOpenProgram={(name) => { transitionToScreen("enrolled-program-detail", () => { setActiveProgram(name); }, { program: name }); }} onDiscover={() => transitionToScreen("discover")} />}
              {screen === "enrolled-program-detail" && <EnrolledProgramDetail programName={activeProgram} onOpenCommission={(id) => { transitionToScreen("detail", () => { setActiveCommissionId(id); }, { commissionId: id }); }} />}
              {screen === "discover" && <DiscoverPrograms onOpenProgram={(name) => { transitionToScreen("program-detail", () => { setActiveProgram(name); }, { program: name }); }} />}
              {screen === "program-detail" && <ProgramDetail name={activeProgram} onJoin={() => transitionToScreen("program-joined")} />}
              {screen === "program-joined" && <ProgramJoinConfirmation name={activeProgram} onMyPrograms={() => transitionToScreen("my-programs")} onDiscover={() => transitionToScreen("discover")} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
