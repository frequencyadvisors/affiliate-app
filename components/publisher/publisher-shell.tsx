"use client";

import { useMemo, useState } from "react";
import { Compass, DollarSign, Settings, ShieldAlert, Store } from "lucide-react";
import { ViewSwitcher } from "@/components/view-switcher";
import { COMMISSIONS, CommissionStatus } from "@/lib/mock-data";
import { EarningsDashboard } from "@/components/publisher/earnings-dashboard";
import { CommissionDetail } from "@/components/publisher/commission-detail";
import { DisputeWizard } from "@/components/publisher/dispute-wizard";
import { DisputeResolution } from "@/components/publisher/dispute-resolution";
import { MyPrograms } from "@/components/publisher/my-programs";
import { EnrolledProgramDetail } from "@/components/publisher/enrolled-program-detail";
import { DiscoverPrograms } from "@/components/publisher/discover-programs";
import { ProgramDetail } from "@/components/publisher/program-detail";
import { ProgramJoinConfirmation } from "@/components/publisher/program-join-confirmation";

type PublisherScreen =
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

export function PublisherShell({
  viewMode,
  setViewMode
}: {
  viewMode: "publisher" | "brand";
  setViewMode: (v: "publisher" | "brand") => void;
}) {
  const [screen, setScreen] = useState<PublisherScreen>("earnings");
  const [activeCommissionId, setActiveCommissionId] = useState("COM-1004");
  const [activeProgram, setActiveProgram] = useState("Chocolate Bar Drop Vol. 3");
  const [tab, setTab] = useState<"all" | CommissionStatus>("all");

  const commission = COMMISSIONS.find((c) => c.id === activeCommissionId) || COMMISSIONS[0];

  const crumbs = useMemo(() => {
    const list = [{ label: "Earnings", onClick: () => setScreen("earnings") }];
    if (screen === "detail") list.push({ label: activeCommissionId, onClick: () => setScreen("detail") });
    if (["program-detail", "program-joined", "enrolled-program-detail"].includes(screen)) list.push({ label: activeProgram, onClick: () => setScreen("program-detail") });
    if (screen === "disputes") list.push({ label: "Disputes", onClick: () => setScreen("disputes") });
    return list;
  }, [screen, activeCommissionId, activeProgram]);

  return (
    <div className="flex h-screen">
      <aside className="w-[220px] shrink-0 border-r bg-card p-3 flex flex-col">
        <div className="mb-4 px-2">
          <p className="text-sm text-muted-foreground">Publisher Console</p>
          <h2 className="font-semibold">Freeq Affiliate</h2>
        </div>

        <nav className="space-y-1 text-sm">
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-muted" onClick={() => setScreen("earnings")}><DollarSign className="h-4 w-4" />Earnings</button>
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-muted" onClick={() => setScreen("my-programs")}><Store className="h-4 w-4" />My Programs</button>
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-muted" onClick={() => setScreen("disputes")}><ShieldAlert className="h-4 w-4" />Disputes</button>
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-muted" onClick={() => setScreen("discover")}><Compass className="h-4 w-4" />Discover</button>
        </nav>

        <div className="mt-auto space-y-3 border-t pt-3">
          <ViewSwitcher viewMode={viewMode} onChange={(v) => { setViewMode(v); setScreen("earnings"); }} />
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"><Settings className="h-4 w-4" />Settings</button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="h-14 shrink-0 border-b bg-card px-6 flex items-center gap-2 text-sm">
          {crumbs.map((c, i) => (
            <div key={c.label} className="flex items-center gap-2">
              <button onClick={c.onClick} className="text-muted-foreground hover:text-foreground">{c.label}</button>
              {i < crumbs.length - 1 && <span className="text-muted-foreground">/</span>}
            </div>
          ))}
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-6 py-6">
            {screen === "earnings" && <EarningsDashboard tab={tab} onTab={setTab} onOpenCommission={(id) => { setActiveCommissionId(id); setScreen("detail"); }} />}
            {screen === "detail" && <CommissionDetail commission={commission} onDispute={(id) => { setActiveCommissionId(id); setScreen("dispute-wizard"); }} />}
            {screen === "dispute-wizard" && <DisputeWizard commissionId={activeCommissionId} onSubmit={() => setScreen("disputes")} />}
            {screen === "disputes" && <DisputeResolution />}
            {screen === "my-programs" && <MyPrograms onOpenProgram={(name) => { setActiveProgram(name); setScreen("enrolled-program-detail"); }} onDiscover={() => setScreen("discover")} />}
            {screen === "enrolled-program-detail" && <EnrolledProgramDetail programName={activeProgram} onOpenCommission={(id) => { setActiveCommissionId(id); setScreen("detail"); }} />}
            {screen === "discover" && <DiscoverPrograms onOpenProgram={(name) => { setActiveProgram(name); setScreen("program-detail"); }} />}
            {screen === "program-detail" && <ProgramDetail name={activeProgram} onJoin={() => setScreen("program-joined")} />}
            {screen === "program-joined" && <ProgramJoinConfirmation name={activeProgram} onMyPrograms={() => setScreen("my-programs")} onDiscover={() => setScreen("discover")} />}
          </div>
        </div>
      </main>
    </div>
  );
}
