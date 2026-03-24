"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { COMMISSIONS, DISPUTES } from "@/lib/mock-data";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Chip, Separator } from "@heroui/react";

type ProgramViewMode = "grid" | "list";
const CREATOR_PROGRAM_VIEW_KEY = "freeq:creator:program-view-mode";

export function buildProgramData() {
  return Object.values(
    COMMISSIONS.reduce<Record<string, any>>((acc, c) => {
      acc[c.programName] ??= {
        programName: c.programName,
        brand: c.brandName,
        rate: c.programName === "Creator Collab Series" ? "18%" : c.programName === "Chocolate Bar Drop Vol. 3" ? "14%" : "11%",
        cookie: c.cookieWindow,
        approvalRate: 0,
        status: "Active",
        lastCommission: c.conversionTimestamp,
        commissions: 0,
        approved: 0,
        openDisputes: 0
      };
      acc[c.programName].commissions += 1;
      if (["approved", "locked", "paid"].includes(c.status)) acc[c.programName].approved += 1;
      if (new Date(c.conversionTimestamp).getTime() > new Date(acc[c.programName].lastCommission).getTime()) acc[c.programName].lastCommission = c.conversionTimestamp;
      return acc;
    }, {})
  ).map((row: any) => ({
    ...row,
    approvalRate: `${Math.round((row.approved / row.commissions) * 100)}%`,
    openDisputes: DISPUTES.filter((d) => COMMISSIONS.find((c) => c.id === d.commissionId)?.programName === row.programName && d.status.includes("open")).length
  }));
}

