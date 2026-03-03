"use client";

import { Commission, getAgeDays, getClickToConversionMinutes } from "@/lib/mock-data";
import { CommissionStatusChip, LifecycleTimeline } from "@/components/commission-status-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CommissionDetail({
  commission,
  onDispute
}: {
  commission: Commission;
  onDispute: (id: string) => void;
}) {
  const isPending = commission.status === "pending" || commission.status === "recorded";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {commission.id} <CommissionStatusChip status={commission.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LifecycleTimeline history={commission.stateHistory} />
          <div className="grid gap-3 rounded-md border p-4 md:grid-cols-2 text-sm">
            <Field label="Model" value={commission.attributionModel} />
            <Field label="Window" value={commission.cookieWindow} />
            <Field label="Referrer" value={commission.referrerSource} />
            <Field label="Customer Type" value={commission.customerType} />
            <Field label="Device" value={commission.device} />
            <Field label="Category" value={commission.productCategory} />
            <Field label="Click to Conversion" value={`${getClickToConversionMinutes(commission.clickTimestamp, commission.conversionTimestamp)} mins`} />
            {isPending && <Field label="Time in State" value={`${getAgeDays(commission.conversionTimestamp)} days / ${commission.validationWindowDays} day window`} />}
          </div>
          {commission.status === "reversed" && (
            <div className="rounded-md border border-status-reversed bg-status-reversed-bg p-4 text-sm">
              <p><strong>Reason:</strong> {commission.reversalReason || "Unknown"}</p>
              <p><strong>Note:</strong> {commission.reversalNote || "No explanation provided"}</p>
              <p><strong>Confidence:</strong> {commission.reversalConfidence || "Unknown"}</p>
              <Button className="mt-3" onClick={() => onDispute(commission.id)}>Dispute This Reversal</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>;
}
