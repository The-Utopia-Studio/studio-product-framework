import { getAuth } from "@clerk/react-router/ssr.server";
import type { LoaderFunctionArgs } from "react-router";

/** Clerk JWT for Convex SSR fetchQuery / fetchAction / fetchMutation. */
export async function getConvexToken(args: LoaderFunctionArgs) {
  const auth = await getAuth(args);
  if (!auth.userId) {
    return null;
  }
  const token = await auth.getToken({ template: "convex" });
  return token;
}
