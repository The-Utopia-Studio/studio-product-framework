import { err, ok, studioError, type Result, type StudioError } from "@studio/core";

/**
 * Web capability blocks for builder research + runtime agents.
 *
 * Which tool when (do not double-pay):
 * - Firecrawl  → URL → clean markdown / structured scrape (read)
 * - Parallel   → cited search / deep research / monitor / enrich
 * - Browserbase → real browser session (act, login walls, multi-step UI)
 */

export type FirecrawlConfig = {
  readonly apiKey: string;
  readonly baseUrl?: string;
};

export type ParallelConfig = {
  readonly apiKey: string;
  readonly baseUrl?: string;
};

export type BrowserbaseConfig = {
  readonly apiKey: string;
  readonly baseUrl?: string;
  readonly projectId?: string;
};

export type ScrapeResult = {
  readonly url: string;
  readonly markdown: string;
  readonly title?: string;
};

export type SearchHit = {
  readonly url: string;
  readonly title: string;
  readonly snippet?: string;
};

export type BrowserSession = {
  readonly id: string;
  readonly connectUrl?: string;
};

/** Firecrawl scrape — prefer for “give me this page as LLM markdown”. */
export async function scrapeUrl(
  config: FirecrawlConfig,
  input: { url: string },
): Promise<Result<ScrapeResult, StudioError>> {
  if (!config.apiKey) {
    return err(studioError("CONFIG", "FIRECRAWL_API_KEY is not set"));
  }
  if (!input.url.trim()) {
    return err(studioError("VALIDATION", "url is required"));
  }

  const base = config.baseUrl ?? "https://api.firecrawl.dev";
  try {
    const response = await fetch(`${base}/v1/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: input.url,
        formats: ["markdown"],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return err(
        studioError("EXTERNAL", `Firecrawl scrape failed: ${response.status}`, {
          cause: body,
          retryable: response.status >= 500,
        }),
      );
    }

    const json = (await response.json()) as {
      success?: boolean;
      data?: { markdown?: string; metadata?: { title?: string; sourceURL?: string } };
    };

    const markdown = json.data?.markdown ?? "";
    if (!markdown) {
      return err(studioError("EXTERNAL", "Firecrawl returned empty markdown"));
    }

    return ok({
      url: json.data?.metadata?.sourceURL ?? input.url,
      markdown,
      title: json.data?.metadata?.title,
    });
  } catch (cause) {
    return err(
      studioError("EXTERNAL", "Firecrawl request failed", {
        cause,
        retryable: true,
      }),
    );
  }
}

/** Parallel Search — prefer for cited, agent-grade web answers. */
export async function searchWeb(
  config: ParallelConfig,
  input: { query: string; maxResults?: number },
): Promise<Result<{ hits: SearchHit[] }, StudioError>> {
  if (!config.apiKey) {
    return err(studioError("CONFIG", "PARALLEL_API_KEY is not set"));
  }
  if (!input.query.trim()) {
    return err(studioError("VALIDATION", "query is required"));
  }

  const base = config.baseUrl ?? "https://api.parallel.ai";
  try {
    const response = await fetch(`${base}/v1/search`, {
      method: "POST",
      headers: {
        "x-api-key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        objective: input.query,
        search_queries: [input.query],
        mode: "basic",
        max_results: input.maxResults ?? 5,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return err(
        studioError("EXTERNAL", `Parallel search failed: ${response.status}`, {
          cause: body,
          retryable: response.status >= 500,
        }),
      );
    }

    const json = (await response.json()) as {
      results?: Array<{ url?: string; title?: string; excerpts?: string[] }>;
    };

    const hits: SearchHit[] = (json.results ?? [])
      .filter((r) => typeof r.url === "string")
      .map((r) => ({
        url: r.url as string,
        title: r.title ?? r.url ?? "",
        snippet: r.excerpts?.[0],
      }));

    return ok({ hits });
  } catch (cause) {
    return err(
      studioError("EXTERNAL", "Parallel request failed", {
        cause,
        retryable: true,
      }),
    );
  }
}

/** Browserbase session — prefer when the agent must *act* in a real browser. */
export async function createBrowserSession(
  config: BrowserbaseConfig,
): Promise<Result<BrowserSession, StudioError>> {
  if (!config.apiKey) {
    return err(studioError("CONFIG", "BROWSERBASE_API_KEY is not set"));
  }

  const base = config.baseUrl ?? "https://api.browserbase.com";
  try {
    const response = await fetch(`${base}/v1/sessions`, {
      method: "POST",
      headers: {
        "X-BB-API-Key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        config.projectId ? { projectId: config.projectId } : {},
      ),
    });

    if (!response.ok) {
      const body = await response.text();
      return err(
        studioError(
          "EXTERNAL",
          `Browserbase session failed: ${response.status}`,
          { cause: body, retryable: response.status >= 500 },
        ),
      );
    }

    const json = (await response.json()) as {
      id?: string;
      connectUrl?: string;
    };

    if (!json.id) {
      return err(studioError("EXTERNAL", "Browserbase returned no session id"));
    }

    return ok({ id: json.id, connectUrl: json.connectUrl });
  } catch (cause) {
    return err(
      studioError("EXTERNAL", "Browserbase request failed", {
        cause,
        retryable: true,
      }),
    );
  }
}
