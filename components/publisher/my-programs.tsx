"use client";

import { ArrowRight } from "lucide-react";
import { COMMISSIONS, DISPUTES, formatDateTime } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function buildProgramData() {
  return Object.values(
    COMMISSIONS.reduce<Record<string, any>>((acc, c) => {
      acc[c.programName] ??= {
        programName: c.programName,
        brand: c.brandName,
        rate: c.programName === "Creator Collab Series" ? "18%" : c.programName === "Chocolate Bar Drop Vol. 3" ? "14%" : "11%",
        cookie: c.cookieWindow,
        approvalRate: 0,
        status: "Active",
        lastCommission: c.conversionTimestamp,
        commissions: 0,
        approved: 0,
        openDisputes: 0
      };
      acc[c.programName].commissions += 1;
      if (["approved", "locked", "paid"].includes(c.status)) acc[c.programName].approved += 1;
      if (new Date(c.conversionTimestamp).getTime() > new Date(acc[c.programName].lastCommission).getTime()) acc[c.programName].lastCommission = c.conversionTimestamp;
      return acc;
    }, {})
  ).map((row: any) => ({
    ...row,
    approvalRate: `${Math.round((row.approved / row.commissions) * 100)}%`,
    openDisputes: DISPUTES.filter((d) => COMMISSIONS.find((c) => c.id === d.commissionId)?.programName === row.programName && d.status.includes("open")).length
  }));
}

export function MyPrograms({ onOpenProgram, onDiscover }: { onOpenProgram: (programName: string) => void; onDiscover: () => void }) {
  const rows = buildProgramData();

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Cookie</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Commission</TableHead>
                <TableHead>Commissions</TableHead>
                <TableHead>Open Disputes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r: any) => (
                <TableRow key={r.programName} className="cursor-pointer hover:bg-muted/50" onClick={() => onOpenProgram(r.programName)}>
                  <TableCell>{r.programName}</TableCell>
                  <TableCell>{r.brand}</TableCell>
                  <TableCell>{r.rate}</TableCell>
                  <TableCell>{r.cookie}</TableCell>
                  <TableCell>{r.approvalRate}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{formatDateTime(r.lastCommission)}</TableCell>
                  <TableCell>{r.commissions}</TableCell>
                  <TableCell>{r.openDisputes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-muted/20 p-4 flex items-center justify-between">
        <div>
          <p className="font-medium">Looking for new partnerships?</p>
          <p className="text-sm text-muted-foreground">Discover programs with transparent governance metrics.</p>
        </div>
        <Button onClick={onDiscover}>Discover Programs <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
