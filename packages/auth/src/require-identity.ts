import { err, ok, studioError, type Result, type StudioError } from "@studio/core";
import type { StudioIdentity } from "./types";

/**
 * Pure guard used by orchestration layers.
 * Convex handlers should resolve identity first, then call this.
 */
export function requireIdentity(
  identity: StudioIdentity | null | undefined,
): Result<StudioIdentity, StudioError> {
  if (!identity) {
    return err(studioError("UNAUTHORIZED", "Not authenticated"));
  }
  return ok(identity);
}
