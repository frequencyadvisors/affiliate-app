"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { BRAND_PROGRAMS_DATA } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const summaryText = `${filteredPrograms.length} programme${filteredPrograms.length === 1 ? "" : "s"} • $${Math.round(listSummary.revenue).toLocaleString()} revenue • ${listSummary.orders.toLocaleString()} orders • ${avgAffiliate}% affiliate • ${avgRoas}x ROAS`;

  return (
    <div className="flex min-h-[calc(100vh-60px)] w-full flex-col">
      <div className="mx-auto w-full max-w-[1180px] flex-1 px-8 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-[var(--font-jost)] text-[50px] font-semibold leading-[0.9] tracking-[-0.2px] text-[#04070f]">Affiliate Programmes</h1>
          <p className="text-[16px] text-muted-foreground">All affiliate programmes created by your organisation.</p>
        </div>

        <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as ProgramFilter)}>
            <TabsList className="h-auto flex-wrap gap-2 rounded-[16px] bg-transparent p-0">
              {PROGRAM_FILTERS.map((filter) => (
                <TabsTrigger
                  key={filter.key}
                  value={filter.key}
                  className="rounded-[11px] border-2 border-black bg-[var(--muted)] px-4 py-2.5 text-[13px] font-semibold tracking-[-0.2px] text-[#04070f] shadow-[2px_2px_0px_0px_black] transition active:translate-x-[1px] active:translate-y-[1px]"
                  activeClassName="rounded-[11px] border-2 border-black bg-[#04070f] px-4 py-2.5 text-[13px] font-semibold tracking-[-0.2px] text-white shadow-[2px_2px_0px_0px_black]"
                  inactiveClassName="hover:bg-[#c8f4ff]"
                >
                  {filter.label}
                  <span className="ml-2 text-[12px] opacity-72">{counts[filter.key]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Button type="button" className="self-start lg:self-auto" onClick={onCreateProgram}>
            <PlusCircle className="h-5 w-5" />
            Create Programme
          </Button>
        </div>

        <div className="mt-5 space-y-5">
          <div className="overflow-hidden rounded-[18px] border-[3px] border-black bg-white shadow-[3px_3px_0px_0px_black]">
            <Table className="table-fixed">
              <TableHeader className="bg-[#f7fafc]">
                <TableRow className="h-[50px] border-b border-black/20 hover:bg-transparent">
                  <TableHead className="w-[29%]">Programme</TableHead>
                  <TableHead className="w-[14%]">Business</TableHead>
                  <TableHead className="w-[12%]">Status</TableHead>
                  <TableHead className="w-[12%]">Revenue</TableHead>
                  <TableHead className="w-[12%]">Orders</TableHead>
                  <TableHead className="w-[12%]">Affiliate</TableHead>
                  <TableHead className="w-[10%]">ROAS</TableHead>
                  <TableHead className="w-[12%] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.map((program) => (
                  <TableRow key={program.programName} className="group h-[67px] cursor-pointer bg-white" onClick={() => onOpenProgram(program.programName)}>
                    <TableCell className="font-semibold">{program.programName}</TableCell>
                    <TableCell>{program.businessUnitName}</TableCell>
                    <TableCell>{PROGRAM_STATUS_LABELS[program.status]}</TableCell>
                    <TableCell className="font-medium">{programMetrics[program.programName]?.revenue || "$0"}</TableCell>
                    <TableCell>{programMetrics[program.programName]?.orders || "0"}</TableCell>
                    <TableCell>{programMetrics[program.programName]?.affiliate || program.commissionRate}</TableCell>
                    <TableCell>{programMetrics[program.programName]?.roas || "0x"}</TableCell>
                    <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                        onClick={() => onOpenProgram(program.programName)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-[16px] bg-[#adf0ff] px-[30px] py-[18px] text-[14px] text-[#525c63]">{summaryText}</div>
        </div>
      </div>
    </div>
  );
}
