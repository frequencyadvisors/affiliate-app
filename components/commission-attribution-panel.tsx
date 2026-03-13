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
import { CommissionStatusChip } from "@/components/commission-status-chip";
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-4 px-5 py-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-semibold leading-[22px] tracking-[-0.66px] text-[#04070f]">{commission.id}</h1>
              <CommissionStatusChip status={commission.status} journeyStage={commission.journeyStage} />
            </div>
            {statusMessage ? <p className="text-[12px] leading-4 text-[#ff6088]">{statusMessage}</p> : null}
          </div>
        </div>

        <div className="px-[30px] pb-[70px] pt-[40px]">
          <div className="mx-auto flex max-w-[694px] flex-col">
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
          <div className="px-5 pb-5">
            <div className="rounded-[14px] bg-[#fff0d9] px-[18px] py-[18px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.72px] text-[#7a3e00]">Why this is contested</p>
              <p className="mt-2 text-[14px] leading-6 text-[#6d3900]">{attribution.conflictingSignal}</p>
            </div>
          </div>
        ) : attribution.systemNote ? (
          <div className="px-5 pb-5">
            <div className="rounded-[14px] border border-black/10 bg-[#f7f9fb] px-[18px] py-[18px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.72px] text-[#525c63]">System Note</p>
              <p className="mt-2 text-[14px] leading-6 text-[#04070f]/78">{attribution.systemNote}</p>
            </div>
          </div>
        ) : null}

        <div className="grid border-t border-black/10 lg:grid-cols-2">
          <div className="border-r border-black/10 px-[30px] py-[30px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.72px] text-[#04070f]/52">Confidence explanation</p>
            <p className="mt-3 text-[14px] font-semibold leading-6 text-[#04070f]">{attribution.integritySummary}</p>
            <p className="mt-1 text-[13px] leading-5 text-[#525c63]">{attribution.integrityDescription}</p>
            <ul className="mt-3 space-y-2">
              {attribution.signals.map((signal) => (
                <li key={signal.label} className="flex gap-2 text-[14px] leading-6 text-[#04070f]">
                  <span className="font-semibold">
                    {signal.status === "positive" ? "✓" : signal.status === "warning" ? "⚠" : "✗"}
                  </span>
                  <span>{signal.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-[30px] py-[30px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.72px] text-[#04070f]/52">What this means for you</p>
            <p className="mt-3 max-w-[260px] text-[14px] leading-6 text-[#04070f]/78">{attribution.systemConfidence}</p>
          </div>
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
    <div className="relative flex items-center gap-[10px] pt-[10px] first:pt-0">
      {!isFirst ? <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-[rgba(0,0,0,0.2)]" /> : null}
      <div className="relative top-[-15px] flex w-[70px] shrink-0 justify-center">
        <div
          className={cn(
            "relative z-10 flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 shadow-[4px_4px_0px_0px_black]",
            isExpected
              ? "bg-[#f5f5f5] text-black/35 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.18)]"
              : item.tone === "alert"
                ? "border-black bg-[#ff6088]"
                : item.tone === "success"
                  ? "border-black bg-[#37dcff]"
                  : item.tone === "review"
                    ? "border-black bg-[#fff0d9]"
                    : "border-black bg-white"
          )}
          style={isExpected ? { borderColor: "rgba(0, 0, 0, 0.18)" } : undefined}
        >
          <Icon className={cn("h-[24px] w-[24px]", isExpected ? "text-black/35" : "text-[#04070f]")} strokeWidth={2.25} />
        </div>
        {showConnector ? <div className="absolute left-[calc(50%+2px)] top-[60px] h-[calc(100%+10px)] w-[2px] -translate-x-1/2 bg-black" /> : null}
      </div>

      <div
        className={cn(
          "mb-2 flex min-h-[90px] flex-1 items-center justify-between rounded-[20px] px-[18px] py-[15px]",
          isExpected ? "bg-transparent" : item.tone === "alert" ? "bg-[rgba(255,96,136,0.1)]" : "bg-white"
        )}
      >
        <div className="min-w-0 flex-1 pr-4">
          <p className={cn("text-[21px] font-semibold leading-[1.1] tracking-[-0.2px]", isExpected ? "text-[#04070f]/40" : "text-[#04070f]")}>{item.title}</p>
          <p className={cn("mt-1 text-[12px] leading-4", isExpected ? "text-[#525c63]/55" : item.tone === "alert" ? "text-[#ff6088]" : "text-[#525c63]")}>
            {item.subtitle}
          </p>
          {item.metadataLabel ? (
            <p className={cn("mt-2 text-[11px] font-semibold uppercase tracking-[0.48px]", isExpected ? "text-[#04070f]/35" : "text-[#04070f]/60")}>
              {item.metadataLabel}
            </p>
          ) : null}
        </div>
        <div className={cn("shrink-0 text-right text-[12px] font-semibold uppercase tracking-[0.72px]", isExpected ? "text-black/30" : "text-black/50")}>
          {item.timestamp}
        </div>
      </div>
    </div>
  );
}
