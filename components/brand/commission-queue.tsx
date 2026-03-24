"use client";

import { AlertTriangle, Check, Flag, RotateCcw, CircleDashed, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { COMMISSIONS, formatCurrency } from "@/lib/mock-data";
import { AttributionState, getAttributionRecord, getAttributionSummary } from "@/lib/verified-influence";
import { cn } from "@/lib/utils";
import { CommissionStatusChip } from "@/components/commission-status-chip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Chip } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TABLE_PAGE_SIZE, useLazyTable } from "@/lib/use-lazy-table";

const stateOrder: AttributionState[] = ["verified", "disputed", "unestablished"];
type CommissionTab = "all" | AttributionState;

const stateMeta: Record<
  AttributionState,
  {
    label: string;
    tone: "success" | "warning" | "default";
  }
> = {
  verified: {
    label: "Verified",
    tone: "success"
  },
  disputed: {
    label: "Disputed",
    tone: "warning"
  },
  unestablished: {
    label: "Unestablished",
    tone: "default"
  }
};

function StateChip({ state }: { state: AttributionState }) {
  return (
    <Chip color={stateMeta[state].tone} variant="soft" size="sm">
      {stateMeta[state].label}
    </Chip>
  );
}

export function CommissionQueue({
  programFilter = "all",
  onOpenCommission,
  idColumnLabel = "Commission ID",
  showHeader = true,
  showReliabilityEyebrow = true,
  showRecordsIntro = true,
  showFilteredSummaryCard = true,
  showOverallSummaryLine = false
}: {
  programFilter?: "all" | string;
  onOpenCommission: (id: string) => void;
  idColumnLabel?: string;
  showHeader?: boolean;
  showReliabilityEyebrow?: boolean;
  showRecordsIntro?: boolean;
  showFilteredSummaryCard?: boolean;
  showOverallSummaryLine?: boolean;
}) {
  const rows = useMemo(() => {
    const base = programFilter === "all"
      ? COMMISSIONS
      : COMMISSIONS.filter((commission) => commission.programName === programFilter);

    return [...base].sort((a, b) => +new Date(b.conversionTimestamp) - +new Date(a.conversionTimestamp));
  }, [programFilter]);
  const records = useMemo(() => rows.map((commission) => getAttributionRecord(commission)), [rows]);
  const summary = useMemo(() => getAttributionSummary(rows), [rows]);
  const [activeTab, setActiveTab] = useState<CommissionTab>("all");

  const totalConversions = rows.length;
  const totalCommission = rows.reduce((acc, row) => acc + row.amount, 0);
  const totalRevenue = records.reduce((acc, record) => acc + Number.parseFloat(record.orderValue.replace(/[$,]/g, "")), 0);
  const rowsById = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const filteredRecords = useMemo(
    () => (activeTab === "all" ? records : records.filter((record) => record.state === activeTab)),
    [activeTab, records]
  );
  const activeSummary = useMemo(() => {
    const filteredRows = filteredRecords
      .map((record) => rowsById.get(record.commissionId))
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    return {
      label: activeTab === "all" ? "All commissions" : `${stateMeta[activeTab].label} commissions`,
      conversions: filteredRows.length,
      revenue: filteredRecords.reduce((acc, record) => acc + Number.parseFloat(record.orderValue.replace(/[$,]/g, "")), 0),
      commission: filteredRows.reduce((acc, row) => acc + row.amount, 0)
    };
  }, [activeTab, filteredRecords, rowsById]);
  const { visibleCount, hasMore, loadMore, sentinelRef } = useLazyTable(filteredRecords.length);
  const visibleRecords = filteredRecords.slice(0, visibleCount);

  const listHeading = programFilter === "all" ? "Brand commissions by attribution state" : "Programme commissions by attribution state";

  return (
    <div className={showHeader ? "space-y-6" : "space-y-5"}>
      <Card variant="secondary" className="border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <CardContent className="space-y-5 p-5 sm:p-6">
          {showReliabilityEyebrow && (
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">
              {programFilter === "all" ? "Brand attribution reliability" : "Programme attribution reliability"}
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="Verified influence"
              percent={totalConversions > 0 ? Math.round((summary.verified.conversions / totalConversions) * 100) : 0}
              conversions={summary.verified.conversions}
              revenue={summary.verified.revenue}
              commission={summary.verified.commission}
              state="verified"
            />
            <SummaryCard
              label="Disputed influence"
              percent={totalConversions > 0 ? Math.round((summary.disputed.conversions / totalConversions) * 100) : 0}
              conversions={summary.disputed.conversions}
              revenue={summary.disputed.revenue}
              commission={summary.disputed.commission}
              state="disputed"
            />
            <SummaryCard
              label="Unestablished influence"
              percent={totalConversions > 0 ? Math.round((summary.unestablished.conversions / totalConversions) * 100) : 0}
              conversions={summary.unestablished.conversions}
              revenue={summary.unestablished.revenue}
              commission={summary.unestablished.commission}
              state="unestablished"
            />
          </div>
        </CardContent>
      </Card>

      <Card variant="secondary" className="border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <CardHeader className="gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          {showRecordsIntro && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">
                Influence records
              </p>
              <CardTitle className="text-2xl tracking-[-0.04em]">{listHeading}</CardTitle>
              <CardDescription className="max-w-2xl text-default-500">
                Each row is a conversion claim with attributed creator influence. Open a commission to inspect supporting evidence, disputed signals, and review context.
              </CardDescription>
            </div>
          )}
          <div className="space-y-3 sm:max-w-sm sm:text-right">
            <div className="text-sm text-default-500">
              {totalConversions} conversions
            </div>
            <div className="text-base font-medium text-foreground">
              {formatCurrency(totalCommission, "USD")} commission value
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-5 pt-0 sm:p-6">
          <div className="flex flex-wrap gap-2 rounded-2xl border border-default-200 bg-background/80 p-1">
            <TabPill active={activeTab === "all"} onClick={() => setActiveTab("all")}>
              All commissions <span className="text-xs text-default-400">{records.length}</span>
            </TabPill>
            {stateOrder.map((state) => (
              <TabPill key={state} active={activeTab === state} onClick={() => setActiveTab(state)}>
                {stateMeta[state].label} <span className="text-xs text-default-400">{summary[state].conversions}</span>
              </TabPill>
            ))}
          </div>

          {showOverallSummaryLine && (
            <p className="text-sm text-default-500">
              {activeSummary.conversions} conversions · {formatCurrency(activeSummary.revenue, "USD")} revenue · {formatCurrency(activeSummary.commission, "USD")} commission
            </p>
          )}

          {showFilteredSummaryCard && (
            <div className="flex flex-col gap-2 rounded-2xl border border-default-200 bg-default-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{activeSummary.label}</p>
                <p className="text-xs text-default-500">{filteredRecords.length} records shown</p>
              </div>
              <div className="text-xs text-default-500 sm:text-right">
                {activeSummary.conversions} conversions · {formatCurrency(activeSummary.revenue, "USD")} revenue ·{" "}
                {formatCurrency(activeSummary.commission, "USD")} commission
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-3xl border border-default-200 bg-background/95">
            <Table>
              <TableHeader className="bg-default-50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>{idColumnLabel}</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Order Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRecords.map((record) => (
                  <TableRow
                    key={record.commissionId}
                    className="group cursor-pointer align-top hover:bg-default-50/70"
                    onClick={() => onOpenCommission(record.commissionId)}
                  >
                    <TableCell className="font-mono text-xs font-medium text-default-500">{record.commissionId}</TableCell>
                    <TableCell className="font-medium text-foreground">{record.creator}</TableCell>
                    <TableCell className="font-medium text-foreground">{record.commission}</TableCell>
                    <TableCell className="max-w-[210px] text-default-500">{record.product}</TableCell>
                    <TableCell className="font-medium text-foreground">{record.orderValue}</TableCell>
                    <TableCell>
                      <CommissionStatusChip
                        status={rowsById.get(record.commissionId)?.status ?? "recorded"}
                        journeyStage={rowsById.get(record.commissionId)?.journeyStage}
                        viewer="brand"
                      />
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-8 w-8">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-8 w-8">
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {hasMore && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className="px-4 py-4">
                      <div className="flex flex-col items-center gap-3">
                        <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
                        <Button type="button" variant="secondary" onClick={loadMore}>
                          Load 20 more commissions
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-10 text-center text-sm text-default-500">
                      No commissions match this attribution and status combination yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredRecords.length > TABLE_PAGE_SIZE && (
            <p className="px-1 text-xs text-default-500">
              Showing {visibleRecords.length} of {filteredRecords.length} commissions
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  percent,
  conversions,
  revenue,
  commission,
  state
}: {
  label: string;
  percent: number;
  conversions: number;
  revenue: number;
  commission: number;
  state: AttributionState;
}) {
  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", state === "verified" ? "border-emerald-200 bg-emerald-50/70" : state === "disputed" ? "border-amber-200 bg-amber-50/70" : "border-slate-200 bg-slate-50/70")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-default-500">{label}</p>
          <p className="mt-3 text-4xl font-semibold leading-none tracking-[-0.05em] text-foreground">{percent}%</p>
          <p className="mt-1 text-xs text-default-500">
            {conversions} {conversions === 1 ? "conversion" : "conversions"}
          </p>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full border border-default-200 bg-white">
          {state === "verified" ? (
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          ) : state === "disputed" ? (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          ) : (
            <CircleDashed className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-default-200 pt-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-default-500">Revenue</p>
          <p className="mt-1 text-base font-semibold text-foreground">{formatCurrency(revenue, "USD")}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-default-500">Commission</p>
          <p className="mt-1 text-base font-semibold text-foreground">{formatCurrency(commission, "USD")}</p>
        </div>
      </div>
    </div>
  );
}

function TabPill({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
        active ? "bg-white text-foreground shadow-sm" : "text-default-500 hover:bg-default-100 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
