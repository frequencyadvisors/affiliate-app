"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const DISPUTE_REASONS = ["Order valid", "Attribution mismatch", "No explanation", "Incorrect fraud flag"];

export function DisputeWizard({ commissionId, onSubmit }: { commissionId: string; onSubmit: () => void }) {
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState(DISPUTE_REASONS[0]);
  const [orderId, setOrderId] = useState("");
  const [note, setNote] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Dispute Reversal • {commissionId}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {step === 0 && (
          <div className="space-y-2">
            <Label>Select reason</Label>
            {DISPUTE_REASONS.map((r) => (
              <label key={r} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} />
                {r}
              </label>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div><Label>Order ID</Label><Input value={orderId} onChange={(e) => setOrderId(e.target.value)} /></div>
            <div><Label>Evidence note</Label><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></div>
            <div><Label>Receipt URL (optional)</Label><Input value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} /></div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-md border p-3 text-sm space-y-1">
            <p><strong>Reason:</strong> {reason}</p>
            <p><strong>Order ID:</strong> {orderId || "-"}</p>
            <p><strong>Note:</strong> {note || "-"}</p>
            <p><strong>Receipt URL:</strong> {receiptUrl || "-"}</p>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < 2 ? <Button onClick={() => setStep((s) => s + 1)}>Next</Button> : <Button onClick={onSubmit}>Submit Dispute</Button>}
        </div>
      </CardContent>
    </Card>
  );
}
