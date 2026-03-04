import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border border-black/10 px-2.5 py-1 text-[10px] font-medium", {
  variants: {
    variant: {
      default: "bg-[rgba(55,220,255,0.45)] text-black",
      secondary: "bg-[rgba(55,220,255,0.45)] text-black",
      outline: "border border-black bg-white text-muted-foreground"
    }
  },
  defaultVariants: { variant: "default" }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