export function MyPrograms({ onOpenProgram, onDiscover }: { onOpenProgram: (programName: string) => void; onDiscover: () => void }) {
  const rows = buildProgramData();
  const [viewMode, setViewMode] = useState<ProgramViewMode>("list");

  useEffect(() => {
    const stored = window.localStorage.getItem(CREATOR_PROGRAM_VIEW_KEY);
    if (stored === "grid" || stored === "list") setViewMode(stored);
  }, []);

  function setProgramViewMode(mode: ProgramViewMode) {
    setViewMode(mode);
    window.localStorage.setItem(CREATOR_PROGRAM_VIEW_KEY, mode);
  }

  const summaries: Record<string, string> = {
    "Chocolate Bar Drop Vol. 3": "Limited-run chocolate bar collection including new MrBeast Bar flavors. High conversion, impulse-buy price point.",
    "Creator Collab Series": "Affiliate program for creator-native partnerships driving Feastables multipack and bundle sales across YouTube and TikTok audiences.",
    "Back to School Bundle": "Seasonal bundle program targeting high-volume snack purchases for the back-to-school period. Limited enrollment."
  };
  const creatorCardMetrics: Record<string, { primary: [string, string]; secondary: [string, string, string, string] }> = {
    "Chocolate Bar Drop Vol. 3": {
      primary: ["$4,280", "$1,960"],
      secondary: ["$2,320", "$11.40", "1,284", "$28,400"]
    },
    "Creator Collab Series": {
      primary: ["$5,140", "$1,420"],
      secondary: ["$3,720", "$12.75", "1,146", "$36,480"]
    },
    "Back to School Bundle": {
      primary: ["$2,920", "$880"],
      secondary: ["$1,640", "$9.20", "724", "$18,520"]
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Chip color="accent" variant="soft" size="sm">Creator workspace</Chip>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">My Programs</h1>
              <p className="max-w-2xl text-sm leading-6 text-default-500 sm:text-base">
                Review your active partnerships, performance, and program health.
              </p>
            </div>
          </div>

          <div className="flex rounded-2xl border border-default-200 bg-default-50 p-1 shadow-sm">
            <ViewToggle active={viewMode === "grid"} onClick={() => setProgramViewMode("grid")}>
              Grid View
            </ViewToggle>
            <ViewToggle active={viewMode === "list"} onClick={() => setProgramViewMode("list")}>
              List View
            </ViewToggle>
          </div>
        </CardContent>
      </Card>

      {viewMode === "grid" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {rows.map((r: any) => (
            <ProgramSurfaceCard
              key={r.programName}
              brandName={r.brand}
              status={r.status}
              programName={r.programName}
              description={summaries[r.programName] || "Performance-ready affiliate program with transparent governance and reliable payout behavior."}
              primaryMetrics={[
                { label: "Earnings this month", value: creatorCardMetrics[r.programName]?.primary[0] || "$0" },
                { label: "Pending approval", value: creatorCardMetrics[r.programName]?.primary[1] || "$0" }
              ]}
              stats={[
                { label: "Approved", value: creatorCardMetrics[r.programName]?.secondary[0] || "$0" },
                { label: "Earnings/Order", value: creatorCardMetrics[r.programName]?.secondary[1] || "$0.00" },
                { label: "Orders Driven", value: creatorCardMetrics[r.programName]?.secondary[2] || "0" },
                { label: "Sales Generated", value: creatorCardMetrics[r.programName]?.secondary[3] || "$0" }
              ]}
              onOpen={() => onOpenProgram(r.programName)}
            />
          ))}
        </div>
      ) : (
        <Card className="border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardHeader className="gap-2 px-6 pt-6">
            <CardTitle className="text-xl tracking-[-0.03em]">Programs list</CardTitle>
            <CardDescription className="text-default-500">Compact view of your creator partnerships.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <Separator />
            <div className="mt-4 space-y-3">
              {rows.map((r: any) => (
                <button
                  key={r.programName}
                  type="button"
                  onClick={() => onOpenProgram(r.programName)}
                  className="group flex w-full items-center justify-between gap-4 rounded-3xl border border-default-200 bg-background/90 px-4 py-4 text-left transition-colors hover:bg-default-50/80"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-semibold tracking-[-0.02em] text-foreground">{r.programName}</p>
                      <Chip variant="soft" color="accent" size="sm">{r.status}</Chip>
                    </div>
                    <p className="mt-1 text-sm text-default-500">{r.brand}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-xs uppercase tracking-[0.22em] text-default-400">Earnings</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{creatorCardMetrics[r.programName]?.primary[0] || "$0"}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-default-300 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-white/70 bg-gradient-to-r from-[rgba(168,85,247,0.12)] to-[rgba(255,255,255,0.9)] shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">Discover more</p>
            <p className="text-xl font-semibold tracking-[-0.03em] text-foreground">Looking for new partnerships?</p>
            <p className="text-sm text-default-500">Discover programs with transparent governance metrics.</p>
          </div>
          <Button variant="primary" onClick={onDiscover}>
            Discover Programs
            <Sparkles className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ViewToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl px-4 py-2 text-sm font-medium transition",
        active ? "bg-white text-foreground shadow-sm" : "text-default-500 hover:text-foreground"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ProgramSurfaceCard({
  brandName,
  status,
  programName,
  description,
  primaryMetrics,
  stats,
  onOpen
}: {
  brandName: string;
  status: string;
  programName: string;
  description: string;
  primaryMetrics: { label: string; value: string }[];
  stats: { label: string; value: string }[];
  onOpen: () => void;
}) {
  return (
    <Card className="border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <CardHeader className="gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">{brandName}</p>
            <CardTitle className="mt-2 text-2xl tracking-[-0.04em]">{programName}</CardTitle>
          </div>
          <Chip color="accent" variant="soft" size="sm">{status}</Chip>
        </div>
        <CardDescription className="text-sm leading-6 text-default-500">{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-5 pb-5 pt-0">
        <div className="grid gap-3 sm:grid-cols-2">
          {primaryMetrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-default-200 bg-default-50/70 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">{metric.value}</p>
            </div>
          ))}
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 text-sm">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-default-200 bg-white/80 p-3">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">{stat.label}</p>
              <p className="mt-2 text-sm font-medium text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <Button fullWidth variant="secondary" onClick={onOpen}>
          Open Program
        </Button>
      </CardContent>
    </Card>
  );
}
