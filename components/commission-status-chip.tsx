"use client";

import {
  Banknote,
  CheckCircle2,
  Circle,
  Clock3,
  Lock,
  XCircle
} from "lucide-react";
import type { ComponentType } from "react";
import { CommissionStatus, StateTransition, formatDateTime } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const cfg: Record<CommissionStatus, { label: string; cls: string; icon: ComponentType<{ className?: string }> }> = {
  recorded: { label: "Recorded", cls: "bg-status-recorded-bg text-status-recorded", icon: Circle },
  pending: { label: "Pending", cls: "bg-status-pending-bg text-status-pending", icon: Clock3 },
  approved: { label: "Approved", cls: "bg-status-approved-bg text-status-approved", icon: CheckCircle2 },
  reversed: { label: "Reversed", cls: "bg-status-reversed-bg text-status-reversed", icon: XCircle },
  locked: { label: "Locked", cls: "bg-status-locked-bg text-status-locked", icon: Lock },
  paid: { label: "Paid", cls: "bg-status-paid-bg text-status-paid", icon: Banknote }
};

export function CommissionStatusChip({ status }: { status: CommissionStatus }) {
  const Icon = cfg[status].icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium", cfg[status].cls)}>
      <Icon className="h-3.5 w-3.5" />
      {cfg[status].label}
    </span>
  );
}

export function LifecycleTimeline({ history }: { history: StateTransition[] }) {
  return (
    <div className="space-y-3">
      {history.map((step, i) => (
        <div key={`${step.status}-${step.at}`} className="flex gap-3">
          <div className="flex w-4 flex-col items-center">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
            {i !== history.length - 1 && <span className="mt-1 h-full w-px bg-border" />}
          </div>
          <div className="pb-2">
            <div className="flex items-center gap-2">
              <CommissionStatusChip status={step.status} />
              <span className="text-xs text-muted-foreground">{formatDateTime(step.at)}</span>
            </div>
            <p className="text-xs text-muted-foreground">by {step.by}</p>
            {step.note && <p className="text-xs">{step.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
