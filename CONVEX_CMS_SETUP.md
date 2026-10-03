# Setup Guide: Real-Time Page Builder CMS with Next.js & Convex

This guide provides a production-ready blueprint for building a dynamic, drag-and-drop page builder using the **Next.js App Router**, **Convex** (for reactive data handling), and **@dnd-kit** (for reordering layout components).

---

## 🛠️ Tech Stack & Architecture
- **Framework:** Next.js (App Router)
- **Database & Real-time Layer:** Convex (Real-time queries & mutations)
- **Styling:** Tailwind CSS
- **Drag-and-Drop Engines:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

---

## 1. Database Configuration (`convex/schema.ts`)
Convex handles schematized arrays seamlessly. Define the document properties where each page stores a title, a slug pattern, and an array of reactive UI blocks.

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pages: defineTable({
    title: v.string(),
    slug: v.string(),
    blocks: v.array(
      v.object({
        id: v.string(),      // Unique block runtime instance ID
        type: v.string(),    // Block template reference identifier (e.g., "Hero", "Features")
        props: v.any(),      // Custom variable data payload for properties
      })
    ),
  }).index("by_slug", ["slug"]),
});
```

---

## 2. API Services, Queries & Mutations (`convex/pages.ts`)
Write database functions to read and execute updates against layouts instantly.

```typescript
// convex/pages.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Retrieve a page by slug path (Server-side & Live-site friendly)
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

// Retrieve a single page entity configuration for the CMS Workspace
export const getById = query({
  args: { id: v.id("pages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List all managed application routes
export const listAllPages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pages").collect();
  },
});

// Apply structural block layouts mutations (Handles drag-and-drop sort order or text changes)
export const updateBlocks = mutation({
  args: {
    id: v.id("pages"),
    blocks: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        props: v.any(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { blocks: args.blocks });
  },
});

// Create a new empty page canvas node
export const createPage = mutation({
  args: { title: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error("A page with this slug path already exists.");
    
    return await ctx.db.insert("pages", {
      title: args.title,
      slug: args.slug,
      blocks: [],
    });
  },
});
```

---

## 3. Creating Content Blocks Registry (`components/blocks/`)
Build UI building blocks that map clean layout components directly to database schemas.

### Hero Section Component
```tsx
// components/blocks/Hero.tsx
export interface HeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
}

export function Hero({ title, subtitle, ctaText }: HeroProps) {
  return (
    <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white py-24 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-6 text-lg text-slate-300">{subtitle}</p>}
        {ctaText && (
          <button className="mt-10 rounded-md bg-indigo-500 px-5 py-3 font-semibold shadow-sm hover:bg-indigo-400">
            {ctaText}
          </button>
        )}
      </div>
    </section>
  );
}
```

### Dynamic Core Component Resolver
```tsx
// components/BlockRenderer.tsx
import { Hero } from "./blocks/Hero";

const BLOCK_COMPONENTS: Record<string, React.ComponentType<any>> = {
  Hero,
  // Add future modular section references here (e.g. Features, Pricing, Testimonials)
};

export function BlockRenderer({ blocks }: { blocks: any[] }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400 border border-dashed border-gray-200 m-4 rounded">
        No sections added yet. Build layouts inside the admin manager workspace.
      </div>
    );
  }

  return (
    <>
      {blocks.map((block) => {
        const Component = BLOCK_COMPONENTS[block.type];
        if (!Component) return null;
        return <Component key={block.id} {...block.props} />;
      })}
    </>
  );
}
```

---

## 4. Drag-and-Drop Sort Container (`components/admin/SortableBlockWrapper.tsx`)
Wrap dynamic workspace cards using `@dnd-kit` primitive elements to establish reordering interactions.

```tsx
// components/admin/SortableBlockWrapper.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WrapperProps {
  id: string;
  children: React.ReactNode;
  onSelect: () => void;
  isActive: boolean;
}

