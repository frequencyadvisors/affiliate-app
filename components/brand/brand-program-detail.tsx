"use client";

import { BadgeDollarSign, Clock, ShieldCheck, Users } from "lucide-react";
import type { ComponentType } from "react";
import { useMemo } from "react";
import { BrandProgramData, COMMISSIONS, CREATOR_PROFILES, formatCurrency } from "@/lib/mock-data";
import { CommissionQueue } from "@/components/brand/commission-queue";

export function BrandProgramDetail({
  program,
  onOpenCommission,
  onOpenCreator
}: {
  program: BrandProgramData;
  onOpenCommission: (id: string) => void;
  onOpenCreator: (name: string) => void;
}) {
  const programRows = useMemo(
    () =>
      COMMISSIONS.filter((commission) => commission.programName === program.programName).sort(
        (a, b) => +new Date(b.conversionTimestamp) - +new Date(a.conversionTimestamp)
      ),
    [program.programName]
  );

  const participatingCreators = Object.values(
    programRows.reduce<Record<string, { name: string; commissions: number; total: number }>>((acc, row) => {
      acc[row.publisher] ??= { name: row.publisher, commissions: 0, total: 0 };
      acc[row.publisher].commissions += 1;
      acc[row.publisher].total += row.amount;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  return (
    <div className="relative grid min-h-[calc(100vh-60px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_404px]">
      <div className="pointer-events-none absolute right-[404px] top-0 hidden h-full w-[2px] bg-black xl:block" />

      <section className="space-y-6 px-8 py-8 xl:pr-6">
        <div className="space-y-[18px] px-2 pb-4 pt-1">
          <div className="space-y-1">
            <h1 className="text-[50px] font-semibold leading-none tracking-[-1px] text-[#04070f]">{program.programName}</h1>
          </div>
        </div>

        <CommissionQueue
          programFilter={program.programName}
          onOpenCommission={onOpenCommission}
          idColumnLabel="ID"
          showHeader={false}
          showReliabilityEyebrow={false}
          showRecordsIntro={false}
          showFilteredSummaryCard={false}
          showOverallSummaryLine
        />
      </section>

      <aside className="border-t-2 border-black xl:sticky xl:top-0 xl:self-start xl:border-t-0">
        <div className="grid grid-cols-2 border-b-2 border-black">
          <SidebarMetric className="border-b border-r border-[#04070f]/20" icon={ShieldCheck} label="Approval Rate" value={program.trustSummary.approvalRate} />
          <SidebarMetric className="border-b border-[#04070f]/20" icon={BadgeDollarSign} label="Avg Payout" value={program.trustSummary.avgPayout} />
          <SidebarMetric className="border-r border-[#04070f]/20" icon={Users} label="Active Publishers" value={program.trustSummary.activePublishers} />
          <SidebarMetric icon={Clock} label="Validation" value={program.validationWindow} />
        </div>

        <section className="border-b border-[#04070f]/20 px-6 py-6">
          <h2 className="text-[12px] font-semibold uppercase leading-[16px] tracking-[0.72px] text-[#04070f]/50">Program Terms</h2>
          <div className="mt-4 grid grid-cols-2 gap-1.5 text-sm">
            <TermCard label="Commission" value={`${program.commissionRate} ${program.commissionType}`} />
            <TermCard label="Attribution" value={program.attributionModel} />
            <TermCard label="Validation" value={program.validationWindow} />
            <TermCard label="Dispute Window" value={program.disputeWindow} />
          </div>
        </section>

        <section className="border-b border-[#04070f]/20 px-6 py-6">
          <h2 className="text-[12px] font-semibold uppercase leading-[16px] tracking-[0.72px] text-[#04070f]/50">Attribution Policy</h2>
          <div className="mt-4 space-y-3">
            <PolicyNote label="Explanation Commitment" value={program.explanationCommitment} />
            <PolicyNote label="Evidence Note" value={program.explanationNote} />
            <PolicyNote label="Cookie Window" value={program.cookieWindow} />
          </div>
        </section>

        <section className="px-4 py-5">
          <h2 className="text-[12px] font-semibold uppercase leading-[16px] tracking-[0.72px] text-[#04070f]/50">Participating Creators</h2>
          <div className="mt-4 space-y-2">
            {participatingCreators.length === 0 && <p className="text-sm text-muted-foreground">No creators enrolled yet.</p>}
            {participatingCreators.map((creator) => (
              <button
                type="button"
                key={creator.name}
                onClick={() => onOpenCreator(creator.name)}
                className="flex w-full items-center justify-between rounded-[8px] bg-[rgba(242,253,255,0.3)] px-3 py-2.5 text-left transition-colors hover:bg-[rgba(242,253,255,0.6)]"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    alt={creator.name}
                    className="h-9 w-9 rounded-full border border-black/10 object-cover"
                    src={CREATOR_PROFILES[creator.name]?.avatar ?? "https://i.pravatar.cc/80"}
                  />
                  <div>
                    <p className="text-[14px] font-medium leading-[18px] text-[#04070f]">{creator.name}</p>
                    <p className="text-[12px] leading-[16px] text-muted-foreground">
                      {CREATOR_PROFILES[creator.name]?.handle ?? "@creator"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] leading-[16px] text-muted-foreground">{creator.commissions} commissions</p>
                  <p className="text-[13px] font-medium leading-[18px] text-[#04070f]">{formatCurrency(creator.total, "USD")}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
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
    <div className={`min-h-[153px] p-5 ${className ?? ""}`}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold uppercase leading-[16px] tracking-[0.72px] text-[#04070f]/50">{label}</p>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[35px] font-semibold leading-[35px] tracking-[-0.2px] text-[#04070f]">{value}</p>
    </div>
  );
}

function TermCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] bg-[rgba(55,220,255,0.3)] px-3 py-2.5">
      <p className="text-[14px] font-normal leading-[16px] text-[#525c63]">{label}</p>
      <p className="mt-1 text-[16px] font-medium leading-[20px] text-[#04070f]">{value}</p>
    </div>
  );
}

function PolicyNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-black/10 bg-[rgba(242,253,255,0.45)] px-3 py-3">
      <p className="text-[12px] uppercase tracking-[0.72px] text-[#04070f]/50">{label}</p>
      <p className="mt-1 text-[14px] leading-5 text-[#04070f]">{value}</p>
    </div>
  );
}
