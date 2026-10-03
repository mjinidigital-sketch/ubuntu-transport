import { mutation, query, action, internalMutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { auth } from "./auth";
import { invalidateSessions } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";


export const viewer = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;
        return await ctx.db.get(userId);
    },
});


// Admin/superadmin/staff only: list all users
export const listUsers = query({
    args: {},
    handler: async (ctx) => {
        // Get userId from auth
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        // Read role directly from DB — avoids stale JWT claim issues
        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        return await ctx.db.query("users").collect();
    },
});

// Admin/superadmin only: set role
export const setUserRole = action({
    args: {
        targetUserId: v.id("users"),
        newRole: v.union(
            v.literal("superadmin"),
            v.literal("admin"),
            v.literal("staff"),
            v.literal("customer"),
            v.literal("user"),
        ),
    },
    handler: async (ctx, args) => {
        // Get the current user's ID for authorization
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        // Get current user's role from database for authorization
        const currentUser = await ctx.runQuery(api.users.viewer, {});
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        // Update the role in the database
        await ctx.runMutation(internal.users.internalUpdateRole, {
            targetUserId: args.targetUserId,
            newRole: args.newRole,
        });

        // Invalidate the target user's sessions to force token refresh with new role
        // This ensures the JWT will reflect the updated role on next request
        await invalidateSessions(ctx, { userId: args.targetUserId });
    },
});

// Internal mutation to update role (called from action)
export const internalUpdateRole = internalMutation({
    args: {
        targetUserId: v.id("users"),
        newRole: v.union(
            v.literal("superadmin"),
            v.literal("admin"),
            v.literal("staff"),
            v.literal("customer"),
            v.literal("user"),
        ),
    },
    handler: async (ctx: any, args: any) => {
        const target = await ctx.db.get(args.targetUserId);
        if (!target) throw new ConvexError("Target user not found");
        await ctx.db.patch(args.targetUserId, { role: args.newRole });
    },
});

// Internal mutation to delete user (called from action)
export const internalDeleteUser = internalMutation({
    args: { targetUserId: v.id("users") },
    handler: async (ctx: any, args: any) => {
        const target = await ctx.db.get(args.targetUserId);
        if (!target) throw new ConvexError("Target user not found");
        await ctx.db.delete(args.targetUserId);
    },
});

// Admin/superadmin only: delete user (with session invalidation)
export const deleteUser = action({
    args: { targetUserId: v.id("users") },
    handler: async (ctx, args) => {
        // Get the current user's ID for authorization
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        // Get current user's role from database for authorization
        const currentUser = await ctx.runQuery(api.users.viewer, {});
        if (!currentUser) throw new ConvexError("User not found");

        const ALLOWED_ROLES = ["superadmin", "admin"];
        if (!currentUser.role || !ALLOWED_ROLES.includes(currentUser.role)) {
            throw new ConvexError("Not authorized");
        }

        // Invalidate the target user's sessions before deletion
        await invalidateSessions(ctx, { userId: args.targetUserId });

        // Delete the user
        await ctx.runMutation(internal.users.internalDeleteUser, {
            targetUserId: args.targetUserId,
        });
    },
});
