import { ConvexError } from "convex/values";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { Doc, TableNames } from "../_generated/dataModel";

// Types for better DX
export type AuthUser = {
  subject: string;
  email?: string;
  name?: string;
};

export type AuthContext = {
  user: AuthUser;
  userId: string;
};

// Base auth helper - works for both queries and mutations
export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<AuthContext> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError({
      message: "Unauthorized: Authentication required",
      code: "UNAUTHORIZED",
    });
  }

  return {
    user: identity,
    userId: identity.subject,
  };
}

// Generic existence check for any document
export async function requireExists<T extends Doc<TableNames>>(
  resource: T | null,
  resourceType: string = "resource"
): Promise<NonNullable<T>> {
  console.log("resource", resource);
  if (!resource) {
    throw new ConvexError({
      message: `Not Found: ${resourceType} does not exist`,
      code: "NOT_FOUND",
    });
  }
  return resource;
}

// Specific ownership check for scripts
export async function requireScriptOwnership(
  ctx: QueryCtx | MutationCtx,
  script: Doc<"scripts"> | null,
  resourceType: string = "script"
): Promise<NonNullable<Doc<"scripts">>> {
  const { userId } = await requireAuth(ctx);
  const existingScript = await requireExists(script, resourceType);

  if (existingScript.userId !== userId) {
    throw new ConvexError({
      message: `Unauthorized: You don't have access to this ${resourceType}`,
      code: "FORBIDDEN",
    });
  }

  return existingScript;
}

// Safe auth check for queries that work with optional auth - as clerkjs first runs with no id before resolving
export async function getAuthState(
  ctx: QueryCtx | MutationCtx
): Promise<AuthContext | null> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  return {
    user: identity,
    userId: identity.subject,
  };
}
