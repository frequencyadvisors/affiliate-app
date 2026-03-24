import * as React from "react";
import { cn } from "@/lib/utils";

type TabsCtx = { value: string; setValue: (v: string) => void };
const Ctx = React.createContext<TabsCtx | null>(null);

export function Tabs({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) {
  return <Ctx.Provider value={{ value, setValue: onValueChange }}>{children}</Ctx.Provider>;
}

export function TabsList({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex h-auto flex-wrap items-center rounded-full border border-[var(--border)] bg-[var(--surface-secondary)]/70 p-1 shadow-sm", className)}>{children}</div>;
}

export function TabsTrigger({
  value,
  children,
  className,
  activeClassName,
  inactiveClassName
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}) {
  const ctx = React.useContext(Ctx)!;
  const isActive = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
        className,
        isActive ? (activeClassName || "bg-[var(--surface)] text-foreground shadow-sm") : inactiveClassName || "text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(Ctx)!;
  if (ctx.value !== value) return null;
  return <div className="mt-5">{children}</div>;
}
