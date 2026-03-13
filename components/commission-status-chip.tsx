"use client";

import {
  Banknote,
  CheckCircle2,
  Circle,
  Clock3,
  MousePointerClick,
  Lock,
  ShoppingCart,
  ShoppingBag,
  XCircle
} from "lucide-react";
import type { ComponentType } from "react";
import { CommissionJourneyStage, CommissionStatus, StateTransition, formatDateTime } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const cfg: Record<CommissionStatus, { label: string; cls: string; icon: ComponentType<{ className?: string }> }> = {
  recorded: { label: "Recorded", cls: "bg-status-recorded-bg text-status-recorded", icon: Circle },
  pending: { label: "In Review", cls: "bg-status-pending-bg text-status-pending", icon: Clock3 },
  approved: { label: "Approved", cls: "bg-status-approved-bg text-status-approved", icon: CheckCircle2 },
  reversed: { label: "Reversed", cls: "bg-status-reversed-bg text-status-reversed", icon: XCircle },
  locked: { label: "Locked", cls: "bg-status-locked-bg text-status-locked", icon: Lock },
  paid: { label: "Paid", cls: "bg-status-paid-bg text-status-paid", icon: Banknote }
};

const journeyCfg: Partial<Record<CommissionJourneyStage, { label: string; cls: string; icon: ComponentType<{ className?: string }> }>> = {
  link_clicked: { label: "Clicked", cls: "bg-[#edf1ff] text-[#2947c7]", icon: MousePointerClick },
  product_viewed: { label: "Clicked", cls: "bg-[#edf1ff] text-[#2947c7]", icon: MousePointerClick },
  added_to_cart: { label: "Cart", cls: "bg-[#fff1df] text-[#b86400]", icon: ShoppingCart },
  checkout_started: { label: "Checkout", cls: "bg-[#ffe7e2] text-[#b53d2d]", icon: ShoppingBag },
  transaction_recorded: { label: "In Review", cls: "bg-[#fff8da] text-[#8f6b00]", icon: Clock3 },
  in_validation: { label: "In Review", cls: "bg-[#fff8da] text-[#8f6b00]", icon: Clock3 },
  approved_for_payout: { label: "Approved", cls: "bg-[#e6f7ef] text-[#0f6d45]", icon: CheckCircle2 },
  paid_out: { label: "Paid", cls: "bg-[#e3f7fb] text-[#116b77]", icon: Banknote },
  returned_after_review: { label: "Reversed", cls: "bg-[#fde7ef] text-[#a93758]", icon: XCircle }
};

type CommissionStatusChipViewer = "brand" | "creator";

function getStatusLabel(
  label: string,
  status: CommissionStatus,
  journeyStage: CommissionJourneyStage | undefined,
  viewer: CommissionStatusChipViewer
) {
  if (viewer !== "brand") return label;
  if (status === "pending" || journeyStage === "transaction_recorded" || journeyStage === "in_validation") {
    return "Ready for Review";
  }
  return label;
}

export function CommissionStatusChip({
  status,
  journeyStage,
  viewer = "creator"
}: {
  status: CommissionStatus;
  journeyStage?: CommissionJourneyStage;
  viewer?: CommissionStatusChipViewer;
}) {
  const activeCfg = journeyStage ? journeyCfg[journeyStage] ?? cfg[status] : cfg[status];
  const Icon = activeCfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border-0 px-2 py-1 text-xs font-medium shadow-none", activeCfg.cls)}>
      <Icon className="h-3.5 w-3.5" />
      {getStatusLabel(activeCfg.label, status, journeyStage, viewer)}
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
