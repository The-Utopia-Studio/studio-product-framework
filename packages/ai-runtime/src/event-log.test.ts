import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AGENT_EVENT_KINDS,
  AGENT_RUN_STATUSES,
  TERMINAL_RUN_STATUSES,
  appendAgentEvent,
  createAgentRun,
  isTerminalRunStatus,
  updateAgentRunStatus,
  type AgentEvent,
  type AgentEventLog,
  type AgentRunRecord,
} from "./event-log";
import type { AgentRunStatus } from "./types";

/** In-memory AgentEventLog that records every call, so we can assert on writes. */
function memoryLog(seed?: Partial<AgentRunRecord>) {
  const runs = new Map<string, AgentRunRecord>();
  const events: AgentEvent[] = [];
  const calls: string[] = [];

  if (seed?.runId) {
    runs.set(seed.runId, {
      runId: seed.runId,
      userId: seed.userId ?? "u1",
      agentSlug: seed.agentSlug ?? "researcher",
      goal: seed.goal ?? "do the thing",
      status: seed.status ?? "queued",
      lastSeq: seed.lastSeq ?? 0,
    });
  }

  const log: AgentEventLog = {
    getRun: async (runId) => {
      calls.push("getRun");
      return runs.get(runId) ?? null;
    },
    insertRun: async (record) => {
      calls.push("insertRun");
      runs.set(record.runId, record);
    },
    insertEvent: async (event) => {
      calls.push("insertEvent");
      events.push(event);
    },
    setRunStatus: async ({ runId, status, lastSeq, errorMessage }) => {
      calls.push("setRunStatus");
      const run = runs.get(runId);
      if (!run) throw new Error("missing run");
      runs.set(runId, { ...run, status, lastSeq });
      if (errorMessage !== undefined) {
        void errorMessage;
      }
    },
  };

  return { log, runs, events, calls };
}

const throwingLog: AgentEventLog = {
  getRun: async () => {
    throw new Error("db down");
  },
  insertRun: async () => {},
  insertEvent: async () => {},
  setRunStatus: async () => {},
};

