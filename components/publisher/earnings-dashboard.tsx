"use client";

import { AlertTriangle, CircleDashed, ShieldCheck } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo, useState } from "react";
import { COMMISSIONS, formatCurrency, formatDateTime, getAgeDays } from "@/lib/mock-data";
import { AttributionState, getAttributionRecord, getAttributionSummary } from "@/lib/verified-influence";
import { CommissionStatusChip } from "@/components/commission-status-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListSurface } from "@/components/ui/list-surface";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TABLE_PAGE_SIZE, useLazyTable } from "@/lib/use-lazy-table";

const stateOrder: AttributionState[] = ["verified", "disputed", "unestablished"];
type CommissionTab = "all" | AttributionState;

export function EarningsDashboard({
  onOpenCommission,
  showTopStats = true,
  programFilter = "all"
}: {
  onOpenCommission: (id: string) => void;
  showTopStats?: boolean;
  programFilter?: "all" | string;
}) {
  const chartData = [
    { name: "Jan", value: 77.1 },
    { name: "", value: 77.5 },
    { name: "", value: 77.9 },
    { name: "", value: 77.2 },
    { name: "", value: 76.8 },
    { name: "", value: 76.4 },
    { name: "Feb", value: 76.1 },
    { name: "", value: 76.5 },
    { name: "", value: 76.2 },
    { name: "", value: 75.9 },
    { name: "", value: 75.7 },
    { name: "", value: 76.3 },
    { name: "Mar", value: 76.9 },
    { name: "", value: 77.3 },
    { name: "", value: 78.6 },
    { name: "", value: 79.1 },
    { name: "", value: 78.9 },
    { name: "Apr", value: 79.8 },
    { name: "", value: 80.4 },
    { name: "", value: 81.1 },
    { name: "May", value: 80.1 },
    { name: "", value: 81.8 },
    { name: "", value: 81.5 },
    { name: "", value: 82.3 },
    { name: "", value: 85.7 },
    { name: "", value: 86.2 },
    { name: "", value: 86.9 },
    { name: "", value: 86.3 },
    { name: "Jun", value: 88.9 }
  ];
  const scopedRows = programFilter === "all" ? COMMISSIONS : COMMISSIONS.filter((c) => c.programName === programFilter);
  const total = scopedRows.filter((c) => ["paid", "locked", "approved"].includes(c.status)).reduce((a, c) => a + c.amount, 0);
  const pending = scopedRows.filter((c) => ["pending", "recorded"].includes(c.status)).reduce((a, c) => a + c.amount, 0);
  const activePrograms = new Set(scopedRows.map((c) => c.programName)).size;
  return (
    <div className="space-y-5">
      <section className="px-2">
        <EarningsPerformanceSection
          chartData={chartData}
          showTopStats={showTopStats}
          total={total}
          pending={pending}
          activePrograms={activePrograms}
          unified={true}
        />
      </section>
      <div className="mb-6">
        <EarningsInfluenceSummaryGrid rows={scopedRows} />
      </div>
      <EarningsActivityPanel rows={scopedRows} onOpenCommission={onOpenCommission} showProductColumn showOrderValueColumn />
    </div>
  );
}