export function SortableBlockWrapper({ id, children, onSelect, isActive }: WrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`group relative mb-4 rounded-xl border-2 bg-white p-4 transition-all shadow-sm ${
        isActive 
          ? "border-indigo-600 ring-2 ring-indigo-100" 
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Structural Move Controller Bar Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 z-10 cursor-grab active:cursor-grabbing rounded p-1 bg-gray-50 opacity-0 group-hover:opacity-100 border transition"
      >
        ⣿
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}
```

---

## 5. Building the Admin Layout Canvas Workspace
Implement a live workspace environment with dual panes containing canvas layout management nodes and schema control settings fields.

```tsx
// app/admin/edit/[id]/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SortableBlockWrapper } from "@/components/admin/SortableBlockWrapper";

export default function AdminEditor({ params }: { params: { id: Id<"pages"> } }) {
  const page = useQuery(api.pages.getById, { id: params.id });
  const updateBlocks = useMutation(api.pages.updateBlocks);
  const [activeId, setActiveId] = useState<string | null>(null);

  if (!page) return <div className="p-8 text-center text-gray-500">Loading UI CMS Workspace Container Engine...</div>;

  const blocks = page.blocks;
  const activeBlock = blocks.find((b) => b.id === activeId);

  // Reordering execution hook
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(blocks, oldIdx, newIdx);

    await updateBlocks({ id: params.id, blocks: reordered });
  };

  // Live content manipulation adjustments updates mutation hook
  const updateActiveProps = async (key: string, value: any) => {
    if (!activeId) return;
    const modified = blocks.map((b) =>
      b.id === activeId ? { ...b, props: { ...b.props, [key]: value } } : b
    );
    await updateBlocks({ id: params.id, blocks: modified });
  };

  // Appends component payloads 
  const addBlockInstance = async (type: string) => {
    const freshBlock = {
      id: crypto.randomUUID(),
      type,
      props: type === "Hero" ? { title: "Draft Hero Section Header Title", subtitle: "Insert description context here." } : {},
    };
    await updateBlocks({ id: params.id, blocks: [...blocks, freshBlock] });
    setActiveId(freshBlock.id);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Left Pane - Management & Configurations Tools */}
      <aside className="w-80 border-r border-slate-200 bg-white p-6 flex flex-col justify-between shadow-sm overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-6">Component Studio</h2>
          
          <div className="space-y-2">
            <button 
              onClick={() => addBlockInstance("Hero")} 
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 font-medium text-sm transition"
            >
              ➕ Add Hero Banner
            </button>
          </div>

          {/* Contextual Input Property Fields Controller Panel */}
          {activeBlock && (
            <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400">Settings: {activeBlock.type}</h3>
              {activeBlock.type === "Hero" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Header Value Title</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-md p-2 text-sm focus:border-indigo-500 focus:outline-none"
                      value={activeBlock.props.title || ""}
                      onChange={(e) => updateActiveProps("title", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Subtitle Text</label>
                    <textarea
                      className="w-full border border-slate-200 rounded-md p-2 text-sm focus:border-indigo-500 focus:outline-none h-20 resize-none"
                      value={activeBlock.props.subtitle || ""}
                      onChange={(e) => updateActiveProps("subtitle", e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Right Canvas Dynamic Board Viewport Wrapper */}
      <main className="flex-1 p-10 overflow-y-auto max-w-5xl mx-auto w-full">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{page.title}</h1>
            <p className="text-sm text-slate-500 mt-1">Route Path: <code className="bg-slate-100 px-1 rounded">/{page.slug}</code></p>
          </div>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block) => (
              <SortableBlockWrapper
                key={block.id}
                id={block.id}
                onSelect={() => setActiveId(block.id)}
                isActive={activeId === block.id}
              >
                <div className="pointer-events-none opacity-85 scale-[0.99]">
                  <BlockRenderer blocks={[block]} />
                </div>
              </SortableBlockWrapper>
            ))}
          </SortableContext>
        </DndContext>
      </main>
    </div>
  );
}
```

---

## 6. Mounting Route Viewport Handlers Rendering Engine (`app/[...slug]/page.tsx`)
Read page schemas directly inside a clean dynamic catch-all route utilizing high performance server fetching layers.

```tsx
// app/[...slug]/page.tsx
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { BlockRenderer } from "@/components/BlockRenderer";
import { notFound } from "next/navigation";

interface PageProps {
  params: { slug: string[] };
}

export default async function DynamicPage({ params }: { params: PageProps["params"] }) {
  const slugPath = params.slug.join("/");

  // Resolve matching schema node object from Convex database context directly during SSR lifecycle
  const page = await fetchQuery(api.pages.getBySlug, { slug: slugPath });

  if (!page) notFound();

  return (
    <main className="w-full min-h-screen bg-white">
      <BlockRenderer blocks={page.blocks} />
    </main>
  );
}
```
