"use client";

import { Activity, AlertTriangle, BadgeDollarSign, Clock, Copy, ShieldCheck, TriangleAlert, Wallet } from "lucide-react";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { Chip } from "@heroui/react";
import { COMMISSIONS, ENROLLED_PROGRAMS, EnrolledProgram, formatCurrency, getAffiliateLinkForProgram } from "@/lib/mock-data";
import { getAttributionRecord, getAttributionSummary } from "@/lib/verified-influence";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  EarningsActivitySection as EarningsActivityPanel,
  EarningsInfluenceSummaryGrid,
  EarningsPerformanceSection
} from "@/components/publisher/earnings-dashboard";

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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_376px]">
      <div className="space-y-6">
        <Card className="border-default-200 bg-background/85 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-success" />
                    <Chip color="success" variant="soft" size="sm">
                      Enrolled programme
                    </Chip>
                  </div>
                  <Chip color="accent" variant="soft" size="sm">
                    {program.validationWindow}
                  </Chip>
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl">{program.programName}</h1>
                  <CardDescription className="text-base">
                    {program.brandName} • Enrolled {program.enrolledDate} • {program.attributionModel}
                  </CardDescription>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-default-500 sm:text-base">
                  A soft overview of how this programme is performing, what attribution is holding up, and where the most important commissions need attention.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:max-w-md">
                <div className="rounded-2xl border border-default-200 bg-default-50/70 p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-default-500">
                    <Copy className="h-4 w-4" />
                    Affiliate link
                  </div>
                  <code className="block break-all rounded-xl bg-background px-3 py-3 text-xs leading-6 text-foreground">
                    {getAffiliateLinkForProgram(program.programName)}
                  </code>
                </div>
                <Button size="lg" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied to clipboard" : "Copy affiliate URL"}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={Wallet} label="Secure value" value={formatCurrency(secureCommission, "USD")} hint="Supported by verified attribution" />
              <MetricCard icon={AlertTriangle} label="At risk" value={formatCurrency(atRiskCommission, "USD")} hint="Needs follow-up review" />
              <MetricCard icon={Clock} label="Pending attribution" value={formatCurrency(pendingAttribution, "USD")} hint="Evidence still settling" />
              <MetricCard icon={Activity} label="Approval rate" value={program.trustSummary.approvalRate} hint="Historical commission health" />
            </div>
          </CardContent>
        </Card>

        <EarningsPerformanceSection chartData={trendData} showTopStats total={totalEarned} pending={pending} activePrograms={1} unified />

        <EarningsInfluenceSummaryGrid rows={programRows} />

        <EarningsActivityPanel
          rows={programRows}
          onOpenCommission={onOpenCommission}
          emptyMessage="No commissions match this attribution state yet."
          showProgramColumn={false}
          showProductColumn
          showOrderValueColumn
        />
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <Card className="border-default-200 bg-background/85 shadow-sm backdrop-blur-xl">
          <CardHeader className="gap-2">
            <CardTitle className="text-base">Programme terms</CardTitle>
            <CardDescription>Reference settings that shape payout and dispute handling.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-0 sm:grid-cols-2 xl:grid-cols-1">
            <InfoTile label="Commission" value={`${program.commissionRate} ${program.commissionType}`} />
            <InfoTile label="Attribution" value={program.attributionModel} />
            <InfoTile label="Validation" value={program.validationWindow} />
            <InfoTile label="Dispute window" value={program.disputeWindow} />
          </CardContent>
        </Card>

        <Card className="border-default-200 bg-background/85 shadow-sm backdrop-blur-xl">
          <CardHeader className="gap-2">
            <CardTitle className="text-base">What to watch</CardTitle>
            <CardDescription>The main items to monitor before pushing more traffic.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <AlertTile
              label="Secure commissions"
              value={`${formatCurrency(secureCommission, "USD")} currently look well-supported by attribution evidence.`}
            />
            <AlertTile
              label="Contested commissions"
              value={`${formatCurrency(atRiskCommission, "USD")} sit in disputed records and may require follow-up.`}
            />
            <AlertTile
              label="Pending attribution"
              value={`${formatCurrency(pendingAttribution, "USD")} still lacks enough evidence to feel settled.`}
            />
          </CardContent>
        </Card>

        <Card className="border-default-200 bg-background/85 shadow-sm backdrop-blur-xl">
          <CardHeader className="gap-2">
            <CardTitle className="text-base">Programme health</CardTitle>
            <CardDescription>High-level signals for this programme&apos;s operational quality.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <HealthRow icon={ShieldCheck} label="Verified share" value={`${verifiedShare}%`} />
            <HealthRow icon={BadgeDollarSign} label="Average payout" value={program.trustSummary.avgPayout} />
            <HealthRow icon={TriangleAlert} label="Open attention" value={`${summary.disputed.conversions + summary.unestablished.conversions} records`} />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-default-200 bg-default-50/60 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500">{label}</p>
        <Icon className="h-4 w-4 text-default-400" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-foreground">{value}</p>
      <p className="mt-1 text-sm leading-5 text-default-500">{hint}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-default-200 bg-default-50/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function AlertTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-default-200 bg-background/90 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
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
    <div className="flex items-center justify-between rounded-2xl border border-default-200 bg-default-50/60 px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-default-500" />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
