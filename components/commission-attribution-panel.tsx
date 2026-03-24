"use client";

import {
  Banknote,
  Check,
  CreditCard,
  Eye,
  Link2,
  Lock,
  Monitor,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  TriangleAlert
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Chip, Separator } from "@heroui/react";
import { cn } from "@/lib/utils";
import { Commission } from "@/lib/mock-data";
import { AttributionRecord, AttributionTimelineEvent, getAttributionTimeline } from "@/lib/verified-influence";

const timelineIconMap = {
  link: Link2,
  monitor: Monitor,
  spark: Sparkles,
  eye: Eye,
  cart: ShoppingBag,
  card: CreditCard,
  alert: TriangleAlert,
  success: Check,
  review: Lock,
  payout: Banknote,
  reverse: RotateCcw
} as const;

function getStatusTone(status: Commission["status"]) {
  switch (status) {
    case "approved":
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "reversed":
      return "danger";
    case "locked":
      return "default";
    default:
      return "accent";
  }
}

function getJourneyTone(stage: Commission["journeyStage"]) {
  switch (stage) {
    case "link_clicked":
    case "product_viewed":
      return "accent";
    case "added_to_cart":
    case "checkout_started":
      return "warning";
    default:
      return "default";
  }
}

export function CommissionAttributionPanel({
  commission,
  attribution,
  statusMessage
}: {
  commission: Commission;
  attribution: AttributionRecord;
  statusMessage?: string;
}) {
  const timelineItems = getAttributionTimeline(commission, attribution);
  const statusTone = getStatusTone(commission.status);
  const journeyTone = getJourneyTone(commission.journeyStage);

  return (
    <Card
      variant="secondary"
      className="overflow-hidden border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,40,0.08)] backdrop-blur-xl"
    >
      <CardHeader className="gap-4 p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Chip color={statusTone} variant="soft" size="sm">
                {commission.status}
              </Chip>
              <Chip color={journeyTone} variant="secondary" size="sm">
                {commission.journeyStage.replace(/_/g, " ")}
              </Chip>
              <Chip color="default" variant="secondary" size="sm">
                {commission.id}
              </Chip>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl tracking-[-0.04em] text-foreground">{commission.id}</CardTitle>
              <CardDescription className="max-w-2xl text-default-500">
                {statusMessage || attribution.systemConfidence}
              </CardDescription>
            </div>
          </div>

          <div className="grid gap-2 sm:min-w-56 sm:grid-cols-2">
            <MetaPill label="State" value={attribution.state} tone="accent" />
            <MetaPill label="Signals" value={String(attribution.signals.length)} tone="default" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="rounded-3xl border border-default-200 bg-background/85 p-5 shadow-[0_10px_30px_rgba(15,23,40,0.04)]">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {timelineItems.map((item, index) => {
              const nextItem = timelineItems[index + 1];
              const isExpected = item.progression === "expected";
              const nextIsExpected = nextItem?.progression === "expected";

              return (
                <TimelineRow
                  key={item.id}
                  item={item}
                  isFirst={index === 0}
                  showConnector={!isExpected && Boolean(nextItem) && !nextIsExpected}
                />
              );
            })}
          </div>
        </div>

        {attribution.conflictingSignal ? (
          <Card variant="secondary" className="border border-warning/20 bg-warning/10 shadow-none">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-warning">Why this is contested</p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">{attribution.conflictingSignal}</p>
            </CardContent>
          </Card>
        ) : attribution.systemNote ? (
          <Card variant="secondary" className="border border-default-200 bg-default-50/80 shadow-none">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">System note</p>
              <p className="mt-2 text-sm leading-6 text-default-600">{attribution.systemNote}</p>
            </CardContent>
          </Card>
        ) : null}

        <Separator />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card variant="secondary" className="border border-default-200 bg-default-50/80 shadow-none">
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">Confidence explanation</p>
              <p className="mt-3 text-base font-semibold leading-6 text-foreground">{attribution.integritySummary}</p>
              <p className="mt-2 text-sm leading-6 text-default-600">{attribution.integrityDescription}</p>
              <div className="mt-4 space-y-2">
                {attribution.signals.map((signal) => (
                  <div key={signal.label} className="flex items-start gap-3 rounded-2xl border border-default-200 bg-background/90 px-3 py-2">
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                        signal.status === "positive"
                          ? "bg-success/15 text-success"
                          : signal.status === "warning"
                            ? "bg-warning/15 text-warning"
                            : "bg-danger/15 text-danger"
                      )}
                    >
                      {signal.status === "positive" ? "✓" : signal.status === "warning" ? "!" : "×"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{signal.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="secondary" className="border border-default-200 bg-background/80 shadow-none">
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">What this means for you</p>
              <p className="mt-3 max-w-md text-sm leading-6 text-default-600">{attribution.systemConfidence}</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineRow({
  item,
  isFirst,
  showConnector
}: {
  item: AttributionTimelineEvent;
  isFirst: boolean;
  showConnector: boolean;
}) {
  const Icon = timelineIconMap[item.icon];
  const isExpected = item.progression === "expected";

  return (
    <div className="relative flex items-stretch gap-4">
      <div className="relative flex w-12 shrink-0 justify-center">
        {!isFirst ? <div className="absolute top-0 h-4 w-px bg-default-200" /> : null}
        <div
          className={cn(
            "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm",
            isExpected
              ? "border-default-200 bg-default-100 text-default-400"
              : item.tone === "alert"
                ? "border-danger/20 bg-danger/15 text-danger"
                : item.tone === "success"
                  ? "border-success/20 bg-success/15 text-success"
                  : item.tone === "review"
                    ? "border-warning/20 bg-warning/15 text-warning"
                    : "border-default-200 bg-background text-foreground"
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </div>
        {showConnector ? <div className="absolute top-10 h-[calc(100%+0.5rem)] w-px bg-default-200" /> : null}
      </div>

      <Card
        variant="secondary"
        className={cn(
          "flex-1 border shadow-none",
          isExpected ? "border-default-200 bg-default-50/50" : "border-default-200 bg-background/95"
        )}
      >
        <CardContent className="flex min-h-[88px] items-start justify-between gap-4 p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <p className={cn("text-base font-semibold tracking-[-0.02em]", isExpected ? "text-default-500" : "text-foreground")}>
              {item.title}
            </p>
            <p className={cn("mt-1 text-sm leading-6", isExpected ? "text-default-400" : "text-default-600")}>
              {item.subtitle}
            </p>
            {item.metadataLabel ? (
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.22em] text-default-400">{item.metadataLabel}</p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-default-400">{item.timestamp}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetaPill({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "accent" | "default";
}) {
  return (
    <div className="rounded-2xl border border-default-200 bg-background/90 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-default-400">{label}</p>
      <p className={cn("mt-1 text-sm font-semibold", tone === "accent" ? "text-foreground" : "text-default-600")}>{value}</p>
    </div>
  );
}
