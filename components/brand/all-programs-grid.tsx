"use client";

import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Chip,
  Separator
} from "@heroui/react";
import { BRAND_PROGRAMS_DATA } from "@/lib/mock-data";

type ProgramLifecycleStatus = "active" | "inactive" | "archived";
type ProgramFilter = "all" | ProgramLifecycleStatus;
type ProgramSummaryMetrics = {
  revenue: string;
  orders: string;
  affiliate: string;
  payout: string;
  roas: string;
};

const PROGRAM_STATUS_LABELS: Record<ProgramLifecycleStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived"
};

const PROGRAM_FILTERS: { key: ProgramFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "archived", label: "Archived" }
];

const programMetrics: Record<string, ProgramSummaryMetrics> = {
  "Chocolate Bar Drop Vol. 3": { revenue: "$184k", orders: "1,284", affiliate: "18%", payout: "$21,930", roas: "8.5x" },
  "Creator Collab Series": { revenue: "$246k", orders: "1,902", affiliate: "18%", payout: "$31,800", roas: "9.1x" },
  "Back to School Bundle": { revenue: "$128k", orders: "942", affiliate: "11%", payout: "$10,360", roas: "6.7x" },
  "Midnight Crunch Drop": { revenue: "$0", orders: "0", affiliate: "13%", payout: "$0", roas: "0x" },
  "Protein Starter Stack": { revenue: "$0", orders: "0", affiliate: "16%", payout: "$0", roas: "0x" },
  "Lunchly Family Pack": { revenue: "$0", orders: "0", affiliate: "12%", payout: "$0", roas: "0x" },
  "Holiday Gifting Capsule": { revenue: "$0", orders: "0", affiliate: "10%", payout: "$0", roas: "0x" },
  "Spring Creator Box": { revenue: "$0", orders: "0", affiliate: "15%", payout: "$0", roas: "0x" }
};

function parseCompactCurrency(value: string) {
  const normalized = value.replace(/[$,]/g, "").trim().toLowerCase();
  if (!normalized) return 0;
  if (normalized.endsWith("k")) return Number.parseFloat(normalized.slice(0, -1)) * 1000;
  if (normalized.endsWith("m")) return Number.parseFloat(normalized.slice(0, -1)) * 1000000;
  return Number.parseFloat(normalized);
}

function parseCount(value: string) {
  return Number.parseInt(value.replace(/,/g, ""), 10) || 0;
}

function parsePercent(value: string) {
  return Number.parseFloat(value.replace("%", "")) || 0;
}

function parseRoas(value: string) {
  return Number.parseFloat(value.replace("x", "")) || 0;
}

