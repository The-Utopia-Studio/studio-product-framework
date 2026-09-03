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
      decision: { approved: true },
    });
    expect(resolved.ok).toBe(true);
    expect((await log.getRun("r1"))?.status).toBe("running");
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
      decision: { approved: true },
    });
    expect(resolved.ok).toBe(false);
  });
});
