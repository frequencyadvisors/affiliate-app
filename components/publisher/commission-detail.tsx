"use client";

import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommissionAuditLogDialog } from "@/components/commission-audit-log-dialog";
import {
  BRAND_PROGRAMS_DATA,
  Commission,
  CUSTOMER_PROFILES,
  formatCurrency,
  formatDateTime,
  getAgeDays
} from "@/lib/mock-data";
import { getAttributionRecord, getReversalReasonCode, getValidationDaysRemaining } from "@/lib/verified-influence";
import { CommissionAttributionPanel } from "@/components/commission-attribution-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_360px]">
      <CommissionAttributionPanel
        commission={commission}
        attribution={attribution}
        statusMessage={
          attribution.state === "verified"
            ? "This commission looks secure"
            : attribution.state === "disputed"
              ? "This commission is contested"
              : "This commission still needs attribution"
        }
      />

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Validation Snapshot</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-lg border border-black/10 bg-[rgba(247,249,251,0.9)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.48px] text-muted-foreground">Incrementality Marker</p>
                  <p className="mt-1 font-semibold text-[#04070f]">{commission.customerType === "New" ? "New customer" : "Returning customer"}</p>
                </div>
                <Badge variant={commission.customerType === "New" ? "secondary" : "outline"}>
                  {commission.customerType === "New" ? "Net-new value" : "Repeat-buyer review"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Validation Window" value={`${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`} />
              <Field label="Attribution Rule" value={attribution.activeRule} />
              <Field label="Commerce Ref" value={`Shopify ${commission.orderId}`} />
              <Field label="Integrity" value={attribution.integritySummary.replace("Attribution Integrity: ", "")} />
            </div>

            <div className="rounded-lg border border-black/10 bg-[rgba(55,220,255,0.12)] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-[#04070f]" />
                <p className="text-[13px] leading-5 text-[#525c63]">
                  This is the same rule set and audit evidence the brand sees, so disputes can be reviewed against a shared record.
                </p>
              </div>
            </div>

            <CommissionAuditLogDialog commission={commission} attribution={attribution} triggerClassName="w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Commission Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Program" value={commission.programName} />
            <Field label="Model" value={commission.attributionModel} />
            <Field label="Window" value={commission.cookieWindow} />
            <Field label="Referrer" value={commission.referrerSource} />
            <Field label="Device" value={commission.device} />
            <Field label="Category" value={commission.productCategory} />
            <Field label="Order Value" value={formatCurrency(estimatedOrderValue, commission.currency)} />
            <Field label="Commission" value={formatCurrency(commission.amount, commission.currency)} />
            <Field label="Order Ref" value={commission.orderId} />
            <Field label="Time in State" value={`${getAgeDays(commission.conversionTimestamp)}d`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Customer Detail</CardTitle></CardHeader>
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
              <Field label="Purchased" value={customer?.purchased ?? commission.productCategory} />
              <Field label="Customer Type" value={commission.customerType} />
              <Field label={preTransaction ? "Last Activity" : "Conversion Date"} value={formatDateTime(commission.conversionTimestamp)} />
              <Field label="Validation Window" value={`${commission.validationWindowDays} days`} />
            </div>
          </CardContent>
        </Card>

        {commission.status === "reversed" && (
          <Card>
            <CardHeader><CardTitle className="text-base">Dispute Action</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Field label="Reason Code" value={`${reasonCode.code} · ${reasonCode.label}`} />
              <Field label="Reason" value={commission.reversalReason || "Unknown"} />
              <Field label="Confidence" value={commission.reversalConfidence || "Unknown"} />
              <p className="text-sm text-muted-foreground">{commission.reversalNote || "No explanation provided."}</p>
              <Button className="w-full" onClick={() => onDispute(commission.id)}>Dispute This Reversal</Button>
              <CommissionAuditLogDialog commission={commission} attribution={attribution} triggerClassName="w-full" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
