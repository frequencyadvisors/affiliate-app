"use client";

import { Activity, BadgeDollarSign, Clock, ShieldCheck, Users } from "lucide-react";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandProgramData } from "@/lib/mock-data";
import { CommissionQueue } from "@/components/brand/commission-queue";

export function BrandProgramDetail({
  program,
  onOpenCommission
}: {
  program: BrandProgramData;
  onOpenCommission: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{program.programName}</span>
            <Badge variant="secondary">{program.status}</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{program.brandName}</p>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={ShieldCheck} label="Approval Rate" value={program.trustSummary.approvalRate} />
        <Metric icon={BadgeDollarSign} label="Avg Payout" value={program.trustSummary.avgPayout} />
        <Metric icon={Activity} label="Reversals Explained" value={program.trustSummary.reversalsExplained} />
        <Metric icon={Users} label="Active Publishers" value={program.trustSummary.activePublishers} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Program Terms</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <TermCell icon={BadgeDollarSign} label="Commission" value={`${program.commissionRate} ${program.commissionType}`} />
            <TermCell icon={Activity} label="Attribution" value={program.attributionModel} />
            <TermCell icon={Clock} label="Validation" value={program.validationWindow} />
            <TermCell icon={Clock} label="Dispute Window" value={program.disputeWindow} />
            <div className="col-span-2 rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Reversal Policy</p>
              <p className="font-medium">{program.explanationCommitment}</p>
              <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
                {program.reversalReasons.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <CommissionQueue programFilter={program.programName} onOpenCommission={onOpenCommission} />
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-muted p-2"><Icon className="h-4 w-4" /></div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TermCell({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
      <div className="rounded-md bg-muted p-2"><Icon className="h-4 w-4" /></div>
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>
    </div>
  );
}