export function EarningsPerformanceSection({
  chartData,
  showTopStats,
  total,
  pending,
  activePrograms,
  unified = false
}: {
  chartData: { name: string; value: number }[];
  showTopStats: boolean;
  total: number;
  pending: number;
  activePrograms: number;
  unified?: boolean;
}) {
  if (unified) {
    return (
      <Card className="overflow-hidden rounded-[20px]">
        <CardContent className="p-0">
          <div className={cn("grid", showTopStats ? "md:grid-cols-4" : "md:grid-cols-3")}>
            <UnifiedStat title="Total Earned" value={formatCurrency(total, "USD")} />
            <UnifiedStat title="In Review" value={formatCurrency(pending, "USD")} withDivider />
            <UnifiedStat title="Conversion Rate" value="6.4%" withDivider />
            {showTopStats && <UnifiedStat title="Active Programs" value={`${activePrograms}`} withDivider />}
          </div>
          <div className="border-t border-black/20 px-5 py-5">
            <h3 className="text-[16px] font-semibold tracking-[-0.4px] text-[#04070f]">Earnings Trend</h3>
            <div className="mt-6 h-[232px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 2, right: 6, left: -18, bottom: 2 }}>
                  <CartesianGrid stroke="#d7dbe0" strokeDasharray="2 6" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#7a8289" }} />
                  <YAxis domain={[75, 89]} ticks={[75, 82, 89]} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#7a8289" }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#1b1d22"
                    strokeWidth={3}
                    dot={(props) => (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={4.5}
                        fill="#ffffff"
                        stroke="#1b1d22"
                        strokeWidth={3}
                      />
                    )}
                    activeDot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {showTopStats && !unified && (
        <div className="grid gap-4 md:grid-cols-4">
          <Stat title="Total Earned" value={formatCurrency(total, "USD")} />
          <Stat title="In Review" value={formatCurrency(pending, "USD")} />
          <Stat title="Conversion Rate" value="6.4%" />
          <Stat title="Active Programs" value={`${activePrograms}`} />
        </div>
      )}

      <Card>
        <CardHeader className="px-6 pb-2 pt-6"><CardTitle className="text-base">Earnings Trend</CardTitle></CardHeader>
        <CardContent className="h-64 px-6 pb-4 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#d7dbe0" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#7a8289" }} />
              <YAxis domain={[75, 89]} ticks={[75, 82, 89]} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#7a8289" }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1b1d22"
                strokeWidth={3}
                dot={(props) => {
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4.5}
                      fill="#ffffff"
                      stroke="#1b1d22"
                      strokeWidth={3}
                    />
                  );
                }}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}

export function EarningsActivitySection({
  rows,
  onOpenCommission,
  showHeader = true,
  emptyMessage = "No commission activity yet.",
  showProgramColumn = true,
  showProductColumn = false,
  showOrderValueColumn = false,
  showOrderIdColumn = true
}: {
  rows: typeof COMMISSIONS;
  onOpenCommission: (id: string) => void;
  showHeader?: boolean;
  emptyMessage?: string;
  showProgramColumn?: boolean;
  showProductColumn?: boolean;
  showOrderValueColumn?: boolean;
  showOrderIdColumn?: boolean;
}) {
  const sortedRows = [...rows].sort((a, b) => +new Date(b.conversionTimestamp) - +new Date(a.conversionTimestamp));
  const attributionById = useMemo(
    () => new Map(sortedRows.map((row) => [row.id, getAttributionRecord(row)])),
    [sortedRows]
  );
  const columnCount = 4 + Number(showProgramColumn) + Number(showProductColumn) + Number(showOrderValueColumn) + Number(showOrderIdColumn);
  const { visibleCount, hasMore, loadMore, sentinelRef } = useLazyTable(sortedRows.length);
  const visibleRows = sortedRows.slice(0, visibleCount);

  return (
    <ListSurface className="overflow-hidden rounded-[20px] border-2 border-black shadow-[3px_3px_0px_0px_black]">
      {showHeader && (
        <div className="px-6 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.78px] text-[#04070f]/54">
                Earnings Activity
              </p>
              <h2 className="text-[28px] font-semibold leading-none tracking-[-1.12px] text-[#04070f]">
                Conversion movement across your commissions
              </h2>
            </div>
            <p className="text-[12px] leading-[18px] text-[#04070f]/64">
              {sortedRows.length} records · newest activity first
            </p>
          </div>
        </div>
      )}
      <div className={showHeader ? "pt-5" : ""}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Journey</TableHead>
              {showProductColumn && <TableHead>Product</TableHead>}
              <TableHead>Commission Amount</TableHead>
              {showOrderValueColumn && <TableHead>Order Value</TableHead>}
              {showOrderIdColumn && <TableHead>Order ID</TableHead>}
              {showProgramColumn && <TableHead>Programme</TableHead>}
              <TableHead>Date</TableHead>
              <TableHead>Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((c) => (
              <TableRow key={c.id} className="cursor-pointer" onClick={() => onOpenCommission(c.id)}>
                <TableCell>
                  <CommissionStatusChip status={c.status} journeyStage={c.journeyStage} />
                </TableCell>
                {showProductColumn && <TableCell>{attributionById.get(c.id)?.product ?? c.productCategory}</TableCell>}
                <TableCell className="font-medium">{formatCurrency(c.amount, c.currency)}</TableCell>
                {showOrderValueColumn && <TableCell className="font-medium">{attributionById.get(c.id)?.orderValue ?? formatCurrency(c.amount, c.currency)}</TableCell>}
                {showOrderIdColumn && <TableCell className="font-medium">{c.orderId}</TableCell>}
                {showProgramColumn && <TableCell>{c.programName}</TableCell>}
                <TableCell>{formatDateTime(c.conversionTimestamp)}</TableCell>
                <TableCell>{getAgeDays(c.conversionTimestamp)}d</TableCell>
              </TableRow>
            ))}
            {hasMore && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnCount} className="px-4 py-4">
                  <div className="flex flex-col items-center gap-3">
                    <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
                    <Card className="border-none p-0 shadow-none">
                      <button
                        type="button"
                        onClick={loadMore}
                        className="rounded-[11px] border-2 border-black bg-[var(--muted)] px-4 py-2.5 text-[13px] font-semibold tracking-[-0.2px] text-[#04070f] shadow-[2px_2px_0px_0px_black] transition active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        Load 20 more commissions
                      </button>
                    </Card>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {sortedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnCount} className="px-6 py-10 text-center text-sm text-[#04070f]/56">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {sortedRows.length > TABLE_PAGE_SIZE && (
        <div className="px-6 pb-6 pt-3 text-[12px] leading-[18px] text-[#04070f]/56">
          Showing {visibleRows.length} of {sortedRows.length} commissions
        </div>
      )}
    </ListSurface>
  );
}

