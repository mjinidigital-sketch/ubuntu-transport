"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";
import { BlogPreview } from "@/components/blog-preview";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Globe,
  Tag,
  Clock,
  User,
  FileText,
  Video,
  Quote,
  Code,
  Sparkles,
  Play,
  Eye,
  EyeOff,
  X,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    bio: string;
    email: string;
    linkedin: string;
    twitter: string;
    website: string;
    role: string;
  };
  videoUrl: string;
  videoType: "youtube" | "vimeo" | "custom";
  readTime: string;
  contentBlocks: Array<{
    id: string;
    type: "text" | "image" | "video" | "quote" | "code" | "callout" | "divider";
    content?: string;
    caption?: string;
    data?: any;
    order: number;
  }>;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
  status: "draft" | "published" | "archived";
}

interface BlogFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BlogFormData) => Promise<void>;
  initialData?: Partial<BlogFormData>;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

const initialFormData: BlogFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  category: "",
  tags: [],
  author: {
    name: "",
    avatar: "",
    bio: "",
    email: "",
    linkedin: "",
    twitter: "",
    website: "",
    role: "",
  },
  videoUrl: "",
  videoType: "youtube",
  readTime: "",
  contentBlocks: [],
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  canonicalUrl: "",
  status: "draft",
};

export function BlogFormSheet({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting = false,
  mode = "create",
}: BlogFormSheetProps) {
  const [formData, setFormData] = useState<BlogFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState("basic");
  const [tagInput, setTagInput] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        ...initialFormData, 
        ...initialData,
        contentBlocks: initialData.contentBlocks || []
      });
    } else {
      setFormData(initialFormData);
    }
  }, [initialData, open]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: generateSlug(value),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addContentBlock = (type: BlogFormData["contentBlocks"][0]["type"]) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      order: formData.contentBlocks.length,
    };
    setFormData((prev) => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, newBlock],
    }));
  };

  const removeContentBlock = (blockId: string) => {
    setFormData((prev) => ({
      ...prev,
      contentBlocks: prev.contentBlocks.filter((b) => b.id !== blockId),
    }));
  };

  const updateContentBlock = (blockId: string, updates: Partial<BlogFormData["contentBlocks"][0]>) => {
    setFormData((prev) => ({
      ...prev,
      contentBlocks: prev.contentBlocks.map((b) =>
        b.id === blockId ? { ...b, ...updates } : b
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error("Please fill in required fields (Title & Slug)");
      return;
    }
    await onSubmit(formData);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-2xl font-bold">
            {mode === "create" ? "Create Blog Post" : "Edit Blog Post"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Create a new blog post with rich content"
              : "Edit your blog post content and settings"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="border-b bg-muted/30 px-6 py-2 shrink-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-10 bg-muted/80 p-1 rounded-xl border border-border/50">
                <TabsTrigger value="basic" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
                  <span>📋</span> Basic
                </TabsTrigger>
                <TabsTrigger value="content" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
                  <span>📝</span> Content
                </TabsTrigger>
                <TabsTrigger value="blocks" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
                  <span>🧱</span> Blocks
                </TabsTrigger>
                <TabsTrigger value="media" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
                  <span>🎬</span> Media
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
                  <span>🔍</span> SEO
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* TAB 1: BASIC */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Title *</Label>
                  <Input
                    placeholder="Enter blog post title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Slug *</Label>
                  <Input
                    placeholder="blog-post-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    className="h-10 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Excerpt</Label>
                  <Textarea
                    placeholder="Brief summary of the blog post"
                    value={formData.excerpt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Category</Label>
                  <Input
                    placeholder="Technology, Design, Business..."
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      className="h-10 rounded-xl flex-1"
                    />
                    <Button type="button" onClick={addTag} variant="outline" className="rounded-xl">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer">
                          {tag}
                          <X className="w-3 h-3" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Read Time</Label>
                  <Input
                    placeholder="5 min read"
                    value={formData.readTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, readTime: e.target.value }))}
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* TAB 2: CONTENT */}
            {activeTab === "content" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Main Content</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
                    placeholder="Write your blog post content here..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Author Name</Label>
                  <Input
                    placeholder="Author name"
                    value={formData.author.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: { ...prev.author, name: e.target.value },
                      }))
                    }
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <ImageUpload
                    value={formData.author.avatar}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: { ...prev.author, avatar: value },
                      }))
                    }
                    label="Author Avatar"
                    placeholder="https://example.com/avatar.jpg"
                    aspectRatio="square"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Author Bio</Label>
                  <RichTextEditor
                    content={formData.author.bio}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: { ...prev.author, bio: value },
                      }))
                    }
                    placeholder="Short author bio"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Author Role</Label>
                  <Input
                    placeholder="e.g., Senior Developer, Content Manager"
                    value={formData.author.role}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: { ...prev.author, role: e.target.value },
                      }))
                    }
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Author Email</Label>
                  <Input
                    placeholder="author@example.com"
                    value={formData.author.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: { ...prev.author, email: e.target.value },
                      }))
                    }
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">LinkedIn URL</Label>
                  <Input
                    placeholder="https://linkedin.com/in/..."
                    value={formData.author.linkedin}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: { ...prev.author, linkedin: e.target.value },
                      }))
                    }
                    className="h-10 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Twitter URL</Label>
                  <Input
                    placeholder="https://twitter.com/..."
                    value={formData.author.twitter}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: { ...prev.author, twitter: e.target.value },
                      }))
                    }
                    className="h-10 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Website URL</Label>
                  <Input
                    placeholder="https://example.com"
                    value={formData.author.website}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: { ...prev.author, website: e.target.value },
                      }))
                    }
                    className="h-10 rounded-xl font-mono"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: CONTENT BLOCKS */}
            {activeTab === "blocks" && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addContentBlock("text")}
                    className="rounded-xl gap-2"
                  >
                    <FileText className="w-4 h-4" /> Text
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addContentBlock("image")}
                    className="rounded-xl gap-2"
                  >
                    <ImageIcon className="w-4 h-4" /> Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addContentBlock("video")}
                    className="rounded-xl gap-2"
                  >
                    <Video className="w-4 h-4" /> Video
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addContentBlock("quote")}
                    className="rounded-xl gap-2"
                  >
                    <Quote className="w-4 h-4" /> Quote
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addContentBlock("code")}
                    className="rounded-xl gap-2"
                  >
                    <Code className="w-4 h-4" /> Code
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addContentBlock("callout")}
                    className="rounded-xl gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Callout
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addContentBlock("divider")}
                    className="rounded-xl gap-2"
                  >
                    Divider
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.contentBlocks.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      No content blocks yet. Add some blocks above to get started.
                    </div>
                  )}
                  {formData.contentBlocks.map((block) => (
                    <div key={block.id} className="border border-border/80 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {block.type}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeContentBlock(block.id)}
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {block.type === "image" && (
                        <>
                          <div className="space-y-2">
                            <ImageUpload
                              value={block.content || ""}
                              onChange={(value) => updateContentBlock(block.id, { content: value })}
                              label="Image"
                              placeholder="https://example.com/image.jpg"
                              aspectRatio="video"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Caption (optional)</Label>
                            <Input
                              placeholder="Image caption"
                              value={block.caption || ""}
                              onChange={(e) => updateContentBlock(block.id, { caption: e.target.value })}
                              className="h-10 rounded-xl"
                            />
                          </div>
                        </>
                      )}

                      {block.type === "video" && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Video URL</Label>
                            <Input
                              placeholder="https://youtube.com/watch?v=..."
                              value={block.content || ""}
                              onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                              className="h-10 rounded-xl font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Video Type</Label>
                            <Select
                              value={block.data?.videoType || "youtube"}
                              onValueChange={(value) => updateContentBlock(block.id, { 
                                data: { ...block.data, videoType: value }
                              })}
                            >
                              <SelectTrigger className="h-10 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="vimeo">Vimeo</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Input
                            placeholder="Caption (optional)"
                            value={block.caption || ""}
                            onChange={(e) => updateContentBlock(block.id, { caption: e.target.value })}
                            className="h-10 rounded-xl"
                          />
                        </>
                      )}

                      {block.type !== "image" && block.type !== "video" && (
                        <>
                          <Input
                            placeholder="Content"
                            value={block.content || ""}
                            onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                            className="h-10 rounded-xl"
                          />
                          <Input
                            placeholder="Caption (optional)"
                            value={block.caption || ""}
                            onChange={(e) => updateContentBlock(block.id, { caption: e.target.value })}
                            className="h-10 rounded-xl"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: MEDIA */}
            {activeTab === "media" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <ImageUpload
                    value={formData.featuredImage}
                    onChange={(value) => setFormData((prev) => ({ ...prev, featuredImage: value }))}
                    label="Featured Image"
                    placeholder="https://example.com/featured-image.jpg"
                    aspectRatio="video"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Video URL</Label>
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    className="h-10 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Video Type</Label>
                  <Select
                    value={formData.videoType}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, videoType: value }))}
                  >
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* TAB 5: SEO */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Meta Title</Label>
                  <Input
                    placeholder="SEO title"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Meta Description</Label>
                  <Textarea
                    placeholder="SEO description"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">OG Image</Label>
                  <Input
                    placeholder="https://example.com/og-image.jpg"
                    value={formData.ogImage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ogImage: e.target.value }))}
                    className="h-10 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Canonical URL</Label>
                  <Input
                    placeholder="https://example.com/blog/post"
                    value={formData.canonicalUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, canonicalUrl: e.target.value }))}
                    className="h-10 rounded-xl font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        <SheetFooter className="px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setPreviewOpen(true)} 
            className="rounded-xl gap-2"
          >
            <Monitor className="w-4 h-4" /> Preview
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl">
            {isSubmitting ? "Saving..." : mode === "create" ? "Create Post" : "Update Post"}
          </Button>
        </SheetFooter>
      </SheetContent>

      {/* Blog Preview Modal */}
      <BlogPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        post={formData}
      />
    </Sheet>
  );
}
