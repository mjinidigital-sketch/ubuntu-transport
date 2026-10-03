import { QueryCtx, MutationCtx } from "./_generated/server";
import { ConvexError } from "convex/values";
import { auth } from "./auth";

// ⚠️ Order matters — least to most privileged
const ROLES = ["user", "customer", "staff", "admin", "superadmin"];
export type Role = "superadmin" | "admin" | "staff" | "customer" | "user";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");
    return identity;
}

export async function requireRole(
    ctx: QueryCtx | MutationCtx,
    requiredRole: Role
) {
    const identity = await getCurrentUser(ctx);

    // Get role from database to avoid stale JWT claim issues
    // Use the same approach as listUsers - get userId from auth
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found");

    const userRole = user.role ?? "user";

    const required = ROLES.indexOf(requiredRole);
    const actual = ROLES.indexOf(userRole);

    console.log("requireRole check:", { userRole, requiredRole, required, actual });

    if (actual < required) {
        throw new ConvexError({
            kind: "authorization",
            error: `Requires role: ${requiredRole}. You have: ${userRole}`,
        });
    }

    return identity;
}