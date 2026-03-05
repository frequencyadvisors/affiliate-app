"use client";

import { Fragment, useMemo, useState } from "react";
import { AlertTriangle, Check, Flag, Inbox, RotateCcw } from "lucide-react";
import { Commission, REVERSAL_REASONS, formatCurrency, formatDateTime, getAgeDays, getPendingCommissions } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CommissionStatusChip } from "@/components/commission-status-chip";

export function CommissionQueue({
  programFilter = "all",
  onOpenCommission,
  showHeader = true
}: {
  programFilter?: "all" | string;
  onOpenCommission: (id: string) => void;
  showHeader?: boolean;
}) {
  const rows = useMemo(() => {
    const base = getPendingCommissions();
    return programFilter === "all" ? base : base.filter((c) => c.programName === programFilter);
  }, [programFilter]);
  const [selected, setSelected] = useState<string[]>([]);
  const [reversingId, setReversingId] = useState<string | null>(null);

  const total = rows.reduce((acc, c) => acc + c.amount, 0);

  const allSelected = rows.length > 0 && selected.length === rows.length;

  function toggleAll(next: boolean) {
    setSelected(next ? rows.map((r) => r.id) : []);
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>Commission Queue</span>
            <span className="text-sm font-normal text-muted-foreground">{rows.length} pending • {formatCurrency(total, "USD")}</span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showHeader ? undefined : "pt-6"}>
        {selected.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 p-2">
            <span className="text-xs text-muted-foreground">{selected.length} selected</span>
            <Button size="sm" variant="secondary"><Check className="h-3.5 w-3.5" />Approve</Button>
            <Button size="sm" variant="outline"><RotateCcw className="h-3.5 w-3.5" />Reverse</Button>
            <Button size="sm" variant="outline"><Flag className="h-3.5 w-3.5" />Flag</Button>
          </div>
        )}

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Inbox className="h-6 w-6 text-muted-foreground" />
            <p className="font-medium">You're all caught up</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></TableHead>
                <TableHead>Publisher</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Conversion Date</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow key={row.id} className="cursor-pointer" onClick={() => onOpenCommission(row.id)}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.includes(row.id)}
                        onCheckedChange={(checked) => setSelected((prev) => checked ? [...prev, row.id] : prev.filter((id) => id !== row.id))}
                      />
                    </TableCell>
                    <TableCell>{row.publisher}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(row.amount, row.currency)}</TableCell>
                    <TableCell>{formatDateTime(row.conversionTimestamp)}</TableCell>
                    <TableCell>{getAgeDays(row.conversionTimestamp)}d</TableCell>
                    <TableCell>{row.riskFlags?.length ? <Badge>Flagged</Badge> : <span className="text-muted-foreground">Low</span>}</TableCell>
                    <TableCell><CommissionStatusChip status={row.status} /></TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost"><Check className="h-4 w-4 text-status-approved" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setReversingId(reversingId === row.id ? null : row.id)}><RotateCcw className="h-4 w-4 text-status-reversed" /></Button>
                        <Button size="icon" variant="ghost"><Flag className="h-4 w-4 text-status-pending" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {reversingId === row.id && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <InlineReversalForm commission={row} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function InlineReversalForm({ commission }: { commission: Commission }) {
  const [reason, setReason] = useState(REVERSAL_REASONS[0].label);
  const [note, setNote] = useState("");
  const [confidence, setConfidence] = useState("medium");

  return (
    <div className="grid gap-3 rounded-md border bg-muted/20 p-3 md:grid-cols-3">
      <div className="space-y-1">
        <Label className="text-xs">Reason</Label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
          {REVERSAL_REASONS.map((r) => (
            <option key={r.code} value={r.label}>{r.label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Confidence</Label>
        <select value={confidence} onChange={(e) => setConfidence(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="space-y-1 md:col-span-3">
        <Label className="text-xs">Note</Label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={`Add reversal explanation for ${commission.id}`} />
      </div>
      <div className="md:col-span-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />Explanation is visible in disputes.</p>
        <Button size="sm" variant="destructive">Confirm Reversal</Button>
      </div>
    </div>
  );
}
