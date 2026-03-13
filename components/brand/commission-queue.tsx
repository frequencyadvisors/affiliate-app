"use client";

import { AlertTriangle, Check, Flag, RotateCcw, CircleDashed, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { COMMISSIONS, formatCurrency } from "@/lib/mock-data";
import { AttributionState, getAttributionRecord, getAttributionSummary } from "@/lib/verified-influence";
import { cn } from "@/lib/utils";
import { CommissionStatusChip } from "@/components/commission-status-chip";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TABLE_PAGE_SIZE, useLazyTable } from "@/lib/use-lazy-table";

const stateOrder: AttributionState[] = ["verified", "disputed", "unestablished"];
type CommissionTab = "all" | AttributionState;

const stateMeta: Record<
  AttributionState,
  {
    label: string;
    chipClassName: string;
    rowClassName: string;
  }
> = {
  verified: {
    label: "Verified",
    chipClassName: "border-[#0f6d45] bg-[#d9f7e8] text-[#0f6d45]",
    rowClassName: ""
  },
  disputed: {
    label: "Disputed",
    chipClassName: "border-[#9a4d00] bg-[#ffe8c9] text-[#7a3e00]",
    rowClassName: "bg-[#fff7eb] hover:bg-[#ffefd6]"
  },
  unestablished: {
    label: "Unestablished",
    chipClassName: "border-[#66717d] bg-[#eef2f5] text-[#55606c]",
    rowClassName: "bg-[#fafbfc] hover:bg-[#f1f4f6]"
  }
};

