"use client";

import { useAuth } from "@clerk/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import Markdown from "react-markdown";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { api } from "../../../convex/_generated/api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

/**
 * Metered chat vertical: Convex action → rate limit → Effect debit → OpenRouter.
 * Falls back messaging when OPENROUTER_API_KEY is missing.
 */
export default function Chat() {
  const { isSignedIn } = useAuth();
  const balance = useQuery(api.wallet.getBalance, isSignedIn ? {} : "skip");
  const upsertUser = useMutation(api.users.upsertUser);
  const runInference = useAction(api.inference.runMeteredInference);
  const recentRuns = useQuery(
    api.inferenceStore.listRecent,
    isSignedIn ? {} : "skip",
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || busy) return;

    setError(null);
    setBusy(true);
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");

    try {
      await upsertUser({});
      const result = await runInference({
        messages: next.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: result.text,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inference failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col w-full py-16 justify-center items-center px-4">
      <div className="w-full max-w-xl mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Metered AI (Effect + OpenRouter)</span>
        <span>
          Credits:{" "}
          <strong className="text-foreground">{balance?.balance ?? "—"}</strong>
        </span>
      </div>

      {error ? (
        <p className="w-full max-w-xl mb-4 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="w-full max-w-xl space-y-4 mb-24">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[65%] px-3 py-1.5 text-sm shadow-sm",
                message.role === "user"
                  ? "bg-[#0B93F6] text-white rounded-2xl rounded-br-sm"
                  : "bg-[#E9E9EB] text-black rounded-2xl rounded-bl-sm",
              )}
            >
              <div className="prose-sm prose-p:my-0.5">
                <Markdown>{message.content}</Markdown>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        className="flex gap-2 justify-center w-full items-center fixed bottom-0"
        onSubmit={onSubmit}
      >
        <div className="flex flex-col gap-2 justify-center items-start mb-8 max-w-xl w-full border p-2 rounded-lg bg-white">
          <Input
            className="w-full border-0 shadow-none !ring-transparent"
            value={input}
            placeholder={busy ? "Thinking…" : "Ask something (1 credit)…"}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <div className="flex justify-between gap-3 items-center w-full px-1">
            <span className="text-xs text-muted-foreground">
              {recentRuns?.[0]
                ? `Last: ${recentRuns[0].status} · ${recentRuns[0].model}`
                : "Local wallet + optional Autumn"}
            </span>
            <Button size="sm" className="text-xs" disabled={busy}>
              {busy ? "Running…" : "Send"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
