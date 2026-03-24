import * as React from "react";
import { cn } from "@/lib/utils";

export function ListSurface({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_50px_rgba(15,23,42,0.08)]",
        className
      )}
      {...props}
    />
  );
}

export function ListRowButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)]/70 px-4 py-3 text-left text-foreground shadow-sm transition-colors hover:bg-[var(--surface)]",
        className
      )}
      {...props}
    />
  );
}
