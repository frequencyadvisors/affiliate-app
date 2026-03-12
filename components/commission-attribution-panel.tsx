"use client";

import {
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
  reverse: RotateCcw
} as const;

export function CommissionAttributionPanel({
  commission,
  attribution,
  statusMessage
}: {
  commission: Commission;
  attribution: AttributionRecord;
  statusMessage: string;
}) {
  const timelineItems = getAttributionTimeline(commission, attribution);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-4 px-5 py-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-semibold leading-[22px] tracking-[-0.66px] text-[#04070f]">{commission.id}</h1>
              <CommissionStatusChip status={commission.status} />
            </div>
            <p className="text-[12px] leading-4 text-[#ff6088]">{statusMessage}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <InlineChip>{attribution.state}</InlineChip>
            <InlineChip>{attribution.confidence} confidence</InlineChip>
            <InlineChip>{attribution.buyerBehaviour}</InlineChip>
          </div>
        </div>

        <div className="px-[30px] pb-[70px] pt-[40px]">
          <div className="mx-auto flex max-w-[694px] flex-col">
            {timelineItems.map((item, index) => (
              <TimelineRow
                key={item.id}
                item={item}
                showConnector={index < timelineItems.length - 1}
              />
            ))}
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.72px] text-[#04070f]/52">Signals the system sees</p>
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
  showConnector
}: {
  item: AttributionTimelineEvent;
  showConnector: boolean;
}) {
  const Icon = timelineIconMap[item.icon];

  return (
    <div className="relative flex gap-[10px] border-t border-black/20 pt-[10px] first:border-t-0 first:pt-0">
      <div className="relative flex w-[70px] shrink-0 justify-center">
        <div
          className={cn(
            "relative z-10 flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-black shadow-[4px_4px_0px_0px_black]",
            item.tone === "alert" ? "bg-[#ff6088]" : item.tone === "success" ? "bg-[#37dcff]" : item.tone === "review" ? "bg-[#fff0d9]" : "bg-white"
          )}
        >
          <Icon className="h-[18px] w-[18px] text-[#04070f]" strokeWidth={2.25} />
        </div>
        {showConnector ? <div className="absolute top-[60px] h-[35px] w-px bg-black" /> : null}
      </div>

      <div
        className={cn(
          "mb-2 flex min-h-[90px] flex-1 items-center justify-between rounded-[20px] px-[18px] py-[15px]",
          item.tone === "alert" ? "bg-[rgba(255,96,136,0.1)]" : "bg-white"
        )}
      >
        <div className="min-w-0 flex-1 pr-4">
          <p className="text-[21px] font-semibold leading-[1.1] tracking-[-0.2px] text-[#04070f]">{item.title}</p>
          <p className={cn("mt-1 text-[12px] leading-4", item.tone === "alert" ? "text-[#ff6088]" : "text-[#525c63]")}>
            {item.subtitle}
          </p>
        </div>
        <div className="shrink-0 text-right text-[12px] font-semibold uppercase tracking-[0.72px] text-black/50">
          {item.timestamp}
        </div>
      </div>
    </div>
  );
}

function InlineChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-black bg-white/80 px-[11px] py-[5px] text-[11px] font-medium capitalize text-[#04070f]">
      {children}
    </span>
  );
}
