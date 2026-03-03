"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const steps = ["Basic Info", "Commission", "Attribution", "Reversal Policy", "Review"];

export type CreateProgramDraft = {
  programName: string;
  category: string;
  description: string;
  commissionRate: string;
  commissionType: string;
  cookieWindow: string;
  attributionModel: string;
  validationWindow: string;
  reversalReasons: string;
  explanationCommitment: string;
  disputeWindow: string;
};

export function CreateProgram({ onSaveDraft, onPublish }: { onSaveDraft: (draft: CreateProgramDraft) => void; onPublish: (draft: CreateProgramDraft) => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateProgramDraft>({
    programName: "",
    category: "Snack & CPG",
    description: "",
    commissionRate: "",
    commissionType: "Revenue share",
    cookieWindow: "14 days",
    attributionModel: "Last-click",
    validationWindow: "21 days",
    reversalReasons: "Duplicate order, Cancelled order",
    explanationCommitment: "Required",
    disputeWindow: "7 days"
  });

  const title = useMemo(() => steps[step], [step]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Create Program • Step {step + 1}/5: {title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(step === 0 || step === 4) && (
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Program Name"><Input value={form.programName} onChange={(e) => setForm({ ...form, programName: e.target.value })} /></Field>
            <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="Description" className="md:col-span-2"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          </div>
        )}
        {(step === 1 || step === 4) && (
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Commission Rate"><Input value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} /></Field>
            <Field label="Type"><Input value={form.commissionType} onChange={(e) => setForm({ ...form, commissionType: e.target.value })} /></Field>
            <Field label="Cookie"><Input value={form.cookieWindow} onChange={(e) => setForm({ ...form, cookieWindow: e.target.value })} /></Field>
          </div>
        )}
        {(step === 2 || step === 4) && (
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Attribution"><Input value={form.attributionModel} onChange={(e) => setForm({ ...form, attributionModel: e.target.value })} /></Field>
            <Field label="Validation Window"><Input value={form.validationWindow} onChange={(e) => setForm({ ...form, validationWindow: e.target.value })} /></Field>
          </div>
        )}
        {(step === 3 || step === 4) && (
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Reversal Reasons"><Textarea value={form.reversalReasons} onChange={(e) => setForm({ ...form, reversalReasons: e.target.value })} /></Field>
            <Field label="Explanation Commitment"><Input value={form.explanationCommitment} onChange={(e) => setForm({ ...form, explanationCommitment: e.target.value })} /></Field>
            <Field label="Dispute Window"><Input value={form.disputeWindow} onChange={(e) => setForm({ ...form, disputeWindow: e.target.value })} /></Field>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onSaveDraft(form)}>Save Draft</Button>
            {step < 4 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <Button onClick={() => onPublish(form)}>Publish Program</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label className="mb-1 block">{label}</Label>
      {children}
    </div>
  );
}
