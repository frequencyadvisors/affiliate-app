"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type DialogCtx = { open: boolean; setOpen: (o: boolean) => void };
const Ctx = React.createContext<DialogCtx | null>(null);

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode }) {
  return <Ctx.Provider value={{ open, setOpen: onOpenChange }}>{children}</Ctx.Provider>;
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(Ctx);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ctx?.open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        ctx.setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ctx]);

  if (!ctx?.open) return null;

  const dialog = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm" onMouseDown={() => ctx.setOpen(false)}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          "w-full max-w-lg rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 text-foreground shadow-[0_30px_90px_rgba(15,23,42,0.18)]",
          className
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return typeof document === "undefined" ? dialog : createPortal(dialog, document.body);
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 space-y-1">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">{children}</h3>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-6 text-[var(--muted-foreground)]">{children}</p>;
}
