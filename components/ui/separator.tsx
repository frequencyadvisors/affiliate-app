import { cn } from "@/lib/utils";

export interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "secondary";
}

export function Separator({ className, orientation = "horizontal", variant = "default" }: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === "horizontal" ? "my-4 h-px w-full" : "mx-4 h-full w-px",
        variant === "secondary" ? "bg-[var(--separator)]" : "bg-[var(--border)]",
        className
      )}
    />
  );
}
