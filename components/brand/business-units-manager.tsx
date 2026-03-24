"use client";

import { useMemo, useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import { BRAND_PROGRAMS_DATA, BRANDS, BUSINESS_UNITS, COMMISSIONS } from "@/lib/mock-data";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Chip } from "@heroui/react";

type UnitRow = {
  id: string;
  brandId: string;
  name: string;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function BusinessUnitsManager() {
  const [units, setUnits] = useState<UnitRow[]>(() => Object.values(BUSINESS_UNITS));
  const [name, setName] = useState("");

  const counts = useMemo(() => {
    return units.reduce<Record<string, { programs: number; commissions: number }>>((acc, unit) => {
      const programs = Object.values(BRAND_PROGRAMS_DATA).filter((program) => program.businessUnitId === unit.id);
      const programIds = new Set(programs.map((program) => program.programId));
      const commissions = COMMISSIONS.filter((commission) => programIds.has(commission.programId));

      acc[unit.id] = {
        programs: programs.length,
        commissions: commissions.length
      };
      return acc;
    }, {});
  }, [units]);

  function addUnit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `bu-${toSlug(trimmed) || "new-unit"}`;
    if (units.some((unit) => unit.id === id)) return;
    setUnits((prev) => [...prev, { id, brandId: "brand-mr-beast", name: trimmed }]);
    setName("");
  }

  function removeUnit(id: string) {
    setUnits((prev) => prev.filter((unit) => unit.id !== id));
  }

  return (
    <Card variant="secondary" className="mx-auto w-full max-w-4xl border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <CardHeader className="gap-2 p-6">
        <Chip color="accent" variant="soft" size="sm" className="w-fit">Brand structure</Chip>
        <CardTitle className="text-3xl tracking-[-0.04em]">Businesses</CardTitle>
        <CardDescription className="text-default-500">
          Organize programmes under businesses tied to your brand.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6 pt-0">
        <div className="flex flex-col gap-3 rounded-3xl border border-default-200 bg-default-50/70 p-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="mb-2 block text-sm font-medium text-foreground">Add business</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addUnit();
              }}
              placeholder="e.g. New Category Team"
              className="h-11 w-full rounded-2xl border border-default-200 bg-white px-4 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <Button onClick={addUnit} className="sm:w-auto">
            <Plus className="h-4 w-4" />
            Add unit
          </Button>
        </div>

        <div className="space-y-3">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="flex items-center justify-between rounded-2xl border border-default-200 bg-background/80 px-4 py-4 transition-colors hover:bg-default-50"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-default-200 bg-default-50 text-default-600">
                  <Building2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{unit.name}</p>
                  <p className="mt-1 text-xs text-default-500">
                    {BRANDS[unit.brandId]?.name || "Brand"} · {counts[unit.id]?.programs || 0} programs · {counts[unit.id]?.commissions || 0} commissions
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeUnit(unit.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-default-200 bg-white px-3 py-2 text-sm font-medium text-default-500 transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
