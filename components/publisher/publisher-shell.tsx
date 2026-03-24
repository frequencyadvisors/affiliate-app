"use client";

import { type CSSProperties, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bell, ChevronDown, ChevronUp, Grip, Sparkles, User } from "lucide-react";
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

const shellTheme = {
  "--background": "oklch(97.02% 0.0078 305)",
  "--foreground": "oklch(21.03% 0.0078 305)",
  "--card": "oklch(100% 0.0039 305)",
  "--card-foreground": "oklch(21.03% 0.0078 305)",
  "--muted": "oklch(55.17% 0.0156 305)",
  "--muted-foreground": "oklch(55.17% 0.0156 305)",
  "--border": "oklch(90% 0.0078 305)",
  "--input": "oklch(100% 0.0039 305)",
  "--primary": "oklch(77% 0.13 305)",
  "--primary-foreground": "oklch(15% 0.026 305)",
  "--ring": "oklch(77% 0.13 305)",
  "--accent": "oklch(77% 0.13 305)",
  "--accent-foreground": "oklch(15% 0.026 305)",
  "--default": "oklch(94% 0.0078 305)",
  "--default-foreground": "oklch(21.03% 0.0059 305)",
  "--field-background": "oklch(100% 0.0039 305)",
  "--field-foreground": "oklch(21.03% 0.0078 305)",
  "--field-placeholder": "oklch(55.17% 0.0156 305)",
  "--field-border": "oklch(92% 0.0078 305)",
  "--surface": "oklch(100% 0.0039 305)",
  "--surface-foreground": "oklch(21.03% 0.0078 305)",
  "--surface-secondary": "oklch(95.24% 0.0062 305)",
  "--surface-secondary-foreground": "oklch(21.03% 0.0078 305)",
  "--surface-tertiary": "oklch(93.73% 0.0062 305)",
  "--surface-tertiary-foreground": "oklch(21.03% 0.0078 305)",
  "--overlay": "oklch(100% 0.0023 305)",
  "--overlay-foreground": "oklch(21.03% 0.0078 305)",
  "--scrollbar": "oklch(87.1% 0.0078 305)",
  "--segment": "oklch(100% 0.0078 305)",
  "--segment-foreground": "oklch(21.03% 0.0078 305)",
  "--separator": "oklch(92% 0.0078 305)",
  "--success": "oklch(73.29% 0.1965 156.95)",
  "--success-foreground": "oklch(21.03% 0.0059 156.95)",
  "--warning": "oklch(78.19% 0.161 78.47)",
  "--warning-foreground": "oklch(21.03% 0.0059 78.47)",
  "--danger": "oklch(65.32% 0.2364 31.88)",
  "--danger-foreground": "oklch(99.11% 0 0)",
  "--surface-shadow": "0 1px 2px rgba(15, 23, 42, 0.04), 0 16px 40px rgba(15, 23, 42, 0.08)",
  "--overlay-shadow": "0 12px 36px rgba(15, 23, 42, 0.12)",
  "--field-shadow": "0 1px 2px rgba(15, 23, 42, 0.05), 0 8px 24px rgba(15, 23, 42, 0.08)"
} as CSSProperties & Record<string, string>;

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
    "group flex h-11 w-full items-center overflow-hidden rounded-2xl border px-3 text-left transition-all duration-200",
    active
      ? "border-[var(--border)] bg-white text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
      : "border-transparent bg-transparent text-default-500 hover:border-[var(--border)] hover:bg-white/70 hover:text-foreground"
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(203,213,225,0.35),transparent_28%),radial-gradient(circle_at_top_right,rgba(192,132,252,0.12),transparent_24%),linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(242,244,248,1)_100%)] p-4 text-foreground">
      <div className="flex min-h-[calc(100vh-2rem)] overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_80px_rgba(15,23,42,0.08)]" style={shellTheme}>
      <aside className="flex w-[248px] shrink-0 flex-col justify-between border-r border-[var(--border)] bg-[var(--surface-secondary)]">
        <div className="flex min-h-px min-w-px flex-1 flex-col">
          <div className="flex h-[76px] items-center border-b border-[var(--border)] px-5">
            <div className="flex h-10 items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--foreground)] shadow-[0_8px_24px_rgba(15,23,42,0.15)]">
                <img src={publisherBrandEyeIcon} alt="" aria-hidden className="h-[16.34px] w-[31.052px]" />
              </div>
              <img src={publisherBrandWordmark} alt="FREEQ" className="h-[21.624px] w-[94.947px] opacity-90" />
            </div>
          </div>

          <div className="flex min-h-px min-w-px flex-1 flex-col justify-between px-4 py-4">
            <nav className="w-full space-y-2 text-sm">
              <button className={navButton(screen === "earnings" || screen === "detail")} onClick={() => transitionToScreen("earnings")}>
                <span className="flex w-full items-center gap-3">
                  <span className={["flex shrink-0 rounded-xl bg-white p-2 shadow-sm", screen === "earnings" || screen === "detail" ? "opacity-100" : "opacity-70"].join(" ")}>
                    <img src={publisherNavEarningsIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center text-[14px] leading-[20px] tracking-[-0.01em]", screen === "earnings" || screen === "detail" ? "font-medium" : "font-normal"].join(" ")}>
                    Earnings
                  </span>
                </span>
              </button>
              <button className={navButton(screen === "my-programs" || screen === "enrolled-program-detail")} onClick={() => transitionToScreen("my-programs")}>
                <span className="flex w-full items-center gap-3">
                  <span className={["flex shrink-0 rounded-xl bg-white p-2 shadow-sm", screen === "my-programs" || screen === "enrolled-program-detail" ? "opacity-100" : "opacity-70"].join(" ")}>
                    <img src={publisherNavMyProgramsIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center text-[14px] leading-[20px] tracking-[-0.01em]", screen === "my-programs" || screen === "enrolled-program-detail" ? "font-medium" : "font-normal"].join(" ")}>
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
                    "px-2 pb-3 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] motion-reduce:transition-none",
                    shouldShowProgramRailList ? "opacity-100 translate-y-0" : "-translate-y-1 opacity-0"
                  ].join(" ")}
                >
                  <div className="flex items-center justify-end px-2 py-2">
                    {canExpandProgramRailList && (
                      <button
                        type="button"
                        onClick={() => setShowAllProgramsInRail((current) => !current)}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-default-500 transition-colors hover:bg-white hover:text-foreground"
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
                            "flex w-full items-start justify-between gap-3 rounded-2xl px-3 py-2 text-left transition-colors",
                            isActive ? "bg-white text-foreground shadow-sm" : "text-default-500 hover:bg-white/75 hover:text-foreground"
                        ].join(" ")}
                      >
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-normal leading-[17px]">{program.programName}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-default-100 px-2 py-0.5 text-[10px] font-medium text-default-500">
                            {program.commissionCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button className={navButton(screen === "discover" || screen === "program-detail" || screen === "program-joined")} onClick={() => transitionToScreen("discover")}>
                <span className="flex w-full items-center gap-3">
                  <span className={["flex shrink-0 rounded-xl bg-white p-2 shadow-sm", screen === "discover" || screen === "program-detail" || screen === "program-joined" ? "opacity-100" : "opacity-70"].join(" ")}>
                    <Sparkles aria-hidden className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center text-[14px] leading-[20px] tracking-[-0.01em]", screen === "discover" || screen === "program-detail" || screen === "program-joined" ? "font-medium" : "font-normal"].join(" ")}>
                    Discover Programs
                  </span>
                </span>
              </button>
              <button className={navButton(screen === "disputes" || screen === "dispute-wizard")} onClick={() => transitionToScreen("disputes")}>
                <span className="flex w-full items-center gap-3">
                  <span className={["flex shrink-0 rounded-xl bg-white p-2 shadow-sm", screen === "disputes" || screen === "dispute-wizard" ? "opacity-100" : "opacity-70"].join(" ")}>
                    <img src={publisherNavDisputesIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center text-[14px] leading-[20px] tracking-[-0.01em]", screen === "disputes" || screen === "dispute-wizard" ? "font-medium" : "font-normal"].join(" ")}>
                    Disputes
                  </span>
                </span>
              </button>
            </nav>

            <div className="h-2 w-full" />
          </div>
        </div>

        <div className="w-full p-4">
          <div className="space-y-3 rounded-[24px] border border-[var(--border)] bg-white/80 p-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
            <button className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-default-500 transition-colors hover:bg-default-50 hover:text-foreground">
              <img src={publisherSettingsIcon} alt="" aria-hidden className="h-4 w-4" />
              Settings
            </button>
            <div className="flex rounded-2xl border border-[var(--border)] bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setViewMode("brand");
                  transitionToScreen("earnings");
                }}
                className={[
                  "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  viewMode === "brand" ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm" : "text-default-500 hover:bg-default-50 hover:text-foreground"
                ].join(" ")}
              >
                Brand
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("publisher");
                  transitionToScreen("earnings");
                }}
                className={[
                  "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  viewMode === "publisher" ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm" : "text-default-500 hover:bg-default-50 hover:text-foreground"
                ].join(" ")}
              >
                Creator
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-transparent">
        <header className="flex h-[76px] shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] bg-white/75 px-6 text-sm backdrop-blur">
          <div className="flex min-w-0 items-center gap-2 text-[14px] text-default-500">
            {crumbs.map((c, i) => (
              <div key={c.label} className="flex items-center gap-2">
                <button onClick={c.onClick} className="rounded-full px-2 py-1 text-foreground transition-colors hover:bg-default-50">{c.label}</button>
                {i < crumbs.length - 1 && <span className="text-default-300">/</span>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-default-500">
            <FigmaCaptureButton />
            <button className="relative rounded-full p-2 transition-colors hover:bg-default-50 hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span
                className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border border-white bg-[var(--accent)] text-[10px] font-semibold text-[var(--accent-foreground)] shadow-sm"
              >
                11
              </span>
            </button>
            <button className="rounded-full p-2 transition-colors hover:bg-default-50 hover:text-foreground">
              <User className="h-5 w-5" />
            </button>
            <button className="rounded-full p-2 transition-colors hover:bg-default-50 hover:text-foreground">
              <Grip className="h-5 w-5" />
            </button>
          </div>
        </header>
        {screen === "earnings" && stalePending && (
          <div className="flex h-[46px] w-full items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-tertiary)] px-4 text-sm text-foreground">
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
                <div className="mb-8 flex w-full flex-col gap-2">
                  <div className="flex items-center">
                    <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
                      {intro.title}
                    </h1>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-default-500 sm:text-base">{intro.subtitle}</p>
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
    </div>
  );
}
