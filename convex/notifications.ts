import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Get notifications for current user
export const getNotifications = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        return notifications;
    },
});

// Get unread notifications count
export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return 0;

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        return notifications.filter((n) => !n.isRead).length;
    },
});

// Mark notification as read
export const markAsRead = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const notification = await ctx.db.get(args.notificationId);
        if (!notification) throw new Error("Notification not found");

        if (notification.userId !== userId) {
            throw new Error("Not authorized");
        }

        await ctx.db.patch(args.notificationId, { isRead: true });
    },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        for (const notification of notifications) {
            if (!notification.isRead) {
                await ctx.db.patch(notification._id, { isRead: true });
            }
        }
    },
});

// Delete notification
export const deleteNotification = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const notification = await ctx.db.get(args.notificationId);
        if (!notification) throw new Error("Notification not found");

        if (notification.userId !== userId) {
            throw new Error("Not authorized");
        }

        await ctx.db.delete(args.notificationId);
    },
});

// Admin function: Create notification for a user
export const createNotification = mutation({
    args: {
        userId: v.id("users"),
        title: v.string(),
        message: v.string(),
        type: v.union(
            v.literal("chat"),
            v.literal("form_submission"),
            v.literal("system"),
            v.literal("alert")
        ),
        link: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const currentUser = await ctx.db.get(userId);
        if (!currentUser) throw new Error("User not found");

        const isAdmin = currentUser.role === "admin" || currentUser.role === "superadmin";
        if (!isAdmin) throw new Error("Not authorized");

        await ctx.db.insert("notifications", {
            userId: args.userId,
            title: args.title,
            message: args.message,
            type: args.type,
            isRead: false,
            link: args.link,
            timestamp: Date.now(),
        });
    },
});
