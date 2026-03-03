"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <AppShell />;
}
