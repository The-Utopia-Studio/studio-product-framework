import { defineApp } from "convex/server";
import polar from "@convex-dev/polar/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import autumn from "@useautumn/convex/convex.config";

/**
 * Convex components registry — add sibling components here.
 * Catalog: https://www.convex.dev/components
 */
const app = defineApp();
app.use(polar);
app.use(rateLimiter);
app.use(autumn);

export default app;
