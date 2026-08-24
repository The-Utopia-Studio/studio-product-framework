"use client";

import { useAuth } from "@clerk/nextjs";
import { useAction, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { Globe, FileText, SendHorizontal, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import posthog from "posthog-js";
import { trackEvent, StudioEvents } from "@studio/observability";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { captureAppException } from "@/components/observability-provider";
import { api } from "../../../convex/_generated/api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: { name: string; args: Record<string, unknown> }[];
};

const EXAMPLE_PROMPTS = [
  "What's the weather like in San Francisco today?",
  "Summarize the top tech news from this week",
  "Explain this codebase's architecture in a few sentences",
];

function toolCallLabel(call: { name: string; args: Record<string, unknown> }) {
  if (call.name === "search_web") {
    return { icon: Globe, text: `Searched “${String(call.args.query ?? "")}”` };
  }
  if (call.name === "scrape_url") {
    return { icon: FileText, text: `Read ${String(call.args.url ?? "a page")}` };
  }
  return { icon: Sparkles, text: `Used ${call.name}` };
}

function ToolCallChips({
  calls,
}: {
  calls: { name: string; args: Record<string, unknown> }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {calls.map((call, i) => {
        const { icon: Icon, text } = toolCallLabel(call);
        return (
          <Badge key={i} variant="outline" className="text-muted-foreground gap-1">
            <Icon className="size-3" />
            {text}
          </Badge>
        );
      })}
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex items-start gap-2.5">
      <Avatar className="size-7 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          <Sparkles className="size-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { isSignedIn } = useAuth();
  const balance = useQuery(api.wallet.getBalance, isSignedIn ? {} : "skip");
  const enabledTools = useQuery(api.inference.getEnabledTools);
  const upsertUser = useMutation(api.users.upsertUser);
  const runInference = useAction(api.inference.runMeteredInference);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;

    setError(null);
    setBusy(true);
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");

    try {
      await upsertUser({});
      const result = await runInference({
        messages: next.map((m) => ({ role: m.role, content: m.content })),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: result.text,
          toolCalls: result.toolCalls,
        },
      ]);

      trackEvent(posthog, StudioEvents.inferenceCompleted, {
        model: result.model,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      });
    } catch (err) {
      const message =
        err instanceof ConvexError
          ? String(err.data)
          : err instanceof Error
            ? err.message
            : "Something went wrong answering that. Please try again.";
      setError(message);
      if (message.includes("run out of credits")) {
        trackEvent(posthog, StudioEvents.creditsExhausted);
      } else {
        captureAppException(err);
      }
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  const activeTools = [
    enabledTools?.webSearch ? { icon: Globe, label: "Web search" } : null,
    enabledTools?.pageReader ? { icon: FileText, label: "Page reader" } : null,
  ].filter((t): t is { icon: typeof Globe; label: string } => t !== null);

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] flex-col">
      <div className="flex items-center justify-between gap-4 border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold">Chat</h1>
          <span className="text-muted-foreground text-xs">Powered by OpenRouter</span>
          {activeTools.map(({ icon: Icon, label }) => (
            <Badge key={label} variant="secondary" className="gap-1 text-xs">
              <Icon className="size-3" />
              {label}
            </Badge>
          ))}
        </div>
        <Badge variant="outline" className="text-xs">
          {balance?.balance ?? "—"} credits
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
              <Sparkles className="text-primary size-6" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Ask me anything</p>
              <p className="text-muted-foreground text-sm">
                {activeTools.length > 0
                  ? "I can also search the web or read a page when it helps."
                  : "Each message costs 1 credit."}
              </p>
            </div>
            <div className="flex max-w-md flex-wrap justify-center gap-2">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => void send(prompt)}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full border px-3 py-1.5 text-xs transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-2.5",
                  message.role === "user" && "flex-row-reverse",
                )}
              >
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-xs",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {message.role === "user" ? "You" : <Sparkles className="size-3.5" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "flex max-w-[75%] flex-col gap-1.5",
                    message.role === "user" && "items-end",
                  )}
                >
                  {message.toolCalls && message.toolCalls.length > 0 ? (
                    <ToolCallChips calls={message.toolCalls} />
                  ) : null}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm",
                    )}
                  >
                    <div className="prose-sm dark:prose-invert max-w-none">
                      <Markdown>{message.content}</Markdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {busy ? <ThinkingBubble /> : null}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {error ? (
        <div className="border-t px-6 py-2">
          <p className="text-destructive mx-auto max-w-2xl text-xs">{error}</p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="border-t px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <Input
            value={input}
            placeholder={busy ? "Thinking…" : "Ask something (1 credit)…"}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={busy || !input.trim()}>
            <SendHorizontal className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
