"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, FolderKanban, Grip, LayoutList, PanelLeftClose, Settings, User } from "lucide-react";
import { ViewSwitcher } from "@/components/view-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BRAND_PROGRAMS_DATA, COMMISSIONS } from "@/lib/mock-data";
import { AllProgramsGrid } from "@/components/brand/all-programs-grid";
import { BrandProgramDetail } from "@/components/brand/brand-program-detail";
import { CommissionQueue } from "@/components/brand/commission-queue";
import { CommissionDetailBrand } from "@/components/brand/commission-detail-brand";
import { DisputeInbox } from "@/components/brand/dispute-inbox";
import { PublishersList } from "@/components/brand/publishers-list";
import { CreateProgram, CreateProgramDraft } from "@/components/brand/create-program";

export type BrandScreen = "all-programs" | "program-detail" | "queue" | "disputes" | "dispute-detail" | "publishers" | "detail" | "create-program";

function shellButton(active: boolean) {
  return [
    "flex h-[38.852px] w-full items-center gap-2 px-3 text-left text-[16px] leading-[22.857px] tracking-[-0.32px]",
    active ? "border-l-4 border-black bg-[var(--nav)]" : "opacity-90 hover:bg-[#4fdfff]"
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

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex h-full w-[226px] shrink-0 flex-col justify-between border-r-2 border-black bg-[var(--nav)]">
        <div className="flex min-h-px min-w-px flex-1 flex-col">
          <div className="flex h-[60px] items-center justify-between border-b-2 border-black px-2">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-black bg-[#f0ff4f]">
                <div className="h-4 w-6 rounded-full bg-black" />
              </div>
              <p className="text-[20px] font-bold tracking-[-0.4px]">FREEQ</p>
            </div>
            <PanelLeftClose className="h-5 w-5" />
          </div>

          <div className="flex min-h-px min-w-px flex-1 flex-col items-center justify-between py-[10px]">
            <Button className="h-10 w-[208px] justify-between text-[16px]" onClick={() => setScreen("create-program")}>
              Create Program <span aria-hidden>⊕</span>
            </Button>

            <nav className="w-full space-y-1 text-sm">
              <button className={shellButton(screen === "all-programs" || screen === "program-detail")} onClick={() => { setScreen("all-programs"); setActiveProgram("all"); }}>
                <FolderKanban className="h-5 w-5" />All Programs
              </button>
              <button className={shellButton(screen === "queue")} onClick={() => { setScreen("queue"); setActiveProgram("all"); }}>
                <LayoutList className="h-5 w-5" />All Commissions
              </button>
              <button className={shellButton(screen === "disputes")} onClick={() => setScreen("disputes")}>Disputes</button>
              <button className={shellButton(screen === "publishers")} onClick={() => setScreen("publishers")}>Publishers</button>
            </nav>

            <div className="w-full overflow-y-auto px-2 text-sm">
              <div className="mb-1 px-[9px]">
                <p className="text-[11px] leading-5 text-black/65">My Programs</p>
              </div>
              {[...Object.keys(BRAND_PROGRAMS_DATA), ...createdPrograms.map((p) => p.programName)].map((program) => {
                const isDraft = createdPrograms.find((p) => p.programName === program)?.status === "draft";
                return (
                  <button
                    key={program}
                    onClick={() => {
                      setActiveProgram(program);
                      setScreen("program-detail");
                    }}
                    className="mb-1 flex h-9 w-full items-center justify-between rounded-md px-2 text-left hover:bg-[#61e4ff]"
                  >
                    <span className="truncate text-[14px] leading-5">{program}</span>
                    {isDraft && <Badge>Draft</Badge>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-[138px] space-y-3 border-t-2 border-black px-3 pt-[14px]">
          <ViewSwitcher
            viewMode={viewMode}
            onChange={(v) => {
              setViewMode(v);
              setScreen("all-programs");
              setActiveProgram("all");
            }}
          />
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-[#61e4ff]"><Settings className="h-4 w-4" />Settings</button>
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
          <div className={screen === "all-programs" ? "w-full p-0" : "mx-auto max-w-[1180px] px-8 py-8"}>
            {screen === "all-programs" && <AllProgramsGrid onOpenProgram={(p) => { setActiveProgram(p); setScreen("program-detail"); }} onCreateProgram={() => setScreen("create-program")} />}
            {screen === "program-detail" && selectedProgram && "trustSummary" in selectedProgram && <BrandProgramDetail program={selectedProgram as any} onOpenCommission={openCommission} />}
            {screen === "queue" && <CommissionQueue programFilter={activeProgram} onOpenCommission={openCommission} />}
            {screen === "detail" && <CommissionDetailBrand commission={activeCommission} />}
            {screen === "disputes" && <DisputeInbox onOpenCommission={openCommission} />}
            {screen === "publishers" && <PublishersList programFilter={activeProgram} />}
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
