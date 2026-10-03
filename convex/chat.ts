import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";
import { auth } from "./auth";
import type { MutationCtx } from "./_generated/server";

// Send a message to a user
export const sendMessage = mutation({
  args: {
    receiverId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Please sign in to send messages");
    }

    const sender = await ctx.db.get(userId);
    if (!sender) {
      throw new Error("User not found");
    }

    const receiver = await ctx.db.get(args.receiverId);
    if (!receiver) {
      throw new Error("Receiver not found");
    }

    // Find or create conversation between these two users
    let conversation = await findConversation(ctx, userId, args.receiverId);
    
    if (!conversation) {
      conversation = await createConversation(ctx, userId, args.receiverId);
    }

    // Insert the message
    const messageId = await ctx.db.insert("messages", {
      conversationId: conversation._id,
      senderId: userId,
      content: args.content,
      isRead: false,
    });

    // Update conversation's lastMessageAt
    await ctx.db.patch(conversation._id, {
      lastMessageAt: Date.now(),
    });

    // Create notification for receiver
    await ctx.db.insert("notifications", {
      userId: args.receiverId,
      title: `New message from ${sender.name || "User"}`,
      message: args.content.substring(0, 50) + (args.content.length > 50 ? "..." : ""),
      type: "chat",
      isRead: false,
      link: `/chat/${conversation._id}`,
      timestamp: Date.now(),
    });

    return { success: true, conversationId: conversation._id, messageId };
  },
});

// Get or create conversation with admin
export const getOrCreateAdminConversation = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Find an admin user
    const admins = await ctx.db
      .query("users")
      .filter((q) => 
        q.or(
          q.eq(q.field("role"), "admin"),
          q.eq(q.field("role"), "superadmin")
        )
      )
      .take(1);

    if (admins.length === 0) {
      throw new Error("No admin found");
    }

    const admin = admins[0];

    // Check if conversation already exists
    let conversation = await findConversation(ctx, userId, admin._id);
    
    if (!conversation) {
      conversation = await createConversation(ctx, userId, admin._id);
    }

    return { conversationId: conversation._id, adminId: admin._id };
  },
});

// Find an admin user (for user chat page)
export const findAdmin = query({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db
      .query("users")
      .filter((q) => 
        q.or(
          q.eq(q.field("role"), "admin"),
          q.eq(q.field("role"), "superadmin")
        )
      )
      .take(1);

    if (admins.length === 0) {
      return null;
    }

    const admin = admins[0];
    return {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      image: admin.image,
    };
  },
});

// List all conversations for the current user
export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return [];
    }

    const isAdmin = user.role === "admin" || user.role === "superadmin";

    let conversations: Doc<"conversations">[];

    if (isAdmin) {
      // Admin sees all conversations
      conversations = await ctx.db
        .query("conversations")
        .order("desc")
        .collect();
    } else {
      // Regular user sees only conversations they're part of
      const asParticipant1 = await ctx.db
        .query("conversations")
        .withIndex("by_participant1", (q) => q.eq("participant1Id", userId))
        .collect();
      
      const asParticipant2 = await ctx.db
        .query("conversations")
        .withIndex("by_participant2", (q) => q.eq("participant2Id", userId))
        .collect();

      conversations = [...asParticipant1, ...asParticipant2];
    }

    // Fetch conversation details with last message and user info
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // Determine the other participant
        const otherParticipantId = conv.participant1Id === userId 
          ? conv.participant2Id 
          : conv.participant1Id;
        
        const otherParticipant = await ctx.db.get(otherParticipantId);
        
        // Get last message
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .order("desc")
          .first();

        // Count unread messages
        const unreadCount = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .filter((q) => 
            q.and(
              q.neq(q.field("senderId"), userId),
              q.eq(q.field("isRead"), false)
            )
          )
          .collect()
          .then(msgs => msgs.length);

        return {
          _id: conv._id,
          participant: {
            _id: otherParticipantId,
            name: otherParticipant?.name || "Unknown",
            email: otherParticipant?.email,
            image: otherParticipant?.image,
          },
          lastMessage: lastMessage?.content,
          lastMessageAt: lastMessage 
            ? (await ctx.db.get(lastMessage._id))?._creationTime 
            : conv.lastMessageAt,
          unreadCount,
        };
      })
    );

    // Sort by last message time
    return conversationsWithDetails.sort((a, b) => {
      const aTime = a.lastMessageAt || 0;
      const bTime = b.lastMessageAt || 0;
      return bTime - aTime;
    });
  },
});

