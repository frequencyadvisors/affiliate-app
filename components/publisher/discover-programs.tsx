"use client";

import { ProgramCard } from "@/components/program-card";

const DISCOVER = [
  {
    brand: "Feastables",
    programName: "Chocolate Bar Drop Vol. 3",
    category: "Snacks",
    intro: "Promote a limited-release chocolate drop built for creator launches and short burst campaigns.",
    rate: "14%",
    cookie: "14 days",
    attribution: "Last-click",
    validation: "21 days"
  },
  {
    brand: "Feastables",
    programName: "Creator Collab Series",
    category: "Snacks",
    intro: "Feature rotating capsule collaborations that pair strong conversion intent with creator-first storytelling.",
    rate: "18%",
    cookie: "30 days",
    attribution: "Last-click",
    validation: "21 days"
  },
  {
    brand: "Feastables",
    programName: "Back to School Bundle",
    category: "Snacks",
    intro: "Drive seasonal bundle sales around campus routines, dorm essentials, and back-to-school shopping moments.",
    rate: "11%",
    cookie: "7 days",
    attribution: "Last-click",
    validation: "14 days"
  },
  {
    brand: "Hydr8",
    programName: "Summer Hydration",
    category: "Wellness",
    intro: "Promote hydration packs and refill routines designed for fitness creators and warm-weather wellness content.",
    rate: "12%",
    cookie: "21 days",
    attribution: "Last-click",
    validation: "21 days"
  },
  {
    brand: "NordLane",
    programName: "Cold Brew Launch",
    category: "Beverage",
    intro: "Support a direct-to-consumer cold brew launch with subscription-friendly messaging for daily ritual audiences.",
    rate: "9%",
    cookie: "30 days",
    attribution: "Last-click",
    validation: "30 days"
  },
  {
    brand: "KiteFuel",
    programName: "Protein Essentials",
    category: "Fitness",
    intro: "Highlight an entry-point protein stack tailored to gym, recovery, and everyday performance content.",
    rate: "15%",
    cookie: "14 days",
    attribution: "Last-click",
    validation: "14 days"
  }
];

export function DiscoverPrograms({ onOpenProgram }: { onOpenProgram: (name: string) => void }) {
  return (
    <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
      {DISCOVER.map((p) => (
        <ProgramCard
          key={p.programName}
          className="h-[410px] max-h-[410px]"
          brandName={p.brand}
          status="Open"
          badgeLabel={p.category}
          programName={p.programName}
          intro={p.intro}
          primaryMetrics={[
            { label: "Commission Rate", value: p.rate },
            { label: "Cookie Window", value: p.cookie }
          ]}
          stats={[
            { label: "Attribution", value: p.attribution },
            { label: "Validation", value: p.validation },
            { label: "Payouts", value: "Monthly" },
            { label: "Status", value: "Open" }
          ]}
          ctaLabel="Review Program"
          onOpen={() => onOpenProgram(p.programName)}
        />
      ))}
    </div>
  );
}
