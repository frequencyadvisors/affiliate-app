"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Copy, Link2, Sparkles } from "lucide-react";
import { Chip } from "@heroui/react";
import { getAffiliateLinkForProgram } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ProgramJoinConfirmation({
  name,
  onMyPrograms,
  onDiscover
}: {
  name: string;
  onMyPrograms: () => void;
  onDiscover: () => void;
}) {
  const affiliateLink = getAffiliateLinkForProgram(name);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-196px)] w-full max-w-6xl items-center px-4 py-8">
      <Card className="w-full border-default-200 bg-background/85 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[1.06fr_0.94fr]">
            <div className="border-b border-default-200 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_45%),linear-gradient(160deg,rgba(250,250,255,0.98),rgba(244,242,255,0.92))] p-8 lg:border-b-0 lg:border-r lg:p-10">
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <Chip color="accent" variant="soft" size="sm">
                  Programme joined
                </Chip>
              </div>
              <div className="mt-6 space-y-4">
                <h2 className="max-w-[14ch] text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl">
                  Your affiliate link is live.
                </h2>
                <p className="max-w-xl text-sm leading-6 text-default-500 sm:text-base">
                  You&apos;re enrolled in {name}. Copy the tracked URL and use it in your bio, description, or next campaign post.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <MiniStat label="Tracking" value="Active" />
                <MiniStat label="Status" value="Ready to share" />
                <MiniStat label="Next step" value="Add to content" />
              </div>
            </div>

            <div className="space-y-6 p-8 lg:p-10">
              <Card className="border-default-200 bg-default-50/70 shadow-sm">
                <CardHeader className="gap-2">
                  <CardTitle className="text-base">Programme URL</CardTitle>
                  <CardDescription>Keep this link handy for posts, bios, and short-form captions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="rounded-2xl border border-default-200 bg-background px-4 py-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-default-500">
                      <Link2 className="h-4 w-4" />
                      Tracked URL
                    </div>
                    <code className="block break-all text-sm leading-6 text-foreground">{affiliateLink}</code>
                  </div>

                  <Button size="lg" className="w-full" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied to clipboard" : "Copy affiliate URL"}
                  </Button>

                  <p className="text-center text-sm text-default-500">
                    {copied ? "The tracked URL is ready to paste." : "This is the tracked URL tied to your programme enrollment."}
                  </p>
                </CardContent>
              </Card>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="secondary" className="w-full" onClick={onMyPrograms}>
                  Go to My Programs
                </Button>
                <Button variant="outline" className="w-full" onClick={onDiscover}>
                  Discover more programmes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-2xl border border-default-200 bg-background/80 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Ready for the next post
                </div>
                <p className="mt-2 text-sm leading-6 text-default-500">
                  The affiliate link is enrolled, the programme is active, and no further setup is required.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-default-200 bg-background/85 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-default-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
