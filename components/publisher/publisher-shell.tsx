"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, Grip, User } from "lucide-react";
import { ViewSwitcher } from "@/components/view-switcher";
import { COMMISSIONS, CommissionStatus, getAgeDays } from "@/lib/mock-data";
import { EarningsDashboard } from "@/components/publisher/earnings-dashboard";
import { CommissionDetail } from "@/components/publisher/commission-detail";
import { DisputeWizard } from "@/components/publisher/dispute-wizard";
import { DisputeResolution } from "@/components/publisher/dispute-resolution";
import { MyPrograms } from "@/components/publisher/my-programs";
import { EnrolledProgramDetail } from "@/components/publisher/enrolled-program-detail";
import { DiscoverPrograms } from "@/components/publisher/discover-programs";
import { ProgramDetail } from "@/components/publisher/program-detail";
import { ProgramJoinConfirmation } from "@/components/publisher/program-join-confirmation";
const publisherBrandEyeIcon = "https://www.figma.com/api/mcp/asset/6f91606e-cd72-4bdd-8b88-ecec4875ba12";
const publisherBrandWordmark = "https://www.figma.com/api/mcp/asset/8d6dd311-66e5-425f-9478-ce95181650de";
const publisherRailCollapseIcon = "https://www.figma.com/api/mcp/asset/1175bfce-0a06-40a7-b6b5-80d771f6fbc8";
const publisherDiscoverCtaIcon = "https://www.figma.com/api/mcp/asset/14cea5d3-0bd4-42b1-8781-f16e676344c2";
const publisherNavEarningsIcon = "https://www.figma.com/api/mcp/asset/ef7854bb-df02-4df8-b03f-6c93118449e0";
const publisherNavMyProgramsIcon = "https://www.figma.com/api/mcp/asset/82c16886-14b5-480d-8a4d-f4fa9b6702a9";
const publisherNavDisputesIcon = "https://www.figma.com/api/mcp/asset/b124d3fd-b7f4-41ba-9b8b-7015c7571196";
const publisherSettingsIcon = "https://www.figma.com/api/mcp/asset/1c17d56c-afd4-4a4c-a042-3ee5f57eb528";

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
  const stalePending = COMMISSIONS.some((c) => c.status === "pending" && getAgeDays(c.conversionTimestamp) > c.validationWindowDays);

  const crumbs = useMemo(() => {
    const list = [{ label: "Mr. Beast", onClick: () => setScreen("earnings") }];
    if (screen === "detail") list.push({ label: activeCommissionId, onClick: () => setScreen("detail") });
    if (["program-detail", "program-joined", "enrolled-program-detail"].includes(screen)) list.push({ label: activeProgram, onClick: () => setScreen("program-detail") });
    if (screen === "disputes") list.push({ label: "Disputes", onClick: () => setScreen("disputes") });
    return list;
  }, [screen, activeCommissionId, activeProgram]);

  function screenIntro() {
    if (screen === "earnings") {
      return {
        title: "Earnings",
        subtitle: "Track commission performance, payout status, and trend movement."
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
          <div className="flex h-[60px] items-center justify-between border-b-2 border-black px-2">
            <div className="flex h-9 items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-[211.99px] bg-black">
                <img src={publisherBrandEyeIcon} alt="" aria-hidden className="h-[16.34px] w-[31.052px]" />
              </div>
              <img src={publisherBrandWordmark} alt="FREEQ" className="h-[21.624px] w-[94.947px]" />
            </div>
            <img src={publisherRailCollapseIcon} alt="" aria-hidden className="h-5 w-5" />
          </div>

          <div className="flex min-h-px min-w-px flex-1 flex-col items-center justify-between py-[10px]">
            <button
              className="flex h-10 w-[205px] items-center gap-0 overflow-hidden rounded-[11px] border-2 border-black bg-primary pl-px pr-0 text-left shadow-[4px_4px_0px_0px_black] hover:brightness-105"
              onClick={() => setScreen("discover")}
            >
              <span className="flex min-w-0 flex-1 items-center px-[15px] py-[14px]">
                <span className="truncate text-[16px] font-semibold leading-none tracking-[-0.16px] text-[#04070f]">
                  Discover Programs
                </span>
              </span>
              <span className="flex h-full w-8 shrink-0 items-center justify-center px-[6px] py-[5px]">
                <img aria-hidden alt="" src={publisherDiscoverCtaIcon} className="h-5 w-5 shrink-0" />
              </span>
            </button>

            <nav className="w-full text-sm">
              <button className={navButton(screen === "earnings" || screen === "detail")} onClick={() => setScreen("earnings")}>
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", screen === "earnings" || screen === "detail" ? "opacity-100" : "opacity-50"].join(" ")}>
                    <img src={publisherNavEarningsIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", screen === "earnings" || screen === "detail" ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    Earnings
                  </span>
                </span>
              </button>
              <button className={navButton(screen === "my-programs" || screen === "enrolled-program-detail")} onClick={() => setScreen("my-programs")}>
                <span className="flex w-full items-center overflow-hidden rounded-[6px] transition-colors group-hover:bg-black/10">
                  <span className={["flex shrink-0 p-[5px]", screen === "my-programs" || screen === "enrolled-program-detail" ? "opacity-100" : "opacity-50"].join(" ")}>
                    <img src={publisherNavMyProgramsIcon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <span className={["flex min-h-px min-w-px flex-1 items-center px-[5px] py-px text-[16px] leading-[22.857px] tracking-[-0.32px]", screen === "my-programs" || screen === "enrolled-program-detail" ? "font-semibold opacity-100" : "font-normal opacity-50"].join(" ")}>
                    My Programs
                  </span>
                </span>
              </button>
              <button className={navButton(screen === "disputes" || screen === "dispute-wizard")} onClick={() => setScreen("disputes")}>
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

            <div className="w-full" />
          </div>
        </div>

        <div className="h-[138px] space-y-3 border-t-2 border-black px-3 pt-[14px]">
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-[#61e4ff]">
            <img src={publisherSettingsIcon} alt="" aria-hidden className="h-4 w-4" />
            Settings
          </button>
          <ViewSwitcher viewMode={viewMode} onChange={(v) => { setViewMode(v); setScreen("earnings"); }} />
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
            <button className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full border-2 border-[var(--background)] bg-[#ff82e6] text-[11px] font-semibold">11</span>
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

        <div className="flex-1 overflow-y-auto">
          <div className={screen === "enrolled-program-detail" ? "w-full" : "mx-auto w-full max-w-[1180px] px-8 py-8"}>
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
            {screen === "earnings" && <EarningsDashboard tab={tab} onTab={setTab} onOpenCommission={(id) => { setActiveCommissionId(id); setScreen("detail"); }} />}
            {screen === "detail" && <CommissionDetail commission={commission} onDispute={(id) => { setActiveCommissionId(id); setScreen("dispute-wizard"); }} />}
            {screen === "dispute-wizard" && <DisputeWizard commissionId={activeCommissionId} onSubmit={() => setScreen("disputes")} />}
            {screen === "disputes" && <DisputeResolution showListHeader={false} />}
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
