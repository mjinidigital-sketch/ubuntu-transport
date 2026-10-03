"use client";

import { useState, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Edit, Plus, ExternalLink, Navigation, Link as LinkIcon, Search, Globe, Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const QUICK_ROUTE_ICONS = ["🏠", "💼", "🚀", "👥", "🛍️", "📝", "📞", "ℹ️", "⚙️", "🔒", "⭐", "🌐"];

const initialFormData = {
  title: "",
  url: "",
  order: 0,
  icon: "🔗",
  isActive: true,
  openInNewTab: false,
  metaTitle: "",
  metaDescription: "",
};

function AdminRoutesContent() {
  const routes = useQuery(api.routes.listRoutes);
  const createRoute = useMutation(api.routes.createRoute);
  const updateRoute = useMutation(api.routes.updateRoute);
  const deleteRoute = useMutation(api.routes.deleteRoute);
  const initializeDefaultRoutes = useMutation(api.routes.initializeDefaultRoutes);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<Id<"routes"> | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<Id<"routes"> | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const handleInitializeDefaults = async () => {
    try {
      await initializeDefaultRoutes();
      toast.success("Default routes initialized successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to initialize routes");
    }
  };

  const handleCreateRoute = async () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error("Please fill in required fields (Title & URL)");
      return;
    }

    try {
      setIsSubmitting(true);
      await createRoute({
        title: formData.title.trim(),
        url: formData.url.trim(),
        order: formData.order,
        icon: formData.icon || undefined,
        isActive: formData.isActive,
        openInNewTab: formData.openInNewTab,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        parentId: selectedParentId || undefined,
      });

      toast.success("Route created successfully");
      setIsCreateOpen(false);
      setSelectedParentId(undefined);
      setFormData(initialFormData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create route");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRoute = async () => {
    if (!editingRouteId) return;
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error("Please fill in required fields (Title & URL)");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateRoute({
        id: editingRouteId,
        title: formData.title.trim(),
        url: formData.url.trim(),
        order: formData.order,
        icon: formData.icon || undefined,
        isActive: formData.isActive,
        openInNewTab: formData.openInNewTab,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        parentId: selectedParentId || undefined,
      });

      toast.success("Route updated successfully");
      setIsEditOpen(false);
      setEditingRouteId(null);
      setSelectedParentId(undefined);
      setFormData(initialFormData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update route");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoute = async (id: Id<"routes">) => {
    if (!confirm("Are you sure you want to delete this route? Child routes will also be deleted.")) return;

    try {
      await deleteRoute({ id });
      toast.success("Route deleted successfully");
    } catch (error) {
      toast.error("Failed to delete route");
    }
  };

  const openEditSheet = (route: any) => {
    setEditingRouteId(route._id);
    setSelectedParentId(route.parentId);
    setFormData({
      title: route.title,
      url: route.url,
      order: route.order || 0,
      icon: route.icon || "🔗",
      isActive: route.isActive ?? true,
      openInNewTab: route.openInNewTab ?? false,
      metaTitle: route.metaTitle || "",
      metaDescription: route.metaDescription || "",
    });
    setIsEditOpen(true);
  };

  const openCreateSubRoute = (parentId: Id<"routes">) => {
    setSelectedParentId(parentId);
    setFormData(initialFormData);
    setIsCreateOpen(true);
  };

  const renderRouteTree = (routeList: any[], level = 0) => {
    return routeList.map((route) => (
      <div key={route._id} className={level > 0 ? "ml-8 mt-2" : "mt-2"}>
        <Card className="rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                  {route.icon || "🔗"}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-foreground">{route.title}</CardTitle>
                    <Badge variant={route.isActive ? "default" : "secondary"} className="text-[10px] px-2 py-0">
                      {route.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {route.openInNewTab && (
                      <span title="Opens in new tab">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono text-muted-foreground">
                      {route.url}
                    </span>
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => openCreateSubRoute(route._id)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Sub-route
                </Button>
                <Button
                  onClick={() => openEditSheet(route)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteRoute(route._id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
        {route.children && route.children.length > 0 && renderRouteTree(route.children, level + 1)}
      </div>
    ));
  };

  if (!routes) {
    return (
      <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading navigation routes...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Navigation Routes</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Configure header, footer, and hierarchy routes for your website navigation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleInitializeDefaults} variant="outline" size="sm" className="rounded-xl font-medium">
              Initialize Defaults
            </Button>
            <Button
              onClick={() => {
                setSelectedParentId(undefined);
                setFormData(initialFormData);
                setIsCreateOpen(true);
              }}
              size="sm"
              className="rounded-xl gap-2 font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Route</span>
            </Button>
          </div>
        </div>

        {/* Route Tree */}
        {routes.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 rounded-2xl bg-card/50">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center text-3xl mb-4 border border-primary/20">
              <Navigation className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">No navigation routes yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Create your first top-level navigation route or initialize the default site hierarchy.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={handleInitializeDefaults} variant="outline" className="rounded-xl font-medium">
                Initialize Defaults
              </Button>
              <Button
                onClick={() => {
                  setSelectedParentId(undefined);
                  setFormData(initialFormData);
                  setIsCreateOpen(true);
                }}
                className="rounded-xl gap-2 font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Create Route</span>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">{renderRouteTree(routes)}</div>
        )}
      </div>

      {/* CREATE / EDIT ROUTE SHEET (80% mobile, 50% wide screen slide-over from right) */}
      <Sheet
        open={isCreateOpen || isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setIsEditOpen(false);
            setEditingRouteId(null);
            setSelectedParentId(undefined);
          }
        }}
      >
        <SheetContent
          side="right"
          className="p-0 flex flex-col h-full bg-background border-l border-border shadow-2xl focus:outline-none"
        >
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b bg-card shrink-0 flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0 border border-primary/20">
                {formData.icon || "🔗"}
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-xl font-bold truncate text-foreground">
                  {isCreateOpen ? (selectedParentId ? "Add Sub-route" : "Create Route") : "Edit Route"}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground truncate">
                  Configure navigation URL, hierarchy, and SEO tags
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-10 bg-muted/60 p-1 rounded-xl mb-6">
                <TabsTrigger value="basic" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs">
                  <span>📋</span> Basic Info
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs">
                  <span>🔍</span> SEO &amp; Meta
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: BASIC */}
              <TabsContent value="basic" className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="route-title" className="text-sm font-bold text-foreground">
                      Route Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="route-title"
                      placeholder="e.g., About Us, Pricing, Services"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="h-11 rounded-xl font-medium"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="route-url" className="text-sm font-bold text-foreground">
                      Target URL Path <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="route-url"
                      placeholder="e.g., /about, /pricing, https://external.com"
                      value={formData.url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                      className="h-11 rounded-xl font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="route-order" className="text-xs font-semibold text-foreground">
                        Display Order
                      </Label>
                      <Input
                        id="route-order"
                        type="number"
                        min="0"
                        value={formData.order}
                        onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                        className="h-10 rounded-xl"
                      />
                      <p className="text-[11px] text-muted-foreground">Lower numbers appear first</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="route-icon" className="text-xs font-semibold text-foreground">
                        Icon (Emoji)
                      </Label>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0">
                          {formData.icon}
                        </div>
                        <Input
                          id="route-icon"
                          placeholder="e.g. 🏠, 💼"
                          value={formData.icon}
                          onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                          className="h-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Pick Emojis */}
                  <div className="pt-1">
                    <span className="text-[11px] text-muted-foreground block mb-1.5 font-medium">Quick Pick Icons:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_ROUTE_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                            formData.icon === icon
                              ? "bg-primary text-primary-foreground scale-110 shadow-xs ring-2 ring-primary"
                              : "bg-muted/60 hover:bg-muted text-foreground hover:scale-105"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                      <Switch
                        id="route-active"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="route-active" className="text-xs font-semibold cursor-pointer">
                        Active Route
                      </Label>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                      <Switch
                        id="route-newTab"
                        checked={formData.openInNewTab}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, openInNewTab: checked }))}
                      />
                      <Label htmlFor="route-newTab" className="text-xs font-semibold cursor-pointer">
                        Open in New Tab
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: SEO */}
              <TabsContent value="seo" className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="route-metaTitle" className="text-xs font-semibold text-foreground">
                      SEO Meta Title
                    </Label>
                    <Input
                      id="route-metaTitle"
                      placeholder="Title for search engines"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
                      className="h-10 rounded-xl"
                    />
                    <p className="text-[11px] text-muted-foreground">Recommended: 50–60 characters</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="route-metaDesc" className="text-xs font-semibold text-foreground">
                      SEO Meta Description
                    </Label>
                    <Textarea
                      id="route-metaDesc"
                      placeholder="Description snippet for search engines..."
                      value={formData.metaDescription}
                      onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                      rows={3}
                      className="text-sm rounded-xl resize-none"
                    />
                    <p className="text-[11px] text-muted-foreground">Recommended: 120–160 characters</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky Drawer Footer */}
          <SheetFooter className="px-6 py-4 border-t bg-card/95 backdrop-blur shrink-0 flex flex-row items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setIsEditOpen(false);
              }}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={isCreateOpen ? handleCreateRoute : handleEditRoute}
              disabled={isSubmitting || !formData.title.trim() || !formData.url.trim()}
              className="h-10 px-6 rounded-xl font-semibold gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : isCreateOpen ? (
                <>
                  <Plus className="w-4 h-4" /> Create Route
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Changes
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function AdminRoutes() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading routes...</span>
        </div>
      }
    >
      <AdminRoutesContent />
    </Suspense>
  );
}
