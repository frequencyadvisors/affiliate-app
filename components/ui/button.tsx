import * as React from "react";
import { Button as HeroButton } from "@heroui/react";
import { cn } from "@/lib/utils";

type HeroButtonProps = React.ComponentProps<typeof HeroButton>;

export interface ButtonProps extends Omit<HeroButtonProps, "variant" | "size"> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

function mapVariant(variant: ButtonProps["variant"]) {
  switch (variant) {
    case "outline":
      return "outline";
    case "ghost":
      return "ghost";
    case "secondary":
      return "secondary";
    case "destructive":
      return "danger";
    default:
      return "primary";
  }
}

function mapSize(size: ButtonProps["size"]) {
  switch (size) {
    case "sm":
      return "sm";
    case "lg":
      return "lg";
    default:
      return "md";
  }
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, disabled, variant, size, ...props }, ref) => {
    return (
      <HeroButton
        ref={ref}
        variant={mapVariant(variant)}
        size={mapSize(size)}
        isIconOnly={size === "icon"}
        isDisabled={disabled}
        className={cn(
          "font-semibold tracking-[-0.02em]",
          size === "icon" && "size-9 min-w-9",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
