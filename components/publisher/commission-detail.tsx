"use client";

import {
  BRAND_PROGRAMS_DATA,
  Commission,
  CUSTOMER_PROFILES,
  formatCurrency,
  formatDateTime,
  getAgeDays
} from "@/lib/mock-data";
import { getAttributionRecord } from "@/lib/verified-influence";
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
  const customer = CUSTOMER_PROFILES[commission.orderId];
  const commissionRate = parseFloat(BRAND_PROGRAMS_DATA[commission.programName]?.commissionRate || "14");
  const estimatedOrderValue = commissionRate > 0 ? commission.amount / (commissionRate / 100) : commission.amount;
  const attribution = getAttributionRecord(commission);

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
              <Field label="Conversion Date" value={formatDateTime(commission.conversionTimestamp)} />
              <Field label="Validation Window" value={`${commission.validationWindowDays} days`} />
            </div>
          </CardContent>
        </Card>

        {commission.status === "reversed" && (
          <Card>
            <CardHeader><CardTitle className="text-base">Dispute Action</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Field label="Reason" value={commission.reversalReason || "Unknown"} />
              <Field label="Confidence" value={commission.reversalConfidence || "Unknown"} />
              <p className="text-sm text-muted-foreground">{commission.reversalNote || "No explanation provided."}</p>
              <Button className="w-full" onClick={() => onDispute(commission.id)}>Dispute This Reversal</Button>
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
