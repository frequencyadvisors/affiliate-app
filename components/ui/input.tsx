import * as React from "react";
import { Input as HeroInput } from "@heroui/react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return (
    <HeroInput
      ref={ref}
      className={cn(
        "w-full",
        className
      )}
      variant="secondary"
      {...props}
    />
  );
});
