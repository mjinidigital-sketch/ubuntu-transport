import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new route
export const createRoute = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    order: v.number(),
    icon: v.optional(v.string()),
    parentId: v.optional(v.id("routes")),
    isActive: v.boolean(),
    openInNewTab: v.optional(v.boolean()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const routeId = await ctx.db.insert("routes", args);
    return routeId;
  },
});

// Get all routes
export const listRoutes = query({
  handler: async (ctx) => {
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_order")
      .collect();
    
    // Build tree structure
    type RouteWithChildren = typeof routes[0] & { children: RouteWithChildren[] };
    const routeMap = new Map<string, RouteWithChildren>();
    const rootRoutes: RouteWithChildren[] = [];
    
    // Initialize map with empty children arrays
    routes.forEach(route => {
      routeMap.set(route._id.toString(), { ...route, children: [] });
    });
    
    // Build tree
    routes.forEach(route => {
      const routeWithChildren = routeMap.get(route._id.toString());
      if (routeWithChildren) {
        if (route.parentId) {
          const parent = routeMap.get(route.parentId.toString());
          if (parent) {
            parent.children.push(routeWithChildren);
          }
        } else {
          rootRoutes.push(routeWithChildren);
        }
      }
    });
    
    return rootRoutes;
  },
});

// Get active routes only
export const listActiveRoutes = query({
  handler: async (ctx) => {
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_order")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Build tree structure
    type RouteWithChildren = typeof routes[0] & { children: RouteWithChildren[] };
    const routeMap = new Map<string, RouteWithChildren>();
    const rootRoutes: RouteWithChildren[] = [];
    
    // Initialize map with empty children arrays
    routes.forEach(route => {
      routeMap.set(route._id.toString(), { ...route, children: [] });
    });
    
    // Build tree
    routes.forEach(route => {
      const routeWithChildren = routeMap.get(route._id.toString());
      if (routeWithChildren) {
        if (route.parentId) {
          const parent = routeMap.get(route.parentId.toString());
          if (parent) {
            parent.children.push(routeWithChildren);
          }
        } else {
          rootRoutes.push(routeWithChildren);
        }
      }
    });
    
    return rootRoutes;
  },
});

// Get route by ID
export const getRoute = query({
  args: { id: v.id("routes") },
  handler: async (ctx, args) => {
    const route = await ctx.db.get(args.id);
    return route;
  },
});

// Update route
export const updateRoute = mutation({
  args: {
    id: v.id("routes"),
    title: v.optional(v.string()),
    url: v.optional(v.string()),
    order: v.optional(v.number()),
    icon: v.optional(v.string()),
    parentId: v.optional(v.id("routes")),
    isActive: v.optional(v.boolean()),
    openInNewTab: v.optional(v.boolean()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const route = await ctx.db.get(id);
    if (!route) {
      throw new Error("Route not found");
    }
    
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete route
export const deleteRoute = mutation({
  args: { id: v.id("routes") },
  handler: async (ctx, args) => {
    // First delete all child routes
    const childRoutes = await ctx.db
      .query("routes")
      .withIndex("by_parent", (q) => q.eq("parentId", args.id))
      .collect();
    
    for (const child of childRoutes) {
      await ctx.db.delete(child._id);
    }
    
    // Then delete the route
    await ctx.db.delete(args.id);
  },
});

// Reorder routes
export const reorderRoutes = mutation({
  args: {
    routeOrders: v.array(v.object({
      id: v.id("routes"),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    for (const { id, order } of args.routeOrders) {
      await ctx.db.patch(id, { order });
    }
  },
});

// Initialize default routes
export const initializeDefaultRoutes = mutation({
  handler: async (ctx) => {
    // Check if routes already exist
    const existingRoutes = await ctx.db.query("routes").collect();
    if (existingRoutes.length > 0) {
      return;
    }

    // Create default routes
    const defaultRoutes = [
      {
        title: "Home",
        url: "/",
        order: 1,
        icon: "🏠",
        isActive: true,
      },
      {
        title: "About",
        url: "/about",
        order: 2,
        icon: "ℹ️",
        isActive: true,
      },
      {
        title: "Services",
        url: "/services",
        order: 3,
        icon: "⚙️",
        isActive: true,
      },
      {
        title: "Portfolio",
        url: "/portfolio",
        order: 4,
        icon: "🎨",
        isActive: true,
      },
      {
        title: "Blog",
        url: "/blog",
        order: 5,
        icon: "📝",
        isActive: true,
      },
      {
        title: "Contact",
        url: "/contact",
        order: 6,
        icon: "📧",
        isActive: true,
      },
    ];

    for (const route of defaultRoutes) {
      await ctx.db.insert("routes", route);
    }
  },
});
