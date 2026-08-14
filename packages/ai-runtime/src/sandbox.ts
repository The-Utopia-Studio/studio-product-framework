import { err, ok, studioError, type Result, type StudioError } from "@studio/core";

/**
 * Sandbox boundary for runtime agents (e.g. Daytona).
 * Never execute untrusted agent code inline in the Convex isolate.
 *
 * No concrete provider ships with this package today — wiring one in is
 * tracked separately. `createSandbox` refuses to proceed unless the
 * provider's own session self-reports real isolation, so a naive stand-in
 * (e.g. a local `child_process` shim) fails loudly on its first call
 * instead of silently pretending to be safe.
 */
export type SandboxIsolation = {
  readonly filesystem: "isolated" | "shared";
  readonly network: "none" | "allowlisted" | "unrestricted";
  /** "scrubbed": the sandboxed process does not inherit host process.env. */
  readonly env: "scrubbed" | "inherited";
};

export type SandboxSession = {
  readonly id: string;
  readonly previewUrl?: string;
  readonly isolation: SandboxIsolation;
};

export type SandboxProvider = {
  readonly create: (input: {
    runId: string;
    userId: string;
  }) => Promise<SandboxSession>;
  readonly exec: (input: {
    sessionId: string;
    command: string;
    timeoutMs?: number;
  }) => Promise<{ stdout: string; stderr: string; exitCode: number }>;
  readonly destroy: (sessionId: string) => Promise<void>;
};

const DEFAULT_EXEC_TIMEOUT_MS = 120_000;
const MAX_OUTPUT_CHARS = 100_000;

function truncate(text: string): string {
  return text.length > MAX_OUTPUT_CHARS
    ? `${text.slice(0, MAX_OUTPUT_CHARS)}\n...[truncated ${text.length - MAX_OUTPUT_CHARS} chars]`
    : text;
}

export async function createSandbox(
  provider: SandboxProvider,
  input: { runId: string; userId: string },
): Promise<Result<SandboxSession, StudioError>> {
  try {
    const session = await provider.create(input);
    if (
      session.isolation.filesystem !== "isolated" ||
      session.isolation.env !== "scrubbed"
    ) {
      return err(
        studioError(
          "VALIDATION",
          "Sandbox provider does not attest to filesystem isolation and a scrubbed environment — refusing to run untrusted agent code",
          { retryable: false },
        ),
      );
    }
    return ok(session);
  } catch (cause) {
    return err(
      studioError("INTERNAL", "Failed to create agent sandbox", {
        cause,
        retryable: true,
      }),
    );
  }
}

export async function execInSandbox(
  provider: SandboxProvider,
  input: { sessionId: string; command: string; timeoutMs?: number },
): Promise<
  Result<{ stdout: string; stderr: string; exitCode: number }, StudioError>
> {
  try {
    const result = await provider.exec({
      ...input,
      timeoutMs: input.timeoutMs ?? DEFAULT_EXEC_TIMEOUT_MS,
    });
    return ok({
      stdout: truncate(result.stdout),
      stderr: truncate(result.stderr),
      exitCode: result.exitCode,
    });
  } catch (cause) {
    return err(
      studioError("INTERNAL", "Sandbox command failed", {
        cause,
        retryable: true,
      }),
    );
  }
}
