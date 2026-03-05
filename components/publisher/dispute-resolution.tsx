"use client";

import { useState } from "react";
import { DISPUTES, Dispute, getDisputeDaysRemaining, getDisputeUrgency } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DisputeResolution({ showListHeader = true }: { showListHeader?: boolean }) {
  const [active, setActive] = useState<Dispute | null>(null);

  if (active) {
    return (
      <div className="space-y-4">
        <Button size="sm" variant="ghost" onClick={() => setActive(null)}>← Back to disputes</Button>
        <Card>
          <CardHeader><CardTitle>{active.id} • {active.subject}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">Status: {active.status.replaceAll("_", " ")}</p>
            <p><strong>Brand response:</strong> {active.brandResponse || "Awaiting response"}</p>
            <div className="space-y-2 rounded-md border p-3">
              {active.messages.map((m, i) => <p key={i}><strong>{m.senderName}:</strong> {m.content}</p>)}
            </div>
            <div className="flex gap-2">
              <Button>Accept Resolution</Button>
              <Button variant="outline">Continue Dispute</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      {showListHeader && <CardHeader><CardTitle className="text-base">Dispute Resolution</CardTitle></CardHeader>}
      <CardContent className={showListHeader ? "space-y-2" : "space-y-2 pt-6"}>
        {DISPUTES.map((d) => {
          const urgency = getDisputeUrgency(d);
          return (
            <button key={d.id} onClick={() => setActive(d)} className="w-full rounded-md border p-3 text-left hover:bg-muted/40">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{d.subject}</p>
                  <p className="text-xs text-muted-foreground">{d.commissionId} • {getDisputeDaysRemaining(d)} days</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{d.status.replaceAll("_", " ")}</Badge>
                  <span className={`text-xs ${urgency === "high" ? "text-status-reversed" : urgency === "medium" ? "text-status-pending" : "text-muted-foreground"}`}>{urgency}</span>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
