import { describe, expect, it } from "vitest";
import { createAgentRun } from "./event-log";
import { openHumanGate, resolveHumanGate } from "./human-gate";
import { createInMemoryEventLog } from "./in-memory-event-log";

describe("human-gate", () => {
  it("opens and resolves a gate", async () => {
    const log = createInMemoryEventLog();
    await createAgentRun(log, {
      runId: "r1",
      userId: "u1",
      agentSlug: "a",
      goal: "g",
    });

    const opened = await openHumanGate(log, {
      runId: "r1",
      reason: "approve publish",
    });
    expect(opened.ok).toBe(true);
    expect((await log.getRun("r1"))?.status).toBe("awaiting_human");

    const resolved = await resolveHumanGate(log, {
      runId: "r1",
      decision: { decision: "approved" },
      loopState: { step: 1 },
    });
    expect(resolved.ok).toBe(true);
    expect((await log.getRun("r1"))?.status).toBe("awaiting_human");
    const events = await log.listEvents("r1");
    const resolveEvent = events.find((e) => e.kind === "human_gate_resolved");
    expect(resolveEvent?.payload.loopState).toEqual({ step: 1 });
  });

  it("refuses resolve when not awaiting_human", async () => {
    const log = createInMemoryEventLog();
    await createAgentRun(log, {
      runId: "r2",
      userId: "u1",
      agentSlug: "a",
      goal: "g",
    });

    const resolved = await resolveHumanGate(log, {
      runId: "r2",
      decision: { decision: "approved" },
    });
    expect(resolved.ok).toBe(false);
  });

  it("refuses resolve without an explicit decision", async () => {
    const log = createInMemoryEventLog();
    await createAgentRun(log, {
      runId: "r3",
      userId: "u1",
      agentSlug: "a",
      goal: "g",
    });
    await openHumanGate(log, { runId: "r3", reason: "need approval" });

    const resolved = await resolveHumanGate(log, {
      runId: "r3",
      decision: { approved: true },
    });
    expect(resolved.ok).toBe(false);
  });
});
