"use client";

import { Badge } from "@/components/ui/badge";

export type ProgramCardStat = {
  label: string;
  value: string;
  dotColor?: string;
};

export type ProgramCardPrimaryMetric = {
  label: string;
  value: string;
};

export function ProgramCard({
  brandName,
  status,
  programName,
  intro,
  description,
  primaryMetrics,
  stats,
  onOpen,
  badgeLabel,
  ctaLabel = "View Program",
  className
}: {
  brandName: string;
  status: string;
  programName: string;
  intro?: string;
  description?: string;
  primaryMetrics: [ProgramCardPrimaryMetric, ProgramCardPrimaryMetric];
  stats: ProgramCardStat[];
  onOpen: () => void;
  badgeLabel?: string;
  ctaLabel?: string;
  className?: string;
}) {
  return (
    <article
      className={[
        "flex h-[460px] max-h-[460px] w-full min-w-0 flex-col overflow-hidden rounded-[20px] border-2 border-black bg-white shadow-[4px_4px_0px_0px_black]",
        className ?? ""
      ].join(" ")}
    >
      <div className="flex min-h-px min-w-0 flex-1 flex-col gap-[15px] px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.6px] text-[#ff6088]">{brandName}</p>
          <Badge className="h-[25px] border-0 px-[10px] py-[5px] text-[12px] font-medium shadow-none">{badgeLabel || status}</Badge>
        </div>
        <h2 className="text-[30px] font-semibold leading-[100%] tracking-[-0.2px] text-[#04070f]">{programName}</h2>
        {intro ? <p className="text-[14px] leading-[18.2px] text-muted-foreground">{intro}</p> : null}
        {description ? <p className="text-[14px] leading-[18.2px] text-muted-foreground">{description}</p> : null}
      </div>

      <div
        className="flex items-start border-y border-black/10"
        style={{ borderTopColor: "rgba(0,0,0,0.10)", borderBottomColor: "rgba(0,0,0,0.10)" }}
      >
        <div className="flex min-h-px min-w-px flex-1 flex-col gap-[13px] p-5">
          <p className="min-w-full text-xs leading-[1.3] text-black">{primaryMetrics[0].label}</p>
          <p className="text-[35px] font-semibold leading-none tracking-[-1.3459px]">{primaryMetrics[0].value}</p>
        </div>
        <div
          className="flex min-h-px min-w-px flex-1 self-stretch border-l border-black/10 p-5"
          style={{ borderLeftColor: "rgba(0,0,0,0.10)" }}
        >
          <div className="flex w-full flex-col gap-[13px]">
            <p className="text-xs leading-[1.3] text-black">{primaryMetrics[1].label}</p>
            <p className="text-[35px] font-semibold leading-none tracking-[-1.3459px]">{primaryMetrics[1].value}</p>
          </div>
        </div>
      </div>

      <div className="flex h-[62px] items-center justify-between border-b-2 border-black bg-[var(--muted)] px-[18px] pb-[2px] text-[12px]">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="opacity-50">{stat.label}</p>
            <p className="font-semibold whitespace-nowrap">
              {stat.dotColor ? <span className="mr-1 inline-block h-[6px] w-[6px] rounded-full" style={{ backgroundColor: stat.dotColor }} /> : null}
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <button
        className="flex h-[44px] w-full items-center justify-center gap-2 bg-primary px-[111px] py-[7px] text-[20px] font-semibold leading-[30px] tracking-[-0.2px] text-[#04070f] hover:brightness-105"
        onClick={onOpen}
      >
        <span className="whitespace-nowrap">{ctaLabel}</span>
        <span aria-hidden className="relative top-[-0.5px]">›</span>
      </button>
    </article>
  );
}
