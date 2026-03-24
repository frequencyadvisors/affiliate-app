"use client";

import { useMemo } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Modal, Separator, useOverlayState } from "@heroui/react";
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
  const state = useOverlayState();
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
      <Button
        className={triggerClassName}
        variant="outline"
        onPress={state.open}
      >
        Review Audit Logs
      </Button>

      <Modal state={state}>
        <Modal.Backdrop variant="blur" className="bg-black/20 backdrop-blur-sm" />
        <Modal.Container placement="center" scroll="inside" size="lg" className="px-4">
          <Modal.Dialog className="w-full rounded-[30px] border border-white/70 bg-background/95 shadow-[0_32px_100px_rgba(15,23,40,0.18)] backdrop-blur-xl">
            <Modal.Header className="flex items-start justify-between gap-4 border-b border-default-200 px-6 py-5 sm:px-8">
              <div className="space-y-1">
                <Modal.Heading className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
                  Shared Audit Log
                </Modal.Heading>
                <CardDescription className="max-w-2xl text-default-500">
                  Both parties see the same event chain, identifiers, and order references for this commission review.
                </CardDescription>
              </div>
              <Button variant="ghost" onPress={state.close} className="shrink-0">
                Close
              </Button>
            </Modal.Header>

            <Modal.Body className="space-y-6 px-6 py-6 sm:px-8">
              <Card variant="secondary" className="border border-default-200 bg-default-50/70 shadow-none">
                <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rawEntries.map((entry) => (
                    <AuditStat key={entry.id} label={entry.label} value={entry.value} />
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-4">
                {eventRows.map((event) => (
                  <Card key={event.id} variant="secondary" className="border border-default-200 bg-background/90 shadow-none">
                    <CardHeader className="gap-1 px-4 pt-4">
                      <CardTitle className="text-base tracking-[-0.02em] text-foreground">{event.title}</CardTitle>
                      <CardDescription className="text-default-500">{event.timestamp}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
                      {event.entries.map((entry) => (
                        <AuditStat key={entry.id} label={entry.label} value={entry.value} />
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
    </>
  );
}

function AuditStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-default-200 bg-background/90 p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-default-400">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-foreground">{value}</p>
    </div>
  );
}
