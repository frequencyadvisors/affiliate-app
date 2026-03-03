"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ProgramJoinConfirmation({
  name,
  onMyPrograms,
  onDiscover
}: {
  name: string;
  onMyPrograms: () => void;
  onDiscover: () => void;
}) {
  return (
    <Card>
      <CardContent className="py-16 text-center space-y-4">
        <CheckCircle2 className="mx-auto h-10 w-10 text-status-approved" />
        <h2 className="text-xl font-semibold">You joined {name}</h2>
        <p className="text-sm text-muted-foreground">Your application was accepted and tracking is now active.</p>
        <div className="flex justify-center gap-2">
          <Button onClick={onMyPrograms}>Go to My Programs</Button>
          <Button variant="outline" onClick={onDiscover}>Back to Discover</Button>
        </div>
      </CardContent>
    </Card>
  );
}
