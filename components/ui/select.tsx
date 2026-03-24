import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps {
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function renderSelectChildren(children: React.ReactNode): React.ReactNode {
  return React.Children.toArray(children).map((child) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    if (child.type === SelectContent) {
      return renderSelectChildren((child as React.ReactElement<{ children: React.ReactNode }>).props.children);
    }

    return child;
  });
}

export function Select({ value, onValueChange, children, className, disabled }: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          "h-11 w-full appearance-none rounded-2xl border border-[var(--border)] bg-[var(--field-background)] px-4 pr-10 text-sm text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:outline-none focus:ring-2 focus:ring-[color:var(--focus)]/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        {renderSelectChildren(children)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
    </div>
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

export function SelectItem({ value, children, disabled }: { value: string; children: React.ReactNode; disabled?: boolean }) {
  return <option value={value} disabled={disabled}>{children}</option>;
}
