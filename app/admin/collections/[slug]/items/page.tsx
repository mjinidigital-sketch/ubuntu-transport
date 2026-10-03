"use client";

import { useState, Suspense, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Trash2,
  Edit,
  Eye,
  Plus,
  ArrowLeft,
  ExternalLink,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { ItemFormSheet, ItemFormData } from "@/components/admin/item-form-sheet";
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useLegacyTable,
} from "@tanstack/react-table/legacy";
import { flexRender } from "@tanstack/react-table";

type SortingState = Array<{
  id: string;
  desc: boolean;
}>;

const ICON_NAME_TO_EMOJI: Record<string, string> = {
  briefcase: "💼",
  folder: "📁",
  users: "👥",
  package: "📦",
  services: "💼",
  projects: "📁",
  team: "👥",
  products: "📦",
};

function getIconDisplay(icon?: string): string {
  if (!icon) return "📦";
  // If it's already an emoji (single character or emoji), return as is
  if (icon.length > 1 && !/^[a-zA-Z]+$/.test(icon)) return icon;
  // Otherwise, map text name to emoji
  return ICON_NAME_TO_EMOJI[icon] || "📦";
}

const initialFormData: ItemFormData = {
  title: "",
  slug: "",
  description: "",
  content: "",
  imageUrl: "",
  icon: "",
  tags: [],
  gallery: [],
  galleryType: "grid",
  contentBlocks: [],
  metadata: {
    price: "",
    duration: "",
    features: [],
    client: "",
    projectDate: "",
    technologies: [],
    projectUrl: "",
    role: "",
    email: "",
    linkedin: "",
    twitter: "",
    github: "",
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",
    dribbble: "",
    behance: "",
    website: "",
    bio: "",
    department: "",
    hireDate: "",
    location: "",
    expertise: [],
    achievements: [],
    sku: "",
    stock: 0,
  },
  faq: [],
  reviews: [],
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  twitterCard: "summary_large_image",
  canonicalUrl: "",
  robots: "index, follow",
  published: false,
  order: 0,
};

type ItemRow = {
  _id: Id<"collectionItems">;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  tags?: string[];
  published?: boolean;
  order?: number;
  metadata?: {
    price?: string;
    duration?: string;
    features?: string[];
    client?: string;
    projectDate?: string;
    technologies?: string[];
    projectUrl?: string;
    role?: string;
    email?: string;
    linkedin?: string;
    twitter?: string;
    sku?: string;
    stock?: number;
    expertise?: string;
    achievements?: string[];
  };
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  canonicalUrl?: string;
  robots?: string;
  content?: string;
  gallery?: string[];
  galleryType?: "grid" | "carousel" | "masonry" | "slider";
  contentBlocks?: Array<{
    id: string;
    type: "hero" | "timeline" | "specifications" | "testimonials" | "cta" | "image" | "text" | "divider";
    title?: string;
    content?: string;
    data?: any;
    order: number;
  }>;
  faq?: Array<{ question: string; answer: string }>;
  reviews?: Array<{ author: string; rating: number; comment: string; date: string }>;
};

function SortButton({ column, children }: { column: any; children: React.ReactNode }) {
  const sorted = column.getIsSorted?.();
  return (
    <button
      className="flex items-center gap-1 hover:text-foreground transition-colors font-medium group"
      onClick={() => column.toggleSorting?.()}
    >
      {children}
      <span className="ml-1 text-muted-foreground group-hover:text-primary transition-colors">
        {sorted === "asc" ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : sorted === "desc" ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
        )}
      </span>
    </button>
  );
}

