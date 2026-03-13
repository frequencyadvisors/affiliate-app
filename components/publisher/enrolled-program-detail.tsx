"use client";

import { Activity, AlertTriangle, BadgeDollarSign, Clock, Copy, ShieldCheck, TriangleAlert, Wallet } from "lucide-react";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { COMMISSIONS, ENROLLED_PROGRAMS, EnrolledProgram, formatCurrency, getAffiliateLinkForProgram } from "@/lib/mock-data";
import { AttributionState, getAttributionRecord, getAttributionSummary } from "@/lib/verified-influence";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EarningsActivityPanel, EarningsInfluenceSummaryGrid, EarningsPerformanceSection } from "@/components/publisher/earnings-dashboard";

export function EnrolledProgramDetail({
  programName,
  onOpenCommission
}: {
  programName: string;
  onOpenCommission: (id: string) => void;
}) {
  const program = ENROLLED_PROGRAMS[programName] as EnrolledProgram;
  const [copied, setCopied] = useState(false);

  if (!program) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getAffiliateLinkForProgram(program.programName));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const programRows = useMemo(
    () =>
      COMMISSIONS.filter((commission) => commission.programName === program.programName).sort(
        (a, b) => +new Date(b.conversionTimestamp) - +new Date(a.conversionTimestamp)
      ),
    [program.programName]
  );
  const summary = useMemo(() => getAttributionSummary(programRows), [programRows]);

  const secureCommission = programRows
    .filter((commission) => getAttributionRecord(commission).state === "verified")
    .reduce((acc, row) => acc + row.amount, 0);
  const atRiskCommission = programRows
    .filter((commission) => getAttributionRecord(commission).state === "disputed")
    .reduce((acc, row) => acc + row.amount, 0);
  const pendingAttribution = programRows
    .filter((commission) => getAttributionRecord(commission).state === "unestablished")
    .reduce((acc, row) => acc + row.amount, 0);
  const verifiedShare = programRows.length > 0 ? Math.round((summary.verified.conversions / programRows.length) * 100) : 0;
  const totalEarned = programRows
    .filter((commission) => ["paid", "locked", "approved"].includes(commission.status))
    .reduce((acc, commission) => acc + commission.amount, 0);
  const pending = programRows
    .filter((commission) => ["pending", "recorded"].includes(commission.status))
    .reduce((acc, commission) => acc + commission.amount, 0);
  const trendData = [
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

  return (
    <div className="relative grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_404px]">
      <div className="pointer-events-none absolute right-[404px] top-0 hidden h-full w-[2px] bg-black xl:block" />

      <section className="space-y-6 px-8 py-8 xl:pr-6">
        <div className="space-y-[18px] px-2 pb-4 pt-1">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="space-y-1">
              <h1 className="text-[50px] font-semibold leading-none tracking-[-1px] text-[#04070f]">{program.programName}</h1>
              <p className="text-sm text-muted-foreground">{program.brandName} • Enrolled {program.enrolledDate}</p>
            </div>
            <div className="flex max-w-full items-center gap-2">
              <code className="max-w-[340px] truncate rounded-[10px] border-2 border-black bg-white px-3 py-2 text-xs shadow-[2px_2px_0px_0px_black]">
                {getAffiliateLinkForProgram(program.programName)}
              </code>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </div>

        <section className="px-2">
          <EarningsPerformanceSection
            chartData={trendData}
            showTopStats={true}
            total={totalEarned}
            pending={pending}
            activePrograms={1}
            unified={true}
          />
        </section>

        <div className="mb-6">
          <EarningsInfluenceSummaryGrid rows={programRows} />
        </div>

        <EarningsActivityPanel
          rows={programRows}
          onOpenCommission={onOpenCommission}
          emptyMessage="No commissions match this attribution state yet."
          showProgramColumn={false}
          showProductColumn
          showOrderValueColumn
        />

      </section>

      <aside className="border-t-2 border-black xl:sticky xl:top-0 xl:self-start xl:border-t-0">
        <div className="grid grid-cols-2 border-b-2 border-black">
          <SidebarMetric className="border-b border-r border-[#04070f]/20" icon={Wallet} label="Secure Value" value={formatCurrency(secureCommission, "USD")} />
          <SidebarMetric className="border-b border-[#04070f]/20" icon={AlertTriangle} label="At Risk" value={formatCurrency(atRiskCommission, "USD")} />
          <SidebarMetric className="border-r border-[#04070f]/20" icon={Activity} label="Approval Rate" value={program.trustSummary.approvalRate} />
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
          <h2 className="text-[12px] font-semibold uppercase leading-[16px] tracking-[0.72px] text-[#04070f]/50">What To Watch</h2>
          <div className="mt-4 space-y-3">
            <PolicyNote label="Secure commissions" value={`${formatCurrency(secureCommission, "USD")} currently look well-supported by attribution evidence.`} />
            <PolicyNote label="Contested commissions" value={`${formatCurrency(atRiskCommission, "USD")} sit in disputed records and may require follow-up.`} />
            <PolicyNote label="Pending attribution" value={`${formatCurrency(pendingAttribution, "USD")} still lacks enough evidence to feel settled.`} />
          </div>
        </section>

        <section className="px-6 py-6">
          <h2 className="text-[12px] font-semibold uppercase leading-[16px] tracking-[0.72px] text-[#04070f]/50">Programme Health</h2>
          <div className="mt-4 space-y-3">
            <HealthRow icon={ShieldCheck} label="Verified Share" value={`${verifiedShare}%`} />
            <HealthRow icon={BadgeDollarSign} label="Average Payout" value={program.trustSummary.avgPayout} />
            <HealthRow icon={TriangleAlert} label="Open Attention" value={`${summary.disputed.conversions + summary.unestablished.conversions} records`} />
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

function HealthRow({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-black/10 bg-[rgba(242,253,255,0.45)] px-3 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#04070f]/62" />
        <span className="text-[14px] text-[#04070f]/72">{label}</span>
      </div>
      <span className="text-[14px] font-semibold text-[#04070f]">{value}</span>
    </div>
  );
}
