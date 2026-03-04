import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[11px] border-2 border-black text-sm font-semibold tracking-[-0.2px] transition active:translate-x-[1px] active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_black] hover:brightness-105",
        outline: "bg-[var(--muted)] text-foreground shadow-[2px_2px_0px_0px_black] hover:bg-[#c8f4ff]",
        ghost: "border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-[var(--muted)] hover:text-foreground",
        secondary: "bg-[var(--background)] text-foreground shadow-[2px_2px_0px_0px_black] hover:bg-white",
        destructive: "bg-[#ff7a54] text-black shadow-[2px_2px_0px_0px_black] hover:brightness-95"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
