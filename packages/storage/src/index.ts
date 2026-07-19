import { err, ok, studioError, type Result, type StudioError } from "@studio/core";

/**
 * Object storage capability (Convex R2 / S3-compatible).
 * Never expose write credentials to the client — mint signed URLs server-side.
 */
export type StoredObject = {
  readonly key: string;
  readonly url: string;
  readonly contentType?: string;
  readonly sizeBytes?: number;
};

export type StorageProvider = {
  readonly createUploadUrl: (input: {
    key: string;
    contentType: string;
    maxBytes?: number;
  }) => Promise<{ uploadUrl: string; key: string }>;
  readonly getPublicUrl: (key: string) => Promise<string>;
  readonly deleteObject: (key: string) => Promise<void>;
};

export async function createUploadUrl(
  provider: StorageProvider,
  input: { key: string; contentType: string; maxBytes?: number },
): Promise<Result<{ uploadUrl: string; key: string }, StudioError>> {
  if (!input.key.trim()) {
    return err(studioError("VALIDATION", "Storage key is required"));
  }
  try {
    return ok(await provider.createUploadUrl(input));
  } catch (cause) {
    return err(
      studioError("INTERNAL", "Failed to create upload URL", {
        cause,
        retryable: true,
      }),
    );
  }
}

export async function resolvePublicUrl(
  provider: StorageProvider,
  key: string,
): Promise<Result<string, StudioError>> {
  try {
    return ok(await provider.getPublicUrl(key));
  } catch (cause) {
    return err(
      studioError("NOT_FOUND", "Failed to resolve object URL", {
        cause,
        retryable: true,
      }),
    );
  }
}
