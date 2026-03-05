"use client";

import { BadgeDollarSign, Clock, ShieldCheck, Users } from "lucide-react";
import type { ComponentType } from "react";
import { COMMISSIONS, BrandProgramData, formatCurrency } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CommissionQueue } from "@/components/brand/commission-queue";

export function BrandProgramDetail({
  program,
  onOpenCommission
}: {
  program: BrandProgramData;
  onOpenCommission: (id: string) => void;
}) {
  const programRows = COMMISSIONS.filter((c) => c.programName === program.programName);
  const totalVolume = programRows.reduce((acc, row) => acc + row.amount, 0);
  const pendingVolume = programRows
    .filter((row) => ["pending", "recorded"].includes(row.status))
    .reduce((acc, row) => acc + row.amount, 0);
  const participatingCreators = Object.values(
    programRows.reduce<Record<string, { name: string; commissions: number; total: number }>>((acc, row) => {
      acc[row.publisher] ??= { name: row.publisher, commissions: 0, total: 0 };
      acc[row.publisher].commissions += 1;
      acc[row.publisher].total += row.amount;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  return (
    <div className="relative grid min-h-[calc(100vh-60px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="pointer-events-none absolute right-[360px] top-0 hidden h-full w-[2px] bg-black xl:block" />

      <section className="space-y-6 px-8 py-8 xl:pr-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="space-y-1">
            <h1 className="text-[45px] font-semibold leading-[35px] tracking-[-0.2px] text-[#04070f]">{program.programName}</h1>
            <p className="text-sm text-muted-foreground">{program.brandName}</p>
          </div>
          <Badge variant="secondary">{program.status}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <LargeStat label="Total Volume" value={formatCurrency(totalVolume, "USD")} />
          <LargeStat label="Pending Volume" value={formatCurrency(pendingVolume, "USD")} />
          <LargeStat label="Reversals Explained" value={program.trustSummary.reversalsExplained} />
        </div>

        <CommissionQueue programFilter={program.programName} onOpenCommission={onOpenCommission} />
      </section>

      <aside className="border-t-2 border-black xl:sticky xl:top-0 xl:self-start xl:border-t-0">
        <div className="grid grid-cols-2 border-b-2 border-black">
          <SidebarMetric className="border-r border-b border-black" icon={ShieldCheck} label="Approval Rate" value={program.trustSummary.approvalRate} />
          <SidebarMetric className="border-b border-black" icon={BadgeDollarSign} label="Avg Payout" value={program.trustSummary.avgPayout} />
          <SidebarMetric className="border-r border-black" icon={Users} label="Active Publishers" value={program.trustSummary.activePublishers} />
          <SidebarMetric icon={Clock} label="Validation" value={program.validationWindow} />
        </div>

        <section className="border-b-2 border-black px-4 py-5">
          <h2 className="text-[16px] font-semibold leading-[24px] tracking-[-0.4px] text-[#04070f]">Program Terms</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
            <Term label="Commission" value={`${program.commissionRate} ${program.commissionType}`} />
            <Term label="Attribution" value={program.attributionModel} />
            <Term label="Validation" value={program.validationWindow} />
            <Term label="Dispute Window" value={program.disputeWindow} />
          </div>
        </section>

        <section className="border-b-2 border-black px-4 py-5">
          <h2 className="text-[16px] font-semibold leading-[24px] tracking-[-0.4px] text-[#04070f]">Participating Creators</h2>
          <div className="mt-4 space-y-2">
            {participatingCreators.length === 0 && (
              <p className="text-sm text-muted-foreground">No creators enrolled yet.</p>
            )}
            {participatingCreators.map((creator) => (
              <div
                key={creator.name}
                className="flex items-center justify-between rounded-[8px] bg-[rgba(242,253,255,0.3)] px-3 py-2"
              >
                <p className="text-[14px] font-medium leading-[20px] text-[#04070f]">{creator.name}</p>
                <p className="text-xs text-muted-foreground">{creator.commissions} commissions</p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function LargeStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="h-[160px]">
      <CardContent className="flex h-full flex-col justify-between p-[22px]">
        <p className="text-[12px] font-semibold uppercase leading-[16px] tracking-[0.72px] text-[#ff6088]">{label}</p>
        <p className="text-[45px] font-semibold leading-[35px] tracking-[-0.2px] text-[#04070f]">{value}</p>
      </CardContent>
    </Card>
  );
}

function SidebarMetric({
  className,
  icon: Icon,
  label,
  value
}: {
  className?: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className={`min-h-[142px] p-4 ${className ?? ""}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold uppercase leading-[16px] tracking-[0.72px] text-[#04070f]">{label}</p>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[45px] font-semibold leading-[35px] tracking-[-0.2px] text-[#04070f]">{value}</p>
    </div>
  );
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-[14px] font-medium leading-[20px] text-[#04070f]">{value}</p>
    </div>
  );
}
