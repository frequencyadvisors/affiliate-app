"use client";

import { ShieldCheck } from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Chip,
  Separator
} from "@heroui/react";
import { CommissionAuditLogDialog } from "@/components/commission-audit-log-dialog";
import { CommissionAttributionPanel } from "@/components/commission-attribution-panel";
import { BRAND_PROGRAMS_DATA, Commission, CUSTOMER_PROFILES, formatCurrency, formatDateTime, getAgeDays } from "@/lib/mock-data";
import { getAttributionRecord, getReversalReasonCode, getValidationDaysRemaining } from "@/lib/verified-influence";

const shellCardClass = "border border-white/70 bg-white/75 shadow-[0_24px_70px_rgba(15,23,40,0.08)] backdrop-blur-xl";

export function CommissionDetail({
  commission,
  onDispute
}: {
  commission: Commission;
  onDispute: (id: string) => void;
}) {
  const preTransaction = ["link_clicked", "product_viewed", "added_to_cart", "checkout_started"].includes(commission.journeyStage);
  const customer = CUSTOMER_PROFILES[commission.orderId];
  const commissionRate = parseFloat(BRAND_PROGRAMS_DATA[commission.programName]?.commissionRate || "14");
  const estimatedOrderValue = commissionRate > 0 ? commission.amount / (commissionRate / 100) : commission.amount;
  const attribution = getAttributionRecord(commission);
  const daysRemaining = getValidationDaysRemaining(commission);
  const reasonCode = getReversalReasonCode(commission);
  const statusTone = attribution.state === "verified" ? "success" : attribution.state === "disputed" ? "danger" : "warning";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Card variant="secondary" className={shellCardClass}>
        <CardHeader className="gap-5 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Chip color={statusTone as "success" | "danger" | "warning"} variant="soft" size="sm">
                  {attribution.state}
                </Chip>
                <Chip color={commission.customerType === "New" ? "success" : "warning"} variant="soft" size="sm">
                  {commission.customerType} customer
                </Chip>
                <Chip color="default" variant="secondary" size="sm">
                  {commission.programName}
                </Chip>
                <Chip color="accent" variant="tertiary" size="sm">
                  {daysRemaining} day{daysRemaining === 1 ? "" : "s"} left
                </Chip>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-default-500">Publisher commission detail</p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{commission.id}</h1>
                <CardDescription className="max-w-3xl text-sm text-default-500">
                  Check attribution evidence, understand the payout details, and escalate a dispute only when the record supports it.
                </CardDescription>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="Commission" value={formatCurrency(commission.amount, commission.currency)} caption="Expected payout" />
                <Metric label="Estimated order" value={formatCurrency(estimatedOrderValue, commission.currency)} caption={`${commissionRate}% rate model`} />
                <Metric label="Attribution" value={commission.attributionModel} caption={commission.cookieWindow} />
                <Metric label="Conversion age" value={`${getAgeDays(commission.conversionTimestamp)}d`} caption={formatDateTime(commission.conversionTimestamp)} />
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-[280px]">
              <Button variant="primary" fullWidth onClick={() => onDispute(commission.id)}>
                Dispute this reversal
              </Button>
              <div className="rounded-2xl border border-default-200 bg-default-50/70 p-4 text-sm text-default-500">
                <ShieldCheck className="mb-2 h-4 w-4 text-default-400" />
                Use the audit log below if you need the event chain before escalating a dispute.
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]">
        <div className="space-y-6">
          <CommissionAttributionPanel commission={commission} attribution={attribution} statusMessage={attribution.state === "verified" ? "This commission looks secure" : attribution.state === "disputed" ? "This commission is contested" : "This commission still needs attribution"} />

          <Card variant="secondary" className={shellCardClass}>
            <CardHeader className="gap-2 p-6">
              <CardTitle className="text-lg">Buyer snapshot</CardTitle>
              <CardDescription>What matters most when deciding whether to contest the payout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
              <div className="rounded-2xl border border-default-200 bg-default-50/70 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">Customer</p>
                <div className="mt-3 flex items-center gap-4">
                  <Avatar size="md" variant="soft" color="accent">
                    <Avatar.Fallback>{(customer?.name ?? "Buyer").slice(0, 2).toUpperCase()}</Avatar.Fallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{customer?.name ?? "Unknown Buyer"}</p>
                    <p className="text-sm text-default-500">
                      {customer ? `${customer.city}, ${customer.region}` : "Location unavailable"} · {customer?.buyerProfile ?? "General Buyer"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <CompactFact label="Purchased" value={customer?.purchased ?? commission.productCategory} />
                <CompactFact label="Customer type" value={commission.customerType} />
                <CompactFact label={preTransaction ? "Last activity" : "Conversion date"} value={formatDateTime(commission.conversionTimestamp)} />
                <CompactFact label="Validation window" value={`${commission.validationWindowDays} days`} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="secondary" className={shellCardClass}>
            <CardHeader className="gap-2 p-6">
              <CardTitle className="text-lg">Validation snapshot</CardTitle>
              <CardDescription>The shared rule set and evidence visible to both sides.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
              <div className="rounded-2xl border border-default-200 bg-default-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">Incrementality marker</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {commission.customerType === "New" ? "New customer" : "Returning customer"}
                    </p>
                  </div>
                  <Chip color={commission.customerType === "New" ? "success" : "warning"} variant="soft">
                    {commission.customerType === "New" ? "Net-new value" : "Repeat-buyer review"}
                  </Chip>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <CompactFact label="Validation window" value={`${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`} />
                <CompactFact label="Attribution rule" value={attribution.activeRule} />
                <CompactFact label="Commerce ref" value={`Shopify ${commission.orderId}`} />
                <CompactFact label="Integrity" value={attribution.integritySummary.replace("Attribution Integrity: ", "")} />
              </div>

              <div className="rounded-2xl border border-default-200 bg-default-50/70 p-4 text-sm text-default-600">
                This is the same rule set and audit evidence the brand sees, so disputes can be reviewed against a shared record.
              </div>

              <CommissionAuditLogDialog commission={commission} attribution={attribution} triggerClassName="w-full" />
            </CardContent>
          </Card>

          <Card variant="secondary" className={shellCardClass}>
            <CardHeader className="gap-2 p-6">
              <CardTitle className="text-lg">Commission facts</CardTitle>
              <CardDescription>Order and attribution metadata used in the payout record.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-6 pb-6 sm:grid-cols-2">
              <CompactFact label="Program" value={commission.programName} />
              <CompactFact label="Model" value={commission.attributionModel} />
              <CompactFact label="Window" value={commission.cookieWindow} />
              <CompactFact label="Referrer" value={commission.referrerSource} />
              <CompactFact label="Device" value={commission.device} />
              <CompactFact label="Category" value={commission.productCategory} />
              <CompactFact label="Order value" value={formatCurrency(estimatedOrderValue, commission.currency)} />
              <CompactFact label="Commission" value={formatCurrency(commission.amount, commission.currency)} />
              <CompactFact label="Order ref" value={commission.orderId} />
              <CompactFact label="Time in state" value={`${getAgeDays(commission.conversionTimestamp)}d`} />
            </CardContent>
          </Card>

          {commission.status === "reversed" && (
            <Card variant="secondary" className={shellCardClass}>
              <CardHeader className="gap-2 p-6">
                <CardTitle className="text-lg">Dispute action</CardTitle>
                <CardDescription>When the reversal is wrong, open a dispute with the shared audit trail attached.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                <CompactFact label="Reason code" value={`${reasonCode.code} · ${reasonCode.label}`} />
                <CompactFact label="Reason" value={commission.reversalReason || "Unknown"} />
                <CompactFact label="Confidence" value={commission.reversalConfidence || "Unknown"} />
                <p className="text-sm leading-6 text-default-500">
                  {commission.reversalNote || "No explanation provided."}
                </p>
                <Separator />
                <Button variant="primary" fullWidth onClick={() => onDispute(commission.id)}>
                  Dispute this reversal
                </Button>
                <CommissionAuditLogDialog commission={commission} attribution={attribution} triggerClassName="w-full" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  caption
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-2xl border border-default-200 bg-default-50/70 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-default-500">{caption}</p>
    </div>
  );
}

function CompactFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-default-200 bg-white/80 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-foreground">{value}</p>
    </div>
  );
}
