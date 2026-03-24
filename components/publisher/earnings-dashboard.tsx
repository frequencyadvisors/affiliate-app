"use client";

import { AlertTriangle, ChevronRight, CircleDashed, ShieldCheck } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo, useState } from "react";
import { COMMISSIONS, formatCurrency, formatDateTime, getAgeDays } from "@/lib/mock-data";
import { AttributionState, getAttributionRecord, getAttributionSummary } from "@/lib/verified-influence";
import { CommissionStatusChip } from "@/components/commission-status-chip";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Chip, Separator } from "@heroui/react";
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
    <div className="space-y-6">
      <section className="px-2">
        <Card className="border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <Chip color="accent" variant="soft" size="sm">Publisher workspace</Chip>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">Earnings</h1>
                <p className="max-w-2xl text-sm leading-6 text-default-500 sm:text-base">
                  Track commission performance, review attribution quality, and inspect payout movement without leaving the dashboard.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip variant="secondary" color="default">Programs {activePrograms}</Chip>
              <Chip variant="soft" color="success">Paid {formatCurrency(total, "USD")}</Chip>
              <Chip variant="soft" color="warning">Review {formatCurrency(pending, "USD")}</Chip>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="px-2">
        <EarningsPerformanceSection
          chartData={chartData}
          showTopStats={showTopStats}
          total={total}
          pending={pending}
          activePrograms={activePrograms}
          unified
        />
      </section>

      <section className="px-2">
        <EarningsInfluenceSummaryGrid rows={scopedRows} />
      </section>

      <section className="px-2">
        <EarningsActivitySection rows={scopedRows} onOpenCommission={onOpenCommission} showProductColumn showOrderValueColumn />
      </section>
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
  const stats = [
    { title: "Total earned", value: formatCurrency(total, "USD") },
    { title: "In review", value: formatCurrency(pending, "USD") },
    { title: "Conversion rate", value: "6.4%" },
    ...(showTopStats ? [{ title: "Active programs", value: `${activePrograms}` }] : [])
  ];

  return (
    <Card className="overflow-hidden border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <CardContent className="p-0">
        <div className={`grid gap-0 ${showTopStats ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
          {stats.map((stat, index) => (
            <UnifiedStat key={stat.title} title={stat.title} value={stat.value} withDivider={index !== 0} />
          ))}
        </div>

        <Separator />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">Earnings trend</h3>
              <p className="text-sm text-default-500">Weekly movement across the current publisher portfolio.</p>
            </div>
            <Chip variant="soft" color="accent" size="sm">Last 6 months</Chip>
          </div>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 2, right: 6, left: -18, bottom: 2 }}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="2 6" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#7c8192" }} />
                <YAxis domain={[75, 89]} ticks={[75, 82, 89]} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#7c8192" }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={(props) => (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4.5}
                      fill="#ffffff"
                      stroke="#a855f7"
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
  const attributionById = useMemo(() => new Map(sortedRows.map((row) => [row.id, getAttributionRecord(row)])), [sortedRows]);
  const { visibleCount, hasMore, loadMore, sentinelRef } = useLazyTable(sortedRows.length);
  const visibleRows = sortedRows.slice(0, visibleCount);
  const [activeCommissionTab, setActiveCommissionTab] = useState<CommissionTab>("all");
  const summary = useMemo(() => getAttributionSummary(rows), [rows]);
  const filteredRows = activeCommissionTab === "all" ? rows : rows.filter((commission) => getAttributionRecord(commission).state === activeCommissionTab);
  const filteredSummary = useMemo(() => {
    if (activeCommissionTab === "all") {
      return {
        conversions: rows.length,
        revenue: summary.verified.revenue + summary.disputed.revenue + summary.unestablished.revenue,
        commission: summary.verified.commission + summary.disputed.commission + summary.unestablished.commission
      };
    }
    return {
      conversions: summary[activeCommissionTab].conversions,
      revenue: summary[activeCommissionTab].revenue,
      commission: summary[activeCommissionTab].commission
    };
  }, [activeCommissionTab, rows.length, summary, rows]);
  const gridColumns = [
    "minmax(180px, 1.1fr)",
    showProductColumn ? "minmax(160px, 1fr)" : null,
    "minmax(150px, 0.9fr)",
    showOrderValueColumn ? "minmax(130px, 0.85fr)" : null,
    showOrderIdColumn ? "minmax(140px, 0.95fr)" : null,
    showProgramColumn ? "minmax(160px, 1fr)" : null,
    "minmax(140px, 0.9fr)",
    "minmax(80px, 0.6fr)"
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card className="border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <CardHeader className="gap-4 px-6 pt-6">
        {showHeader && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">Earnings activity</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                Conversion movement across your commissions
              </h2>
            </div>
            <p className="text-sm text-default-500">{sortedRows.length} records · newest activity first</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <FilterPill active={activeCommissionTab === "all"} onClick={() => setActiveCommissionTab("all")}>
            All Commissions {rows.length}
          </FilterPill>
          {stateOrder.map((state) => (
            <FilterPill key={state} active={activeCommissionTab === state} onClick={() => setActiveCommissionTab(state)}>
              {state === "verified" ? "Verified" : state === "disputed" ? "Disputed" : "Un-established"} {summary[state].conversions}
            </FilterPill>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pb-6 pt-0">
        <Separator />
        <p className="text-lg font-semibold tracking-[-0.03em] text-foreground">
          {filteredSummary.conversions} conversions · {formatCurrency(filteredSummary.revenue, "USD")} revenue · {formatCurrency(filteredSummary.commission, "USD")} commission
        </p>

        <div className="rounded-3xl border border-default-200 bg-background/90">
          <div className="grid gap-4 border-b border-default-200 bg-default-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-default-500" style={{ gridTemplateColumns: gridColumns }}>
            <span>Journey</span>
            {showProductColumn && <span>Product</span>}
            <span>Commission</span>
            {showOrderValueColumn && <span>Order value</span>}
            {showOrderIdColumn && <span>Order ID</span>}
            {showProgramColumn && <span>Programme</span>}
            <span>Date</span>
            <span>Age</span>
          </div>

          <div className="divide-y divide-default-200">
            {visibleRows.length === 0 && <div className="px-6 py-10 text-center text-sm text-default-500">{emptyMessage}</div>}

            {visibleRows.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onOpenCommission(c.id)}
                className="grid w-full gap-4 px-4 py-4 text-left transition-colors hover:bg-default-50/80"
                style={{ gridTemplateColumns: gridColumns }}
              >
                <div className="flex items-center">
                  <CommissionStatusChip status={c.status} journeyStage={c.journeyStage} />
                </div>
                {showProductColumn && <div className="text-sm text-foreground">{attributionById.get(c.id)?.product ?? c.productCategory}</div>}
                <div className="text-sm font-medium text-foreground">{formatCurrency(c.amount, c.currency)}</div>
                {showOrderValueColumn && <div className="text-sm text-foreground">{attributionById.get(c.id)?.orderValue ?? formatCurrency(c.amount, c.currency)}</div>}
                {showOrderIdColumn && <div className="text-sm text-default-600">{c.orderId}</div>}
                {showProgramColumn && <div className="text-sm text-default-600">{c.programName}</div>}
                <div className="text-sm text-default-600">{formatDateTime(c.conversionTimestamp)}</div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-default-600">{getAgeDays(c.conversionTimestamp)}d</span>
                  <ChevronRight className="h-4 w-4 text-default-300" />
                </div>
              </button>
            ))}

            {hasMore && (
              <div className="flex flex-col items-center gap-3 px-4 py-5">
                <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
                <Button variant="secondary" onClick={loadMore}>
                  Load 20 more commissions
                </Button>
              </div>
            )}
          </div>
        </div>

        {sortedRows.length > TABLE_PAGE_SIZE && (
          <p className="text-sm text-default-500">Showing {visibleRows.length} of {sortedRows.length} commissions</p>
        )}
      </CardContent>
    </Card>
  );
}

export function EarningsInfluenceSummaryGrid({ rows }: { rows: typeof COMMISSIONS }) {
  const summary = useMemo(() => getAttributionSummary(rows), [rows]);
  const totalConversions = rows.length;

  return (
    <section>
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

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 text-sm font-medium transition",
        active ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm" : "bg-default-100 text-default-500 hover:bg-default-200"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card className="h-[160px] border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <CardContent className="flex h-full flex-col justify-between p-[22px]">
        <p className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.24em] text-default-500">{title}</p>
        <p className="text-[40px] font-semibold leading-none tracking-[-0.05em] text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function UnifiedStat({ title, value, withDivider = false }: { title: string; value: string; withDivider?: boolean }) {
  return (
    <div className={withDivider ? "border-l border-default-200" : ""}>
      <div className="flex h-[160px] flex-col justify-between p-[22px]">
        <p className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.24em] text-default-500">{title}</p>
        <p className="text-[40px] font-semibold leading-none tracking-[-0.05em] text-foreground">{value}</p>
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
      className={[
        "rounded-3xl border p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]",
        state === "verified"
          ? "border-emerald-200 bg-emerald-50/70"
          : state === "disputed"
            ? "border-amber-200 bg-amber-50/70"
            : "border-slate-200 bg-slate-50/70"
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">{label}</p>
          <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.05em] text-foreground">{percent}%</p>
          <p className="mt-1 text-sm text-default-500">{conversions} conversions</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/80">
          {state === "verified" ? (
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          ) : state === "disputed" ? (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          ) : (
            <CircleDashed className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/70 pt-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">Revenue</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(revenue, "USD")}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">Commission</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(commission, "USD")}</p>
        </div>
      </div>
    </div>
  );
}
