"use client";

import { Label } from "@/components/ui/label";

export function ViewSwitcher({
  viewMode,
  onChange
}: {
  viewMode: "publisher" | "brand";
  onChange: (v: "publisher" | "brand") => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-black/70">View</Label>
      <select
        value={viewMode}
        onChange={(e) => onChange(e.target.value as "publisher" | "brand")}
        className="h-10 w-full rounded-[10px] border-2 border-black bg-white px-3 text-sm shadow-[2px_2px_0px_0px_black]"
      >
        <option value="publisher">Publisher View</option>
        <option value="brand">Brand View</option>
      </select>
    </div>
  );
}
