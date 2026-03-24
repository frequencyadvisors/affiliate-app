"use client";

import { useState, type ReactNode } from "react";
import { COMMISSIONS, CREATOR_PROFILES, DETAIL_COMMISSIONS, Dispute, DISPUTES, formatDateTime, getDisputeDaysRemaining, getDisputeUrgency } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Chip, Separator, TextArea } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DisputeInbox({
  onOpenCommission,
  showListHeader = true
}: {
  onOpenCommission: (id: string) => void;
  showListHeader?: boolean;
}) {
  const [active, setActive] = useState<Dispute | null>(null);
  const getCommission = (commissionId: string) =>
    COMMISSIONS.find((c) => c.id === commissionId) ?? DETAIL_COMMISSIONS.find((c) => c.id === commissionId);

  if (active) {
    const activeCommission = getCommission(active.commissionId);
    const activeCreatorName = activeCommission?.publisher ?? active.raisedBy;
    const activeCreator = CREATOR_PROFILES[activeCreatorName];
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setActive(null)}>
            Back to disputes
          </Button>
          <Card variant="secondary" className="border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <CardHeader className="gap-3 p-6">
              <div className="flex flex-wrap gap-2">
                <Chip color="accent" variant="soft" size="sm">{active.id}</Chip>
                <Chip color="warning" variant="soft" size="sm">{active.status.replaceAll("_", " ")}</Chip>
              </div>
              <CardTitle className="text-2xl tracking-[-0.04em]">{active.subject}</CardTitle>
              <CardDescription className="text-default-500">
                Shared dispute discussion with the publisher and the tied commission reference.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <div className="flex items-center gap-3 rounded-2xl border border-default-200 bg-default-50/70 p-4">
                <img
                  alt={activeCreatorName}
                  src={activeCreator?.avatar ?? "https://i.pravatar.cc/80"}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{activeCreatorName}</p>
                  <p className="text-sm text-default-500">{activeCreator?.handle ?? "@creator"} · {activeCreator?.niche ?? "Creator"}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard label="Commission" value={active.commissionId} action={<button className="text-left text-sm font-medium text-accent" onClick={() => onOpenCommission(active.commissionId)}>Open commission</button>} />
                <InfoCard label="Evidence" value={active.evidence} />
              </div>
              <Separator />
              <div className="space-y-3">
                {active.messages.map((m, i) => (
                  <div key={i} className="rounded-2xl border border-default-200 bg-background/80 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-default-500">{m.senderName} · {formatDateTime(m.sentAt)}</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{m.content}</p>
                  </div>
                ))}
              </div>
              <TextArea placeholder="Respond to publisher" />
            </CardContent>
          </Card>
        </div>

        <Card variant="secondary" className="border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardHeader className="gap-2 p-6">
            <CardTitle className="text-lg">Resolution tools</CardTitle>
            <CardDescription className="text-default-500">Actions stay the same, only the surface has changed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-6 pt-0">
            <Button className="w-full">Reinstate</Button>
            <Button variant="secondary" className="w-full">Uphold with explanation</Button>
            <Button variant="outline" className="w-full">Escalate</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card variant="secondary" className="border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      {showListHeader && (
        <CardHeader className="gap-2 p-6 pb-0">
          <CardTitle className="text-lg tracking-[-0.02em]">Dispute inbox</CardTitle>
          <CardDescription className="text-default-500">Publisher disputes awaiting response or resolution.</CardDescription>
        </CardHeader>
      )}
      <CardContent className={showListHeader ? "space-y-3 p-6 pt-4" : "space-y-3 p-6"}>
        {DISPUTES.map((d) => {
          const urgency = getDisputeUrgency(d);
          const commission = getCommission(d.commissionId);
          const creatorName = commission?.publisher ?? d.raisedBy;
          const creator = CREATOR_PROFILES[creatorName];
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setActive(d)}
              className="flex w-full items-center justify-between rounded-2xl border border-default-200 bg-background/80 px-4 py-4 text-left transition-colors hover:bg-default-50"
            >
              <div className="flex items-center gap-3">
                <img
                  alt={creatorName}
                  src={creator?.avatar ?? "https://i.pravatar.cc/80"}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{d.id} · {d.subject}</p>
                  <p className="text-xs text-default-500">
                    {creatorName} ({creator?.handle ?? "@creator"}) · {d.commissionId} · due in {getDisputeDaysRemaining(d)}d
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Chip color="warning" variant="soft" size="sm">{d.status.replaceAll("_", " ")}</Chip>
                <span className={cn("text-xs font-medium uppercase tracking-[0.18em]", urgency === "high" ? "text-danger" : urgency === "medium" ? "text-warning" : "text-default-400")}>{urgency}</span>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function InfoCard({
  label,
  value,
  action
}: {
  label: string;
  value: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-default-200 bg-default-50/70 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-default-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