// List messages for a specific conversation
export const listMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return [];
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Check if user is part of this conversation
    const isAdmin = user.role === "admin" || user.role === "superadmin";
    const isParticipant = conversation.participant1Id === userId || conversation.participant2Id === userId;

    if (!isAdmin && !isParticipant) {
      throw new Error("Unauthorized: You are not part of this conversation");
    }

    // Get all messages in this conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    // Fetch sender details for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          senderName: sender?.name || "Unknown",
          senderImage: sender?.image,
        };
      })
    );

    return messagesWithSenders;
  },
});

// Mark messages as read
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Check if user is part of this conversation
    const isAdmin = user.role === "admin" || user.role === "superadmin";
    const isParticipant = conversation.participant1Id === userId || conversation.participant2Id === userId;

    if (!isAdmin && !isParticipant) {
      throw new Error("Unauthorized: You are not part of this conversation");
    }

    // Mark all messages from other participant as read
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const message of messages) {
      if (message.senderId !== userId && !message.isRead) {
        await ctx.db.patch(message._id, { isRead: true });
      }
    }

    return { success: true };
  },
});

// Get total unread message count
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return 0;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return 0;
    }

    const isAdmin = user.role === "admin" || user.role === "superadmin";

    if (isAdmin) {
      // Admin counts unread messages from all conversations
      const allConversations = await ctx.db
        .query("conversations")
        .collect();

      let totalUnread = 0;
      for (const conv of allConversations) {
        const unread = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .filter((q) => 
            q.and(
              q.neq(q.field("senderId"), userId),
              q.eq(q.field("isRead"), false)
            )
          )
          .collect();
        totalUnread += unread.length;
      }
      return totalUnread;
    } else {
      // Regular user counts unread from their conversations
      const asParticipant1 = await ctx.db
        .query("conversations")
        .withIndex("by_participant1", (q) => q.eq("participant1Id", userId))
        .collect();
      
      const asParticipant2 = await ctx.db
        .query("conversations")
        .withIndex("by_participant2", (q) => q.eq("participant2Id", userId))
        .collect();

      const allConversations = [...asParticipant1, ...asParticipant2];

      let totalUnread = 0;
      for (const conv of allConversations) {
        const unread = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .filter((q) => 
            q.and(
              q.neq(q.field("senderId"), userId),
              q.eq(q.field("isRead"), false)
            )
          )
          .collect();
        totalUnread += unread.length;
      }
      return totalUnread;
    }
  },
});

// Delete a conversation (admin only)
export const deleteConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const isAdmin = user.role === "admin" || user.role === "superadmin";
    if (!isAdmin) {
      throw new Error("Unauthorized: Only admins can delete conversations");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Delete all messages in the conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the conversation
    await ctx.db.delete(args.conversationId);

    return { success: true };
  },
});

// Helper function to find existing conversation between two users
async function findConversation(
  ctx: MutationCtx,
  userId1: Id<"users">,
  userId2: Id<"users">
): Promise<Doc<"conversations"> | null> {
  // Check if conversation exists with userId1 as participant1
  const conv1 = await ctx.db
    .query("conversations")
    .withIndex("by_participant1_and_participant2", (q: any) =>
      q.eq("participant1Id", userId1).eq("participant2Id", userId2)
    )
    .first();

  if (conv1) return conv1;

  // Check if conversation exists with userId1 as participant2
  const conv2 = await ctx.db
    .query("conversations")
    .withIndex("by_participant2_and_participant1", (q: any) =>
      q.eq("participant2Id", userId1).eq("participant1Id", userId2)
    )
    .first();

  if (conv2) return conv2;

  return null;
}

// Helper function to create a new conversation
async function createConversation(
  ctx: MutationCtx,
  userId1: Id<"users">,
  userId2: Id<"users">
): Promise<Doc<"conversations">> {
  const conversationId = await ctx.db.insert("conversations", {
    participant1Id: userId1,
    participant2Id: userId2,
    lastMessageAt: Date.now(),
    isArchived: false,
  });

  const conversation = await ctx.db.get(conversationId);
  if (!conversation) {
    throw new Error("Failed to create conversation");
  }

  return conversation;
}