export function EarningsActivityPanel({
  rows,
  onOpenCommission,
  emptyMessage = "No commission activity yet.",
  showProgramColumn = true,
  showProductColumn = false,
  showOrderValueColumn = false,
  showOrderIdColumn = true
}: {
  rows: typeof COMMISSIONS;
  onOpenCommission: (id: string) => void;
  emptyMessage?: string;
  showProgramColumn?: boolean;
  showProductColumn?: boolean;
  showOrderValueColumn?: boolean;
  showOrderIdColumn?: boolean;
}) {
  const [activeCommissionTab, setActiveCommissionTab] = useState<CommissionTab>("all");
  const summary = useMemo(() => getAttributionSummary(rows), [rows]);
  const totalRevenue = summary.verified.revenue + summary.disputed.revenue + summary.unestablished.revenue;
  const totalCommission = summary.verified.commission + summary.disputed.commission + summary.unestablished.commission;
  const filteredRows =
    activeCommissionTab === "all"
      ? rows
      : rows.filter((commission) => getAttributionRecord(commission).state === activeCommissionTab);
  const activeSummary =
    activeCommissionTab === "all"
      ? {
          conversions: rows.length,
          revenue: totalRevenue,
          commission: totalCommission
        }
      : {
          conversions: summary[activeCommissionTab].conversions,
          revenue: summary[activeCommissionTab].revenue,
          commission: summary[activeCommissionTab].commission
        };

  return (
    <section className="border-t border-black/20 pt-[26px]">
      <div className="space-y-4 px-2 pb-2">
        <Tabs value={activeCommissionTab} onValueChange={(value) => setActiveCommissionTab(value as CommissionTab)}>
          <TabsList className="h-auto flex-wrap gap-2 rounded-[16px] bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="rounded-[11px] border-2 border-black bg-[var(--muted)] px-4 py-2.5 text-[13px] font-semibold tracking-[-0.2px] text-[#04070f] shadow-[2px_2px_0px_0px_black] transition active:translate-x-[1px] active:translate-y-[1px]"
              activeClassName="rounded-[11px] border-2 border-black bg-[#04070f] px-4 py-2.5 text-[13px] font-semibold tracking-[-0.2px] text-white shadow-[2px_2px_0px_0px_black]"
              inactiveClassName="hover:bg-[#c8f4ff]"
            >
              All Commissions
              <span className="ml-2 text-[12px] opacity-72">{rows.length}</span>
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

        <p className="pt-8 text-[21px] font-semibold leading-none tracking-[-0.84px] text-[#04070f] sm:text-[24px]">
          {activeSummary.conversions} conversions · {formatCurrency(activeSummary.revenue, "USD")} revenue ·{" "}
          {formatCurrency(activeSummary.commission, "USD")} commission
        </p>

        <EarningsActivitySection
          rows={filteredRows}
          onOpenCommission={onOpenCommission}
          showHeader={false}
          emptyMessage={emptyMessage}
          showProgramColumn={showProgramColumn}
          showProductColumn={showProductColumn}
          showOrderValueColumn={showOrderValueColumn}
          showOrderIdColumn={showOrderIdColumn}
        />
      </div>
    </section>
  );
}

export function EarningsInfluenceSummaryGrid({
  rows
}: {
  rows: typeof COMMISSIONS;
}) {
  const summary = useMemo(() => getAttributionSummary(rows), [rows]);
  const totalConversions = rows.length;

  return (
    <section className="px-2">
      <div className="grid gap-4 md:grid-cols-3">
        <InfluenceSummaryCard
          label="Verified Influence"
          conversions={summary.verified.conversions}
          revenue={summary.verified.revenue}
          commission={summary.verified.commission}
          percent={totalConversions > 0 ? Math.round((summary.verified.conversions / totalConversions) * 100) : 0}
          state="verified"
        />
        <InfluenceSummaryCard
          label="Disputed Influence"
          conversions={summary.disputed.conversions}
          revenue={summary.disputed.revenue}
          commission={summary.disputed.commission}
          percent={totalConversions > 0 ? Math.round((summary.disputed.conversions / totalConversions) * 100) : 0}
          state="disputed"
        />
        <InfluenceSummaryCard
          label="Unestablished Influence"
          conversions={summary.unestablished.conversions}
          revenue={summary.unestablished.revenue}
          commission={summary.unestablished.commission}
          percent={totalConversions > 0 ? Math.round((summary.unestablished.conversions / totalConversions) * 100) : 0}
          state="unestablished"
        />
      </div>
    </section>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card className="h-[160px]">
      <CardContent className="flex h-full flex-col justify-between p-[22px]">
        <p className="whitespace-nowrap text-[12px] font-semibold uppercase leading-[16px] tracking-[0.72px] text-[#ff6088]">{title}</p>
        <p className="text-[45px] font-semibold leading-[35px] tracking-[-0.2px] text-[#04070f]">{value}</p>
      </CardContent>
    </Card>
  );
}

function UnifiedStat({
  title,
  value,
  withDivider = false
}: {
  title: string;
  value: string;
  withDivider?: boolean;
}) {
  return (
    <div className={withDivider ? "border-l border-black/20" : ""}>
      <div className="flex h-[160px] flex-col justify-between p-[22px]">
        <p className="whitespace-nowrap text-[12px] font-semibold uppercase leading-[16px] tracking-[0.72px] text-[#04070f]/50">{title}</p>
        <p className="text-[45px] font-semibold leading-[35px] tracking-[-0.2px] text-[#04070f]">{value}</p>
      </div>
    </div>
  );
}

function InfluenceSummaryCard({
  label,
  conversions,
  revenue,
  commission,
  percent,
  state
}: {
  label: string;
  conversions: number;
  revenue: number;
  commission: number;
  percent: number;
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
          <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-1.2px] text-[#04070f]">{percent}%</p>
          <p className="mt-1 text-[13px] text-[#04070f]/64">{conversions} conversions</p>
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
