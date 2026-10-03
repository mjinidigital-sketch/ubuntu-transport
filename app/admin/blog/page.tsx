"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Trash2,
  Edit,
  Eye,
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  ChevronsUpDown,
} from "lucide-react";
import { BlogFormSheet, BlogFormData } from "@/components/admin/blog-form-sheet";
import { BlogPreview } from "@/components/blog-preview";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

type BlogRow = {
  _id: Id<"blogPosts">;
  title: string;
  slug: string;
  excerpt?: string;
  category: string;
  status: "draft" | "published" | "archived";
  publishedAt?: number;
  author: {
    name: string;
    avatar?: string;
  };
  readTime?: string;
};

type SortingState = Array<{
  id: string;
  desc: boolean;
}>;

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
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </span>
    </button>
  );
}

export default function AdminBlogPage() {
  const posts = useQuery(api.blog.listBlogPosts, { status: undefined });
  const createBlogPost = useMutation(api.blog.createBlogPost);
  const updateBlogPost = useMutation(api.blog.updateBlogPost);
  const deleteBlogPost = useMutation(api.blog.deleteBlogPost);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<any>(null);
  const [previewVariant, setPreviewVariant] = useState<"magazine" | "hero-focus" | "carousel" | "category-filter" | "compact-list" | "featured-sidebar" | "author-spotlight" | "podcast" | "video">("magazine");
  const [editingPostId, setEditingPostId] = useState<Id<"blogPosts"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredPosts = useMemo(() => {
    let data = posts || [];
    
    if (searchQuery) {
      data = data.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      data = data.filter((post) => post.status === statusFilter);
    }
    
    return data;
  }, [posts, searchQuery, statusFilter]);

  const handleCreatePost = async (formData: BlogFormData) => {
    try {
      setIsSubmitting(true);
      const cleanSlug = formData.slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await createBlogPost({
        title: formData.title.trim(),
        slug: cleanSlug,
        excerpt: formData.excerpt || undefined,
        content: formData.content || undefined,
        featuredImage: formData.featuredImage || undefined,
        category: formData.category,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        author: {
          name: formData.author.name,
          avatar: formData.author.avatar || undefined,
          bio: formData.author.bio || undefined,
          email: formData.author.email || undefined,
          linkedin: formData.author.linkedin || undefined,
          twitter: formData.author.twitter || undefined,
          website: formData.author.website || undefined,
          role: formData.author.role || undefined,
        },
        videoUrl: formData.videoUrl || undefined,
        videoType: formData.videoType || undefined,
        readTime: formData.readTime || undefined,
        contentBlocks: formData.contentBlocks.length > 0 ? formData.contentBlocks : undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        ogImage: formData.ogImage || undefined,
        canonicalUrl: formData.canonicalUrl || undefined,
        status: formData.status,
      });
      toast.success("Blog post created successfully");
      setIsCreateOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPost = async (formData: BlogFormData) => {
    if (!editingPostId) return;
    try {
      setIsSubmitting(true);
      const cleanSlug = formData.slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await updateBlogPost({
        id: editingPostId,
        title: formData.title.trim(),
        slug: cleanSlug,
        excerpt: formData.excerpt || undefined,
        content: formData.content || undefined,
        featuredImage: formData.featuredImage || undefined,
        category: formData.category,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        author: {
          name: formData.author.name,
          avatar: formData.author.avatar || undefined,
          bio: formData.author.bio || undefined,
          email: formData.author.email || undefined,
          linkedin: formData.author.linkedin || undefined,
          twitter: formData.author.twitter || undefined,
          website: formData.author.website || undefined,
          role: formData.author.role || undefined,
        },
        videoUrl: formData.videoUrl || undefined,
        videoType: formData.videoType || undefined,
        readTime: formData.readTime || undefined,
        contentBlocks: formData.contentBlocks.length > 0 ? formData.contentBlocks : undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        ogImage: formData.ogImage || undefined,
        canonicalUrl: formData.canonicalUrl || undefined,
        status: formData.status,
      });
      toast.success("Blog post updated successfully");
      setIsEditOpen(false);
      setEditingPostId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id: Id<"blogPosts">) => {
    if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) return;
    try {
      await deleteBlogPost({ id });
      toast.success("Blog post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete blog post");
    }
  };

  const openCreateSheet = () => {
    setIsCreateOpen(true);
  };

  const openEditSheet = (post: BlogRow) => {
    setEditingPostId(post._id);
    setIsEditOpen(true);
  };

  const openPreview = (post: BlogRow) => {
    setPreviewPost(post);
    setIsPreviewOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog content</p>
        </div>
        <Button onClick={openCreateSheet} className="gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => value && setStatusFilter(value)}>
          <SelectTrigger className="w-40 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={previewVariant} onValueChange={(value) => value && setPreviewVariant(value as any)}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder="Preview Variant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="magazine">Magazine</SelectItem>
            <SelectItem value="hero-focus">Hero Focus</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="category-filter">Category Filter</SelectItem>
            <SelectItem value="compact-list">Compact List</SelectItem>
            <SelectItem value="featured-sidebar">Featured Sidebar</SelectItem>
            <SelectItem value="author-spotlight">Author Spotlight</SelectItem>
            <SelectItem value="podcast">Podcast</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border/80 rounded-2xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => (
              <TableRow key={post._id}>
                <TableCell>
                  <div>
                    <div className="font-semibold text-foreground">{post.title}</div>
                    <div className="text-xs text-muted-foreground font-mono">/{post.slug}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{post.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {post.author.avatar && (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span className="text-sm">{post.author.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={post.status === "published" ? "default" : post.status === "draft" ? "secondary" : "outline"}
                    className="rounded-full"
                  >
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      onClick={() => openPreview(post)}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 rounded-lg text-xs font-medium gap-1.5 hover:bg-primary/10 hover:text-primary"
                    >
                      Preview
                    </Button>
                    <Button
                      onClick={() => openEditSheet(post)}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 rounded-lg text-xs font-medium gap-1.5 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleDeletePost(post._id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Sheet */}
      <BlogFormSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreatePost}
        isSubmitting={isSubmitting}
        mode="create"
      />

      {/* Edit Sheet */}
      <BlogFormSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSubmit={handleEditPost}
        isSubmitting={isSubmitting}
        mode="edit"
        initialData={editingPostId ? {
          ...posts?.find((p) => p._id === editingPostId),
          author: {
            name: posts?.find((p) => p._id === editingPostId)?.author.name || "",
            avatar: posts?.find((p) => p._id === editingPostId)?.author.avatar || "",
            bio: posts?.find((p) => p._id === editingPostId)?.author.bio || "",
            email: posts?.find((p) => p._id === editingPostId)?.author.email || "",
            linkedin: posts?.find((p) => p._id === editingPostId)?.author.linkedin || "",
            twitter: posts?.find((p) => p._id === editingPostId)?.author.twitter || "",
            website: posts?.find((p) => p._id === editingPostId)?.author.website || "",
            role: posts?.find((p) => p._id === editingPostId)?.author.role || "",
          }
        } : undefined}
      />

      {/* Preview Modal */}
      <BlogPreview
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        post={previewPost}
        variant={previewVariant}
      />
    </div>
  );
}
