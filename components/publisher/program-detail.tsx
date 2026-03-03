"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProgramDetail({ name, onJoin }: { name: string; onJoin: () => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>{name}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">Program terms, trust metrics, and reversal governance are clearly documented.</p>
          <div className="grid grid-cols-2 gap-3">
            <Term label="Attribution" value="Last-click" />
            <Term label="Validation" value="21 days" />
            <Term label="Dispute Window" value="7 days" />
            <Term label="Reversal Explanations" value="Required" />
          </div>
          <Button onClick={onJoin}>Join Program</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Term({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-muted/30 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>;
}