function StateChip({ state }: { state: AttributionState }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.72px]",
        stateMeta[state].chipClassName
      )}
    >
      {stateMeta[state].label}
    </span>
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
    <div className={showHeader ? "space-y-8" : "space-y-7"}>
      <section className={showHeader ? "" : showReliabilityEyebrow ? "border-t border-black/20 pt-[30px]" : ""}>
        {showReliabilityEyebrow && (
          <div className="px-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.78px] text-[#04070f]/54">
              {programFilter === "all" ? "Brand Attribution Reliability" : "Programme Attribution Reliability"}
            </p>
          </div>
        )}

        <div className={`grid gap-4 px-2 pb-[30px] md:grid-cols-3 ${showReliabilityEyebrow ? "pt-5" : "pt-0"}`}>
          <SummaryCard
            label="Verified Influence"
            percent={totalConversions > 0 ? Math.round((summary.verified.conversions / totalConversions) * 100) : 0}
            conversions={summary.verified.conversions}
            revenue={summary.verified.revenue}
            commission={summary.verified.commission}
            state="verified"
          />
          <SummaryCard
            label="Disputed Influence"
            percent={totalConversions > 0 ? Math.round((summary.disputed.conversions / totalConversions) * 100) : 0}
            conversions={summary.disputed.conversions}
            revenue={summary.disputed.revenue}
            commission={summary.disputed.commission}
            state="disputed"
          />
          <SummaryCard
            label="Unestablished Influence"
            percent={totalConversions > 0 ? Math.round((summary.unestablished.conversions / totalConversions) * 100) : 0}
            conversions={summary.unestablished.conversions}
            revenue={summary.unestablished.revenue}
            commission={summary.unestablished.commission}
            state="unestablished"
          />
        </div>
      </section>

      <section className="border-t border-black/20 pt-[26px]">
        {showRecordsIntro && (
          <div className="flex flex-col gap-5 px-2 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.78px] text-[#04070f]/54">
                Influence Records
              </p>
              <h2 className="text-[28px] font-semibold leading-none tracking-[-1.12px] text-[#04070f]">
                {listHeading}
              </h2>
            </div>
            <div className="flex w-full max-w-[410px] flex-col gap-3">
              <p className="text-[15px] leading-6 text-[#04070f]/68">
                Each row is a conversion claim with attributed creator influence. Open a commission to inspect supporting evidence, disputed signals, and review context.
              </p>
              <div className="text-[12px] leading-[18px] text-[#04070f]/64">
                {totalConversions} conversions • {formatCurrency(totalCommission, "USD")} commission value
              </div>
            </div>
          </div>
        )}

        <div className={`space-y-4 px-2 pb-2 ${showRecordsIntro ? "pt-5" : "pt-0"}`}>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CommissionTab)}>
            <TabsList className="h-auto flex-wrap gap-2 rounded-[16px] bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-[11px] border-2 border-black bg-[var(--muted)] px-4 py-2.5 text-[13px] font-semibold tracking-[-0.2px] text-[#04070f] shadow-[2px_2px_0px_0px_black] transition active:translate-x-[1px] active:translate-y-[1px]"
                activeClassName="rounded-[11px] border-2 border-black bg-[#04070f] px-4 py-2.5 text-[13px] font-semibold tracking-[-0.2px] text-white shadow-[2px_2px_0px_0px_black]"
                inactiveClassName="hover:bg-[#c8f4ff]"
              >
                All Commissions
                <span className="ml-2 text-[12px] opacity-72">{records.length}</span>
              </TabsTrigger>
              {stateOrder.map((state) => (
                <TabsTrigger
                  key={state}
                  value={state}
                  className="rounded-[11px] border-2 border-black bg-[var(--muted)] px-4 py-2.5 text-[13px] font-semibold tracking-[-0.2px] text-[#04070f] shadow-[2px_2px_0px_0px_black] transition active:translate-x-[1px] active:translate-y-[1px]"
                  activeClassName="rounded-[11px] border-2 border-black bg-[#04070f] px-4 py-2.5 text-[13px] font-semibold tracking-[-0.2px] text-white shadow-[2px_2px_0px_0px_black]"
                  inactiveClassName="hover:bg-[#c8f4ff]"
                >
                  {state === "verified" ? "Verified" : state === "disputed" ? "Disputed" : "Un-established"}
                  <span className="ml-2 text-[12px] opacity-72">{summary[state].conversions}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {showOverallSummaryLine && (
            <p className="pt-8 text-[21px] font-semibold leading-none tracking-[-0.84px] text-[#04070f] sm:text-[24px]">
              {activeSummary.conversions} conversions · {formatCurrency(activeSummary.revenue, "USD")} revenue · {formatCurrency(activeSummary.commission, "USD")} commission
            </p>
          )}

          {showFilteredSummaryCard && (
            <div className="flex flex-col gap-2 rounded-[16px] border border-black/12 bg-[#f7fafc] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[14px] font-semibold text-[#04070f]">{activeSummary.label}</p>
                <p className="text-[12px] text-[#04070f]/64">{filteredRecords.length} records shown</p>
              </div>
              <div className="text-[12px] text-[#04070f]/64 sm:text-right">
                {activeSummary.conversions} conversions • {formatCurrency(activeSummary.revenue, "USD")} revenue •{" "}
                {formatCurrency(activeSummary.commission, "USD")} commission
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-[18px] border-2 border-black bg-white shadow-[3px_3px_0px_0px_black]">
            <Table>
              <TableHeader>
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
                    className={cn("group cursor-pointer align-top", stateMeta[record.state].rowClassName)}
                    onClick={() => onOpenCommission(record.commissionId)}
                  >
                    <TableCell className="font-mono text-[12px] font-semibold text-[#04070f]/72">{record.commissionId}</TableCell>
                    <TableCell className="font-semibold">{record.creator}</TableCell>
                    <TableCell className="font-medium">{record.commission}</TableCell>
                    <TableCell className="max-w-[210px] text-[#04070f]/78">{record.product}</TableCell>
                    <TableCell className="font-medium">{record.orderValue}</TableCell>
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
                        <Button type="button" variant="outline" onClick={loadMore}>
                          Load 20 more commissions
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-10 text-center text-sm text-[#04070f]/56">
                      No commissions match this attribution and status combination yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredRecords.length > TABLE_PAGE_SIZE && (
            <p className="px-1 text-[12px] leading-[18px] text-[#04070f]/56">
              Showing {visibleRecords.length} of {filteredRecords.length} commissions
            </p>
          )}
        </div>
      </section>
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
    <div
      className={cn(
        "rounded-[18px] border-2 p-5 shadow-[3px_3px_0px_0px_black]",
        state === "verified"
          ? "border-[#0f6d45] bg-[#effcf4]"
          : state === "disputed"
            ? "border-[#9a4d00] bg-[#fff5e7]"
            : "border-[#73808c] bg-[#f6f8fa]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.72px] text-[#04070f]/52">{label}</p>
          <p className="mt-3 text-[42px] font-semibold leading-none tracking-[-1.68px] text-[#04070f]">{percent}%</p>
          <p className="mt-1 text-[13px] text-[#04070f]/64">
            {conversions} {conversions === 1 ? "conversion" : "conversions"}
          </p>
        </div>
        <div className="grid h-[34px] w-[34px] place-items-center rounded-full border border-black bg-white/75">
          {state === "verified" ? (
            <ShieldCheck className="h-4 w-4 text-[#55606c]" />
          ) : state === "disputed" ? (
            <AlertTriangle className="h-4 w-4 text-[#55606c]" />
          ) : (
            <CircleDashed className="h-4 w-4 text-[#55606c]" />
          )}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-black/12 pt-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.72px] text-[#04070f]/50">Revenue</p>
          <p className="mt-1 text-[18px] font-semibold text-[#04070f]">{formatCurrency(revenue, "USD")}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.72px] text-[#04070f]/50">Commission</p>
          <p className="mt-1 text-[18px] font-semibold text-[#04070f]">{formatCurrency(commission, "USD")}</p>
        </div>
      </div>
    </div>
  );
}
