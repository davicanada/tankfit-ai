"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { resetJourneyAction } from "@/app/demo/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AdvisorMessage } from "@/lib/ai/types";

const confirmedMessage =
  "This fictional opportunity is already confirmed. Continue the customer journey to review it, or reset the demo to start a new conversation.";
const starterPrompts = [
  "What products do you offer?",
  "Help me choose a monitoring solution",
  "Which connectivity options are available?",
] as const;

export function DiscoveryChat({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [requirementsConfirmed, setRequirementsConfirmed] = useState(false);
  const [sessionStateKnown, setSessionStateKnown] = useState(false);
  const [isResetting, startReset] = useTransition();
  const sessionEventRef = useRef(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const locked = sessionStateKnown && requirementsConfirmed;
  useEffect(() => {
    let active = true;
    const reset = () => {
      sessionEventRef.current = true;
      setMessages([]);
      setMessage("");
      setError("");
      setRequirementsConfirmed(false);
      setSessionStateKnown(true);
    };
    const confirm = () => {
      sessionEventRef.current = true;
      setMessage("");
      setError("");
      setRequirementsConfirmed(true);
      setSessionStateKnown(true);
    };
    const reopen = () => {
      setRequirementsConfirmed(false);
      setSessionStateKnown(true);
      setError("");
    };
    window.addEventListener("tankfit-session-reset", reset);
    window.addEventListener("tankfit-requirements-confirmed", confirm);
    window.addEventListener("tankfit-requirements-reopened", reopen);
    fetch("/api/discovery")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (sessionEventRef.current) return;
        if (Array.isArray(data.messages)) setMessages(data.messages);
        const confirmed = data.requirementsConfirmed === true;
        setRequirementsConfirmed(confirmed);
        if (confirmed) setMessage("");
        setSessionStateKnown(true);
      })
      .catch(() => {
        if (active) setSessionStateKnown(true);
      });
    return () => {
      active = false;
      window.removeEventListener("tankfit-session-reset", reset);
      window.removeEventListener("tankfit-requirements-confirmed", confirm);
      window.removeEventListener("tankfit-requirements-reopened", reopen);
    };
  }, []);
  useEffect(() => {
    const conversation = conversationRef.current;
    if (!conversation || messages.length === 0) return;
    conversation.scrollTo({
      top: conversation.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);
  function resetDemo() {
    setError("");
    startReset(async () => {
      const result = await resetJourneyAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRequirementsConfirmed(false);
      setSessionStateKnown(true);
      setMessages([]);
      setMessage("");
      window.dispatchEvent(new Event("tankfit-session-reset"));
      window.dispatchEvent(new Event("tankfit-discovery-updated"));
    });
  }
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
        ref={conversationRef}
        role="log"
        aria-live="polite"
        className={`${compact ? "max-h-72" : "max-h-[32rem]"} space-y-4 overflow-y-auto break-words pr-1`}
      >
        {messages.length === 0 && (
          <div className="max-w-[88%] rounded-2xl rounded-tl-sm border bg-muted/35 px-4 py-3 text-sm">
            <p className="mb-1 text-xs font-semibold text-primary">
              TankFit AI
            </p>
            <p className="leading-relaxed">
              I can explain the fictional catalog or help you narrow down a
              monitoring solution. What would you like to know?
            </p>
          </div>
        )}
        {messages.map((entry, index) => (
          <div
            key={index}
            className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                entry.role === "user"
                  ? "rounded-tr-sm bg-primary text-primary-foreground"
                  : "rounded-tl-sm border bg-muted/35"
              }`}
            >
              <p
                className={`mb-1 text-xs font-semibold ${
                  entry.role === "user" ? "opacity-80" : "text-primary"
                }`}
              >
                {entry.role === "user" ? "You" : "TankFit AI"}
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </p>
            </div>
          </div>
        ))}
      </div>
      {messages.length === 0 && !locked && (
        <div
          aria-label="Suggested conversation starters"
          className="flex flex-wrap gap-2"
        >
          {starterPrompts.map((prompt) => (
            <Button
              key={prompt}
              onClick={() => setMessage(prompt)}
              size="sm"
              type="button"
              variant="outline"
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (pending || isResetting || locked || !message.trim()) return;
          setPending(true);
          setError("");
          try {
            const response = await fetch("/api/discovery", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message }),
            });
            const result = await response.json();
            if (response.status === 409) {
              setRequirementsConfirmed(true);
              setSessionStateKnown(true);
              setMessage("");
              throw new Error(confirmedMessage);
            }
            if (!response.ok)
              throw new Error(result.error ?? "Conversation unavailable.");
            setMessages(result.messages);
            setMessage("");
            if (result.guidedReviewRequired)
              setError(
                "AI fact extraction is temporarily unavailable. Review unknown values in the guided fields before continuing.",
              );
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
            disabled={pending || isResetting || locked}
            placeholder="Ask about the catalog, or describe what you need to monitor."
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <Button
          disabled={pending || isResetting || locked || !message.trim()}
          type="submit"
        >
          {pending ? "Thinking…" : "Send message"}
        </Button>
        {(error || locked) && (
          <p role="status" className="text-sm text-amber-200">
            {error || confirmedMessage}
          </p>
        )}
        {locked && (
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/demo/customer">Continue customer journey</Link>
            </Button>
            <Button
              disabled={isResetting}
              onClick={resetDemo}
              size="sm"
              type="button"
              variant="outline"
            >
              {isResetting ? "Resetting…" : "Reset demo"}
            </Button>
          </div>
        )}
      </form>
      {!locked && (
        <Link
          className="block text-sm text-primary underline"
          href="/demo/customer"
        >
          Review facts and continue the customer journey
        </Link>
      )}
    </section>
  );
}
