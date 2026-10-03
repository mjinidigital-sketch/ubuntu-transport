"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SortableBlockWrapper } from "@/components/admin/SortableBlockWrapper";
import { BlockRenderer } from "@/components/BlockRenderer";
import { BLOCK_CONFIG, getBlockConfig, getDefaultProps as getConfigDefaultProps, getBlockVariants } from "@/components/blocks/block-config";
import { getComponentFormRegistration, getComponentTabs, type ComponentFormProps } from "@/components/admin/component-forms/form-registry";
import { GenericComponentForm } from "@/components/admin/component-forms/GenericComponentForm";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Plus, ZoomIn, ZoomOut, Maximize2, ChevronDown, ChevronRight, Check, Info, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdminEditor({ params }: { params: Promise<{ id: Id<"pages"> }> }) {
  const [pageId, setPageId] = useState<Id<"pages"> | null>(null);
  const page = useQuery(api.pages.getById, pageId ? { id: pageId } : "skip");
  const updateBlocks = useMutation(api.pages.updateBlocks);
  const updateSEO = useMutation(api.pages.updateSEO);
  const setPublishStatus = useMutation(api.pages.setPublishStatus);
  const updatePage = useMutation(api.pages.updatePage);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("blocks");
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.85);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const router = useRouter();

  // Local state for active block props (moved here to be available before blocks is used)
  const [localActiveProps, setLocalActiveProps] = useState<Record<string, any>>({});

  // Local state for page title and slug with debounced updates
  const [localPageData, setLocalPageData] = useState({
    title: page?.title || "",
    slug: page?.slug || ""
  });
  const [debouncedPageData, setDebouncedPageData] = useState(localPageData);

  React.useEffect(() => {
    setLocalPageData({
      title: page?.title || "",
      slug: page?.slug || ""
    });
  }, [page]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPageData(localPageData);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [localPageData]);

  React.useEffect(() => {
    if (pageId && debouncedPageData.title !== page?.title) {
      handlePageUpdate('title', debouncedPageData.title);
    }
    if (pageId && debouncedPageData.slug !== page?.slug) {
      handlePageUpdate('slug', debouncedPageData.slug);
    }
  }, [debouncedPageData]);



  // SEO state
  const [seoData, setSeoData] = useState({
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
    ogTitle: "",
    ogDescription: "",
    twitterCard: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    canonicalUrl: "",
    robots: "",
  });
  const [lastSavedSeoData, setLastSavedSeoData] = useState(seoData);

  // Debounce hook for SEO updates
  const [debouncedSeoData, setDebouncedSeoData] = useState(seoData);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSeoData(seoData);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [seoData]);

  // Auto-save SEO data when debounced
  React.useEffect(() => {
    if (pageId) {
      const hasChanges = Object.keys(debouncedSeoData).some(
        key => debouncedSeoData[key as keyof typeof debouncedSeoData] !== lastSavedSeoData[key as keyof typeof lastSavedSeoData]
      );
      if (hasChanges) {
        handleSEOUpdate(true);
        setLastSavedSeoData(debouncedSeoData);
      }
    }
  }, [debouncedSeoData]);

  useEffect(() => {
    params.then((resolvedParams) => {
      setPageId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (page) {
      setSeoData({
        metaTitle: page.metaTitle || "",
        metaDescription: page.metaDescription || "",
        ogImage: page.ogImage || "",
        ogTitle: page.ogTitle || "",
        ogDescription: page.ogDescription || "",
        twitterCard: page.twitterCard || "",
        twitterTitle: page.twitterTitle || "",
        twitterDescription: page.twitterDescription || "",
        twitterImage: page.twitterImage || "",
        canonicalUrl: page.canonicalUrl || "",
        robots: page.robots || "",
      });
    }
  }, [page]);

  const blocks = page?.blocks || [];
  const activeBlock = blocks.find((b) => b.id === activeId);

  // Sync local active props when active block changes
  React.useEffect(() => {
    if (activeId) {
      const activeBlock = blocks.find(b => b.id === activeId);
      if (activeBlock) {
        setLocalActiveProps(activeBlock.props);
      }
    } else {
      setLocalActiveProps({});
    }
  }, [activeId, blocks]);

  // Debounced save for active props
  React.useEffect(() => {
    if (!activeId || !pageId) return;

    const handler = setTimeout(() => {
      const modified = blocks.map((b) =>
        b.id === activeId ? { ...b, props: { ...b.props, ...localActiveProps } } : b
      );
      updateBlocks({ id: pageId, blocks: modified });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [localActiveProps, activeId, pageId, blocks, updateBlocks]);

  if (!pageId || !page) return <div className="p-8 text-center text-gray-500">Loading UI CMS Workspace Container Engine...</div>;

  // Get component path for the active block
  const getComponentPath = (blockType: string, variant: string) => {
    const config = getBlockConfig(blockType);
    if (!config) return null;

    const variantConfig = config.variants.find(v => v.id === variant);
    return variantConfig?.component || null;
  };

  const activeComponentPath = activeBlock ? getComponentPath(activeBlock.type, activeBlock.props.variant) : null;
  const componentFormRegistration = activeComponentPath ? getComponentFormRegistration(activeComponentPath) : null;
  const availableTabs = activeComponentPath ? getComponentTabs(activeComponentPath) : { form: true, edit: true, media: true };

  const handleSEOUpdate = async (silent = false) => {
    if (!pageId) return;
    try {
      await updateSEO({ id: pageId, ...seoData });
      if (!silent) {
        toast.success("SEO settings updated successfully");
      }
    } catch (error) {
      if (!silent) {
        toast.error("Failed to update SEO settings");
      }
    }
  };

  const handlePublishToggle = async () => {
    if (!pageId) return;
    try {
      await setPublishStatus({ id: pageId, published: !page.published });
      toast.success(page.published ? "Page unpublished" : "Page published successfully");
    } catch (error) {
      toast.error("Failed to update publish status");
    }
  };

  const handlePageUpdate = async (field: string, value: string) => {
    if (!pageId) return;
    try {
      await updatePage({ id: pageId, [field]: value });
      toast.success("Page updated successfully");
    } catch (error) {
      toast.error("Failed to update page");
    }
  };

  // Reordering execution hook
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(blocks, oldIdx, newIdx);

    await updateBlocks({ id: pageId, blocks: reordered });
  };

  // Live content manipulation adjustments updates mutation hook
  const updateActiveProps = (key: string, value: any) => {
    if (!activeId) return;
    setLocalActiveProps(prev => ({ ...prev, [key]: value }));
  };

  // Appends component payloads 
  const addBlockInstance = async (type: string, variant?: string) => {
    if (!pageId) return;

    const config = getBlockConfig(type);
    if (!config) return;

    const selectedVariantKey = variant || selectedVariants[type] || config.defaultVariant;

    const freshBlock = {
      id: crypto.randomUUID(),
      type,
      props: { ...getConfigDefaultProps(type), variant: selectedVariantKey },
    };
    await updateBlocks({ id: pageId, blocks: [...blocks, freshBlock] });
    setActiveId(freshBlock.id);
  };

  // Toggle block expansion
  const toggleBlockExpansion = (blockId: string) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  // Select variant for a block
  const selectVariant = (blockId: string, variant: string) => {
    setSelectedVariants(prev => ({ ...prev, [blockId]: variant }));
  };

  // Check if a block is published/added to the page
  const isBlockAdded = (blockId: string) => {
    return blocks.some(b => b.type === blockId);
  };

  // Handle variant selection and block addition
  const handleVariantSelection = async () => {
    if (!selectedBlockType || !selectedVariant || !pageId) return;

    const defaultProps = getConfigDefaultProps(selectedBlockType);
    const freshBlock = {
      id: crypto.randomUUID(),
      type: selectedBlockType,
      props: { ...defaultProps, variant: selectedVariant },
    };
    await updateBlocks({ id: pageId, blocks: [...blocks, freshBlock] });
    setActiveId(freshBlock.id);
    setIsVariantDialogOpen(false);
    setSelectedBlockType(null);
    setSelectedVariant(null);
  };

  // Open edit drawer for a block
  const openEditDrawer = (blockId: string) => {
    setActiveId(blockId);
    setIsEditDrawerOpen(true);
  };

  // Delete block - shows confirmation dialog
  const deleteBlock = () => {
    if (!activeId || !pageId) return;
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete block - actually performs the deletion
  const confirmDeleteBlock = async () => {
    if (!activeId || !pageId) return;
    const modified = blocks.filter((b) => b.id !== activeId);
    await updateBlocks({ id: pageId, blocks: modified });
    setActiveId(null);
    setIsDeleteDialogOpen(false);
    toast.success("Block deleted successfully");
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Left Pane - Management & Configurations Tools */}
      <aside className="hidden lg:block w-80 border-r border-slate-200 bg-white p-6 flex flex-col justify-between shadow-sm overflow-y-auto">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Component Studio</h2>
            <Button
              onClick={() => router.push("/admin/pages")}
              variant="default"
            >
              ← Back
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full " >
            <TabsList className="grid w-full grid-cols-3 mb-6 h-[36px] bg-card px-4  ">
              <TabsTrigger value="blocks" className={`text-xs cursor-pointer ${activeTab === "blocks" ? "text-indigo-600 font-bold" : "text-slate-600 font-medium"} `}>Block Editor</TabsTrigger>
              <TabsTrigger value="form" className={`text-xs cursor-pointer ${activeTab === "form" ? "text-indigo-600 font-bold" : "text-slate-600 font-medium"} `}>Form</TabsTrigger>
              <TabsTrigger value="seo" className={`text-xs cursor-pointer ${activeTab === "seo" ? "text-indigo-600 font-bold" : "text-slate-600 font-medium"} `}>Edit</TabsTrigger>
            </TabsList>

            <TabsContent value="blocks" className="space-y-3 px-8">
              <TooltipProvider>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Tooltip>
                      <TooltipTrigger>
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 cursor-help">
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                          Component Studio
                        </h3>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Browse and add components to your page</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-xs text-slate-400">{blocks.length} active</span>
                  </div>

                  <div className="space-y-2">
                    {BLOCK_CONFIG.map((block) => {
                      const isExpanded = expandedBlocks.has(block.id);
                      const isAdded = isBlockAdded(block.id);
                      const selectedVariant = selectedVariants[block.id] || block.defaultVariant;

                      return (
                        <div key={block.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-all shadow-sm">
                          {/* Block Header */}
                          <button
                            onClick={() => toggleBlockExpansion(block.id)}
                            className="w-full p-3 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                {block.name.charAt(0)}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-slate-800">{block.name}</span>
                                  {isAdded && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">Added to page</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  {block.variants.length} variant{block.variants.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isAdded && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Remove all blocks of this type
                                        const modified = blocks.filter(b => b.type !== block.id);
                                        updateBlocks({ id: pageId, blocks: modified });
                                      }}
                                      className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                      <Info className="w-3.5 h-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Remove from page</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                              )}
                            </div>
                          </button>

                          {/* Collapsible Variants */}
                          {isExpanded && (
                            <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-2">
                              <p className="text-xs text-slate-500 mb-2">Select a variant to add:</p>
                              <div className="space-y-1.5">
                                {block.variants.map((variant) => {
                                  const isSelected = selectedVariant === variant.id;
                                  const isVariantAdded = blocks.some(b => b.type === block.id && b.props.variant === variant.id);

                                  return (
                                    <Tooltip key={variant.id}>
                                      <TooltipTrigger>
                                        <button
                                          onClick={() => {
                                            selectVariant(block.id, variant.id);
                                            addBlockInstance(block.id, variant.id);
                                          }}
                                          className="w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group cursor-pointer relative"
                                          style={{
                                            borderColor: isSelected ? 'indigo-400' : 'slate-200',
                                            backgroundColor: isSelected ? 'indigo-50' : 'white',
                                          }}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                                              }`}>
                                              {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                            </div>
                                            <div>
                                              <span className="text-xs font-medium text-slate-700">{variant.name}</span>
                                              {isVariantAdded && (
                                                <span className="ml-2 text-[10px] text-emerald-600 font-medium">Added</span>
                                              )}
                                            </div>
                                          </div>
                                          {variant.description && (
                                            <Info className="w-3 h-3 text-slate-400" />
                                          )}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">{variant.description || variant.name}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                              </div>

                              {/* Quick Add Button */}
                              <Tooltip>
                                <TooltipTrigger>
                                  <button
                                    onClick={() => addBlockInstance(block.id, selectedVariant)}
                                    className="w-full mt-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add {block.name}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Add {block.name} with selected variant</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Block Indicator */}
                {activeBlock && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-indigo-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {activeBlock.type}
                        </h4>
                        <p className="text-xs text-indigo-600 mt-1">Click edit button to modify content</p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger>
                          <button
                            onClick={() => openEditDrawer(activeBlock.id)}
                            className="text-xs bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shadow-sm"
                          >
                            Edit
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Edit component content and style</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </TooltipProvider>
            </TabsContent>

            <TabsContent value="form" className="space-y-6 px-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Page Title</label>
                <Input
                  value={localPageData.title}
                  onChange={(e) => setLocalPageData(prev => ({ ...prev, title: e.target.value }))}
                  className="h-10"
                  placeholder="Page title"
                />
                <p className="text-xs text-slate-500">The main heading displayed on the page</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">URL Slug</label>
                <Input
                  value={localPageData.slug}
                  onChange={(e) => setLocalPageData(prev => ({ ...prev, slug: e.target.value }))}
                  className="h-10"
                  placeholder="page-slug"
                />
                <p className="text-xs text-slate-500">The URL path for this page</p>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6 px-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Meta Title</label>
                <Input
                  value={seoData.metaTitle}
                  onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
                  placeholder="Page title for search engines"
                  className="h-10"
                />
                <p className="text-xs text-slate-500">The title displayed in search results</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Meta Description</label>
                <textarea
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all h-24 resize-none"
                  value={seoData.metaDescription}
                  onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
                  placeholder="Brief description for search results"
                />
                <p className="text-xs text-slate-500">Description shown in search results</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">OG Image</label>
                <Input
                  value={seoData.ogImage}
                  onChange={(e) => setSeoData({ ...seoData, ogImage: e.target.value })}
                  placeholder="https://example.com/og-image.jpg"
                  className="h-10"
                />
                <p className="text-xs text-slate-500">Image for social media sharing</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">OG Title</label>
                <Input
                  value={seoData.ogTitle}
                  onChange={(e) => setSeoData({ ...seoData, ogTitle: e.target.value })}
                  placeholder="Title for social media sharing"
                  className="h-10"
                />
                <p className="text-xs text-slate-500">Custom title for social media</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">OG Description</label>
                <textarea
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all h-24 resize-none"
                  value={seoData.ogDescription}
                  onChange={(e) => setSeoData({ ...seoData, ogDescription: e.target.value })}
                  placeholder="Description for social media sharing"
                />
                <p className="text-xs text-slate-500">Description for social media sharing</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Twitter Card Type</label>
                <select
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all h-10"
                  value={seoData.twitterCard}
                  onChange={(e) => setSeoData({ ...seoData, twitterCard: e.target.value })}
                >
                  <option value="">Select card type</option>
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                </select>
                <p className="text-xs text-slate-500">Twitter card display type</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Canonical URL</label>
                <Input
                  value={seoData.canonicalUrl}
                  onChange={(e) => setSeoData({ ...seoData, canonicalUrl: e.target.value })}
                  placeholder="https://example.com/page"
                  className="h-10"
                />
                <p className="text-xs text-slate-500">Preferred URL for search engines</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Robots Meta</label>
                <Input
                  value={seoData.robots}
                  onChange={(e) => setSeoData({ ...seoData, robots: e.target.value })}
                  placeholder="index, follow"
                  className="h-10"
                />
                <p className="text-xs text-slate-500">Search engine crawling instructions</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-xs text-emerald-700">
                  ✨ <strong>Auto-save enabled:</strong> Changes are saved automatically after you stop typing.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </aside>

      {/* Right Canvas Dynamic Board Viewport Wrapper */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden w-full h-full bg-slate-100">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm shrink-0">
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">{page.title}</h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1">Route: <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">/{page.slug}</code></p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                  className="p-2 rounded-md transition-all hover:bg-white hover:shadow-sm text-slate-600"
                  title="Reduce (Larger Preview)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-slate-600 w-12 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
                  className="p-2 rounded-md transition-all hover:bg-white hover:shadow-sm text-slate-600"
                  title="Increase (Smaller Preview)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(0.85)}
                  className="p-2 rounded-md transition-all hover:bg-white hover:shadow-sm text-slate-600"
                  title="Reset"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Editor Button */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden flex-1"
                onClick={() => setIsMobileEditorOpen(true)}
              >
                ⚙️ Edit Blocks
              </Button>

              <Sheet open={isMobileEditorOpen} onOpenChange={setIsMobileEditorOpen}>
                <SheetContent side="right" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Block Editor</SheetTitle>
                  </SheetHeader>
                  <TooltipProvider>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between mb-3">
                        <Tooltip>
                          <TooltipTrigger>
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 cursor-help">
                              <Sparkles className="w-4 h-4 text-indigo-500" />
                              Component Studio
                            </h3>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Browse and add components to your page</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="text-xs text-slate-400">{blocks.length} active</span>
                      </div>

                      <div className="space-y-2">
                        {BLOCK_CONFIG.map((block) => {
                          const isExpanded = expandedBlocks.has(block.id);
                          const isAdded = isBlockAdded(block.id);
                          const selectedVariant = selectedVariants[block.id] || block.defaultVariant;

                          return (
                            <div key={block.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-all shadow-sm">
                              {/* Block Header */}
                              <button
                                onClick={() => toggleBlockExpansion(block.id)}
                                className="w-full p-3 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                    {block.name.charAt(0)}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-slate-800">{block.name}</span>
                                      {isAdded && (
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">Added to page</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                      {block.variants.length} variant{block.variants.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                  )}
                                </div>
                              </button>

                              {/* Collapsible Variants */}
                              {isExpanded && (
                                <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-2">
                                  <p className="text-xs text-slate-500 mb-2">Select a variant to add:</p>
                                  <div className="space-y-1.5">
                                    {block.variants.map((variant) => {
                                      const isSelected = selectedVariant === variant.id;
                                      const isVariantAdded = blocks.some(b => b.type === block.id && b.props.variant === variant.id);

                                      return (
                                        <Tooltip key={variant.id}>
                                          <TooltipTrigger>
                                            <button
                                              onClick={() => {
                                                selectVariant(block.id, variant.id);
                                                addBlockInstance(block.id, variant.id);
                                                setIsMobileEditorOpen(false);
                                              }}
                                              className="w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group cursor-pointer"
                                              style={{
                                                borderColor: isSelected ? 'indigo-400' : 'slate-200',
                                                backgroundColor: isSelected ? 'indigo-50' : 'white',
                                              }}
                                            >
                                              <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                                                  }`}>
                                                  {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                                </div>
                                                <div>
                                                  <span className="text-xs font-medium text-slate-700">{variant.name}</span>
                                                  {isVariantAdded && (
                                                    <span className="ml-2 text-[10px] text-emerald-600 font-medium">Added</span>
                                                  )}
                                                </div>
                                              </div>
                                              {variant.description && (
                                                <Info className="w-3 h-3 text-slate-400" />
                                              )}
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">{variant.description || variant.name}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      );
                                    })}
                                  </div>

                                  {/* Quick Add Button */}
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <button
                                        onClick={() => {
                                          addBlockInstance(block.id, selectedVariant);
                                          setIsMobileEditorOpen(false);
                                        }}
                                        className="w-full mt-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Add {block.name}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Add {block.name} with selected variant</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TooltipProvider>

                  {activeBlock && (
                    <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            <span className="text-indigo-500">⚙️</span>
                            Edit {activeBlock.type}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">Customize this block's content and style</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsDeleteDialogOpen(true)}
                          className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>

                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => setActiveId(null)}
                          className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          ← Back to Blocks
                        </button>
                      </div>

                      {(() => {
                        const mobileComponentPath = getComponentPath(activeBlock.type, activeBlock.props.variant);
                        const mobileFormRegistration = mobileComponentPath ? getComponentFormRegistration(mobileComponentPath) : null;

                        return mobileFormRegistration?.formComponent ? (
                          React.createElement(mobileFormRegistration.formComponent, {
                            props: activeBlock.props,
                            onChange: updateActiveProps,
                            mode: 'form'
                          })
                        ) : (
                          <GenericComponentForm
                            blockType={activeBlock.type}
                            componentPath={mobileComponentPath || ''}
                            props={activeBlock.props}
                            onChange={updateActiveProps}
                            mode="form"
                          />
                        );
                      })()}
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              <Button
                onClick={handlePublishToggle}
                variant={page.published ? "destructive" : "default"}
                size="sm"
                className="flex-1 md:flex-none"
              >
                {page.published ? "Unpublish" : "Publish"}
              </Button>
              <Button
                onClick={() => router.push(`/${page.slug}`)}
                variant="outline"
                size="sm"
                className="flex-1 md:flex-none"
              >
                View Live
              </Button>
            </div>
          </div>

          {/* Preview Container */}
          <div className="flex-1 flex items-center justify-center p-2 md:p-4 min-h-0">
            <div className="bg-white shadow-2xl rounded-lg overflow-hidden w-full h-full relative">
              <div
                className="absolute inset-0 p-2 md:p-4 overflow-y-auto transform origin-top transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.map((block) => (
                      <SortableBlockWrapper
                        key={block.id}
                        id={block.id}
                        onSelect={() => setActiveId(block.id)}
                        isActive={activeId === block.id}
                        onDelete={() => {
                          setActiveId(block.id);
                          deleteBlock();
                        }}
                        onEdit={() => openEditDrawer(block.id)}
                      >
                        <BlockRenderer blocks={[block]} />
                      </SortableBlockWrapper>
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Variant Selection Dialog */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">🎨 Choose Block Style</DialogTitle>
            <DialogDescription className="text-base">
              Select a variant for <span className="font-semibold text-indigo-600">{selectedBlockType && getBlockConfig(selectedBlockType)?.name}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedBlockType && (
            <div className="grid gap-3 py-4 max-h-96 overflow-y-auto">
              {getBlockVariants(selectedBlockType).map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative group ${selectedVariant === variant.id
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 shadow-md'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-sm'
                    }`}
                >
                  {selectedVariant === variant.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="font-semibold text-sm text-slate-800 pr-8">{variant.name}</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">{variant.description}</div>
                </button>
              ))}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsVariantDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVariantSelection}
              disabled={!selectedVariant}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6"
            >
              ✨ Add Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600">🗑️ Delete Block?</DialogTitle>
            <DialogDescription className="text-sm">
              This action cannot be undone. The block will be permanently removed from your page.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteBlock}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Block Drawer */}
      <Sheet open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto">
          <SheetHeader className="px-8 pt-8 pb-2">
            <SheetTitle className="text-2xl">Edit Block</SheetTitle>
            <p className="text-sm text-slate-500 mt-2">Customize this block's content and style</p>
          </SheetHeader>

          {activeBlock && (
            <div className="mt-6">
              <div className="flex items-center justify-between px-8 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <span className="text-indigo-500">⚙️</span>
                    {activeBlock.type}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteDialogOpen(true);
                    setIsEditDrawerOpen(false);
                  }}
                  className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  🗑️ Delete
                </button>
              </div>

              <Tabs defaultValue="form" className="w-full px-8">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  {availableTabs?.form && <TabsTrigger value="form">Form</TabsTrigger>}
                  {availableTabs?.edit && <TabsTrigger value="edit">Edit</TabsTrigger>}
                  {availableTabs?.media && <TabsTrigger value="media">Media</TabsTrigger>}
                </TabsList>

                {availableTabs?.form && (
                  <TabsContent value="form" className="space-y-6">
                    {componentFormRegistration?.formComponent ? (
                      React.createElement(componentFormRegistration.formComponent, {
                        props: activeBlock.props,
                        onChange: updateActiveProps,
                        mode: 'form'
                      })
                    ) : (
                      <GenericComponentForm
                        blockType={activeBlock.type}
                        componentPath={activeComponentPath || ''}
                        props={activeBlock.props}
                        onChange={updateActiveProps}
                        mode="form"
                      />
                    )}
                  </TabsContent>
                )}

                {availableTabs?.edit && (
                  <TabsContent value="edit" className="space-y-6">
                    {componentFormRegistration?.formComponent ? (
                      React.createElement(componentFormRegistration.formComponent, {
                        props: activeBlock.props,
                        onChange: updateActiveProps,
                        mode: 'edit'
                      })
                    ) : (
                      <GenericComponentForm
                        blockType={activeBlock.type}
                        componentPath={activeComponentPath || ''}
                        props={activeBlock.props}
                        onChange={updateActiveProps}
                        mode="edit"
                      />
                    )}
                  </TabsContent>
                )}

                {availableTabs?.media && (
                  <TabsContent value="media" className="space-y-6">
                    {componentFormRegistration?.formComponent ? (
                      React.createElement(componentFormRegistration.formComponent, {
                        props: activeBlock.props,
                        onChange: updateActiveProps,
                        mode: 'media'
                      })
                    ) : (
                      <GenericComponentForm
                        blockType={activeBlock.type}
                        componentPath={activeComponentPath || ''}
                        props={activeBlock.props}
                        onChange={updateActiveProps}
                        mode="media"
                      />
                    )}
                  </TabsContent>
                )}
              </Tabs>

              <div className="mt-8 pt-6 border-t px-8 pb-8">
                <Button
                  onClick={() => setIsEditDrawerOpen(false)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-11"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
