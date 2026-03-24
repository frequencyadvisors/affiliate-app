"use client";

import { Button } from "@/components/ui/button";

export function ViewSwitcher({
  viewMode,
  onChange
}: {
  viewMode: "publisher" | "brand";
  onChange: (v: "publisher" | "brand") => void;
}) {
  return (
    <div className="w-full">
      <div className="flex w-full gap-2 rounded-[18px] border border-white/70 bg-white/60 p-1.5 backdrop-blur-md">
        <Button
          type="button"
          onClick={() => onChange("brand")}
          variant={viewMode === "brand" ? "default" : "ghost"}
          className="h-9 flex-1 rounded-[14px]"
          aria-pressed={viewMode === "brand"}
        >
          Brand
        </Button>
        <Button
          type="button"
          onClick={() => onChange("publisher")}
          variant={viewMode === "publisher" ? "default" : "ghost"}
          className="h-9 flex-1 rounded-[14px]"
          aria-pressed={viewMode === "publisher"}
        >
          Creator
        </Button>
      </div>
    </div>
  );
}
