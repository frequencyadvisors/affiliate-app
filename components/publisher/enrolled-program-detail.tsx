"use client";

import { Activity, BadgeDollarSign, Clock, Copy, Users } from "lucide-react";
import type { ComponentType } from "react";
import { ENROLLED_PROGRAMS, EnrolledProgram } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EarningsDashboard } from "@/components/publisher/earnings-dashboard";

export function EnrolledProgramDetail({
  programName,
  onOpenCommission
}: {
  programName: string;
  onOpenCommission: (id: string) => void;
}) {
  const program = ENROLLED_PROGRAMS[programName] as EnrolledProgram;
  if (!program) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{program.programName}</CardTitle>
          <p className="text-sm text-muted-foreground">{program.brandName} • Enrolled {program.enrolledDate}</p>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <code className="rounded bg-muted px-2 py-1 text-xs">{program.affiliateLink}</code>
          <Button size="sm" variant="outline"><Copy className="h-4 w-4" />Copy</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Activity} label="Approval Rate" value={program.trustSummary.approvalRate} />
        <Metric icon={BadgeDollarSign} label="Avg Payout" value={program.trustSummary.avgPayout} />
        <Metric icon={Users} label="Active Publishers" value={program.trustSummary.activePublishers} />
        <Metric icon={Clock} label="Validation" value={program.validationWindow} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Program Terms</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Term label="Commission" value={`${program.commissionRate} ${program.commissionType}`} />
            <Term label="Attribution" value={program.attributionModel} />
            <Term label="Validation" value={program.validationWindow} />
            <Term label="Dispute Window" value={program.disputeWindow} />
          </div>
        </CardContent>
      </Card>

      <EarningsDashboard tab="all" onTab={() => {}} onOpenCommission={onOpenCommission} />
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Icon className="h-4 w-4" /><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div></div></CardContent></Card>;
}

function Term({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-muted/30 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>;
}
