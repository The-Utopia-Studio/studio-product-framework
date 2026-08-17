import { describe, expect, it } from "vitest";
import { createSandbox, execInSandbox } from "./sandbox";
import type { SandboxIsolation, SandboxProvider } from "./sandbox";

function providerReporting(isolation: SandboxIsolation): SandboxProvider {
  return {
    create: async () => ({ id: "sess-1", isolation }),
    exec: async () => ({ stdout: "ok", stderr: "", exitCode: 0 }),
    destroy: async () => {},
  };
}

describe("createSandbox", () => {
  it("succeeds when the provider attests to real isolation", async () => {
    const provider = providerReporting({
      filesystem: "isolated",
      network: "none",
      env: "scrubbed",
    });
    const result = await createSandbox(provider, {
      runId: "r1",
      userId: "u1",
    });
    expect(result.ok).toBe(true);
  });

  it("refuses a provider that shares the host filesystem", async () => {
    const provider = providerReporting({
      filesystem: "shared",
      network: "none",
      env: "scrubbed",
    });
    const result = await createSandbox(provider, {
      runId: "r1",
      userId: "u1",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION");
    }
  });

  it("refuses a provider that inherits the host environment", async () => {
    const provider = providerReporting({
      filesystem: "isolated",
      network: "none",
      env: "inherited",
    });
    const result = await createSandbox(provider, {
      runId: "r1",
      userId: "u1",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION");
    }
  });

  it("wraps a provider throw as a retryable INTERNAL error", async () => {
    const provider: SandboxProvider = {
      create: async () => {
        throw new Error("boom");
      },
      exec: async () => ({ stdout: "", stderr: "", exitCode: 0 }),
      destroy: async () => {},
    };
    const result = await createSandbox(provider, {
      runId: "r1",
      userId: "u1",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INTERNAL");
      expect(result.error.retryable).toBe(true);
    }
  });
});

describe("execInSandbox", () => {
  it("truncates oversized output instead of returning it unbounded", async () => {
    const huge = "x".repeat(200_000);
    const provider: SandboxProvider = {
      create: async () => ({
        id: "sess-1",
        isolation: { filesystem: "isolated", network: "none", env: "scrubbed" },
      }),
      exec: async () => ({ stdout: huge, stderr: "", exitCode: 0 }),
      destroy: async () => {},
    };
    const result = await execInSandbox(provider, {
      sessionId: "sess-1",
      command: "echo",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.stdout.length).toBeLessThan(huge.length);
      expect(result.value.stdout).toContain("[truncated");
    }
  });

  it("passes a default timeout through to the provider when none is given", async () => {
    let receivedTimeout: number | undefined;
    const provider: SandboxProvider = {
      create: async () => ({
        id: "sess-1",
        isolation: { filesystem: "isolated", network: "none", env: "scrubbed" },
      }),
      exec: async (input) => {
        receivedTimeout = input.timeoutMs;
        return { stdout: "", stderr: "", exitCode: 0 };
      },
      destroy: async () => {},
    };
    await execInSandbox(provider, { sessionId: "sess-1", command: "echo" });
    expect(receivedTimeout).toBeGreaterThan(0);
  });
});
