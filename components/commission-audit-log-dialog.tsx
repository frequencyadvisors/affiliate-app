"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Commission } from "@/lib/mock-data";
import { AttributionRecord, getAuditLogEntries, getAttributionTimeline } from "@/lib/verified-influence";

export function CommissionAuditLogDialog({
  commission,
  attribution,
  triggerClassName
}: {
  commission: Commission;
  attribution: AttributionRecord;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const eventRows = useMemo(
    () =>
      getAttributionTimeline(commission, attribution)
        .filter((item) => item.auditEntries?.length)
        .map((item) => ({
          id: item.id,
          title: item.title,
          timestamp: item.timestamp,
          entries: item.auditEntries ?? []
        })),
    [attribution, commission]
  );
  const rawEntries = useMemo(() => getAuditLogEntries(commission, attribution), [attribution, commission]);

  return (
    <>
      <Button className={triggerClassName} variant="outline" onClick={() => setOpen(true)}>
        Review Audit Logs
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Shared Audit Log</DialogTitle>
            <DialogDescription>
              Both parties see the same event chain, identifiers, and order references for this commission review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2 rounded-lg border border-black/10 bg-[#f7f9fb] p-4 text-sm md:grid-cols-2">
              {rawEntries.map((entry) => (
                <div key={entry.id}>
                  <p className="text-xs uppercase tracking-[0.48px] text-muted-foreground">{entry.label}</p>
                  <p className="font-medium text-[#04070f]">{entry.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {eventRows.map((event) => (
                <div key={event.id} className="rounded-lg border border-black/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#04070f]">{event.title}</p>
                      <p className="text-xs uppercase tracking-[0.48px] text-muted-foreground">{event.timestamp}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    {event.entries.map((entry) => (
                      <div key={entry.id}>
                        <p className="text-xs uppercase tracking-[0.48px] text-muted-foreground">{entry.label}</p>
                        <p className="text-[#04070f]">{entry.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
