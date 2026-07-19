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

export type OpenRouterTransport = {
  readonly postChatCompletions: (body: {
    model: string;
    messages: InferenceRequest["messages"];
  }) => Promise<{
    id?: string;
    choices: Array<{ message?: { content?: string | null } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  }>;
};

export function createOpenRouterGateway(
  transport: OpenRouterTransport,
  config: Pick<OpenRouterConfig, "defaultModel">,
): InferenceGateway {
  return {
    async complete(request: InferenceRequest): Promise<InferenceResponse> {
      const model = request.model || config.defaultModel;
      const response = await transport.postChatCompletions({
        model,
        messages: request.messages,
      });
      const text = response.choices[0]?.message?.content ?? "";
      return {
        text,
        model,
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        providerRequestId: response.id,
      };
    },
  };
}
