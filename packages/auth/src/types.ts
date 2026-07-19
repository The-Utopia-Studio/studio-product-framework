/**
 * Identity contracts for Studio Product Framework.
 * Auth mechanics live in Convex + Clerk; this package owns shared shapes
 * so apps and services stay consistent.
 */
export type StudioIdentity = {
  readonly subject: string;
  readonly tokenIdentifier: string;
  readonly email?: string;
  readonly name?: string;
};

export type AuthenticatedUser = {
  readonly id: string;
  readonly identity: StudioIdentity;
};
