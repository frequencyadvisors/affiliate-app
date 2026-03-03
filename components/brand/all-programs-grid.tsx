"use client";

import { Sprout } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_PROGRAMS_DATA } from "@/lib/mock-data";

export function AllProgramsGrid({
  onOpenProgram,
  onCreateProgram
}: {
  onOpenProgram: (programName: string) => void;
  onCreateProgram: () => void;
}) {
  const programs = Object.values(BRAND_PROGRAMS_DATA);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">All Programs</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((p) => (
          <Card key={p.programName} className="cursor-pointer hover:bg-muted/30" onClick={() => onOpenProgram(p.programName)}>
            <CardHeader>
              <CardTitle className="text-base">{p.programName}</CardTitle>
              <CardDescription>{p.brandName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="secondary">Snack & CPG</Badge>
              <p className="text-sm text-muted-foreground">Performance-ready affiliate program with clear reversal governance.</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-muted-foreground">Commission</p><p className="font-medium">{p.commissionRate}</p></div>
                <div><p className="text-muted-foreground">Cookie</p><p className="font-medium">{p.cookieWindow}</p></div>
                <div><p className="text-muted-foreground">Approval</p><p className="font-medium">{p.trustSummary.approvalRate}</p></div>
                <div><p className="text-muted-foreground">Avg Payout</p><p className="font-medium">{p.trustSummary.avgPayout}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {programs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <Sprout className="h-8 w-8 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">No programs yet</h3>
              <p className="text-sm text-muted-foreground">Create your first program to start onboarding publishers.</p>
            </div>
            <Button onClick={onCreateProgram}>Create your first program</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
