"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@heroui/react";
import { AppShell } from "@/components/app-shell";
import { Spinner } from "@heroui/react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <Card className="w-full max-w-sm border border-white/70 bg-white/80 backdrop-blur-md">
          <CardContent className="flex items-center gap-4 p-6">
            <Spinner size="lg" color="accent" />
            <div>
              <p className="text-sm font-semibold text-foreground">Loading workspace</p>
              <p className="text-sm text-muted-foreground">Bootstrapping the HeroUI shell.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AppShell />;
}
