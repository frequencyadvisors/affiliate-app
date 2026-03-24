import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <table className={cn("w-full caption-bottom border-separate border-spacing-0 text-left text-sm text-foreground", className)} {...props} />
    </div>
  );
}
export const TableHeader = (p: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className="border-b border-[var(--separator)] bg-[var(--surface-secondary)]/70 [&_tr]:border-0" {...p} />
);
export const TableBody = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className="[&_tr:last-child]:border-0" {...p} />;
export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("border-b border-[var(--separator)] transition-colors hover:bg-[var(--surface-secondary)]/50", className)} {...props} />
);
export const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      "h-11 px-4 py-3 text-left align-middle text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--muted-foreground)]",
      className
    )}
    {...props}
  />
);
export const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-4 py-4 align-middle", className)} {...props} />
);
