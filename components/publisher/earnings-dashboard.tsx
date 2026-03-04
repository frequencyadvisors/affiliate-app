"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { COMMISSIONS, CommissionStatus, formatCurrency, formatDateTime, getAgeDays } from "@/lib/mock-data";
import { CommissionStatusChip } from "@/components/commission-status-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs: ("all" | CommissionStatus)[] = ["all", "pending", "approved", "reversed", "locked", "paid"];

export function EarningsDashboard({
  tab,
  onTab,
  onOpenCommission
}: {
  tab: "all" | CommissionStatus;
  onTab: (t: "all" | CommissionStatus) => void;
  onOpenCommission: (id: string) => void;
}) {
  const chartData = [
    { name: "Jan", value: 220 },
    { name: "Feb", value: 410 },
    { name: "Mar", value: 320 },
    { name: "Apr", value: 610 },
    { name: "May", value: 540 },
    { name: "Jun", value: 760 }
  ];
  const rows = tab === "all" ? COMMISSIONS : COMMISSIONS.filter((c) => c.status === tab);
  const total = COMMISSIONS.filter((c) => ["paid", "locked", "approved"].includes(c.status)).reduce((a, c) => a + c.amount, 0);
  const pending = COMMISSIONS.filter((c) => ["pending", "recorded"].includes(c.status)).reduce((a, c) => a + c.amount, 0);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat title="Total Earned" value={formatCurrency(total, "USD")} />
        <Stat title="Pending" value={formatCurrency(pending, "USD")} />
        <Stat title="Conversion Rate" value="6.4%" />
        <Stat title="Active Programs" value="3" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Earnings Trend</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="var(--primary)" fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => onTab(v as "all" | CommissionStatus)}>
        <TabsList>
          {tabs.map((t) => <TabsTrigger key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</TabsTrigger>)}
        </TabsList>
        <TabsContent value={tab}>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Age</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c) => (
                    <TableRow key={c.id} className="cursor-pointer" onClick={() => onOpenCommission(c.id)}>
                      <TableCell><CommissionStatusChip status={c.status} /></TableCell>
                      <TableCell>{c.programName}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(c.amount, c.currency)}</TableCell>
                      <TableCell>{formatDateTime(c.conversionTimestamp)}</TableCell>
                      <TableCell>{getAgeDays(c.conversionTimestamp)}d</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
