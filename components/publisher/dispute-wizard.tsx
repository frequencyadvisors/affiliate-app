"use client";

import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { Chip } from "@heroui/react";
import { AlertTriangle, ArrowRight, FileText, Flag, Paperclip, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const DISPUTE_REASONS = [
  {
    value: "Order valid",
    title: "Order valid",
    description: "The order appears legitimate and should keep its commission."
  },
  {
    value: "Attribution mismatch",
    title: "Attribution mismatch",
    description: "Another touchpoint appears to have taken credit incorrectly."
  },
  {
    value: "No explanation",
    title: "No explanation",
    description: "The reversal was flagged without enough detail to understand it."
  },
  {
    value: "Incorrect fraud flag",
    title: "Incorrect fraud flag",
    description: "The transaction looks valid and should be reviewed again."
  }
] as const;

type DisputeReason = (typeof DISPUTE_REASONS)[number]["value"];

export function DisputeWizard({ commissionId, onSubmit }: { commissionId: string; onSubmit: () => void }) {
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<DisputeReason>(DISPUTE_REASONS[0].value);
  const [orderId, setOrderId] = useState("");
  const [note, setNote] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6">
      <Card className="border-default-200 bg-background/85 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <CardHeader className="gap-4 px-6 pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <Flag className="h-4 w-4 text-danger" />
                <Chip color="danger" variant="soft" size="sm">
                  Dispute workflow
                </Chip>
              </div>
              <CardTitle className="text-3xl tracking-[-0.05em]">Dispute reversal</CardTitle>
              <CardDescription className="max-w-2xl text-base">
                Build a structured case for commission {commissionId}. Capture the reason, supporting evidence, and the message trail before you submit.
              </CardDescription>
            </div>
            <Chip color="accent" variant="soft" size="sm">
              Step {step + 1} of 3
            </Chip>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {["Reason", "Evidence", "Review"].map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  step === index
                    ? "border-accent bg-accent/5 shadow-sm"
                    : "border-default-200 bg-default-50/60 hover:border-default-300 hover:bg-default-100/70"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500">Step {index + 1}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6 pt-0">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <div className="space-y-4">
              {step === 0 && (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-default-200 bg-default-50/70 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ShieldCheck className="h-4 w-4 text-accent" />
                      Choose the clearest reason code
                    </div>
                    <p className="mt-2 text-sm leading-6 text-default-500">
                      Pick the explanation that best matches the reversal so the review trail stays clean and auditable.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {DISPUTE_REASONS.map((option) => {
                      const selected = reason === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setReason(option.value)}
                          className={`rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-accent bg-accent/5 shadow-sm"
                              : "border-default-200 bg-background hover:border-default-300 hover:bg-default-50/80"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{option.title}</p>
                              <p className="mt-1 text-sm leading-6 text-default-500">{option.description}</p>
                            </div>
                            <Chip variant="soft" color={selected ? "accent" : "default"} size="sm">
                              {selected ? "Selected" : "Select"}
                            </Chip>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4">
                  <Field label="Order ID">
                    <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="ORD-0000" />
                  </Field>
                  <Field label="Evidence note">
                    <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Summarize the evidence and why the reversal should be reviewed." />
                  </Field>
                  <Field label="Receipt URL (optional)">
                    <Input value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} placeholder="https://..." />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <Card className="border-default-200 bg-default-50/70 shadow-sm">
                  <CardHeader className="gap-2">
                    <CardTitle className="text-base">Review before submission</CardTitle>
                    <CardDescription>Double-check the record so the dispute is complete on the first pass.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <ReviewRow label="Reason" value={reason} />
                    <ReviewRow label="Order ID" value={orderId || "Not provided"} />
                    <ReviewRow label="Evidence note" value={note || "Not provided"} />
                    <ReviewRow label="Receipt URL" value={receiptUrl || "Not provided"} />
                  </CardContent>
                </Card>
              )}
            </div>

            <aside className="space-y-4">
              <Card className="border-default-200 bg-background/85 shadow-sm">
                <CardHeader className="gap-2">
                  <CardTitle className="text-base">Dispute summary</CardTitle>
                  <CardDescription>Quick facts that stay visible while you work through the wizard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <SummaryTile icon={FileText} label="Commission" value={commissionId} />
                  <SummaryTile icon={AlertTriangle} label="Selected reason" value={reason} />
                  <SummaryTile icon={Paperclip} label="Evidence" value={receiptUrl ? "Receipt URL attached" : "No receipt link yet"} />
                </CardContent>
              </Card>

              <Card className="border-default-200 bg-default-50/70 shadow-sm">
                <CardHeader className="gap-2">
                  <CardTitle className="text-base">Review guidance</CardTitle>
                  <CardDescription>The right details make the dispute faster to assess.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <GuidanceRow>Use the exact order ID from the transaction record.</GuidanceRow>
                  <GuidanceRow>Keep the note short, factual, and evidence-backed.</GuidanceRow>
                  <GuidanceRow>Include URLs only when they support the reversal case.</GuidanceRow>
                </CardContent>
              </Card>
            </aside>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-default-200 pt-4">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
              Back
            </Button>

            {step < 2 ? (
              <Button onClick={() => setStep((current) => current + 1)}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={onSubmit}>Submit Dispute</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SummaryTile({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-default-200 bg-default-50/80 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-default-500" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500">{label}</p>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function GuidanceRow({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-default-200 bg-background px-4 py-3 text-sm leading-6 text-default-600">{children}</div>;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-default-200 bg-background px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}
