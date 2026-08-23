import type {
  InferenceGateway,
  InferenceRequest,
  InferenceResponse,
} from "@studio/effect-critical";

/**
 * OpenRouter-oriented gateway adapter.
 * Wire API keys and HTTP in Convex "use node" actions; keep this pure.
 */
export type OpenRouterConfig = {
  readonly apiKey: string;
  readonly baseUrl?: string;
  readonly defaultModel: string;
};

type WireMessage = {
  readonly role: "system" | "user" | "assistant" | "tool";
  readonly content: string | null;
  readonly tool_calls?: ReadonlyArray<ToolCallWire>;
  readonly tool_call_id?: string;
};

type ToolCallWire = {
  readonly id: string;
  readonly function: { readonly name: string; readonly arguments: string };
};

export type OpenRouterTransport = {
  readonly postChatCompletions: (body: {
    model: string;
    messages: ReadonlyArray<WireMessage>;
    tools?: ReadonlyArray<{ type: "function"; function: ToolDefinition }>;
    tool_choice?: "auto";
  }) => Promise<{
    id?: string;
    choices: Array<{
      message?: {
        content?: string | null;
        tool_calls?: ReadonlyArray<ToolCallWire>;
      };
    }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  }>;
};

// A plain JSON-schema function definition — deliberately generic, this
// package has no idea what "search the web" means, just how to describe and
// invoke a function via OpenRouter's OpenAI-compatible tool-calling wire
// format.
export type ToolDefinition = {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
};

// Returns the tool's result already rendered as the string to feed back to
// the model — the caller decides how to serialize its own result shape.
export type ToolExecutor = (
  name: string,
  args: Record<string, unknown>,
) => Promise<string>;

export type ToolConfig = {
  readonly tools: ReadonlyArray<ToolDefinition>;
  readonly executeTool: ToolExecutor;
};

export function createOpenRouterGateway(
  transport: OpenRouterTransport,
  config: Pick<OpenRouterConfig, "defaultModel">,
  toolConfig?: ToolConfig,
): InferenceGateway {
  return {
    async complete(request: InferenceRequest): Promise<InferenceResponse> {
      const model = request.model || config.defaultModel;
      const baseMessages: WireMessage[] = request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const hasTools = Boolean(toolConfig && toolConfig.tools.length > 0);

      const first = await transport.postChatCompletions({
        model,
        messages: baseMessages,
        ...(hasTools && toolConfig
          ? {
              tools: toolConfig.tools.map((t) => ({
                type: "function" as const,
                function: t,
              })),
              tool_choice: "auto" as const,
            }
          : {}),
      });

      const firstMessage = first.choices[0]?.message;
      const requestedCalls = firstMessage?.tool_calls ?? [];
      const inputTokens = first.usage?.prompt_tokens ?? 0;
      const outputTokens = first.usage?.completion_tokens ?? 0;

      if (requestedCalls.length === 0 || !toolConfig) {
        return {
          text: firstMessage?.content ?? "",
          model,
          inputTokens,
          outputTokens,
          providerRequestId: first.id,
          toolCalls: [],
        };
      }

      // One round only — execute what was requested, then force a final
      // natural-language answer. No multi-hop agent loop.
      const toolCallRecords: Array<{
        name: string;
        args: Record<string, unknown>;
      }> = [];
      const toolResultMessages: WireMessage[] = [];
      for (const call of requestedCalls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {
          // malformed arguments — proceed with {} rather than failing the
          // whole turn over one bad tool call.
        }
        toolCallRecords.push({ name: call.function.name, args });
        let resultText: string;
        try {
          resultText = await toolConfig.executeTool(call.function.name, args);
        } catch (err) {
          resultText = `Error: ${err instanceof Error ? err.message : "tool call failed"}`;
        }
        toolResultMessages.push({
          role: "tool",
          content: resultText,
          tool_call_id: call.id,
        });
      }

      const second = await transport.postChatCompletions({
        model,
        messages: [
          ...baseMessages,
          {
            role: "assistant",
            content: firstMessage?.content ?? null,
            tool_calls: requestedCalls,
          },
          ...toolResultMessages,
        ],
      });
      const secondMessage = second.choices[0]?.message;

      return {
        text: secondMessage?.content ?? "",
        model,
        inputTokens: inputTokens + (second.usage?.prompt_tokens ?? 0),
        outputTokens: outputTokens + (second.usage?.completion_tokens ?? 0),
        providerRequestId: second.id ?? first.id,
        toolCalls: toolCallRecords,
      };
    },
  };
}
