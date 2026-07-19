import { Effect } from "effect";
import { DeliveryError } from "./errors";

export type DeliveryMessage = {
  readonly channel: "email" | "imessage" | "webhook" | "push";
  readonly to: string;
  readonly body: string;
  readonly idempotencyKey: string;
};

export type DeliveryTransport = {
  readonly send: (
    message: DeliveryMessage,
  ) => Promise<{ messageId: string }>;
};

/** Delivery paths where silent failure breaks trust. */
export function deliverMessage(
  transport: DeliveryTransport,
  message: DeliveryMessage,
): Effect.Effect<{ messageId: string }, DeliveryError> {
  return Effect.tryPromise({
    try: () => transport.send(message),
    catch: (cause) =>
      new DeliveryError({
        channel: message.channel,
        message:
          cause instanceof Error ? cause.message : "Delivery failed",
        retryable: true,
        cause,
      }),
  });
}