function AdminCollectionItemsContent() {
  const { slug } = useParams();

  // ─── All hooks declared unconditionally at the top ─────────────────────────
  const collection = useQuery(api.collections.getCollectionBySlug, { slug: slug as string });
  const items = useQuery(api.collections.getItemsByCollection, {
    collectionId: collection?._id as Id<"collections">,
  });

  const createCollectionItem = useMutation(api.collections.createCollectionItem);
  const updateCollectionItem = useMutation(api.collections.updateCollectionItem);
  const deleteCollectionItem = useMutation(api.collections.deleteCollectionItem);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<Id<"collectionItems"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ItemFormData>(initialFormData);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  // Stable derived values for use in callbacks and column defs
  const collectionSlug = collection?.slug ?? "";
  const collectionIcon = collection?.icon ?? "📦";
  const collectionName = collection?.name ?? "";

  // ─── useMemo hooks (ALL before any conditional return) ──────────────────────
  const filteredData = useMemo(() => {
    if (!items) return [];
    let data = items as ItemRow[];
    if (statusFilter === "published") data = data.filter((i) => i.published);
    if (statusFilter === "draft") data = data.filter((i) => !i.published);
    return data;
  }, [items, statusFilter]);

  const columns: LegacyColumnDef<ItemRow>[] = useMemo(
    () => [
      {
        id: "title",
        accessorKey: "title",
        header: ({ column }: any) => <SortButton column={column}>Item</SortButton>,
        cell: ({ row }: any) => (
          <div className="flex items-center gap-3 min-w-0">
            {row.original.imageUrl ? (
              <img
                src={row.original.imageUrl}
                alt={row.original.title}
                className="w-10 h-10 object-cover rounded-lg border border-border shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xl shrink-0">
                {getIconDisplay(row.original.icon || collectionIcon)}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold text-foreground text-sm truncate">{row.original.title}</div>
              <div className="text-xs font-mono text-muted-foreground truncate">
                /{collectionSlug}/{row.original.slug}
              </div>
            </div>
          </div>
        ),
        enableSorting: true,
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Description",
        cell: ({ row }: any) => (
          <span className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
            {row.original.description
              ? row.original.description.replace(/<[^>]*>?/gm, "").slice(0, 100)
              : <span className="italic">No description</span>}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: "tags",
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }: any) => (
          <div className="flex flex-col gap-1">
            {row.original.tags && row.original.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {row.original.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                    #{tag}
                  </Badge>
                ))}
                {row.original.tags.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{row.original.tags.length - 3}</span>
                )}
              </div>
            )}
            {(!row.original.tags || row.original.tags.length === 0) && (
              <span className="text-xs text-muted-foreground italic">—</span>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        id: "order",
        accessorKey: "order",
        header: ({ column }: any) => <SortButton column={column}>Order</SortButton>,
        cell: ({ row }: any) => (
          <span className="text-xs font-mono text-muted-foreground">#{row.original.order ?? 0}</span>
        ),
        enableSorting: true,
      },
      {
        id: "status",
        accessorKey: "published",
        header: ({ column }: any) => <SortButton column={column}>Status</SortButton>,
        cell: ({ row }: any) => (
          <Badge
            variant={row.original.published ? "default" : "secondary"}
            className="text-xs font-medium px-2.5 py-0.5 rounded-full"
          >
            {row.original.published ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Published
              </span>
            ) : (
              "Draft"
            )}
          </Badge>
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1">
            <Button
              onClick={() => openEditSheet(row.original)}
              variant="ghost"
              size="sm"
              className="h-8 px-3 rounded-lg text-xs font-medium gap-1.5 hover:bg-primary/10 hover:text-primary"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Link href={`/collections/${collectionSlug}/${row.original.slug}`} target="_blank">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Button
              onClick={() => handleDeleteItem(row.original._id)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collectionSlug, collectionIcon]
  );

  // useTable hook — must be unconditional
  const table = useLegacyTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  // ─── Non-hook derived values ─────────────────────────────────────────────────
  const publishedCount = items?.filter((i) => i.published).length ?? 0;
  const draftCount = items?.filter((i) => !i.published).length ?? 0;

  // ─── Event handlers ──────────────────────────────────────────────────────────
  const handleCreateItem = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error("Please fill in required fields (Title & Slug)");
      return;
    }
    try {
      setIsSubmitting(true);
      const cleanSlug = formData.slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await createCollectionItem({
        collectionId: collection!._id,
        title: formData.title.trim(),
        slug: cleanSlug,
        description: formData.description || undefined,
        content: formData.content || undefined,
        imageUrl: formData.imageUrl || undefined,
        icon: formData.icon || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        gallery: formData.gallery.length > 0 ? formData.gallery : undefined,
        galleryType: formData.galleryType || undefined,
        contentBlocks: formData.contentBlocks.length > 0 ? formData.contentBlocks : undefined,
        metadata: {
          price: formData.metadata.price || undefined,
          duration: formData.metadata.duration || undefined,
          features: formData.metadata.features.length > 0 ? formData.metadata.features : undefined,
          client: formData.metadata.client || undefined,
          projectDate: formData.metadata.projectDate || undefined,
          technologies: formData.metadata.technologies.length > 0 ? formData.metadata.technologies : undefined,
          projectUrl: formData.metadata.projectUrl || undefined,
          role: formData.metadata.role || undefined,
          email: formData.metadata.email || undefined,
          linkedin: formData.metadata.linkedin || undefined,
          twitter: formData.metadata.twitter || undefined,
          sku: formData.metadata.sku || undefined,
          stock: formData.metadata.stock ?? undefined,
        },
        faq: formData.faq.length > 0 ? formData.faq : undefined,
        reviews: formData.reviews.length > 0 ? formData.reviews : undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        ogImage: formData.ogImage || undefined,
        twitterCard: formData.twitterCard || undefined,
        canonicalUrl: formData.canonicalUrl || undefined,
        robots: formData.robots || undefined,
        published: formData.published,
        order: formData.order,
      });
      toast.success("Item created successfully");
      setIsCreateOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = async () => {
    if (!editingItemId) return;
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error("Please fill in required fields (Title & Slug)");
      return;
    }
    try {
      setIsSubmitting(true);
      const cleanSlug = formData.slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await updateCollectionItem({
        id: editingItemId,
        title: formData.title.trim(),
        slug: cleanSlug,
        description: formData.description || undefined,
        content: formData.content || undefined,
        imageUrl: formData.imageUrl || undefined,
        icon: formData.icon || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        gallery: formData.gallery.length > 0 ? formData.gallery : undefined,
        galleryType: formData.galleryType || undefined,
        contentBlocks: formData.contentBlocks.length > 0 ? formData.contentBlocks : undefined,
        metadata: {
          price: formData.metadata.price || undefined,
          duration: formData.metadata.duration || undefined,
          features: formData.metadata.features.length > 0 ? formData.metadata.features : undefined,
          client: formData.metadata.client || undefined,
          projectDate: formData.metadata.projectDate || undefined,
          technologies: formData.metadata.technologies.length > 0 ? formData.metadata.technologies : undefined,
          projectUrl: formData.metadata.projectUrl || undefined,
          role: formData.metadata.role || undefined,
          email: formData.metadata.email || undefined,
          linkedin: formData.metadata.linkedin || undefined,
          twitter: formData.metadata.twitter || undefined,
          sku: formData.metadata.sku || undefined,
          stock: formData.metadata.stock ?? undefined,
        },
        faq: formData.faq.length > 0 ? formData.faq : undefined,
        reviews: formData.reviews.length > 0 ? formData.reviews : undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        ogImage: formData.ogImage || undefined,
        twitterCard: formData.twitterCard || undefined,
        canonicalUrl: formData.canonicalUrl || undefined,
        robots: formData.robots || undefined,
        published: formData.published,
        order: formData.order,
      });
      toast.success("Item updated successfully");
      setIsEditOpen(false);
      setEditingItemId(null);
      setFormData(initialFormData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: Id<"collectionItems">) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
    try {
      await deleteCollectionItem({ id });
      toast.success("Item deleted successfully");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const openCreateSheet = () => {
    setFormData({ ...initialFormData, icon: getIconDisplay(collectionIcon) });
    setIsCreateOpen(true);
  };

  const openEditSheet = (item: ItemRow) => {
    setEditingItemId(item._id);
    setFormData({
      title: item.title,
      slug: item.slug,
      description: item.description || "",
      content: item.content || "",
      imageUrl: item.imageUrl || "",
      icon: getIconDisplay(item.icon),
      tags: item.tags || [],
      gallery: item.gallery || [],
      galleryType: item.galleryType || "grid",
      contentBlocks: item.contentBlocks || [],
      metadata: {
        price: item.metadata?.price || "",
        duration: item.metadata?.duration || "",
        features: item.metadata?.features || [],
        client: item.metadata?.client || "",
        projectDate: item.metadata?.projectDate || "",
        technologies: item.metadata?.technologies || [],
        projectUrl: item.metadata?.projectUrl || "",
        role: item.metadata?.role || "",
        email: item.metadata?.email || "",
        linkedin: item.metadata?.linkedin || "",
        twitter: item.metadata?.twitter || "",
        sku: item.metadata?.sku || "",
        stock: item.metadata?.stock ?? 0,
        expertise: Array.isArray(item.metadata?.expertise) ? item.metadata.expertise : [item.metadata?.expertise || ""],
        achievements: item.metadata?.achievements || [],
      },
      faq: item.faq || [],
      reviews: item.reviews || [],
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
      ogImage: item.ogImage || "",
      twitterCard: item.twitterCard || "summary_large_image",
      canonicalUrl: item.canonicalUrl || "",
      robots: item.robots || "index, follow",
      published: item.published ?? false,
      order: item.order ?? 0,
    });
    setIsEditOpen(true);
  };

  // ─── Conditional loading — AFTER all hooks ───────────────────────────────────
  if (!collection) {
    return (
      <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading collection items...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-border">
          <div className="space-y-2">
            <Link href="/admin/collections">
              <Button variant="ghost" size="sm" className="mb-1 -ml-2 text-muted-foreground hover:text-foreground gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                Back to Collections
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl shadow-xs shrink-0">
                {getIconDisplay(collection.icon)}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {collection.name}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                  /collections/{collection.slug}/ &bull; {items?.length ?? 0} item{items?.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            {items && items.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {publishedCount} Published
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/60 rounded-full px-2.5 py-1">
                  {draftCount} Draft{draftCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Link href={`/collections/${collection.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs font-medium">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Public</span>
              </Button>
            </Link>
            <Button onClick={openCreateSheet} size="sm" className="rounded-xl gap-2 font-semibold shadow-xs">
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </Button>
          </div>
        </div>

        {/* Table Toolbar */}
        {items && items.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search items by title, slug, description..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 h-9 rounded-xl text-sm bg-muted/30 border-border/60 focus-visible:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex rounded-xl border border-border overflow-hidden text-xs font-medium">
                {(["all", "published", "draft"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1.5 capitalize transition-colors ${statusFilter === f
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-mono bg-muted/40 px-2 py-1 rounded-lg">
                {table.getRowModel().rows.length} result{table.getRowModel().rows.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {/* Items Table / Empty State */}
        {!items ? (
          <div className="py-24 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center text-3xl mb-4 border border-primary/20">
              {getIconDisplay(collection.icon)}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">No items in {collection.name} yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Create your first item to build out this collection with rich text, metadata, images, and SEO settings.
            </p>
            <Button onClick={openCreateSheet} className="rounded-xl gap-2 font-semibold">
              <Plus className="w-4 h-4" />
              <span>Add First Item</span>
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup: any) => (
                  <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30 border-b-2 border-border">
                    {headerGroup.headers.map((header: any) => (
                      <TableHead
                        key={header.id}
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3 px-4"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground text-sm">
                      No items match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row: any) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-primary/5 transition-colors border-b border-border/50 last:border-0"
                    >
                      {row.getVisibleCells().map((cell: any) => (
                        <TableCell key={cell.id} className="py-3 px-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* CREATE ITEM SLIDE-OUT SHEET */}
      <ItemFormSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
        collectionName={collectionName}
        collectionSlug={collectionSlug}
        collectionIcon={collectionIcon}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateItem}
        isSubmitting={isSubmitting}
      />

      {/* EDIT ITEM SLIDE-OUT SHEET */}
      <ItemFormSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode="edit"
        collectionName={collectionName}
        collectionSlug={collectionSlug}
        collectionIcon={collectionIcon}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditItem}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default function AdminCollectionItems() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading items...</span>
        </div>
      }
    >
      <AdminCollectionItemsContent />
    </Suspense>
  );
}