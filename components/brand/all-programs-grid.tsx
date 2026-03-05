"use client";

import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BRAND_PROGRAMS_DATA } from "@/lib/mock-data";

export function AllProgramsGrid({
  onOpenProgram,
  onCreateProgram
}: {
  onOpenProgram: (programName: string) => void;
  onCreateProgram: () => void;
}) {
  const programs = Object.values(BRAND_PROGRAMS_DATA);
  const summaries: Record<string, string> = {
    "Chocolate Bar Drop Vol. 3": "Limited-run chocolate bar collection including new MrBeast Bar flavors. High conversion, impulse-buy price point.",
    "Creator Collab Series": "Affiliate program for creator-native partnerships driving Feastables multipack and bundle sales across YouTube and TikTok audiences.",
    "Back to School Bundle": "Seasonal bundle program targeting high-volume snack purchases for the back-to-school period. Limited enrollment."
  };
  const reversalLabel: Record<string, string> = {
    "Back to School Bundle": "Optional"
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)] w-full flex-col">
      <div className="mx-auto w-full max-w-[1180px] flex-1 px-8 py-8">
        <div className="flex h-[79.773px] w-full flex-col gap-2">
          <div className="flex h-[50px] items-center">
            <h1 className="font-[var(--font-jost)] text-[50px] font-semibold leading-[24px] tracking-[-0.2px] text-[#04070f]">All Programs</h1>
          </div>
          <p className="text-[16px] text-muted-foreground">All affiliate programs created by your organisation.</p>
        </div>

        <div className="mt-[35px] grid items-start gap-4 lg:grid-cols-3">
          {programs.map((p) => (
            <article
              key={p.programName}
              className="flex h-[460px] max-h-[460px] w-full min-w-0 flex-col overflow-hidden rounded-[20px] border-2 border-black bg-white shadow-[4px_4px_0px_0px_black]"
            >
              <div className="flex min-h-px min-w-0 flex-1 flex-col gap-[15px] px-5 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.6px] text-[#ff6088]">{p.brandName}</p>
                  <Badge className="h-[25px] px-[10px] py-[5px] text-[12px] font-medium">Active</Badge>
                </div>
                <h2 className="text-[35px] font-semibold leading-[100%] tracking-[-0.2px] text-[#04070f]">
                  {p.programName}
                </h2>
                <p className="text-[14px] leading-[18.2px] text-muted-foreground">
                  {summaries[p.programName] || "Performance-ready affiliate program with transparent governance and reliable payout behavior."}
                </p>
              </div>

              <div className="flex items-start border-y-2 border-black">
                <div className="flex min-h-px min-w-px flex-1 flex-col gap-[13px] p-5">
                  <p className="min-w-full text-xs leading-[1.3] text-black">Commission</p>
                  <p className="text-[35px] font-semibold leading-none tracking-[-1.3459px]">{p.commissionRate}</p>
                </div>
                <div className="flex min-h-px min-w-px flex-1 self-stretch border-l border-black/20 p-5">
                  <div className="flex w-full flex-col gap-[13px]">
                    <p className="text-xs leading-[1.3] text-black">Cookie Window</p>
                    <div className="flex items-end gap-[7px]">
                      <p className="text-[35px] font-semibold leading-none tracking-[-1.3459px]">{p.cookieWindow.replace(" days", "")}</p>
                      <span className="flex h-6 w-3 items-center justify-center">
                        <span className="inline-block rotate-90 whitespace-nowrap text-[9px] font-bold uppercase leading-[1.3] text-black">days</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex h-[62px] items-center justify-between border-b-2 border-black bg-[var(--muted)] px-[18px] pb-[2px] text-[12px]">
                <div>
                  <p className="opacity-50">Approval</p>
                  <p className="font-semibold">{p.trustSummary.approvalRate}</p>
                </div>
                <div>
                  <p className="opacity-50">Avg. Payout</p>
                  <p className="font-semibold">11 days</p>
                </div>
                <div>
                  <p className="opacity-50">Reversals</p>
                  <p className="font-semibold whitespace-nowrap">
                    <span className="mr-1 inline-block h-[6px] w-[6px] rounded-full bg-[#37dcff]" />
                    {reversalLabel[p.programName] || "Always"}
                  </p>
                </div>
                <div>
                  <p className="opacity-50">Creators</p>
                  <p className="font-semibold">{p.trustSummary.activePublishers}</p>
                </div>
              </div>

              <button
                className="flex h-[44px] w-full items-center justify-center gap-2 bg-primary px-[111px] py-[7px] text-[20px] font-semibold leading-[30px] tracking-[-0.2px] text-[#04070f] hover:brightness-105"
                onClick={() => onOpenProgram(p.programName)}
              >
                <span className="whitespace-nowrap">View Program</span>
                <span aria-hidden className="relative top-[-0.5px]">›</span>
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-auto h-[138px] w-full border-t-2 border-black bg-[var(--lime)]">
        <div className="mx-auto flex h-full w-full max-w-[1180px] items-center justify-center px-8 pt-[2px]">
          <button className="flex h-[50.391px] items-center gap-4" onClick={onCreateProgram}>
            <span className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] border-[3px] border-black bg-primary shadow-[3px_3px_0px_0px_black]">
              <PlusCircle className="h-6 w-6" />
            </span>
            <span className="text-left">
              <span className="block text-[26.4px] font-semibold leading-[26.4px] tracking-[-0.88px] text-[#04070f]">
                Create new programs to grow your network
              </span>
              <span className="text-[16px] leading-[24px] text-muted-foreground">
                Use the left rail to create and manage affiliate programs.
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
