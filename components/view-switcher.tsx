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
      <Label className="text-xs text-muted-foreground">View</Label>
      <select
        value={viewMode}
        onChange={(e) => onChange(e.target.value as "publisher" | "brand")}
        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
      >
        <option value="publisher">Publisher View</option>
        <option value="brand">Brand View</option>
      </select>
    </div>
  );
}
