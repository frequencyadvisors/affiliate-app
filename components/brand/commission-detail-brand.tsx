"use client";

import { Flag, RotateCcw } from "lucide-react";
import { Commission, formatCurrency, getClickToConversionMinutes } from "@/lib/mock-data";
import { CommissionStatusChip, LifecycleTimeline } from "@/components/commission-status-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function CommissionDetailBrand({ commission }: { commission: Commission }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{commission.id} • {formatCurrency(commission.amount, commission.currency)}</span>
            <CommissionStatusChip status={commission.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LifecycleTimeline history={commission.stateHistory} />
          <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2 text-sm">
            <Detail label="Device" value={commission.device} />
            <Detail label="Referrer" value={commission.referrerSource} />
            <Detail label="Click to Conv." value={`${getClickToConversionMinutes(commission.clickTimestamp, commission.conversionTimestamp)} mins`} />
            <Detail label="Cookie Window" value={commission.cookieWindow} />
            <Detail label="Customer Type" value={commission.customerType} />
            <Detail label="Category" value={commission.productCategory} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {commission.status === "pending" || commission.status === "recorded" ? (
          <Card>
            <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full">Approve</Button>
              <Button className="w-full" variant="outline"><RotateCcw className="h-4 w-4" />Reverse</Button>
              <Button className="w-full" variant="outline"><Flag className="h-4 w-4" />Flag</Button>
            </CardContent>
          </Card>
        ) : null}

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
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>;
}
