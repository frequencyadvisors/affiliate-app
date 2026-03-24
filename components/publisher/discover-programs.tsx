"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Chip, Separator } from "@heroui/react";

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
    <div className="space-y-6">
      <Card className="border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Chip color="accent" variant="soft" size="sm">Discover</Chip>
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">Explore programs</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-default-500 sm:text-base">
                Browse open partnerships with a softer marketplace layout and clear governance details.
              </p>
            </div>
          </div>
          <Button variant="secondary">
            Browse all
            <Sparkles className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DISCOVER.map((p) => (
          <Card key={p.programName} className="border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <CardHeader className="gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">{p.brand}</p>
                  <CardTitle className="mt-2 text-2xl tracking-[-0.04em]">{p.programName}</CardTitle>
                </div>
                <Chip color="accent" variant="soft" size="sm">{p.category}</Chip>
              </div>
              <CardDescription className="text-sm leading-6 text-default-500">{p.intro}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 pt-0">
              <div className="grid grid-cols-2 gap-3">
                <Fact label="Commission" value={p.rate} />
                <Fact label="Cookie window" value={p.cookie} />
                <Fact label="Attribution" value={p.attribution} />
                <Fact label="Validation" value={p.validation} />
              </div>
              <Separator />
              <Button fullWidth onClick={() => onOpenProgram(p.programName)}>
                Review Program
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-default-200 bg-default-50/70 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
