"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, Check, ChevronDown, Rocket, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const steps = ["Program Basics", "Governance Rules", "Publisher Preview", "Confirm & Publish"] as const;
const reversalOptions = [
  "Product returned by customer",
  "Order cancelled before fulfillment",
  "Duplicate or fraudulent conversion",
  "Policy violation by publisher",
  "Funding hold or billing issue"
];
const FLOW_COLUMN_CLASS = "mx-auto w-full max-w-6xl";
const FLOW_INPUT_CLASS = "h-10 rounded-2xl border border-default-200 bg-background/90 text-foreground placeholder:text-default-400";
const FLOW_FIELD_LABEL_CLASS = "text-base font-medium tracking-[-0.02em] text-foreground";

export type CreateProgramDraft = {
  programName: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  commissionRate: string;
  commissionType: "Percentage" | "Flat Fee";
  cookieWindow: string;
  attributionModel: "Last-click" | "First-click" | "Multi-touch";
  validationWindow: string;
  reversalReasons: string;
  explanationCommitment: "Optional" | "Required";
  disputeWindow: string;
  enrollment: "Open" | "Invite Only";
};

export function CreateProgram({
  onSaveDraft,
  onPublish,
  onStepChange
}: {
  onSaveDraft: (draft: CreateProgramDraft) => void;
  onPublish: (draft: CreateProgramDraft) => void;
  onStepChange?: (step: number) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateProgramDraft>({
    programName: "",
    category: "Snack & CPG",
    description: "",
    startDate: "",
    endDate: "",
    commissionRate: "12",
    commissionType: "Percentage",
    cookieWindow: "30 days",
    attributionModel: "Last-click",
    validationWindow: "30 days",
    reversalReasons: "Duplicate or fraudulent conversion",
    explanationCommitment: "Optional",
    disputeWindow: "7 days",
    enrollment: "Open"
  });
  const [selectedReversalReasons, setSelectedReversalReasons] = useState<string[]>(["Duplicate or fraudulent conversion"]);

  const pageMeta = useMemo(() => {
    if (step === 0) {
      return {
        title: "Program Basics",
        subtitle: "Set up the fundamentals of your program."
      };
    }
    if (step === 1) {
      return {
        title: "Governance Rules",
        subtitle: "Define the rules publishers will be held to and the commitments you're making to them."
      };
    }
    if (step === 2) {
      return {
        title: "Publisher Terms Preview",
        subtitle: "This is what creators will see when they’re invited to your program."
      };
    }
    return {
      title: "Review and Publish",
      subtitle: "Review your settings before publishing. You can also save as draft."
    };
  }, [step]);

  const isStepOneInvalid = !form.programName.trim() || !form.startDate.trim() || !form.commissionRate.trim();
  const isLastStep = step === steps.length - 1;
  const commissionDisplay = form.commissionType === "Percentage" ? `${form.commissionRate || "0"}%` : `$${form.commissionRate || "0"}`;

  useEffect(() => {
    onStepChange?.(step);
  }, [onStepChange, step]);

  return (
    <div className="flex w-full flex-col gap-6">
      <Stepper currentStep={step} />

      <div className={cn(FLOW_COLUMN_CLASS, "space-y-2 pt-2 text-center")}>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground">{pageMeta.title}</h1>
        <p className="text-base text-default-500">{pageMeta.subtitle}</p>
      </div>

      {step === 0 && (
        <div className={FLOW_COLUMN_CLASS}>
          <FlowCard>
            <FlowSection>
              <Field label="Program Name" required>
                <Input
                  value={form.programName}
                  placeholder="e.g. Chocolate Bar Drop Vol. 4"
                  className={FLOW_INPUT_CLASS}
                  onChange={(e) => setForm({ ...form, programName: e.target.value })}
                />
              </Field>
            </FlowSection>

            <SectionDivider />

            <FlowSection>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Start Date" required>
                  <DateLikeInput
                    value={form.startDate}
                    placeholder="Select date"
                    onChange={(v) => setForm({ ...form, startDate: v })}
                  />
                </Field>
                <Field label="End Date">
                  <DateLikeInput
                    value={form.endDate}
                    placeholder="Ongoing"
                    onChange={(v) => setForm({ ...form, endDate: v })}
                  />
                </Field>
              </div>
            </FlowSection>

            <SectionDivider />

            <FlowSection>
              <CommissionTypeRateRow
                commissionType={form.commissionType}
                commissionRate={form.commissionRate}
                onTypeChange={(v) => setForm({ ...form, commissionType: v })}
                onRateChange={(v) => setForm({ ...form, commissionRate: v })}
              />
            </FlowSection>

            <SectionDivider />

            <FlowSection>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Cookie Window">
                  <SelectLike
                    value={form.cookieWindow}
                    options={["7 days", "14 days", "30 days"]}
                    onChange={(v) => setForm({ ...form, cookieWindow: v })}
                  />
                </Field>
                <Field label="Validation Window">
                  <SelectLike
                    value={form.validationWindow}
                    options={["7 days", "14 days", "21 days", "30 days"]}
                    onChange={(v) => setForm({ ...form, validationWindow: v })}
                  />
                </Field>
              </div>
            </FlowSection>

            <SectionDivider />

            <FlowSection>
              <InlineSegmentField
                label="Publisher Enrollment"
                value={form.enrollment}
                options={["Open", "Invite Only"]}
                onChange={(v) => setForm({ ...form, enrollment: v as CreateProgramDraft["enrollment"] })}
              />
            </FlowSection>
          </FlowCard>
        </div>
      )}

      {step === 1 && (
        <div className={FLOW_COLUMN_CLASS}>
          <FlowCard>
            <FlowSection className="space-y-3">
              <div>
                <h2 className="text-[28px] font-semibold tracking-[-0.2px]">Attribution Model</h2>
                <p className="text-sm text-default-500">Choose how conversions are credited to publishers.</p>
              </div>

              <div className="space-y-3">
                <AttributionOption
                  checked={form.attributionModel === "Last-click"}
                  title="Last-click"
                  description="Full credit to the final touchpoint before purchase."
                  onSelect={() => setForm({ ...form, attributionModel: "Last-click" })}
                />
                <AttributionOption
                  checked={form.attributionModel === "First-click"}
                  title="First-click"
                  description="Full credit to the first touchpoint that drove awareness."
                  onSelect={() => setForm({ ...form, attributionModel: "First-click" })}
                />
                <AttributionOption
                  checked={form.attributionModel === "Multi-touch"}
                  title="Multi-touch"
                  description="Credit distributed across touchpoints proportionally."
                  onSelect={() => setForm({ ...form, attributionModel: "Multi-touch" })}
                  recommendation="Recommended"
                />
              </div>
            </FlowSection>

            <SectionDivider />

            <FlowSection className="space-y-3">
              <div>
                <h2 className="text-[28px] font-semibold tracking-[-0.2px]">Reversal Policy</h2>
                <p className="text-sm text-default-500">Select the reasons you may reverse a commission.</p>
              </div>

              <div className="space-y-2">
                {reversalOptions.map((option) => {
                  const active = selectedReversalReasons.includes(option);
                  return (
                    <label key={option} className="flex items-center gap-3 text-[15px]">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...selectedReversalReasons, option]
                            : selectedReversalReasons.filter((item) => item !== option);
                          setSelectedReversalReasons(next);
                          setForm({ ...form, reversalReasons: next.join(", ") });
                        }}
                        className="h-4 w-4 rounded border-default-300 text-accent focus:ring-accent/20"
                      />
                      {option}
                    </label>
                  );
                })}
              </div>

              <SectionDivider />

              <GovernanceFooterRow
                explanationCommitment={form.explanationCommitment}
                disputeWindow={form.disputeWindow}
                onExplanationChange={(v) =>
                  setForm({ ...form, explanationCommitment: v as CreateProgramDraft["explanationCommitment"] })
                }
                onDisputeWindowChange={(v) => setForm({ ...form, disputeWindow: v })}
              />
            </FlowSection>
          </FlowCard>
        </div>
      )}

      {step === 2 && (
        <div className={cn(FLOW_COLUMN_CLASS, "space-y-4")}>
          <FlowCard>
            <FlowSection className="space-y-1">
              <p className="text-3xl font-semibold tracking-[-0.04em] text-foreground">{form.programName || "Program Name"}</p>
              <p className="text-base text-default-500">
                {formatProgramDate(form.startDate) || "Start date"} — {formatProgramDate(form.endDate) || "Ongoing"}
              </p>
            </FlowSection>

            <SectionDivider />

            <FlowSection>
              <div className="grid gap-4 md:grid-cols-2">
                <PreviewItem title="Commission" value={`${commissionDisplay} per conversion`} />
                <PreviewItem title="Cookie Window" value={form.cookieWindow} />
              </div>
            </FlowSection>

            <SectionDivider />

            <FlowSection className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <PreviewItem title="Attribution Model" value={form.attributionModel} />
                <PreviewItem title="Validation Window" value={`Commissions reviewed within ${form.validationWindow}.`} />
                <PreviewItem title="Reversal Reasons" value={form.reversalReasons || "None selected"} />
                <PreviewItem title="Explanation Commitment" value={form.explanationCommitment} />
              </div>
                <PreviewItem title="Dispute Window" value={form.disputeWindow} />
            </FlowSection>
          </FlowCard>
          <p className="text-sm text-default-500">
            These terms are locked once the program is published. To change them, create a new program version.
          </p>
        </div>
      )}

      {step === 3 && (
        <div className={cn(FLOW_COLUMN_CLASS, "space-y-4")}>
          <ReviewCard
            title="Basics"
            rows={[
              ["Name", form.programName || "—"],
              ["Dates", `${formatProgramDate(form.startDate) || "—"} — ${formatProgramDate(form.endDate) || "Ongoing"}`],
              ["Commission", `${commissionDisplay} per conversion`],
              ["Cookie window", form.cookieWindow],
              ["Validation window", form.validationWindow],
              ["Enrollment", form.enrollment]
            ]}
          />
          <ReviewCard title="Attribution" rows={[["Model", form.attributionModel]]} />
          <ReviewCard
            title="Reversal Policy"
            rows={[
              ["Reasons", form.reversalReasons || "—"],
              ["Notes", form.explanationCommitment]
            ]}
          />
          <ReviewCard title="Dispute Rules" rows={[["Publisher dispute window", form.disputeWindow]]} />
        </div>
      )}

      <div className={cn(FLOW_COLUMN_CLASS, "pb-[100px] pt-4")}>
        <div className="flex items-center justify-between">
          {step === 0 ? (
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          <div className="flex items-center gap-2">
            {isLastStep && (
              <Button variant="outline" onClick={() => onSaveDraft(form)}>
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
            )}
            {!isLastStep ? (
              <Button onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))} disabled={step === 0 && isStepOneInvalid}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => onPublish(form)}>
                <Rocket className="h-4 w-4" />
                Publish Program
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-3">
      {steps.map((label, index) => {
        const complete = index < currentStep;
        const active = index === currentStep;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full border text-sm font-medium",
                complete || active ? "border-accent bg-accent text-accent-foreground" : "border-default-300 bg-background text-foreground"
              ].join(" ")}
            >
              {complete ? <Check className="h-5 w-5" /> : index + 1}
            </div>
            <p className={["text-sm tracking-[-0.02em] text-foreground", active || complete ? "font-semibold" : "font-normal"].join(" ")}>
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={FLOW_FIELD_LABEL_CLASS}>
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </Label>
      {children}
    </div>
  );
}

