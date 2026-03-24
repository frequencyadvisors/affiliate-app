"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Chip, Separator } from "@heroui/react";

export function ProgramDetail({ name, onJoin }: { name: string; onJoin: () => void }) {
  return (
    <div className="space-y-6">
      <Card className="border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <CardHeader className="gap-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Chip color="accent" variant="soft" size="sm">Program details</Chip>
            <Chip color="success" variant="soft" size="sm">Open for enrollment</Chip>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">{name}</h1>
            <CardDescription className="max-w-3xl text-sm leading-6 text-default-500 sm:text-base">
              Program terms, trust metrics, and reversal governance are clearly documented so you can evaluate the partnership quickly.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6 pt-0 sm:px-8">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Term label="Attribution" value="Last-click" />
            <Term label="Validation" value="21 days" />
            <Term label="Dispute Window" value="7 days" />
            <Term label="Reversal Explanations" value="Required" />
          </div>

          <Separator />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
            <div className="rounded-3xl border border-default-200 bg-default-50/70 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 text-emerald-500" />
                <div className="space-y-2">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-default-500">Governance notes</p>
                  <p className="text-sm leading-6 text-default-600">
                    Transparent reversal rules, a fixed validation window, and a low-friction dispute process keep the program operationally clean.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-default-200 bg-background/90 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">Next step</p>
              <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-foreground">Join in one click</p>
              <p className="mt-2 text-sm leading-6 text-default-500">
                Once you join, the tracked link becomes available in your workspace and can be copied into content immediately.
              </p>
              <Button className="mt-4 w-full" onClick={onJoin}>
                Join Program
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-default-200 bg-background/90 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-default-500">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-foreground">{value}</p>
    </div>
  );
}
