"use client";

import { COMMISSIONS, formatCurrency } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Chip } from "@heroui/react";

export function PublishersList({
  programFilter = "all",
  showHeader = true
}: {
  programFilter?: "all" | string;
  showHeader?: boolean;
}) {
  const filtered = programFilter === "all" ? COMMISSIONS : COMMISSIONS.filter((c) => c.programName === programFilter);
  const grouped = Object.values(
    filtered.reduce<Record<string, { name: string; total: number; conversions: number; approved: number }>>((acc, c) => {
      acc[c.publisher] ??= { name: c.publisher, total: 0, conversions: 0, approved: 0 };
      acc[c.publisher].total += c.amount;
      acc[c.publisher].conversions += 1;
      if (["approved", "locked", "paid"].includes(c.status)) acc[c.publisher].approved += 1;
      return acc;
    }, {})
  );

  return (
    <Card variant="secondary" className="border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      {showHeader && (
        <CardHeader className="gap-2 p-6 pb-0">
          <Chip color="accent" variant="soft" size="sm" className="w-fit">Publishers</Chip>
          <CardTitle className="text-2xl tracking-[-0.04em]">Partner roster</CardTitle>
          <CardDescription className="text-default-500">
            Revenue and approval performance by publisher.
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "p-6 pt-4" : "p-6"}>
        <div className="overflow-hidden rounded-3xl border border-default-200 bg-background/95">
          <Table>
            <TableHeader className="bg-default-50">
              <TableRow>
                <TableHead>Publisher</TableHead>
                <TableHead>Total commissions</TableHead>
                <TableHead>Conversions</TableHead>
                <TableHead>Approval rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                  <TableCell>{formatCurrency(p.total, "USD")}</TableCell>
                  <TableCell>{p.conversions}</TableCell>
                  <TableCell>{Math.round((p.approved / p.conversions) * 100)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
