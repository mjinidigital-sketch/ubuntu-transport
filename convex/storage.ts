import { v } from "convex/values";
import { mutation, action } from "./_generated/server";

// Generate a storage URL for an uploaded file
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Upload an image and return its storage ID
export const uploadImage = action({
  args: {
    file: v.bytes(),
    fileName: v.string(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const blob = new Blob([args.file], { type: args.fileType });
    const storageId = await ctx.storage.store(blob);
    return storageId;
  },
});

// Get a storage URL from a storage ID
export const getStorageUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Delete a file from storage
export const deleteFile = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});
