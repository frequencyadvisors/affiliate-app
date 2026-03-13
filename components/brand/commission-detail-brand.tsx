"use client";

import { useState } from "react";
import { Flag, RotateCcw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommissionAuditLogDialog } from "@/components/commission-audit-log-dialog";
import { BRAND_PROGRAMS_DATA, Commission, CREATOR_PROFILES, CUSTOMER_PROFILES, REVERSAL_REASONS, formatCurrency, formatDateTime, getAgeDays } from "@/lib/mock-data";
import { getAttributionRecord, getReversalReasonCode, getValidationDaysRemaining } from "@/lib/verified-influence";
import { CommissionAttributionPanel } from "@/components/commission-attribution-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_360px]">
      <CommissionAttributionPanel
        commission={commission}
        attribution={attribution}
      />

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Validation Logic Workspace</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-lg border border-black/10 bg-[rgba(247,249,251,0.9)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.48px] text-muted-foreground">Incrementality Marker</p>
                  <p className="mt-1 font-semibold text-[#04070f]">{commission.customerType === "New" ? "New customer" : "Returning customer"}</p>
                </div>
                <Badge variant={commission.customerType === "New" ? "secondary" : "outline"}>
                  {commission.customerType === "New" ? "Value created" : "Needs incrementality review"}
                </Badge>
              </div>
              <p className="mt-2 text-[13px] leading-5 text-[#525c63]">
                {commission.customerType === "New"
                  ? "This order expands customer reach, which makes commission defense easier."
                  : "Returning buyers need stronger attribution evidence to justify the payout."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Detail label="Clawback Window" value={`${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`} />
              <Detail label="Attribution Rule" value={attribution.activeRule} />
              <Detail label="Commerce Ref" value={`Shopify ${commission.orderId}`} />
              <Detail label="Audit Readiness" value={attribution.integritySummary.replace("Attribution Integrity: ", "")} />
            </div>

            <div className="rounded-lg border border-black/10 bg-[rgba(55,220,255,0.12)] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-[#04070f]" />
                <div>
                  <p className="font-semibold text-[#04070f]">Rule-based fairness</p>
                  <p className="mt-1 text-[13px] leading-5 text-[#525c63]">
                    Validation runs against the active contract logic and the shared audit trail, not against subjective judgment.
                  </p>
                </div>
              </div>
            </div>

            <CommissionAuditLogDialog commission={commission} attribution={attribution} triggerClassName="w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Commission Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Detail label="Program" value={commission.programName} />
            <Detail label="Model" value={commission.attributionModel} />
            <Detail label="Window" value={commission.cookieWindow} />
            <Detail label="Referrer" value={commission.referrerSource} />
            <Detail label="Device" value={commission.device} />
            <Detail label="Category" value={commission.productCategory} />
            <Detail label="Order Value" value={formatCurrency(estimatedOrderValue, commission.currency)} />
            <Detail label="Commission" value={formatCurrency(commission.amount, commission.currency)} />
            <Detail label="Order Ref" value={commission.orderId} />
            <Detail label="Time in State" value={`${getAgeDays(commission.conversionTimestamp)}d`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Participating Creator</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-md border border-black/10 bg-[rgba(242,253,255,0.35)] p-3">
              <img
                alt={commission.publisher}
                src={creator?.avatar ?? "https://i.pravatar.cc/80"}
                className="h-11 w-11 rounded-full border border-black/10 object-cover"
              />
              <div>
                <p className="text-[15px] font-semibold leading-[20px] text-[#04070f]">{commission.publisher}</p>
                <p className="text-xs text-muted-foreground">{creator?.handle ?? "@creator"} · {creator?.niche ?? "Creator"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Detail label="Source" value={commission.referrerSource} />
              <Detail label={preTransaction ? "Last Activity" : "Conversion Date"} value={formatDateTime(commission.conversionTimestamp)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Customer Insight</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-black/10 bg-[rgba(55,220,255,0.2)] p-3">
              <p className="text-[15px] font-semibold leading-[20px] text-[#04070f]">
                {customer?.name ?? "Unknown Buyer"}
              </p>
              <p className="text-xs text-muted-foreground">
                {customer ? `${customer.city}, ${customer.region}` : "Location unavailable"} · {customer?.buyerProfile ?? "General Buyer"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Detail label="Purchased" value={customer?.purchased ?? commission.productCategory} />
              <Detail label="Customer Type" value={commission.customerType} />
              <Detail label="Validation Window" value={`${commission.validationWindowDays} days`} />
              <Detail label="Est. Order Value" value={formatCurrency(estimatedOrderValue, commission.currency)} />
            </div>
          </CardContent>
        </Card>

        {(commission.status === "pending" || commission.status === "recorded") && (
          <Card>
            <CardHeader><CardTitle className="text-base">Reversal & Review Workflow</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p className="text-xs uppercase tracking-[0.48px] text-muted-foreground">Mandatory Reason Code</p>
                <Select value={selectedReasonCode} onValueChange={setSelectedReasonCode}>
                  <SelectContent>
                    {REVERSAL_REASONS.map((reason) => (
                      <SelectItem key={reason.code} value={reason.code}>
                        {reason.code} · {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[13px] leading-5 text-[#525c63]">
                  Every non-approved commission needs a structured taxonomy so disputes stay clinical and reviewable.
                </p>
              </div>
              <Button className="w-full">Approve</Button>
              <Button className="w-full" variant="outline"><RotateCcw className="h-4 w-4" />Reverse</Button>
              <Button className="w-full" variant="outline"><Flag className="h-4 w-4" />Flag</Button>
              <CommissionAuditLogDialog commission={commission} attribution={attribution} triggerClassName="w-full" />
            </CardContent>
          </Card>
        )}

        {commission.status === "reversed" && (
          <Card>
            <CardHeader><CardTitle className="text-base">Reversal Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Detail label="Reason Code" value={`${reasonCode.code} · ${reasonCode.label}`} />
              <Detail label="Reason" value={commission.reversalReason || "-"} />
              <Detail label="Confidence" value={commission.reversalConfidence || "-"} />
              <p className="text-[13px] leading-5 text-[#525c63]">
                This reversal is grounded in the shared audit record so both sides can review the same evidence chain.
              </p>
              <Textarea defaultValue={commission.reversalNote} placeholder="Add internal note" />
              <CommissionAuditLogDialog commission={commission} attribution={attribution} triggerClassName="w-full" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
