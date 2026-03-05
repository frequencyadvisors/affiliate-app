"use client";

import { COMMISSIONS, formatCurrency } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
    <Card>
      {showHeader && <CardHeader><CardTitle className="text-base">Publishers</CardTitle></CardHeader>}
      <CardContent className={showHeader ? undefined : "pt-6"}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Publisher</TableHead>
              <TableHead>Total Commissions</TableHead>
              <TableHead>Conversions</TableHead>
              <TableHead>Approval Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grouped.map((p) => (
              <TableRow key={p.name}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{formatCurrency(p.total, "USD")}</TableCell>
                <TableCell>{p.conversions}</TableCell>
                <TableCell>{Math.round((p.approved / p.conversions) * 100)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
