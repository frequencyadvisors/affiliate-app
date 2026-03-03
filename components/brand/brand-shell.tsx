"use client";

import { useMemo, useState } from "react";
import { FolderKanban, LayoutList, Settings } from "lucide-react";
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

type BrandScreen = "all-programs" | "program-detail" | "queue" | "disputes" | "dispute-detail" | "publishers" | "detail" | "create-program";

export function BrandShell({
  viewMode,
  setViewMode
}: {
  viewMode: "publisher" | "brand";
  setViewMode: (v: "publisher" | "brand") => void;
}) {
  const [screen, setScreen] = useState<BrandScreen>("all-programs");
  const [activeProgram, setActiveProgram] = useState<"all" | string>("all");
  const [activeCommissionId, setActiveCommissionId] = useState<string>("COM-1001");
  const [createdPrograms, setCreatedPrograms] = useState<(CreateProgramDraft & { status: "draft" | "active" })[]>([]);

  const selectedProgram = activeProgram !== "all" ? (BRAND_PROGRAMS_DATA[activeProgram] || createdPrograms.find((p) => p.programName === activeProgram)) : null;
  const activeCommission = COMMISSIONS.find((c) => c.id === activeCommissionId) || COMMISSIONS[0];

  const crumbs = useMemo(() => {
    const list = [{ label: "All Programs", onClick: () => { setScreen("all-programs"); setActiveProgram("all"); } }];
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
    <div className="flex h-screen">
      <aside className="w-[220px] shrink-0 border-r bg-card p-3 flex flex-col">
        <div className="mb-4 px-2">
          <p className="text-sm text-muted-foreground">Brand Console</p>
          <h2 className="font-semibold">Freeq Affiliate</h2>
        </div>
        <nav className="space-y-1 text-sm">
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-muted" onClick={() => { setScreen("all-programs"); setActiveProgram("all"); }}><FolderKanban className="h-4 w-4" />All Programs</button>
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-muted" onClick={() => { setScreen("queue"); setActiveProgram("all"); }}><LayoutList className="h-4 w-4" />All Commissions</button>
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-muted" onClick={() => setScreen("disputes")}>Disputes</button>
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-muted" onClick={() => setScreen("publishers")}>Publishers</button>
        </nav>
        <div className="my-4 border-t" />
        <div className="space-y-1 overflow-y-auto text-sm">
          {[...Object.keys(BRAND_PROGRAMS_DATA), ...createdPrograms.map((p) => p.programName)].map((program) => {
            const isDraft = createdPrograms.find((p) => p.programName === program)?.status === "draft";
            return (
              <button key={program} onClick={() => { setActiveProgram(program); setScreen("program-detail"); }} className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-muted">
                <span className="truncate">{program}</span>
                {isDraft && <Badge>Draft</Badge>}
              </button>
            );
          })}
        </div>
        <Button className="mt-3" variant="outline" onClick={() => setScreen("create-program")}>Create Program</Button>

        <div className="mt-auto space-y-3 border-t pt-3">
          <ViewSwitcher viewMode={viewMode} onChange={(v) => { setViewMode(v); setScreen("all-programs"); setActiveProgram("all"); }} />
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"><Settings className="h-4 w-4" />Settings</button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="h-14 shrink-0 border-b bg-card px-6 flex items-center gap-2 text-sm">
          {crumbs.map((c, i) => (
            <div key={c.label} className="flex items-center gap-2">
              <button className="text-muted-foreground hover:text-foreground" onClick={c.onClick}>{c.label}</button>
              {i < crumbs.length - 1 && <span className="text-muted-foreground">/</span>}
            </div>
          ))}
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-6 py-6">
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
