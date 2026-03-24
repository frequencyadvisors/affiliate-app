"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Chip } from "@heroui/react";
import { AlertTriangle, ArrowLeft, Clock3, MessageSquareQuote } from "lucide-react";
import { DISPUTES, Dispute, getDisputeDaysRemaining, getDisputeUrgency } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function DisputeResolution({ showListHeader = true }: { showListHeader?: boolean }) {
  const [active, setActive] = useState<Dispute | null>(null);
  const disputes = useMemo(() => DISPUTES, []);

  if (active) {
    const urgency = getDisputeUrgency(active);
    return (
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="border-default-200 bg-background/85 shadow-sm backdrop-blur-xl">
          {showListHeader && (
            <CardHeader className="gap-2">
              <CardTitle className="text-base">Dispute resolution</CardTitle>
              <CardDescription>Select a dispute to inspect the evidence trail.</CardDescription>
            </CardHeader>
          )}
          <CardContent className={`${showListHeader ? "pt-0" : "pt-6"} space-y-3`}>
            <div className="flex flex-wrap gap-2">
              <Chip variant="soft" color="danger" size="sm">
                High urgency {disputes.filter((dispute) => getDisputeUrgency(dispute) === "high").length}
              </Chip>
              <Chip variant="soft" color="warning" size="sm">
                Needs review {disputes.filter((dispute) => getDisputeUrgency(dispute) === "medium").length}
              </Chip>
            </div>
            <Separator />
            {disputes.map((dispute) => {
              const rowUrgency = getDisputeUrgency(dispute);
              const isActive = active.id === dispute.id;

              return (
                <button
                  key={dispute.id}
                  type="button"
                  onClick={() => setActive(dispute)}
                  className={`group flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                    isActive
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-default-200 bg-background hover:border-default-300 hover:bg-default-50/80"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                      rowUrgency === "high"
                        ? "border-danger/30 bg-danger/10 text-danger"
                        : rowUrgency === "medium"
                          ? "border-warning/30 bg-warning/10 text-warning"
                          : "border-default-200 bg-default-100 text-default-500"
                    }`}
                  >
                    <MessageSquareQuote className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{dispute.subject}</p>
                        <p className="mt-1 text-xs text-default-500">
                          {dispute.commissionId} • due in {getDisputeDaysRemaining(dispute)} days
                        </p>
                      </div>
                      <Chip
                        variant="soft"
                        color={dispute.status.startsWith("resolved") ? "success" : dispute.status === "escalated" ? "danger" : "default"}
                        size="sm"
                      >
                        {formatDisputeStatus(dispute.status)}
                      </Chip>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-default-600">{dispute.reason}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip variant="soft" color={rowUrgency === "high" ? "danger" : rowUrgency === "medium" ? "warning" : "default"} size="sm">
                        {rowUrgency} urgency
                      </Chip>
                      <Chip variant="soft" color="default" size="sm">
                        {dispute.messages.length} messages
                      </Chip>
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-default-200 bg-background/85 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardHeader className="gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">{active.id}</CardTitle>
                <CardDescription className="mt-1 text-base">{active.subject}</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip variant="soft" color={urgency === "high" ? "danger" : urgency === "medium" ? "warning" : "default"} size="sm">
                  {urgency} urgency
                </Chip>
                <Chip variant="soft" color={active.status.startsWith("resolved") ? "success" : active.status === "escalated" ? "danger" : "accent"} size="sm">
                  {formatDisputeStatus(active.status)}
                </Chip>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-0">
            <Button variant="ghost" className="w-fit px-0 text-default-600" onClick={() => setActive(null)}>
              <ArrowLeft className="h-4 w-4" />
              Back to disputes
            </Button>

            <div className="grid gap-4 lg:grid-cols-2">
              <DetailPanel
                icon={AlertTriangle}
                label="Brand response"
                value={active.brandResponse || "Awaiting response"}
                tone={active.brandResponse ? "default" : "warning"}
              />
              <DetailPanel
                icon={Clock3}
                label="Deadline"
                value={`${active.deadlineAt} • ${getDisputeDaysRemaining(active)} days remaining`}
                tone={urgency === "high" ? "danger" : "default"}
              />
            </div>

            <Card className="border-default-200 bg-default-50/60 shadow-sm">
              <CardHeader className="gap-1">
                <CardTitle className="text-base">Evidence trail</CardTitle>
                <CardDescription>The thread, reason, and message history shared between both sides.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="rounded-2xl border border-default-200 bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500">Reason</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{active.reason}</p>
                </div>

                <div className="rounded-2xl border border-default-200 bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500">Messages</p>
                  <div className="mt-4 space-y-3">
                    {active.messages.map((message) => (
                      <div key={`${message.senderName}-${message.sentAt}`} className="rounded-2xl border border-default-200 bg-default-50/80 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{message.senderName}</p>
                            <p className="text-xs text-default-500">{message.sentAt}</p>
                          </div>
                          <Chip variant="soft" color={message.sender === "brand" ? "accent" : message.sender === "publisher" ? "default" : "success"} size="sm">
                            {message.sender}
                          </Chip>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-default-600">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button>Accept Resolution</Button>
              <Button variant="outline">Continue Dispute</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="border-default-200 bg-background/85 shadow-sm backdrop-blur-xl">
      {showListHeader && (
        <CardHeader className="gap-2">
          <CardTitle className="text-base">Dispute resolution</CardTitle>
          <CardDescription>Select a dispute to inspect the evidence trail.</CardDescription>
        </CardHeader>
      )}
      <CardContent className={`${showListHeader ? "pt-0" : "pt-6"} space-y-3`}>
        <div className="flex flex-wrap gap-2">
          <Chip variant="soft" color="danger" size="sm">
            High urgency {disputes.filter((dispute) => getDisputeUrgency(dispute) === "high").length}
          </Chip>
          <Chip variant="soft" color="warning" size="sm">
            Needs review {disputes.filter((dispute) => getDisputeUrgency(dispute) === "medium").length}
          </Chip>
        </div>
        <Separator />

        {disputes.map((dispute) => {
          const rowUrgency = getDisputeUrgency(dispute);
          return (
            <button
              key={dispute.id}
              type="button"
              onClick={() => setActive(dispute)}
              className="group flex w-full items-start gap-3 rounded-2xl border border-default-200 bg-background px-4 py-4 text-left transition hover:border-default-300 hover:bg-default-50/80"
            >
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                  rowUrgency === "high"
                    ? "border-danger/30 bg-danger/10 text-danger"
                    : rowUrgency === "medium"
                      ? "border-warning/30 bg-warning/10 text-warning"
                      : "border-default-200 bg-default-100 text-default-500"
                }`}
              >
                <MessageSquareQuote className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{dispute.subject}</p>
                    <p className="mt-1 text-xs text-default-500">
                      {dispute.commissionId} • due in {getDisputeDaysRemaining(dispute)} days
                    </p>
                  </div>
                  <Chip
                    variant="soft"
                    color={dispute.status.startsWith("resolved") ? "success" : dispute.status === "escalated" ? "danger" : "default"}
                    size="sm"
                  >
                    {formatDisputeStatus(dispute.status)}
                  </Chip>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-default-600">{dispute.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip variant="soft" color={rowUrgency === "high" ? "danger" : rowUrgency === "medium" ? "warning" : "default"} size="sm">
                    {rowUrgency} urgency
                  </Chip>
                  <Chip variant="soft" color="default" size="sm">
                    {dispute.messages.length} messages
                  </Chip>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function formatDisputeStatus(status: Dispute["status"]) {
  return status.replaceAll("_", " ");
}

function DetailPanel({
  icon: Icon,
  label,
  value,
  tone = "default"
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "default" | "warning" | "danger";
}) {
  return (
    <div className={`rounded-2xl border px-4 py-4 shadow-sm ${tone === "warning" ? "border-warning/30 bg-warning/10" : tone === "danger" ? "border-danger/30 bg-danger/10" : "border-default-200 bg-background"}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-default-500" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500">{label}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}
