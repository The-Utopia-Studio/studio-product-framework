import type { AgentEvent, AgentEventLog, AgentRunRecord } from "./event-log";

/**
 * In-memory `AgentEventLog` for unit tests and local probes.
 * Also exposes `listEvents` so resume paths can be exercised without Convex.
 */
export type InMemoryEventLog = AgentEventLog & {
  readonly listEvents: (runId: string) => Promise<ReadonlyArray<AgentEvent>>;
  readonly getEventsSnapshot: () => ReadonlyArray<AgentEvent>;
};

export function createInMemoryEventLog(
  seed?: Partial<AgentRunRecord>,
): InMemoryEventLog {
  const runs = new Map<string, AgentRunRecord>();
  const events: AgentEvent[] = [];

  if (seed?.runId) {
    runs.set(seed.runId, {
      runId: seed.runId,
      userId: seed.userId ?? "u1",
      agentSlug: seed.agentSlug ?? "agent",
      goal: seed.goal ?? "goal",
      status: seed.status ?? "queued",
      lastSeq: seed.lastSeq ?? 0,
    });
  }

  return {
    getRun: async (runId) => runs.get(runId) ?? null,
    insertRun: async (record) => {
      runs.set(record.runId, record);
    },
    insertEvent: async (event) => {
      events.push(event);
    },
    setRunStatus: async ({ runId, status, lastSeq }) => {
      const run = runs.get(runId);
      if (!run) throw new Error(`missing run ${runId}`);
      runs.set(runId, { ...run, status, lastSeq });
    },
    listEvents: async (runId) =>
      events.filter((event) => event.runId === runId).sort((a, b) => a.seq - b.seq),
    getEventsSnapshot: () => [...events],
  };
}