function SelectLike({
  value,
  options,
  onChange
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-2xl border border-default-200 bg-background/90 px-3 pr-8 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-default-400" />
    </div>
  );
}

function DateLikeInput({
  value,
  placeholder,
  onChange
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-default-400" />
      <Input
        ref={inputRef}
        type="date"
        value={value}
        aria-label={placeholder}
        className={cn(
          FLOW_INPUT_CLASS,
          "pl-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:opacity-0"
        )}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => inputRef.current?.showPicker?.()}
      />
    </div>
  );
}

function formatProgramDate(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function Segmented({
  options,
  value,
  onChange
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex h-10 rounded-2xl border border-default-200 bg-default-100 p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={[
            "h-8 rounded-xl px-4 text-sm font-medium leading-5 transition-colors",
            value === option ? "bg-background text-foreground shadow-sm" : "text-default-500 hover:bg-background/70 hover:text-foreground"
          ].join(" ")}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function SectionDivider() {
  return <div className="h-px w-full bg-default-200" />;
}

function AttributionOption({
  checked,
  title,
  description,
  recommendation,
  onSelect
}: {
  checked: boolean;
  title: string;
  description: string;
  recommendation?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full rounded-2xl border bg-background/90 p-4 text-left transition-colors",
        checked ? "border-accent ring-1 ring-accent/20" : "border-default-200 hover:border-default-300"
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span className={["h-4 w-4 rounded-full border-2", checked ? "border-accent bg-accent" : "border-default-300"].join(" ")} />
        <p className="text-2xl font-semibold leading-none tracking-[-0.04em] text-foreground">{title}</p>
        {recommendation && (
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">{recommendation}</span>
        )}
      </div>
      <p className="mt-1.5 text-sm text-default-500">{description}</p>
    </button>
  );
}

function PreviewItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-default-500">{title}</p>
      <p className="text-lg text-foreground">{value}</p>
    </div>
  );
}

function ReviewCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <FlowCard>
      <FlowSection className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">{title}</h2>
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-1 gap-1 border-b border-default-200 pb-2.5 last:border-0 last:pb-0 md:grid-cols-[220px_minmax(0,1fr)] md:gap-4">
            <p className="text-sm text-default-500">{label}</p>
            <p className="text-lg font-medium text-foreground">{value}</p>
          </div>
        ))}
      </FlowSection>
    </FlowCard>
  );
}

function FlowCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)]", className)}>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

function FlowSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-5 md:p-6", className)}>{children}</div>;
}

function InlineSegmentField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-base font-medium tracking-[-0.02em] text-foreground">{label}</Label>
      <div className="inline-flex h-10 items-start rounded-2xl border border-default-200 bg-default-100 p-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-xl px-4 py-1 text-sm font-medium leading-5",
              value === option ? "bg-background text-foreground shadow-sm" : "text-default-500"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function CommissionTypeRateRow({
  commissionType,
  commissionRate,
  onTypeChange,
  onRateChange
}: {
  commissionType: CreateProgramDraft["commissionType"];
  commissionRate: string;
  onTypeChange: (value: CreateProgramDraft["commissionType"]) => void;
  onRateChange: (value: string) => void;
}) {
  const isPercent = commissionType === "Percentage";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-base font-medium tracking-[-0.02em] text-foreground">Commission Type</Label>
        <div className="inline-flex h-10 items-start rounded-2xl border border-default-200 bg-default-100 p-1">
          <button
            type="button"
            onClick={() => onTypeChange("Percentage")}
            className={cn(
              "rounded-xl px-4 py-1 text-sm font-medium leading-5",
              isPercent ? "bg-background text-foreground shadow-sm" : "text-default-500"
            )}
          >
            %
          </button>
          <button
            type="button"
            onClick={() => onTypeChange("Flat Fee")}
            className={cn(
              "rounded-xl px-4 py-1 text-sm font-medium leading-5",
              !isPercent ? "bg-background text-foreground shadow-sm" : "text-default-500"
            )}
          >
            Flat Fee
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label className="text-base font-medium tracking-[-0.02em] text-foreground">
          Commission Rate<span className="ml-1 text-accent">*</span>
        </Label>
        <div
          className="inline-flex h-10 items-center gap-1 rounded-2xl border border-default-200 bg-background/90 px-3"
        >
          {!isPercent && <span className="text-sm text-foreground">$</span>}
          <input
            type="text"
            inputMode="decimal"
            value={commissionRate}
            onChange={(e) => onRateChange(e.target.value)}
            className="w-12 bg-transparent text-sm text-foreground outline-none"
            placeholder="12"
          />
          {isPercent && <span className="text-sm text-foreground">%</span>}
        </div>
      </div>
    </div>
  );
}

