"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Grip, Rocket, Settings, User } from "lucide-react";
import { ViewSwitcher } from "@/components/view-switcher";
import { Button } from "@/components/ui/button";
import { BRAND_PROGRAMS_DATA, COMMISSIONS } from "@/lib/mock-data";
import { AllProgramsGrid } from "@/components/brand/all-programs-grid";
import { BrandProgramDetail } from "@/components/brand/brand-program-detail";
import { CommissionQueue } from "@/components/brand/commission-queue";
import { CommissionDetailBrand } from "@/components/brand/commission-detail-brand";
import { DisputeInbox } from "@/components/brand/dispute-inbox";
import { PublishersList } from "@/components/brand/publishers-list";
import { CreateProgram, CreateProgramDraft } from "@/components/brand/create-program";

export type BrandScreen = "all-programs" | "program-detail" | "queue" | "disputes" | "dispute-detail" | "publishers" | "test-flight" | "detail" | "create-program";
const createProgramIcon = "https://www.figma.com/api/mcp/asset/a076753a-400d-4add-8301-1e6adba64c8a";
const brandEyeIcon = "https://www.figma.com/api/mcp/asset/05344e1b-ddc1-4efb-a08a-78e83255c98a";
const brandWordmark = "https://www.figma.com/api/mcp/asset/8e86cb85-e11a-484f-8bf2-1a74b4b4344e";
const railCollapseIcon = "https://www.figma.com/api/mcp/asset/aedf3b33-11ea-49bb-aff7-d9124e170b71";
const navAllProgramsIcon = "https://www.figma.com/api/mcp/asset/ae965d9e-7762-404c-9858-ae5b291be3c1";
const navCommissionsIcon = "https://www.figma.com/api/mcp/asset/1748b546-bc95-4019-bfbb-c8155c8d8527";
const navDisputesIcon = "https://www.figma.com/api/mcp/asset/ed672f88-c4d0-4048-9ac2-41665cd78124";

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
  initialProgram
}: {
  viewMode: "publisher" | "brand";
  setViewMode: (v: "publisher" | "brand") => void;
  initialScreen?: BrandScreen;
  initialProgram?: string;
}) {
  const [screen, setScreen] = useState<BrandScreen>(initialScreen || "all-programs");
  const [activeProgram, setActiveProgram] = useState<"all" | string>(initialProgram || "all");
  const [activeCommissionId, setActiveCommissionId] = useState<string>("COM-1001");
  const [createdPrograms, setCreatedPrograms] = useState<(CreateProgramDraft & { status: "draft" | "active" })[]>([]);

  useEffect(() => {
    if (initialScreen) setScreen(initialScreen);
  }, [initialScreen]);

  useEffect(() => {
    if (initialProgram) setActiveProgram(initialProgram);
  }, [initialProgram]);

  const selectedProgram = activeProgram !== "all" ? (BRAND_PROGRAMS_DATA[activeProgram] || createdPrograms.find((p) => p.programName === activeProgram)) : null;
  const activeCommission = COMMISSIONS.find((c) => c.id === activeCommissionId) || COMMISSIONS[0];

  const crumbs = useMemo(() => {
    const list = [{ label: "Mr. Beast", onClick: () => { setScreen("all-programs"); setActiveProgram("all"); } }];
    if (activeProgram !== "all") list.push({ label: activeProgram, onClick: () => setScreen("program-detail") });
    if (screen === "detail") list.push({ label: activeCommissionId, onClick: () => setScreen("detail") });
    if (screen === "disputes") list.push({ label: "Disputes", onClick: () => setScreen("disputes") });
    return list;
  }, [screen, activeProgram, activeCommissionId]);

  function openCommission(id: string) {
    setActiveCommissionId(id);
    setScreen("detail");
  }

  function screenIntro() {
    if (screen === "queue") {
      return {
        title: "Commissions",
        subtitle: "Review pending conversions, risks, and status updates across all programs."
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
    if (screen === "test-flight") {
      return {
        title: "Test Flight",
        subtitle: "Run experiments and validate workflows before wider rollout."
      };
    }
    return null;
  }

  const intro = screenIntro();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex h-full w-[226px] shrink-0 flex-col justify-between border-r-2 border-black bg-[var(--nav)]">
        <div className="flex min-h-px min-w-px flex-1 flex-col">
          <div className="flex h-[60px] items-center justify-between border-b-2 border-black px-2">
            <div className="flex h-9 items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-[211.99px] bg-black">
                <img src={brandEyeIcon} alt="" aria-hidden className="h-[16.34px] w-[31.052px]" />
              </div>
              <img src={brandWordmark} alt="FREEQ" className="h-[21.624px] w-[94.947px]" />
            </div>
            <img src={railCollapseIcon} alt="" aria-hidden className="h-5 w-5" />
          </div>

          <div className="flex min-h-px min-w-px flex-1 flex-col items-center justify-between py-[10px]">
            <Button
              className="h-10 w-[205px] justify-start gap-0 overflow-hidden pl-px pr-0 shadow-[4px_4px_0px_0px_black]"
              onClick={() => setScreen("create-program")}
            >
              <span className="flex min-w-0 flex-1 items-center px-[15px] py-[14px]">
                <span className="truncate text-[16px] font-semibold leading-none tracking-[-0.16px] text-[#04070f]">
                  Create Program
                </span>
              </span>
              <span className="flex h-full w-8 shrink-0 items-center justify-center px-[6px] py-[5px]">
                <img
                  aria-hidden
                  alt=""
                  src={createProgramIcon}
                  className="h-5 w-5 shrink-0"
                />
              </span>
            </Button>

            <nav className="w-full text-sm">
              <button className={navButton(screen === "all-programs" || screen === "program-detail")} onClick={() => { setScreen("all-programs"); setActiveProgram("all"); }}>
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", screen === "all-programs" || screen === "program-detail" ? "opacity-100" : "opacity-50"].join(" ")}>
                    <img src={navAllProgramsIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", screen === "all-programs" || screen === "program-detail" ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    All Programs
                  </span>
                </span>
              </button>
              <button className={navButton(screen === "queue")} onClick={() => { setScreen("queue"); setActiveProgram("all"); }}>
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", screen === "queue" ? "opacity-100" : "opacity-50"].join(" ")}>
                    <img src={navCommissionsIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", screen === "queue" ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    Commissions
                  </span>
                </span>
              </button>
              <button className={navButton(screen === "disputes")} onClick={() => setScreen("disputes")}>
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", screen === "disputes" ? "opacity-100" : "opacity-50"].join(" ")}>
                    <img src={navDisputesIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", screen === "disputes" ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    Disputes
                  </span>
                </span>
              </button>
              <button className={navButton(screen === "test-flight")} onClick={() => setScreen("test-flight")}>
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", screen === "test-flight" ? "opacity-100" : "opacity-50"].join(" ")}>
                    <Rocket className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", screen === "test-flight" ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    Test Flight
                  </span>
                </span>
              </button>
            </nav>

            <div className="w-full" />
          </div>
        </div>

        <div className="h-[138px] space-y-3 border-t-2 border-black px-3 pt-[14px]">
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-[#61e4ff]"><Settings className="h-4 w-4" />Settings</button>
          <ViewSwitcher
            viewMode={viewMode}
            onChange={(v) => {
              setViewMode(v);
              setScreen("all-programs");
              setActiveProgram("all");
            }}
          />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-[var(--background)]">
        <header className="flex h-[60px] shrink-0 items-center justify-between gap-2 border-b-2 border-black bg-[var(--background)] px-6 text-sm">
          <div className="flex items-center gap-2 text-[15px]">
            <button className="hover:underline" onClick={() => { setScreen("all-programs"); setActiveProgram("all"); }}>Mr. Beast</button>
            {screen === "all-programs" && <span>Overview</span>}
            {screen !== "all-programs" &&
              crumbs.slice(1).map((c) => (
                <button key={c.label} className="hover:underline" onClick={c.onClick}>{c.label}</button>
              ))}
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full border-2 border-[var(--background)] bg-[#ff82e6] text-[11px] font-semibold">11</span>
            </button>
            <User className="h-5 w-5" />
            <Grip className="h-5 w-5" />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className={screen === "program-detail" || screen === "all-programs" ? "w-full" : "mx-auto w-full max-w-[1180px] px-8 py-8"}>
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
            {screen === "all-programs" && <AllProgramsGrid onOpenProgram={(p) => { setActiveProgram(p); setScreen("program-detail"); }} onCreateProgram={() => setScreen("create-program")} />}
            {screen === "program-detail" && selectedProgram && "trustSummary" in selectedProgram && <BrandProgramDetail program={selectedProgram as any} onOpenCommission={openCommission} />}
            {screen === "queue" && <CommissionQueue programFilter={activeProgram} onOpenCommission={openCommission} showHeader={false} />}
            {screen === "detail" && <CommissionDetailBrand commission={activeCommission} />}
            {screen === "disputes" && <DisputeInbox onOpenCommission={openCommission} showListHeader={false} />}
            {screen === "publishers" && <PublishersList programFilter={activeProgram} showHeader={false} />}
            {screen === "test-flight" && (
              <div className="rounded-[20px] border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_black]">
                <p className="mt-2 text-[14px] text-muted-foreground">This is a placeholder screen for Test Flight navigation.</p>
              </div>
            )}
            {screen === "create-program" && (
              <CreateProgram
                onSaveDraft={(draft) => {
                  setCreatedPrograms((prev) => [...prev.filter((p) => p.programName !== draft.programName), { ...draft, status: "draft" }]);
                  setActiveProgram(draft.programName);
                }}
                onPublish={(draft) => {
                  setCreatedPrograms((prev) => [...prev.filter((p) => p.programName !== draft.programName), { ...draft, status: "active" }]);
                  setActiveProgram(draft.programName);
                  setScreen("all-programs");
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