export function AllProgramsGrid({
  businessUnitId,
  onOpenProgram,
  onCreateProgram
}: {
  businessUnitId?: "all" | string;
  onOpenProgram: (programName: string) => void;
  onCreateProgram: () => void;
}) {
  const allPrograms = Object.values(BRAND_PROGRAMS_DATA)
    .filter((program) => (!businessUnitId || businessUnitId === "all" ? true : program.businessUnitId === businessUnitId))
    .filter((program): program is typeof program & { status: ProgramLifecycleStatus } => program.status !== "draft");

  const [activeFilter, setActiveFilter] = useState<ProgramFilter>("all");

  const counts = allPrograms.reduce<Record<ProgramFilter, number>>(
    (acc, program) => {
      acc.all += 1;
      acc[program.status] += 1;
      return acc;
    },
    { all: 0, active: 0, inactive: 0, archived: 0 }
  );

  const filteredPrograms = allPrograms.filter((program) => activeFilter === "all" || program.status === activeFilter);

  const listSummary = filteredPrograms.reduce(
    (acc, program) => {
      const metrics = programMetrics[program.programName];
      acc.revenue += parseCompactCurrency(metrics?.revenue || "$0");
      acc.orders += parseCount(metrics?.orders || "0");
      acc.affiliate += parsePercent(metrics?.affiliate || program.commissionRate);
      acc.roas += parseRoas(metrics?.roas || "0x");
      return acc;
    },
    { revenue: 0, orders: 0, affiliate: 0, roas: 0 }
  );

  const avgAffiliate = filteredPrograms.length ? Math.round((listSummary.affiliate / filteredPrograms.length) * 10) / 10 : 0;
  const avgRoas = filteredPrograms.length ? Math.round((listSummary.roas / filteredPrograms.length) * 10) / 10 : 0;
  const totalRevenue = Math.round(listSummary.revenue).toLocaleString();
  const activeShare = allPrograms.length ? Math.round((counts.active / allPrograms.length) * 100) : 0;

  const statCards = [
    {
      label: "Programmes",
      value: filteredPrograms.length.toString(),
      caption: `of ${allPrograms.length} in view`,
      tone: "accent" as const
    },
    {
      label: "Revenue",
      value: `$${totalRevenue}`,
      caption: `${listSummary.orders.toLocaleString()} orders`,
      tone: "success" as const
    },
    {
      label: "Affiliate rate",
      value: `${avgAffiliate}%`,
      caption: `${avgRoas}x ROAS`,
      tone: "warning" as const
    },
    {
      label: "Active share",
      value: `${activeShare}%`,
      caption: `${counts.active} active programmes`,
      tone: "default" as const
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-60px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_rgba(250,252,255,0.98)_0%,_rgba(244,248,252,0.98)_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),transparent)]" />

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Chip color="accent" variant="soft" size="sm" className="shadow-none">
              Brand workspace
            </Chip>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
                Affiliate programmes
              </h1>
              <p className="max-w-2xl text-base leading-7 text-default-600">
                A cleaner HeroUI surface for programme visibility, filtering, and commercial review.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/20 sm:w-auto"
            onClick={onCreateProgram}
          >
            <Plus className="h-4 w-4" />
            Create programme
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label} variant="secondary" className="border border-white/70 bg-white/75 shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-default-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground">{stat.value}</p>
                  </div>
                  <Chip
                    color={stat.tone}
                    variant="soft"
                    size="sm"
                    className="shrink-0"
                  >
                    {stat.caption}
                  </Chip>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card variant="secondary" className="border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardHeader className="gap-4 pb-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl tracking-[-0.03em]">Programme library</CardTitle>
              <CardDescription className="max-w-2xl text-default-500">
                {filteredPrograms.length} programme{filteredPrograms.length === 1 ? "" : "s"} in view.
                {" "}
                {activeFilter === "all" ? "All statuses are visible." : `Filtered to ${PROGRAM_STATUS_LABELS[activeFilter]}.`}
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={onCreateProgram}
            >
              Create programme
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-5 p-5 pt-4 sm:p-6">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-white/70 bg-white/80 p-1 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-md">
              {PROGRAM_FILTERS.map((filter) => {
                const isActive = activeFilter === filter.key;

                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={[
                      "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-white text-foreground shadow-sm"
                        : "text-default-500 hover:bg-default-100/80 hover:text-foreground"
                    ].join(" ")}
                    aria-pressed={isActive}
                  >
                    {filter.label}
                    <span className="text-xs text-default-400">{counts[filter.key]}</span>
                  </button>
                );
              })}
            </div>

            <Separator variant="secondary" className="bg-default-200" />

            <div className="overflow-hidden rounded-3xl border border-default-200 bg-background/90">
              <div className="hidden grid-cols-[minmax(0,2.2fr)_1fr_0.8fr_0.9fr_0.9fr_0.9fr_0.75fr_auto] gap-4 border-b border-default-200 bg-default-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-default-500 lg:grid">
                <span>Programme</span>
                <span>Business</span>
                <span>Status</span>
                <span>Revenue</span>
                <span>Orders</span>
                <span>Affiliate</span>
                <span>ROAS</span>
                <span className="text-right">Action</span>
              </div>

              <div className="divide-y divide-default-200">
                {filteredPrograms.map((program) => {
                  const metrics = programMetrics[program.programName];
                  const statusTone = program.status === "active" ? "success" : program.status === "inactive" ? "warning" : "default";

                  return (
                    <button
                      key={program.programName}
                      type="button"
                      onClick={() => onOpenProgram(program.programName)}
                      className="group grid w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-default-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/30 lg:grid-cols-[minmax(0,2.2fr)_1fr_0.8fr_0.9fr_0.9fr_0.9fr_0.75fr_auto] lg:items-center"
                    >
                      <div className="space-y-1">
                        <span className="block font-semibold tracking-[-0.02em] text-foreground">
                          {program.programName}
                        </span>
                        <p className="text-sm text-default-500">{program.businessUnitName}</p>
                      </div>

                      <div className="text-sm text-default-600 lg:text-foreground">
                        <span className="lg:hidden mr-2 text-default-400">Business</span>
                        {program.businessUnitName}
                      </div>

                      <div className="text-sm text-default-600 lg:text-foreground">
                        <span className="lg:hidden mr-2 text-default-400">Status</span>
                        <Chip color={statusTone} variant="soft" size="sm">
                          {PROGRAM_STATUS_LABELS[program.status]}
                        </Chip>
                      </div>

                      <div className="text-sm font-medium text-foreground">
                        <span className="lg:hidden mr-2 text-default-400">Revenue</span>
                        {metrics?.revenue || "$0"}
                      </div>

                      <div className="text-sm text-default-600 lg:text-foreground">
                        <span className="lg:hidden mr-2 text-default-400">Orders</span>
                        {metrics?.orders || "0"}
                      </div>

                      <div className="text-sm text-default-600 lg:text-foreground">
                        <span className="lg:hidden mr-2 text-default-400">Affiliate</span>
                        {metrics?.affiliate || program.commissionRate}
                      </div>

                      <div className="text-sm text-default-600 lg:text-foreground">
                        <span className="lg:hidden mr-2 text-default-400">ROAS</span>
                        {metrics?.roas || "0x"}
                      </div>

                      <div className="flex justify-start lg:justify-end" onClick={(event) => event.stopPropagation()}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-default-500 opacity-100 transition-opacity group-hover:text-foreground lg:opacity-0 lg:group-hover:opacity-100"
                          onClick={() => onOpenProgram(program.programName)}
                        >
                          View
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