function GovernanceFooterRow({
  explanationCommitment,
  disputeWindow,
  onExplanationChange,
  onDisputeWindowChange
}: {
  explanationCommitment: CreateProgramDraft["explanationCommitment"];
  disputeWindow: string;
  onExplanationChange: (value: string) => void;
  onDisputeWindowChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,280px)_minmax(0,1fr)_minmax(0,180px)] lg:items-center">
      <Label className="text-base font-medium tracking-[-0.02em] text-foreground lg:text-lg">
        Supporting note on reversals
      </Label>

      <div className="inline-flex h-10 w-full items-start rounded-2xl border border-default-200 bg-default-100 p-1">
        {(["Optional", "Required"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onExplanationChange(option)}
            className={cn(
              "flex flex-1 items-center justify-center rounded-xl px-4 py-1 text-sm font-medium leading-5 transition-colors",
              explanationCommitment === option ? "bg-background text-foreground shadow-sm" : "text-default-500"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <Label className="text-base font-medium tracking-[-0.02em] text-foreground lg:text-lg">
        Publisher dispute window
      </Label>

      <div className="relative w-full">
        <select
          value={disputeWindow}
          onChange={(e) => onDisputeWindowChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-2xl border border-default-200 bg-background/90 px-5 pr-12 text-base font-medium tracking-[-0.02em] text-foreground"
        >
          {["7 days", "14 days", "21 days"].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-default-400" />
      </div>
    </div>
  );
}
