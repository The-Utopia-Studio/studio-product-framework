import { err, ok, studioError, type Result, type StudioError } from "@studio/core";

/**
 * Sandbox boundary for runtime agents (e.g. Daytona).
 * Never execute untrusted agent code inline in the Convex isolate.
 */
export type SandboxSession = {
  readonly id: string;
  readonly previewUrl?: string;
};

export type SandboxProvider = {
  readonly create: (input: {
    runId: string;
    userId: string;
  }) => Promise<SandboxSession>;
  readonly exec: (input: {
    sessionId: string;
    command: string;
  }) => Promise<{ stdout: string; stderr: string; exitCode: number }>;
  readonly destroy: (sessionId: string) => Promise<void>;
};

export async function createSandbox(
  provider: SandboxProvider,
  input: { runId: string; userId: string },
): Promise<Result<SandboxSession, StudioError>> {
  try {
    const session = await provider.create(input);
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
  input: { sessionId: string; command: string },
): Promise<
  Result<{ stdout: string; stderr: string; exitCode: number }, StudioError>
> {
  try {
    const result = await provider.exec(input);
    return ok(result);
  } catch (cause) {
    return err(
      studioError("INTERNAL", "Sandbox command failed", {
        cause,
        retryable: true,
      }),
    );
  }
}
