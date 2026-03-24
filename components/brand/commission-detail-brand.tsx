"use client";

import { useState } from "react";
import { Flag, RotateCcw, ShieldCheck } from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Chip,
  Separator,
  TextArea
} from "@heroui/react";
import { CommissionAuditLogDialog } from "@/components/commission-audit-log-dialog";
import { CommissionAttributionPanel } from "@/components/commission-attribution-panel";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import {
  BRAND_PROGRAMS_DATA,
  Commission,
  CREATOR_PROFILES,
  CUSTOMER_PROFILES,
  REVERSAL_REASONS,
  formatCurrency,
  formatDateTime,
  getAgeDays
} from "@/lib/mock-data";
import { getAttributionRecord, getReversalReasonCode, getValidationDaysRemaining } from "@/lib/verified-influence";

const shellCardClass = "border border-white/70 bg-white/75 shadow-[0_24px_70px_rgba(15,23,40,0.08)] backdrop-blur-xl";

export function CommissionDetailBrand({ commission }: { commission: Commission }) {
  const [selectedReasonCode, setSelectedReasonCode] = useState(getReversalReasonCode(commission).code);
  const preTransaction = ["link_clicked", "product_viewed", "added_to_cart", "checkout_started"].includes(commission.journeyStage);
  const creator = CREATOR_PROFILES[commission.publisher];
  const customer = CUSTOMER_PROFILES[commission.orderId];
  const commissionRate = parseFloat(BRAND_PROGRAMS_DATA[commission.programName]?.commissionRate || "14");
  const estimatedOrderValue = commissionRate > 0 ? commission.amount / (commissionRate / 100) : commission.amount;
  const attribution = getAttributionRecord(commission);
  const daysRemaining = getValidationDaysRemaining(commission);
  const reasonCode = getReversalReasonCode(commission);
  const statusTone = commission.status === "reversed" ? "danger" : commission.status === "approved" || commission.status === "paid" ? "success" : commission.status === "locked" ? "warning" : "accent";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Card variant="secondary" className={shellCardClass}>
        <CardHeader className="gap-5 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Chip color={statusTone as "accent" | "danger" | "success" | "warning"} variant="soft" size="sm">
                  {commission.status}
                </Chip>
                <Chip color="default" variant="secondary" size="sm">
                  {commission.programName}
                </Chip>
                <Chip color={commission.customerType === "New" ? "success" : "warning"} variant="soft" size="sm">
                  {commission.customerType} customer
                </Chip>
                <Chip color="accent" variant="tertiary" size="sm">
                  {daysRemaining} day{daysRemaining === 1 ? "" : "s"} left
                </Chip>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-default-500">Brand commission review</p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{commission.id}</h1>
                <CardDescription className="max-w-3xl text-sm text-default-500">
                  Review attribution, confirm the commission record, and move cleanly between approval, reversal, and audit evidence.
                </CardDescription>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="Commission" value={formatCurrency(commission.amount, commission.currency)} caption={`${commission.status} payout`} />
                <Metric label="Estimated order" value={formatCurrency(estimatedOrderValue, commission.currency)} caption={`${commissionRate}% rate model`} />
                <Metric label="Model" value={commission.attributionModel} caption={commission.cookieWindow} />
                <Metric label="Age" value={`${getAgeDays(commission.conversionTimestamp)}d`} caption={formatDateTime(commission.conversionTimestamp)} />
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-[280px]">
              <CommissionAuditLogDialog
                commission={commission}
                attribution={attribution}
                triggerClassName="w-full border-transparent bg-primary text-primary-foreground shadow-none hover:bg-primary/90"
              />
              <div className="rounded-2xl border border-default-200 bg-default-50/70 p-4 text-sm text-default-500">
                <ShieldCheck className="mb-2 h-4 w-4 text-default-400" />
                The same audit trail, reasoning, and order identifiers are shared across brand and publisher views.
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]">
        <div className="space-y-6">
          <CommissionAttributionPanel commission={commission} attribution={attribution} />

          <Card variant="secondary" className={shellCardClass}>
            <CardHeader className="gap-2 p-6">
              <CardTitle className="text-lg">Evidence at a glance</CardTitle>
              <CardDescription>The shared record the team uses when validating this commission.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <CompactFact label="Clawback window" value={`${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`} />
                <CompactFact label="Attribution rule" value={attribution.activeRule} />
                <CompactFact label="Commerce ref" value={`Shopify ${commission.orderId}`} />
                <CompactFact label="Audit readiness" value={attribution.integritySummary.replace("Attribution Integrity: ", "")} />
              </div>

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Chip color="default" variant="secondary">
                  {preTransaction ? "Pre-transaction" : "Post-transaction"}
                </Chip>
                <Chip color={commission.customerType === "New" ? "success" : "warning"} variant="soft">
                  {commission.customerType === "New" ? "Value created" : "Needs incrementality review"}
                </Chip>
                <Chip color="accent" variant="tertiary">
                  {attribution.conflictingSignal ? "Contested signal" : "Clean evidence chain"}
                </Chip>
              </div>

              <div className="rounded-2xl border border-default-200 bg-default-50/70 p-4 text-sm text-default-600">
                {commission.customerType === "New"
                  ? "This order expands customer reach, which makes approval and defense easier."
                  : "Returning buyers need stronger attribution evidence before approval or payout."}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="secondary" className={shellCardClass}>
            <CardHeader className="gap-2 p-6">
              <CardTitle className="text-lg">Review workspace</CardTitle>
              <CardDescription>Choose a reversal code, review the evidence, and decide how this commission should move.</CardDescription>
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
                    {commission.customerType === "New" ? "Value created" : "Review needed"}
                  </Chip>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">Mandatory reason code</p>
                <Select value={selectedReasonCode} onValueChange={setSelectedReasonCode}>
                  <SelectContent>
                    {REVERSAL_REASONS.map((reason) => (
                      <SelectItem key={reason.code} value={reason.code}>
                        {reason.code} · {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm leading-6 text-default-500">
                  Every non-approved commission needs a structured taxonomy so the review trail stays clinical and auditable.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="primary" fullWidth>
                  Approve
                </Button>
                <Button variant="secondary" fullWidth>
                  <RotateCcw className="h-4 w-4" />
                  Reverse
                </Button>
              </div>
              <Button variant="ghost" fullWidth>
                <Flag className="h-4 w-4" />
                Flag for follow-up
              </Button>

              <CommissionAuditLogDialog commission={commission} attribution={attribution} triggerClassName="w-full" />
            </CardContent>
          </Card>

          <Card variant="secondary" className={shellCardClass}>
            <CardHeader className="gap-2 p-6">
              <CardTitle className="text-lg">Commission facts</CardTitle>
              <CardDescription>Everything attached to this payout record.</CardDescription>
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

          <Card variant="secondary" className={shellCardClass}>
            <CardHeader className="gap-2 p-6">
              <CardTitle className="text-lg">Creator profile</CardTitle>
              <CardDescription>Who drove the commission and how they are represented in the record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="flex items-center gap-4 rounded-2xl border border-default-200 bg-default-50/70 p-4">
                <Avatar size="md" variant="soft" color="accent">
                  <Avatar.Image src={creator?.avatar ?? "https://i.pravatar.cc/80"} />
                  <Avatar.Fallback>{commission.publisher.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{commission.publisher}</p>
                  <p className="text-sm text-default-500">
                    {creator?.handle ?? "@creator"} · {creator?.niche ?? "Creator"}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <CompactFact label="Source" value={commission.referrerSource} />
                <CompactFact label={preTransaction ? "Last activity" : "Conversion date"} value={formatDateTime(commission.conversionTimestamp)} />
              </div>
            </CardContent>
          </Card>

          <Card variant="secondary" className={shellCardClass}>
            <CardHeader className="gap-2 p-6">
              <CardTitle className="text-lg">Customer insight</CardTitle>
              <CardDescription>Useful context for incrementality and reversal review.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="rounded-2xl border border-default-200 bg-default-50/70 p-4">
                <p className="text-sm font-semibold text-foreground">{customer?.name ?? "Unknown Buyer"}</p>
                <p className="mt-1 text-sm text-default-500">
                  {customer ? `${customer.city}, ${customer.region}` : "Location unavailable"} · {customer?.buyerProfile ?? "General Buyer"}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <CompactFact label="Purchased" value={customer?.purchased ?? commission.productCategory} />
                <CompactFact label="Customer type" value={commission.customerType} />
                <CompactFact label="Validation window" value={`${commission.validationWindowDays} days`} />
                <CompactFact label="Est. order value" value={formatCurrency(estimatedOrderValue, commission.currency)} />
              </div>
            </CardContent>
          </Card>

          {commission.status === "reversed" && (
            <Card variant="secondary" className={shellCardClass}>
              <CardHeader className="gap-2 p-6">
                <CardTitle className="text-lg">Reversal details</CardTitle>
                <CardDescription>The reason code and note attached to this reversal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                <CompactFact label="Reason code" value={`${reasonCode.code} · ${reasonCode.label}`} />
                <CompactFact label="Reason" value={commission.reversalReason || "-"} />
                <CompactFact label="Confidence" value={commission.reversalConfidence || "-"} />
                <p className="text-sm leading-6 text-default-500">
                  This reversal is grounded in the shared audit record so both sides can review the same evidence chain.
                </p>
                <TextArea defaultValue={commission.reversalNote} placeholder="Add internal note" variant="secondary" />
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
