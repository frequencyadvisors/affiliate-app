"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DISCOVER = [
  { brand: "Feastables", programName: "Chocolate Bar Drop Vol. 3", category: "Snacks", description: "Launch-focused chocolate drops.", rate: "14%", cookie: "14 days" },
  { brand: "Feastables", programName: "Creator Collab Series", category: "Snacks", description: "Creator capsule collabs.", rate: "18%", cookie: "30 days" },
  { brand: "Feastables", programName: "Back to School Bundle", category: "Snacks", description: "Student-themed bundles.", rate: "11%", cookie: "7 days" },
  { brand: "Hydr8", programName: "Summer Hydration", category: "Wellness", description: "Hydration packs + refills.", rate: "12%", cookie: "21 days" },
  { brand: "NordLane", programName: "Cold Brew Launch", category: "Beverage", description: "DTC cold brew subscription.", rate: "9%", cookie: "30 days" },
  { brand: "KiteFuel", programName: "Protein Essentials", category: "Fitness", description: "Protein stack starter pack.", rate: "15%", cookie: "14 days" }
];

export function DiscoverPrograms({ onOpenProgram }: { onOpenProgram: (name: string) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {DISCOVER.map((p) => (
        <Card key={p.programName} className="cursor-pointer hover:bg-muted/30" onClick={() => onOpenProgram(p.programName)}>
          <CardHeader>
            <p className="text-xs text-muted-foreground">{p.brand}</p>
            <CardTitle className="text-base">{p.programName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Badge variant="secondary">{p.category}</Badge>
            <p className="text-muted-foreground">{p.description}</p>
            <div className="flex justify-between"><span>Rate</span><strong>{p.rate}</strong></div>
            <div className="flex justify-between"><span>Cookie</span><strong>{p.cookie}</strong></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
