import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ value, onValueChange, children }: { value?: string; onValueChange?: (v: string) => void; children: React.ReactNode }) {
  const options = React.Children.toArray(children) as React.ReactElement<{ children?: React.ReactNode }>[];
  return (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
      {options.map((child) => child.props.children)}
    </select>
  );
}

export function SelectTrigger({ className }: { className?: string }) {
  return <span className={cn("hidden", className)} />;
}

export function SelectValue() {
  return null;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
}
