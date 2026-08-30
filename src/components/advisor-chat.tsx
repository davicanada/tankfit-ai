"use client";

import { useState } from "react";
import { Bot, RotateCcw, Send, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { CompatibilityRequirements } from "@/domain/compatibility/types";
import type { AdvisorMessage, AdvisorReply } from "@/lib/ai/types";

type DisplayMessage = AdvisorMessage & {
  id: string;
  metadata?: Pick<AdvisorReply, "mode" | "provider" | "model" | "attempts">;
};

const initialMessage: DisplayMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Ask about this fictional tank-monitoring scenario, the recommendation, or a constraint. I will answer in the language you use.",
  metadata: {
    mode: "deterministic",
    provider: null,
    model: null,
    attempts: [],
  },
};

type AdvisorChatProps = {
  requirements: CompatibilityRequirements;
};

const providerLabels: Record<NonNullable<AdvisorReply["provider"]>, string> = {
  gemini: "Gemini",
  cerebras: "Cerebras",
  groq: "Groq",
  openrouter: "OpenRouter",
};

function providerLabel(provider: AdvisorReply["provider"]) {
  if (!provider) return "Guided mode";
  return providerLabels[provider];
}

export function AdvisorChat({ requirements }: AdvisorChatProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage() {
    const content = input.trim();
    if (!content || isSending) return;

    const visitorMessage: DisplayMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    const nextMessages = [...messages, visitorMessage].slice(-12);

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: text }) => ({
            role,
            content: text,
          })),
          requirements,
        }),
      });

      const body = (await response.json()) as AdvisorReply | { error?: string };
      if (!response.ok || !("answer" in body)) {
        throw new Error(
          "error" in body && body.error
            ? body.error
            : "The advisor could not answer this request.",
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: body.answer,
          metadata: {
            mode: body.mode,
            provider: body.provider,
            model: body.model,
            attempts: body.attempts,
          },
        },
      ]);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The advisor could not answer this request.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card className="mt-6 overflow-hidden border-primary/20 bg-card/90">
      <CardHeader className="border-b border-border/70">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">
              Step 3
            </p>
            <CardTitle className="mt-2 flex items-center gap-2">
              <Bot className="size-5 text-primary" /> Ask TankFit AI
            </CardTitle>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              AI explains the server-validated result. It cannot change
              compatibility, product facts, or review requirements.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setMessages([initialMessage]);
              setError(null);
            }}
            disabled={isSending}
          >
            <RotateCcw /> Clear chat
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="max-h-[430px] space-y-4 overflow-y-auto p-5 sm:p-6"
          aria-live="polite"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" ? (
                <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Bot className="size-4" />
                </div>
              ) : null}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background/70"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.role === "assistant" && message.metadata ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-2">
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10px]"
                    >
                      {providerLabel(message.metadata.provider)}
                    </Badge>
                    {message.metadata.model ? (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {message.metadata.model}
                      </span>
                    ) : null}
                    {message.metadata.attempts.some(
                      (attempt) => attempt.outcome === "failed",
                    ) ? (
                      <span className="text-[10px] text-amber-300">
                        Fallback activated
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {message.role === "user" ? (
                <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <UserRound className="size-4" />
                </div>
              ) : null}
            </div>
          ))}
          {isSending ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Bot className="size-4 animate-pulse" />
              </div>
              Checking the available AI providers…
            </div>
          ) : null}
        </div>

        <div className="border-t border-border/70 p-5 sm:p-6">
          {error ? (
            <p className="mb-3 text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <Textarea
              value={input}
              onChange={(event) => setInput(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              maxLength={1_200}
              rows={3}
              placeholder="Ask in English, French, Portuguese, Mandarin, Hindi, or another language…"
              aria-label="Message for TankFit AI"
              disabled={isSending}
            />
            <Button
              type="submit"
              className="sm:h-[76px] sm:w-28"
              disabled={isSending || !input.trim()}
            >
              <Send /> Send
            </Button>
          </form>
          <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
            Do not enter real personal, payment, customer, or confidential
            information.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
