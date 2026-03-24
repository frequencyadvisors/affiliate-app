"use client";

import { BadgeDollarSign, Clock, ShieldCheck, Users } from "lucide-react";
import type { ComponentType } from "react";
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Chip, Separator } from "@heroui/react";
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[minmax(0,1fr)_384px]">
      <section className="space-y-6">
        <Card variant="secondary" className="border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardHeader className="gap-5 p-6 sm:p-8">
            <div className="flex flex-col gap-4">
              <Chip color="accent" variant="soft" size="sm" className="w-fit">
                Program overview
              </Chip>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">{program.programName}</h1>
                <CardDescription className="max-w-3xl text-default-500">
                  Review commission flow, creator participation, and program-level reliability in a lighter HeroUI dashboard surface.
                </CardDescription>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Approval rate" value={program.trustSummary.approvalRate} icon={ShieldCheck} />
              <Metric label="Avg payout" value={program.trustSummary.avgPayout} icon={BadgeDollarSign} />
              <Metric label="Validation" value={program.validationWindow} icon={Clock} />
            </div>
          </CardHeader>
        </Card>

        <Card variant="secondary" className="border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardHeader className="gap-2 p-6">
            <CardTitle className="text-lg tracking-[-0.02em]">Programme commissions</CardTitle>
            <CardDescription className="text-default-500">
              Program filtered commission queue with the same review and action behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pb-2">
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
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <Card variant="secondary" className="border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardHeader className="gap-2 p-6">
            <CardTitle className="text-lg">Program terms</CardTitle>
            <CardDescription className="text-default-500">The commercial shape of this program.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 px-6 pb-6 sm:grid-cols-2">
            <TermCard label="Commission" value={`${program.commissionRate} ${program.commissionType}`} />
            <TermCard label="Attribution" value={program.attributionModel} />
            <TermCard label="Validation" value={program.validationWindow} />
            <TermCard label="Dispute Window" value={program.disputeWindow} />
          </CardContent>
        </Card>

        <Card variant="secondary" className="border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardHeader className="gap-2 p-6">
            <CardTitle className="text-lg">Attribution policy</CardTitle>
            <CardDescription className="text-default-500">How commissions are explained and challenged.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            <PolicyNote label="Explanation Commitment" value={program.explanationCommitment} />
            <PolicyNote label="Evidence Note" value={program.explanationNote} />
            <PolicyNote label="Cookie Window" value={program.cookieWindow} />
          </CardContent>
        </Card>

        <Card variant="secondary" className="border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardHeader className="gap-2 p-6">
            <CardTitle className="text-lg">Participating creators</CardTitle>
            <CardDescription className="text-default-500">Creators currently driving commissions in this program.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {participatingCreators.length === 0 && <p className="text-sm text-default-500">No creators enrolled yet.</p>}
            {participatingCreators.map((creator) => (
              <button
                type="button"
                key={creator.name}
                onClick={() => onOpenCreator(creator.name)}
                className="flex w-full items-center justify-between rounded-2xl border border-default-200 bg-background/80 px-4 py-3 text-left transition-colors hover:bg-default-50"
              >
                <div className="flex items-center gap-3">
                  <img
                    alt={creator.name}
                    className="h-10 w-10 rounded-full object-cover"
                    src={CREATOR_PROFILES[creator.name]?.avatar ?? "https://i.pravatar.cc/80"}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{creator.name}</p>
                    <p className="text-xs text-default-500">{CREATOR_PROFILES[creator.name]?.handle ?? "@creator"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-default-500">{creator.commissions} commissions</p>
                  <p className="text-sm font-medium text-foreground">{formatCurrency(creator.total, "USD")}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-default-200 bg-background/80 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-default-500">{label}</p>
        <Icon className="h-4 w-4 text-default-500" />
      </div>
      <p className="text-2xl font-semibold tracking-[-0.04em] text-foreground">{value}</p>
    </div>
  );
}

function TermCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-default-200 bg-default-50/70 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-default-500">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-foreground">{value}</p>
    </div>
  );
}

function PolicyNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-default-200 bg-background/80 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.22em] text-default-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}
