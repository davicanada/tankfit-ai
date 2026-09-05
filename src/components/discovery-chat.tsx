"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AdvisorMessage } from "@/lib/ai/types";

export function DiscoveryChat({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const reset = () => {
      setMessages([]);
      setMessage("");
      setError("");
    };
    window.addEventListener("tankfit-session-reset", reset);
    fetch("/api/discovery")
      .then((r) => r.json())
      .then((data) => {
        if (active && Array.isArray(data.messages)) setMessages(data.messages);
      })
      .catch(() => {});
    return () => {
      active = false;
      window.removeEventListener("tankfit-session-reset", reset);
    };
  }, []);
  return (
    <section
      aria-label="TankFit AI conversation"
      className="space-y-4 rounded-xl border bg-card p-5"
    >
      <h2 className="text-xl font-semibold">TankFit AI</h2>
      <p className="text-xs text-muted-foreground">
        Fictional needs only. Do not enter real names, contact, payment or
        confidential information. You can write in your preferred language.
      </p>
      <div
        role="log"
        aria-live="polite"
        className={`${compact ? "max-h-56" : "max-h-96"} space-y-4 overflow-y-auto break-words`}
      >
        {messages.length === 0 && (
          <p className="text-sm">
            What material do your fictional tanks contain, and what problem
            would you like to solve?
          </p>
        )}
        {messages.map((entry, index) => (
          <div key={index} className="rounded-md bg-muted/40 p-3 text-sm">
            <p className="mb-1 font-semibold">
              {entry.role === "user" ? "You" : "TankFit AI"}
            </p>
            <p className="whitespace-pre-wrap">{entry.content}</p>
          </div>
        ))}
      </div>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (pending || !message.trim()) return;
          setPending(true);
          setError("");
          try {
            const response = await fetch("/api/discovery", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message }),
            });
            const result = await response.json();
            if (!response.ok)
              throw new Error(result.error ?? "Conversation unavailable.");
            setMessages(result.messages);
            setMessage("");
            window.dispatchEvent(new Event("tankfit-discovery-updated"));
          } catch (err) {
            setError(err instanceof Error ? err.message : "Please retry.");
          } finally {
            setPending(false);
          }
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm">Message to TankFit AI</span>
          <Textarea
            value={message}
            maxLength={1200}
            disabled={pending}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <Button disabled={pending || !message.trim()} type="submit">
          {pending ? "Thinking…" : "Send message"}
        </Button>
        <p role="status" className="text-sm text-amber-200">
          {error}
        </p>
      </form>
      <Link
        className="block text-sm text-primary underline"
        href="/demo/customer"
      >
        Review facts and continue the customer journey
      </Link>
    </section>
  );
}
