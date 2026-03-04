"use client";

import { useEffect, useMemo, useState } from "react";
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

function shellButton(active: boolean) {
  return [
    "flex w-full items-center gap-2 px-3 py-2 text-left text-[16px] tracking-[-0.32px]",
    active ? "border-l-[3px] border-black bg-[var(--nav)]" : "opacity-90 hover:bg-[#4fdfff]"
  ].join(" ");
}

export function PublisherShell({
  viewMode,
  setViewMode,
  initialScreen
}: {
  viewMode: "publisher" | "brand";
  setViewMode: (v: "publisher" | "brand") => void;
  initialScreen?: PublisherScreen;
}) {
  const [screen, setScreen] = useState<PublisherScreen>(initialScreen || "earnings");
  const [activeCommissionId, setActiveCommissionId] = useState("COM-1004");
  const [activeProgram, setActiveProgram] = useState("Chocolate Bar Drop Vol. 3");
  const [tab, setTab] = useState<"all" | CommissionStatus>("all");

  useEffect(() => {
    if (initialScreen) setScreen(initialScreen);
  }, [initialScreen]);

  const commission = COMMISSIONS.find((c) => c.id === activeCommissionId) || COMMISSIONS[0];

  const crumbs = useMemo(() => {
    const list = [{ label: "Mr. Beast", onClick: () => setScreen("earnings") }];
    if (screen === "detail") list.push({ label: activeCommissionId, onClick: () => setScreen("detail") });
    if (["program-detail", "program-joined", "enrolled-program-detail"].includes(screen)) list.push({ label: activeProgram, onClick: () => setScreen("program-detail") });
    if (screen === "disputes") list.push({ label: "Disputes", onClick: () => setScreen("disputes") });
    return list;
  }, [screen, activeCommissionId, activeProgram]);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-[226px] shrink-0 flex-col justify-between border-r-2 border-black bg-[var(--nav)]">
        <div>
          <div className="flex h-[60px] items-center justify-between border-b-2 border-black px-2">
            <p className="text-lg font-bold">FREEQ</p>
          </div>

          <nav className="mt-8 space-y-1 text-sm">
            <button className={shellButton(screen === "earnings" || screen === "detail")} onClick={() => setScreen("earnings")}><DollarSign className="h-4 w-4" />Earnings</button>
            <button className={shellButton(screen === "my-programs" || screen === "enrolled-program-detail")} onClick={() => setScreen("my-programs")}><Store className="h-4 w-4" />My Programs</button>
            <button className={shellButton(screen === "disputes" || screen === "dispute-wizard")} onClick={() => setScreen("disputes")}><ShieldAlert className="h-4 w-4" />Disputes</button>
            <button className={shellButton(screen === "discover" || screen === "program-detail" || screen === "program-joined")} onClick={() => setScreen("discover")}><Compass className="h-4 w-4" />Discover</button>
          </nav>
        </div>

        <div className="space-y-3 border-t-2 border-black p-3">
          <ViewSwitcher viewMode={viewMode} onChange={(v) => { setViewMode(v); setScreen("earnings"); }} />
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-[#61e4ff]"><Settings className="h-4 w-4" />Settings</button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-[var(--background)]">
        <header className="flex h-[60px] shrink-0 items-center gap-2 border-b-2 border-black bg-[var(--background)] px-6 text-sm">
          {crumbs.map((c, i) => (
            <div key={c.label} className="flex items-center gap-2">
              <button onClick={c.onClick} className="hover:underline">{c.label}</button>
              {i < crumbs.length - 1 && <span className="opacity-30">/</span>}
            </div>
          ))}
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1180px] px-8 py-8">
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
