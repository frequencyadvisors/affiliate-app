import * as React from "react";
import { Badge as HeroBadge } from "@heroui/react";
import type { BadgeProps as HeroBadgeProps } from "@heroui/react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  variant?: "default" | "secondary" | "outline";
}

export function Badge({ className, variant, ...props }: BadgeProps) {
  const color: HeroBadgeProps["color"] = variant === "outline" ? "default" : "accent";
  const badgeVariant: HeroBadgeProps["variant"] = variant === "outline" ? "secondary" : "soft";

  return (
    <HeroBadge
      variant={badgeVariant}
      color={color}
      className={cn("text-[10px] font-medium", className)}
      {...props}
    />
  );
}
