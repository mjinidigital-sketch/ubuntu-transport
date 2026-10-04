import { defineApp } from "convex/server";
import { v } from "convex/values";

export default defineApp({
  env: {
    CONVEX_SITE_URL: v.optional(v.string()),
    NEXT_PUBLIC_CONVEX_SITE_URL: v.optional(v.string()),
  },
});
