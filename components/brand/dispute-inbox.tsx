"use client";

import { useState } from "react";
import { Dispute, DISPUTES, formatDateTime, getDisputeDaysRemaining, getDisputeUrgency } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function DisputeInbox({
  onOpenCommission,
  showListHeader = true
}: {
  onOpenCommission: (id: string) => void;
  showListHeader?: boolean;
}) {
  const [active, setActive] = useState<Dispute | null>(null);

  if (active) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setActive(null)}>← Back to disputes</Button>
        <Card>
          <CardHeader><CardTitle>{active.id} • {active.subject}</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">Commission: <button className="underline" onClick={() => onOpenCommission(active.commissionId)}>{active.commissionId}</button></p>
            <p><strong>Evidence:</strong> {active.evidence}</p>
            <div className="space-y-2 rounded-md border p-3">
              {active.messages.map((m, i) => (
                <div key={i} className="rounded-md bg-muted/30 p-2">
                  <p className="text-xs text-muted-foreground">{m.senderName} • {formatDateTime(m.sentAt)}</p>
                  <p>{m.content}</p>
                </div>
              ))}
            </div>
            <Textarea placeholder="Respond to publisher" />
            <div className="flex flex-wrap gap-2">
              <Button>Reinstate</Button>
              <Button variant="outline">Uphold with explanation</Button>
              <Button variant="secondary">Escalate</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      {showListHeader && <CardHeader><CardTitle className="text-base">Dispute Inbox</CardTitle></CardHeader>}
      <CardContent className={showListHeader ? "space-y-2" : "space-y-2 pt-6"}>
        {DISPUTES.map((d) => {
          const urgency = getDisputeUrgency(d);
          return (
            <button key={d.id} onClick={() => setActive(d)} className="w-full rounded-md border p-3 text-left hover:bg-muted/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{d.id} • {d.subject}</p>
                  <p className="text-xs text-muted-foreground">{d.commissionId} • due in {getDisputeDaysRemaining(d)}d</p>
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
