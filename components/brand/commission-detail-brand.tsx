"use client";

import { Flag, RotateCcw } from "lucide-react";
import { BRAND_PROGRAMS_DATA, Commission, CREATOR_PROFILES, CUSTOMER_PROFILES, formatCurrency, formatDateTime, getAgeDays } from "@/lib/mock-data";
import { getAttributionRecord } from "@/lib/verified-influence";
import { CommissionAttributionPanel } from "@/components/commission-attribution-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function CommissionDetailBrand({ commission }: { commission: Commission }) {
  const creator = CREATOR_PROFILES[commission.publisher];
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
            ? "This commission looks verified"
            : attribution.state === "disputed"
              ? "This commission is disputed"
              : "This commission is still unestablished"
        }
      />

      <div className="space-y-4">
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
              <Detail label="Conversion Date" value={formatDateTime(commission.conversionTimestamp)} />
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
            <CardHeader><CardTitle className="text-base">Brand Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full">Approve</Button>
              <Button className="w-full" variant="outline"><RotateCcw className="h-4 w-4" />Reverse</Button>
              <Button className="w-full" variant="outline"><Flag className="h-4 w-4" />Flag</Button>
            </CardContent>
          </Card>
        )}

        {commission.status === "reversed" && (
          <Card>
            <CardHeader><CardTitle className="text-base">Reversal Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Detail label="Reason" value={commission.reversalReason || "-"} />
              <Detail label="Confidence" value={commission.reversalConfidence || "-"} />
              <Textarea defaultValue={commission.reversalNote} placeholder="Add internal note" />
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
