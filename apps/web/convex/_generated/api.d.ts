/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as autumn from "../autumn.js";
import type * as http from "../http.js";
import type * as inference from "../inference.js";
import type * as inferenceStore from "../inferenceStore.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_walletHelpers from "../lib/walletHelpers.js";
import type * as observabilityNode from "../observabilityNode.js";
import type * as rateLimitGuard from "../rateLimitGuard.js";
import type * as rateLimits from "../rateLimits.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";
import type * as wallet from "../wallet.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  autumn: typeof autumn;
  http: typeof http;
  inference: typeof inference;
  inferenceStore: typeof inferenceStore;
  "lib/auth": typeof lib_auth;
  "lib/walletHelpers": typeof lib_walletHelpers;
  observabilityNode: typeof observabilityNode;
  rateLimitGuard: typeof rateLimitGuard;
  rateLimits: typeof rateLimits;
  subscriptions: typeof subscriptions;
  users: typeof users;
  wallet: typeof wallet;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  polar: import("@convex-dev/polar/_generated/component.js").ComponentApi<"polar">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  autumn: import("@useautumn/convex/_generated/component.js").ComponentApi<"autumn">;
};