describe("createAgentRun", () => {
  it("opens a run as queued with no events yet", async () => {
    const { log } = memoryLog();
    const result = await createAgentRun(log, {
      runId: "r1",
      userId: "u1",
      agentSlug: "researcher",
      goal: "summarise the inbox",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("queued");
      expect(result.value.lastSeq).toBe(0);
    }
  });

  it.each(["runId", "userId", "agentSlug", "goal"] as const)(
    "refuses a blank %s",
    async (field) => {
      const { log } = memoryLog();
      const input = {
        runId: "r1",
        userId: "u1",
        agentSlug: "researcher",
        goal: "g",
        [field]: "   ",
      };
      const result = await createAgentRun(log, input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION");
        expect(result.error.message).toContain(field);
      }
    },
  );

  it("refuses a duplicate runId instead of overwriting the first run", async () => {
    const { log, runs } = memoryLog({ runId: "r1", goal: "original goal" });
    const result = await createAgentRun(log, {
      runId: "r1",
      userId: "u2",
      agentSlug: "other",
      goal: "different goal",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("VALIDATION");
    // The original survived — this is the audit guarantee.
    expect(runs.get("r1")?.goal).toBe("original goal");
  });

  it("reports a storage fault as a retryable INTERNAL error", async () => {
    const result = await createAgentRun(throwingLog, {
      runId: "r1",
      userId: "u1",
      agentSlug: "a",
      goal: "g",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INTERNAL");
      expect(result.error.retryable).toBe(true);
    }
  });
});

describe("appendAgentEvent", () => {
  it("numbers the first event seq 1", async () => {
    const { log } = memoryLog({ runId: "r1", status: "running" });
    const result = await appendAgentEvent(log, {
      runId: "r1",
      kind: "run_started",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.seq).toBe(1);
  });

  it("assigns seq monotonically across appends", async () => {
    const { log, events } = memoryLog({ runId: "r1", status: "running" });
    for (const kind of ["run_started", "tool_called", "tool_result"] as const) {
      const r = await appendAgentEvent(log, { runId: "r1", kind });
      expect(r.ok).toBe(true);
    }
    expect(events.map((e) => e.seq)).toEqual([1, 2, 3]);
  });

  it("advances the run's lastSeq so the next append cannot reuse a number", async () => {
    const { log, runs } = memoryLog({ runId: "r1", status: "running" });
    await appendAgentEvent(log, { runId: "r1", kind: "run_started" });
    expect(runs.get("r1")?.lastSeq).toBe(1);
    await appendAgentEvent(log, { runId: "r1", kind: "stage_entered" });
    expect(runs.get("r1")?.lastSeq).toBe(2);
  });

  it("ignores a seq supplied in the payload — seq is assigned, not accepted", async () => {
    const { log, events } = memoryLog({ runId: "r1", status: "running" });
    await appendAgentEvent(log, {
      runId: "r1",
      kind: "tool_called",
      payload: { seq: 999 },
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.seq).toBe(1);
    expect(events[0]?.payload).toEqual({ seq: 999 });
  });

  it("only ever inserts an event — never updates or deletes one", async () => {
    const { log, calls } = memoryLog({ runId: "r1", status: "running" });
    await appendAgentEvent(log, { runId: "r1", kind: "run_started" });
    await appendAgentEvent(log, { runId: "r1", kind: "tool_called" });
    // insertEvent is the only event-touching call the port exposes; assert it is
    // the only one used, and that it was used once per append.
    expect(calls.filter((c) => c === "insertEvent")).toHaveLength(2);
  });

  it("refuses an unknown event kind", async () => {
    const { log } = memoryLog({ runId: "r1", status: "running" });
    const result = await appendAgentEvent(log, {
      runId: "r1",
      // deliberately outside the union
      kind: "not_a_kind" as never,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("VALIDATION");
  });

  it("refuses an event for a run that does not exist", async () => {
    const { log } = memoryLog();
    const result = await appendAgentEvent(log, {
      runId: "ghost",
      kind: "run_started",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
  });

  it.each(TERMINAL_RUN_STATUSES)(
    "refuses an append to a run that is already %s",
    async (status) => {
      const { log, events } = memoryLog({ runId: "r1", status });
      const result = await appendAgentEvent(log, {
        runId: "r1",
        kind: "tool_called",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION");
        expect(result.error.retryable).toBe(false);
      }
      expect(events).toHaveLength(0);
    },
  );

  it("refuses an oversized payload rather than writing an unbounded row", async () => {
    const { log } = memoryLog({ runId: "r1", status: "running" });
    const result = await appendAgentEvent(log, {
      runId: "r1",
      kind: "tool_result",
      payload: { blob: "x".repeat(70_000) },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION");
      expect(result.error.message).toContain("max");
    }
  });

  // Greptile P1 on this PR: JSON.stringify throws on a bigint and renders an
  // ArrayBuffer as "{}", so the old size check either escaped the Result
  // contract or let a multi-megabyte byte payload through.
  it("measures a bigint payload instead of throwing on it", async () => {
    const { log } = memoryLog({ runId: "r1", status: "running" });
    const result = await appendAgentEvent(log, {
      runId: "r1",
      kind: "tool_result",
      payload: { tokens: 9_007_199_254_740_993n },
    });
    expect(result.ok).toBe(true);
  });

  // A raw ArrayBuffer is the real bypass: JSON.stringify renders it "{}", so the
  // old check measured a 70KB buffer as 11 bytes. (A typed-array view expands to
  // indexed keys instead, so it happened to trip the limit by accident.)
  it.each([
    ["ArrayBuffer", new ArrayBuffer(70_000)],
    ["Uint8Array", new Uint8Array(70_000)],
  ])("refuses an oversized %s payload", async (_label, blob) => {
    const { log } = memoryLog({ runId: "r1", status: "running" });
    const result = await appendAgentEvent(log, {
      runId: "r1",
      kind: "tool_result",
      payload: { blob },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION");
      expect(result.error.message).toContain("max");
    }
  });

  it("rejects a cyclic payload as unstorable rather than throwing", async () => {
    const { log } = memoryLog({ runId: "r1", status: "running" });
    const cyclic: Record<string, unknown> = { name: "loop" };
    cyclic.self = cyclic;
    const result = await appendAgentEvent(log, {
      runId: "r1",
      kind: "error",
      payload: cyclic,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION");
      expect(result.error.message).toContain("cycle");
    }
  });

  it("accepts a payload that repeats a value without calling it a cycle", async () => {
    const { log } = memoryLog({ runId: "r1", status: "running" });
    const shared = { id: "tool-1" };
    const result = await appendAgentEvent(log, {
      runId: "r1",
      kind: "tool_called",
      payload: { first: shared, second: shared },
    });
    expect(result.ok).toBe(true);
  });

  it("stamps createdAt from the injected clock", async () => {
    const { log } = memoryLog({ runId: "r1", status: "running" });
    const result = await appendAgentEvent(
      log,
      { runId: "r1", kind: "run_started" },
      1_700_000_000_000,
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.createdAt).toBe(1_700_000_000_000);
  });
});

describe("updateAgentRunStatus", () => {
  it("moves a queued run to running", async () => {
    const { log, runs } = memoryLog({ runId: "r1", status: "queued" });
    const result = await updateAgentRunStatus(log, {
      runId: "r1",
      status: "running",
    });
    expect(result.ok).toBe(true);
    expect(runs.get("r1")?.status).toBe("running");
  });

  it("refuses an unknown status", async () => {
    const { log } = memoryLog({ runId: "r1" });
    const result = await updateAgentRunStatus(log, {
      runId: "r1",
      status: "vibing" as never,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("VALIDATION");
  });

  it("refuses a status change on a run that does not exist", async () => {
    const { log } = memoryLog();
    const result = await updateAgentRunStatus(log, {
      runId: "ghost",
      status: "running",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
  });

  it.each(TERMINAL_RUN_STATUSES)(
    "will not reopen a run that is already %s",
    async (status) => {
      const { log, runs } = memoryLog({ runId: "r1", status });
      const result = await updateAgentRunStatus(log, {
        runId: "r1",
        status: "running",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.retryable).toBe(false);
      expect(runs.get("r1")?.status).toBe(status);
    },
  );

  it("will not mark a run failed without a reason", async () => {
    const { log } = memoryLog({ runId: "r1", status: "running" });
    const result = await updateAgentRunStatus(log, {
      runId: "r1",
      status: "failed",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("errorMessage");
    }
  });

  it("accepts a failure that carries a reason", async () => {
    const { log, runs } = memoryLog({ runId: "r1", status: "running" });
    const result = await updateAgentRunStatus(log, {
      runId: "r1",
      status: "failed",
      errorMessage: "tool timeout after 3 retries",
    });
    expect(result.ok).toBe(true);
    expect(runs.get("r1")?.status).toBe("failed");
  });
});

describe("status and kind constants", () => {
  it("AGENT_RUN_STATUSES covers the AgentRunStatus union exactly", () => {
    // The `satisfies` in event-log.ts stops a status being invented here; this
    // catches the other direction — a status added to the type and forgotten.
    const fromType: Record<AgentRunStatus, true> = {
      queued: true,
      running: true,
      awaiting_tool: true,
      succeeded: true,
      failed: true,
      cancelled: true,
    };
    expect([...AGENT_RUN_STATUSES].sort()).toEqual(
      Object.keys(fromType).sort(),
    );
  });

  it("marks exactly the finished statuses as terminal", () => {
    const terminal = AGENT_RUN_STATUSES.filter(isTerminalRunStatus);
    expect(terminal.sort()).toEqual([...TERMINAL_RUN_STATUSES].sort());
    expect(isTerminalRunStatus("running")).toBe(false);
    expect(isTerminalRunStatus("queued")).toBe(false);
  });

  it("distinguishes a blocked action from an error", () => {
    // An eval needs to tell "the guard worked" apart from "the run broke".
    expect(AGENT_EVENT_KINDS).toContain("action_blocked");
    expect(AGENT_EVENT_KINDS).toContain("error");
  });
});

describe("the Convex adapter is append-only", () => {
  // The port has no update or delete for events, so the type system already
  // prevents this. This guards the storage layer itself: a future edit to
  // agentRuns.ts could reach past the port straight to ctx.db.
  it("never patches, replaces, or deletes an agentEvents row", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const adapterPath = resolve(
      here,
      "../../../apps/web/convex/agentRuns.ts",
    );
    // Deliberately not a soft skip: if this file moves, the guarantee needs
    // re-asserting at the new path, not silently dropping.
    const source = readFileSync(adapterPath, "utf8");

    expect(source).toContain('ctx.db.insert("agentEvents"');
    for (const forbidden of ["agentEvents\").delete", "delete(", "replace("]) {
      const onEvents = new RegExp(
        `${forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^\\n]*agentEvents`,
      );
      expect(source).not.toMatch(onEvents);
    }
    // The only patch in the adapter is on agentRuns (the mutable run index).
    const patches = source.match(/ctx\.db\.patch\([^)]*\)/g) ?? [];
    expect(patches.length).toBeLessThanOrEqual(1);
  });

  // Greptile P1 on this PR: the read path used to .take(500) with no cursor, so
  // a long run's history was silently truncated for audit and eval consumers.
  it("paginates the event read path instead of silently truncating it", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(
      resolve(here, "../../../apps/web/convex/agentRuns.ts"),
      "utf8",
    );

    expect(source).toContain("afterSeq");
    expect(source).toContain("hasMore");
    // Over-fetch by one is what makes hasMore truthful.
    expect(source).toMatch(/take\(limit \+ 1\)/);
    // No unbounded-looking fixed take on the query path.
    expect(source).not.toMatch(/\.take\(500\)/);
  });
});
