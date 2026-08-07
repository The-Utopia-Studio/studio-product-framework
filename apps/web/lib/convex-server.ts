import { auth } from "@clerk/nextjs/server";

/** Clerk JWT for Convex SSR fetchQuery / fetchAction / fetchMutation. */
export async function getConvexToken() {
  const session = await auth();
  if (!session.userId) {
    return null;
  }
  return session.getToken({ template: "convex" });
}
