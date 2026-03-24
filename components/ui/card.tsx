import * as React from "react";
import {
  Card as HeroCard,
  CardContent as HeroCardContent,
  CardDescription as HeroCardDescription,
  CardFooter as HeroCardFooter,
  CardHeader as HeroCardHeader,
  CardTitle as HeroCardTitle
} from "@heroui/react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <HeroCard className={cn("border border-white/70 bg-white/80 text-card-foreground backdrop-blur-md", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <HeroCardHeader className={cn("space-y-1.5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <HeroCardTitle className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <HeroCardDescription className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <HeroCardContent className={cn(className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <HeroCardFooter className={cn("flex items-center", className)} {...props} />;
}
