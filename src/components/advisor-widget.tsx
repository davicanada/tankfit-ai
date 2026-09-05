"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DiscoveryChat } from "./discovery-chat";

export function AdvisorWidget() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) close.current?.focus();
  }, [open]);
  if (path.startsWith("/demo") || path === "/advisor") return null;
  return (
    <aside
      className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)]"
      aria-label="TankFit AI assistant"
    >
      {open && (
        <div
          role="region"
          aria-label="Ask TankFit AI"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              trigger.current?.focus();
            }
          }}
          className="mb-3 max-h-[80dvh] w-96 max-w-full overflow-y-auto rounded-xl border bg-background p-3 shadow-2xl"
        >
          <div className="mb-2 flex items-center justify-between">
            <Link href="/advisor" className="text-sm text-primary underline">
              Open full-page advisor
            </Link>
            <Button
              ref={close}
              variant="ghost"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              Close assistant
            </Button>
          </div>
          <DiscoveryChat compact />
        </div>
      )}
      <Button ref={trigger} aria-expanded={open} onClick={() => setOpen(!open)}>
        Ask TankFit AI
      </Button>
    </aside>
  );
}
