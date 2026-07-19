import { err, ok, studioError, type Result, type StudioError } from "@studio/core";

export type EmailMessage = {
  readonly to: string | ReadonlyArray<string>;
  readonly subject: string;
  readonly html: string;
  readonly text?: string;
  readonly from?: string;
  readonly replyTo?: string;
  readonly tags?: ReadonlyArray<{ name: string; value: string }>;
};

export type EmailProvider = {
  readonly send: (message: EmailMessage) => Promise<{ id: string }>;
};

/** Transactional email capability (Resend, etc.). Wire SDK in Convex actions. */
export async function sendEmail(
  provider: EmailProvider,
  message: EmailMessage,
): Promise<Result<{ id: string }, StudioError>> {
  if (!message.subject.trim()) {
    return err(studioError("VALIDATION", "Email subject is required"));
  }
  try {
    const result = await provider.send(message);
    return ok(result);
  } catch (cause) {
    return err(
      studioError("DELIVERY", "Failed to send email", {
        cause,
        retryable: true,
      }),
    );
  }
}

export function renderWelcomeEmail(input: {
  name: string;
  productName: string;
}): EmailMessage {
  return {
    to: "",
    subject: `Welcome to ${input.productName}`,
    html: `<h1>Welcome, ${input.name}</h1><p>You're in. Let's build.</p>`,
    text: `Welcome, ${input.name}. You're in. Let's build.`,
  };
}
