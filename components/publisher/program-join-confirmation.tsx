"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Copy, Link2 } from "lucide-react";
import { getAffiliateLinkForProgram } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

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
    <section className="mx-auto flex min-h-[calc(100vh-196px)] max-w-[880px] items-center">
      <div className="w-full overflow-hidden rounded-[28px] border-2 border-black bg-white shadow-[8px_8px_0px_0px_black]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border-b-2 border-black bg-[linear-gradient(160deg,#d9ec70_0%,#f5ffb8_42%,#ffffff_100%)] p-8 lg:border-b-0 lg:border-r-2 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.72px] shadow-[2px_2px_0px_0px_black]">
              <CheckCircle2 className="h-4 w-4" />
              Joined
            </div>
            <div className="mt-6 space-y-4">
              <h2 className="text-[38px] font-semibold leading-[0.95] tracking-[-0.04em] text-[#04070f] sm:text-[48px]">
                Your programme link is live.
              </h2>
              <p className="max-w-[40ch] text-[16px] leading-6 text-[#04070f]/72">
                You&apos;re enrolled in {name}. Copy this URL now and drop it into your bio, video description, or next post.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.72px] text-[#04070f]/60">
              <span className="rounded-full border border-black/20 bg-white/70 px-3 py-1">Tracking active</span>
              <span className="rounded-full border border-black/20 bg-white/70 px-3 py-1">Ready to share</span>
            </div>
          </div>

          <div className="space-y-5 p-8 lg:p-10">
            <div className="rounded-[18px] border-2 border-black bg-[var(--muted)] p-4 shadow-[3px_3px_0px_0px_black]">
              <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.72px] text-[#04070f]/58">
                <Link2 className="h-4 w-4" />
                Programme URL
              </div>
              <code className="block break-all rounded-[12px] bg-white px-4 py-4 text-[14px] leading-6 text-[#04070f]">
                {affiliateLink}
              </code>
            </div>

            <Button size="lg" className="w-full text-[16px]" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy URL"}
            </Button>

            <p className="text-center text-[13px] text-muted-foreground">
              {copied ? "Copied to clipboard." : "This is the tracked URL tied to this programme."}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" className="flex-1" onClick={onMyPrograms}>
                Go to My Programs
              </Button>
              <Button variant="outline" className="flex-1" onClick={onDiscover}>
                Discover More
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
