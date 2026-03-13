"use client";

import { useMemo, type ComponentType } from "react";
import { AlertTriangle, BarChart3, Building2, Calendar, CheckCircle2, CircleDollarSign, Users } from "lucide-react";
import {
  BRAND_PROGRAMS_DATA,
  COMMISSIONS,
  CUSTOMER_PROFILES,
  CREATOR_PROFILES,
  DETAIL_COMMISSIONS,
  DISPUTES,
  formatCurrency,
  getAgeDays,
  type BrandProgramData,
  type Commission
} from "@/lib/mock-data";
import { CommissionStatusChip } from "@/components/commission-status-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListSurface } from "@/components/ui/list-surface";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function estimateOrderValue(commission: Commission, program: BrandProgramData | undefined) {
  const rate = program?.commissionRate ?? "";
  const parsed = Number.parseFloat(rate.replace("%", "").trim());
  if (Number.isFinite(parsed) && parsed > 0) {
    return commission.amount / (parsed / 100);
  }
  return commission.amount * 8;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

export function CreatorInsights({
  creatorName
}: {
  creatorName: string;
}) {
  const profile = CREATOR_PROFILES[creatorName];
  const data = useMemo(() => {
    const unique = new Map<string, Commission>();
    [...COMMISSIONS, ...DETAIL_COMMISSIONS]
      .filter((c) => c.publisher === creatorName)
      .forEach((c) => unique.set(c.id, c));

    const commissions = [...unique.values()].sort(
      (a, b) => new Date(b.conversionTimestamp).getTime() - new Date(a.conversionTimestamp).getTime()
    );

    const perProgram = new Map<
      string,
      {
        programName: string;
        businessUnit: string;
        conversions: number;
        commissionsTotal: number;
        revenueTotal: number;
        latestConversion: string;
      }
    >();

    let totalRevenue = 0;
    let totalCommissions = 0;
    commissions.forEach((c) => {
      const program = BRAND_PROGRAMS_DATA[c.programName];
      const businessUnit = program?.businessUnitName ?? "Unknown";
      const orderValue = estimateOrderValue(c, program);
      totalRevenue += orderValue;
      totalCommissions += c.amount;

      const existing = perProgram.get(c.programName) ?? {
        programName: c.programName,
        businessUnit,
        conversions: 0,
        commissionsTotal: 0,
        revenueTotal: 0,
        latestConversion: c.conversionTimestamp
      };

      existing.conversions += 1;
      existing.commissionsTotal += c.amount;
      existing.revenueTotal += orderValue;
      if (new Date(c.conversionTimestamp).getTime() > new Date(existing.latestConversion).getTime()) {
        existing.latestConversion = c.conversionTimestamp;
      }
      perProgram.set(c.programName, existing);
    });

    const programRows = [...perProgram.values()].sort((a, b) => b.commissionsTotal - a.commissionsTotal);
    const businessUnits = [...new Set(programRows.map((r) => r.businessUnit))];
    const firstConversion = commissions.length
      ? commissions.reduce((earliest, c) =>
          new Date(c.conversionTimestamp).getTime() < new Date(earliest).getTime() ? c.conversionTimestamp : earliest
        , commissions[0].conversionTimestamp)
      : null;

    const approved = commissions.filter((c) => ["approved", "locked", "paid"].includes(c.status)).length;
    const declined = commissions.filter((c) => c.status === "reversed").length;
    const decided = approved + declined;
    const approvalRate = decided ? (approved / decided) * 100 : 0;

    const disputeCount = DISPUTES.filter((d) => commissions.some((c) => c.id === d.commissionId)).length;
    const disputeFrequency = commissions.length ? (disputeCount / commissions.length) * 100 : 0;

    const byBusinessUnit = businessUnits.map((unit) => {
      const unitRevenue = programRows
        .filter((p) => p.businessUnit === unit)
        .reduce((acc, p) => acc + p.revenueTotal, 0);
      return {
        businessUnit: unit,
        revenue: unitRevenue,
        share: totalRevenue ? (unitRevenue / totalRevenue) * 100 : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);

    const monthly = commissions.reduce<Record<string, number>>((acc, c) => {
      const key = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(new Date(c.conversionTimestamp));
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const monthlyTrend = Object.entries(monthly).map(([period, count]) => ({ period, count }));
    const maxTrend = Math.max(1, ...monthlyTrend.map((m) => m.count));

    const activePrograms = programRows.filter((p) => getAgeDays(p.latestConversion) <= 60).length;
    const customerRows = commissions.map((c) => {
      const program = BRAND_PROGRAMS_DATA[c.programName];
      const orderValue = estimateOrderValue(c, program);
      const customer = CUSTOMER_PROFILES[c.orderId];
      return {
        ...c,
        orderValue,
        customerName: customer?.name ?? "Unknown",
        buyerProfile: customer?.buyerProfile ?? "General Buyer",
        purchased: customer?.purchased ?? c.productCategory,
        location: customer ? `${customer.city}, ${customer.region}` : "Unknown"
      };
    });

    const buyerSegments = Object.entries(
      customerRows.reduce<Record<string, number>>((acc, row) => {
        acc[row.buyerProfile] = (acc[row.buyerProfile] ?? 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return {
      commissions,
      customerRows,
      buyerSegments,
      programRows,
      businessUnits,
      totalRevenue,
      totalCommissions,
      totalConversions: commissions.length,
      aov: commissions.length ? totalRevenue / commissions.length : 0,
      approved,
      declined,
      approvalRate,
      disputeCount,
      disputeFrequency,
      byBusinessUnit,
      monthlyTrend,
      maxTrend,
      activePrograms,
      historicalPrograms: Math.max(0, programRows.length - activePrograms),
      firstConversion
    };
  }, [creatorName]);

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-6 px-8 py-8">
      <div className="rounded-[14px] border-2 border-black bg-card p-5 shadow-[4px_4px_0px_0px_black]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              alt={creatorName}
              src={profile?.avatar ?? "https://i.pravatar.cc/100"}
              className="h-14 w-14 rounded-full border-2 border-black/10 object-cover"
            />
            <div>
              <h1 className="text-[34px] font-semibold leading-[32px] tracking-[-0.2px] text-[#04070f]">{creatorName}</h1>
              <p className="text-sm text-muted-foreground">
                {profile?.handle ?? "@creator"} · {profile?.niche ?? "Creator"} · First conversion {data.firstConversion ? formatDate(data.firstConversion) : "—"}
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p className="font-medium text-[#04070f]">{data.businessUnits.join(" • ") || "No businesses yet"}</p>
            <p>{data.programRows.length} programs across the brand relationship</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={CircleDollarSign} label="Total Commissions" value={formatCurrency(data.totalCommissions, "USD")} />
        <SummaryCard icon={BarChart3} label="Total Attributed Revenue" value={formatCurrency(data.totalRevenue, "USD")} />
        <SummaryCard icon={Users} label="Total Conversions" value={String(data.totalConversions)} />
        <SummaryCard icon={Calendar} label="Average Order Value" value={formatCurrency(data.aov, "USD")} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={CheckCircle2} label="Approval vs Decline" value={`${data.approvalRate.toFixed(1)}%`} subValue={`${data.approved} approved • ${data.declined} declined`} />
        <SummaryCard icon={Building2} label="Program Participation" value={`${data.activePrograms} active`} subValue={`${data.historicalPrograms} historical`} />
        <SummaryCard icon={AlertTriangle} label="Dispute Frequency" value={`${data.disputeFrequency.toFixed(1)}%`} subValue={`${data.disputeCount} total disputes`} />
        <SummaryCard icon={Users} label="Businesses" value={`${data.businessUnits.length}`} subValue="Across brand account" />
      </div>

      <ListSurface>
        <div className="px-6 pt-6">
          <h2 className="text-[18px] font-semibold">Programme Participation Breakdown</h2>
        </div>
        <div className="pb-6 pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Programme</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Conversions</TableHead>
                <TableHead>Total Commissions</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.programRows.map((row) => {
                const active = getAgeDays(row.latestConversion) <= 60;
                return (
                  <TableRow key={`${row.programName}-${row.businessUnit}`}>
                    <TableCell className="font-medium">{row.programName}</TableCell>
                    <TableCell>{row.businessUnit}</TableCell>
                    <TableCell>{row.conversions}</TableCell>
                    <TableCell>{formatCurrency(row.commissionsTotal, "USD")}</TableCell>
                    <TableCell>{formatCurrency(row.revenueTotal, "USD")}</TableCell>
                    <TableCell>{active ? "Active" : "Historical"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ListSurface>

      <ListSurface>
        <div className="px-6 pt-6">
          <h2 className="text-[18px] font-semibold">Complete Commission History</h2>
        </div>
        <div className="pb-6 pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Programme</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Order Ref</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Order Value</TableHead>
                <TableHead>Conversion Date</TableHead>
                <TableHead>Validation Status</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.commissions.map((c) => {
                const program = BRAND_PROGRAMS_DATA[c.programName];
                const orderValue = estimateOrderValue(c, program);
                return (
                  <TableRow key={c.id}>
                    <TableCell>{c.programName}</TableCell>
                    <TableCell>{program?.businessUnitName ?? "Unknown"}</TableCell>
                    <TableCell>{c.orderId}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(c.amount, c.currency)}</TableCell>
                    <TableCell>{formatCurrency(orderValue, c.currency)}</TableCell>
                    <TableCell>{formatDate(c.conversionTimestamp)}</TableCell>
                    <TableCell><CommissionStatusChip status={c.status} viewer="brand" /></TableCell>
                    <TableCell>{getAgeDays(c.conversionTimestamp)}d</TableCell>
                    <TableCell>{c.riskFlags?.[0] ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ListSurface>

      <ListSurface>
        <div className="space-y-1 px-6 pt-6">
          <h2 className="text-[18px] font-semibold">People Behind The Conversions</h2>
          <p className="text-sm text-muted-foreground">
            Customer-level view of who converted through {creatorName}, what they bought, and the buyer profiles emerging across programs.
          </p>
        </div>
        <div className="space-y-4 pb-6 pt-4">
          <div className="flex flex-wrap gap-2 px-6">
            {data.buyerSegments.map(([segment, count]) => (
              <span
                key={segment}
                className="rounded-full border border-black/10 bg-[rgba(55,220,255,0.2)] px-3 py-1 text-xs font-medium text-[#04070f]"
              >
                {segment} · {count}
              </span>
            ))}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Buyer Profile</TableHead>
                <TableHead>What They Bought</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Order Value</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.customerRows.map((row) => (
                <TableRow key={`customer-${row.id}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-[#04070f]">{row.customerName}</p>
                      <p className="text-xs text-muted-foreground">{row.location}</p>
                    </div>
                  </TableCell>
                  <TableCell>{row.buyerProfile}</TableCell>
                  <TableCell>{row.purchased}</TableCell>
                  <TableCell>{row.programName}</TableCell>
                  <TableCell>{formatCurrency(row.orderValue, row.currency)}</TableCell>
                  <TableCell>{formatDate(row.conversionTimestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ListSurface>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-[18px]">Revenue Contribution by Business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.byBusinessUnit.map((unit) => (
              <div key={unit.businessUnit} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{unit.businessUnit}</span>
                  <span className="font-medium">{formatCurrency(unit.revenue, "USD")} · {unit.share.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-black/10">
                  <div className="h-2 rounded-full bg-[#37dcff]" style={{ width: `${Math.max(4, unit.share)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[18px]">Conversion Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.monthlyTrend.map((point) => (
              <div key={point.period} className="grid grid-cols-[62px_minmax(0,1fr)_40px] items-center gap-2 text-sm">
                <span className="text-muted-foreground">{point.period}</span>
                <div className="h-2 rounded-full bg-black/10">
                  <div className="h-2 rounded-full bg-black" style={{ width: `${(point.count / data.maxTrend) * 100}%` }} />
                </div>
                <span className="text-right font-medium">{point.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  subValue
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.72px] text-[#04070f]/50">
          <Icon className="h-4 w-4 text-[#04070f]" />
          <span>{label}</span>
        </div>
        <p className="text-[30px] font-semibold leading-[30px] tracking-[-0.2px] text-[#04070f]">{value}</p>
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
      </CardContent>
    </Card>
  );
}
