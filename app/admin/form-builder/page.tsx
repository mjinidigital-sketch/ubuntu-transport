"use client";

import { useState, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Copy, Eye, Settings, Layout, LayoutTemplate, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type FormBlock = {
  id: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "radio" | "date" | "file" | "tel" | "url" | "hidden" | "section" | "html";
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  props?: any;
};

type FormDefinition = {
  _id: Id<"formDefinitions">;
  name: string;
  slug: string;
  description?: string;
  blocks: FormBlock[];
  settings?: {
    submitButtonText?: string;
    successMessage?: string;
    redirectUrl?: string;
    sendEmailNotification?: boolean;
    emailTo?: string;
    storeInDatabase?: boolean;
  };
  published: boolean;
  publishedAt?: number;
};

type FormTemplate = {
  _id: Id<"formTemplates">;
  name: string;
  slug: string;
  category: "contact" | "booking" | "subscribe" | "feedback" | "survey" | "registration" | "custom";
  description?: string;
  blocks: FormBlock[];
  settings?: {
    submitButtonText?: string;
    successMessage?: string;
    redirectUrl?: string;
    sendEmailNotification?: boolean;
    emailTo?: string;
    storeInDatabase?: boolean;
  };
};

function AdminFormBuilderContent() {
  const forms = useQuery(api.forms.getAllFormDefinitions);
  const templates = useQuery(api.forms.getAllFormTemplates);
  const createForm = useMutation(api.forms.createFormDefinition);
  const updateForm = useMutation(api.forms.updateFormDefinition);
  const deleteForm = useMutation(api.forms.deleteFormDefinition);
  const initializeTemplates = useMutation(api.forms.initializeDefaultFormTemplates);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<Id<"formDefinitions"> | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    blocks: [] as FormBlock[],
    settings: {
      submitButtonText: "Submit",
      successMessage: "Thank you for your submission!",
      redirectUrl: "",
      sendEmailNotification: true,
      emailTo: "",
      storeInDatabase: true,
    },
  });

  const handleInitializeTemplates = async () => {
    try {
      await initializeTemplates();
      toast.success("Default form templates initialized successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to initialize templates");
    }
  };

  const handleCreateForm = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const slug = formData.slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await createForm({
        name: formData.name,
        slug,
        description: formData.description,
        blocks: formData.blocks,
        settings: formData.settings,
      });
      
      toast.success("Form created successfully");
      setIsCreateDialogOpen(false);
      resetFormData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create form");
    }
  };

  const handleUpdateForm = async () => {
    if (!editingForm) return;

    try {
      const slug = formData.slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await updateForm({
        id: editingForm,
        name: formData.name,
        slug,
        description: formData.description,
        blocks: formData.blocks,
        settings: formData.settings,
      });
      
      toast.success("Form updated successfully");
      setIsEditDialogOpen(false);
      setEditingForm(null);
      resetFormData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update form");
    }
  };

  const handleDeleteForm = async (id: Id<"formDefinitions">) => {
    if (!confirm("Are you sure you want to delete this form? All submissions will be lost.")) return;
    
    try {
      await deleteForm({ id });
      toast.success("Form deleted successfully");
    } catch (error) {
      toast.error("Failed to delete form");
    }
  };

  const handleTogglePublish = async (id: Id<"formDefinitions">, currentStatus: boolean) => {
    try {
      await updateForm({
        id,
        published: !currentStatus,
      });
      toast.success(currentStatus ? "Form unpublished" : "Form published successfully");
    } catch (error) {
      toast.error("Failed to update publish status");
    }
  };

  const openEditDialog = (form: FormDefinition) => {
    setEditingForm(form._id);
    setFormData({
      name: form.name,
      slug: form.slug,
      description: form.description || "",
      blocks: form.blocks,
      settings: {
        submitButtonText: form.settings?.submitButtonText || "Submit",
        successMessage: form.settings?.successMessage || "Thank you for your submission!",
        redirectUrl: form.settings?.redirectUrl || "",
        sendEmailNotification: form.settings?.sendEmailNotification ?? true,
        emailTo: form.settings?.emailTo || "",
        storeInDatabase: form.settings?.storeInDatabase ?? true,
      },
    });
    setIsEditDialogOpen(true);
  };

  const addBlock = (type: FormBlock["type"]) => {
    const newBlock: FormBlock = {
      id: `block-${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: `Enter ${type}...`,
      required: false,
    };
    
    if (type === "select" || type === "radio" || type === "checkbox") {
      newBlock.options = ["Option 1", "Option 2", "Option 3"];
    }
    
    setFormData({
      ...formData,
      blocks: [...formData.blocks, newBlock],
    });
  };

  const updateBlock = (blockId: string, updates: Partial<FormBlock>) => {
    setFormData({
      ...formData,
      blocks: formData.blocks.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      ),
    });
  };

  const removeBlock = (blockId: string) => {
    setFormData({
      ...formData,
      blocks: formData.blocks.filter(block => block.id !== blockId),
    });
  };

  const loadFromTemplate = (template: FormTemplate) => {
    setFormData({
      name: template.name,
      slug: template.slug,
      description: template.description || "",
      blocks: template.blocks,
      settings: {
        submitButtonText: template.settings?.submitButtonText || "Submit",
        successMessage: template.settings?.successMessage || "Thank you for your submission!",
        redirectUrl: template.settings?.redirectUrl || "",
        sendEmailNotification: template.settings?.sendEmailNotification ?? true,
        emailTo: template.settings?.emailTo || "",
        storeInDatabase: template.settings?.storeInDatabase ?? true,
      },
    });
    setSelectedTemplate(template.slug);
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      blocks: [],
      settings: {
        submitButtonText: "Submit",
        successMessage: "Thank you for your submission!",
        redirectUrl: "",
        sendEmailNotification: true,
        emailTo: "",
        storeInDatabase: true,
      },
    });
    setSelectedTemplate(null);
  };

  if (!forms || !templates) {
    return <div className="p-8 text-center text-muted-foreground">Loading forms...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Form Builder</h1>
            <p className="text-muted-foreground mt-2">Create and manage custom forms with flexible blocks</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleInitializeTemplates}
              variant="outline"
              size="sm"
            >
              <LayoutTemplate className="w-4 h-4 mr-2" />
              Initialize Templates
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Form
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="px-8 pt-8 pb-2">
                  <DialogTitle className="text-2xl">Create New Form</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-2">Choose a template or build your form from scratch</p>
                </DialogHeader>
                <Tabs defaultValue="basic" className="w-full px-8">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="basic">Form</TabsTrigger>
                    <TabsTrigger value="blocks">Block Editor</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Form Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Contact Form"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">A descriptive name for your form</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-sm font-medium">URL Slug *</Label>
                      <Input
                        id="slug"
                        placeholder="e.g., contact"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">Will be converted to lowercase with hyphens</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe this form..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">Optional description for internal use</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="blocks" className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Add Field Types</Label>
                      <div className="grid grid-cols-4 gap-2">
                        <Button onClick={() => addBlock("text")} variant="outline" size="sm" className="h-10">
                          Text
                        </Button>
                        <Button onClick={() => addBlock("email")} variant="outline" size="sm" className="h-10">
                          Email
                        </Button>
                        <Button onClick={() => addBlock("textarea")} variant="outline" size="sm" className="h-10">
                          Textarea
                        </Button>
                        <Button onClick={() => addBlock("select")} variant="outline" size="sm" className="h-10">
                          Select
                        </Button>
                        <Button onClick={() => addBlock("checkbox")} variant="outline" size="sm" className="h-10">
                          Checkbox
                        </Button>
                        <Button onClick={() => addBlock("radio")} variant="outline" size="sm" className="h-10">
                          Radio
                        </Button>
                        <Button onClick={() => addBlock("date")} variant="outline" size="sm" className="h-10">
                          Date
                        </Button>
                        <Button onClick={() => addBlock("tel")} variant="outline" size="sm" className="h-10">
                          Phone
                        </Button>
                        <Button onClick={() => addBlock("number")} variant="outline" size="sm" className="h-10">
                          Number
                        </Button>
                        <Button onClick={() => addBlock("url")} variant="outline" size="sm" className="h-10">
                          URL
                        </Button>
                        <Button onClick={() => addBlock("file")} variant="outline" size="sm" className="h-10">
                          File
                        </Button>
                        <Button onClick={() => addBlock("section")} variant="outline" size="sm" className="h-10">
                          Section
                        </Button>
                      </div>
                    </div>
                    
                    {formData.blocks.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Form Fields ({formData.blocks.length})</Label>
                          <p className="text-xs text-muted-foreground">Drag to reorder (coming soon)</p>
                        </div>
                        {formData.blocks.map((block, index) => (
                          <Card key={block.id} className="p-5 border-2 hover:border-primary/50 transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                  <Badge variant="secondary" className="text-xs px-2 py-1">{block.type}</Badge>
                                  <Input
                                    value={block.label}
                                    onChange={(e) => updateBlock(block.id, { label: e.target.value })}
                                    className="flex-1 h-10"
                                    placeholder="Field label"
                                  />
                                </div>
                                <Input
                                  placeholder="Placeholder text"
                                  value={block.placeholder || ""}
                                  onChange={(e) => updateBlock(block.id, { placeholder: e.target.value })}
                                  className="h-10"
                                />
                                <div className="flex items-center gap-3">
                                  <Switch
                                    checked={block.required || false}
                                    onCheckedChange={(checked) => updateBlock(block.id, { required: checked })}
                                  />
                                  <Label className="text-sm cursor-pointer">Required field</Label>
                                </div>
                                
                                {(block.type === "select" || block.type === "radio" || block.type === "checkbox") && (
                                  <div className="space-y-2">
                                    <Label className="text-sm">Options (comma-separated)</Label>
                                    <Input
                                      placeholder="Option 1, Option 2, Option 3"
                                      value={block.options?.join(", ") || ""}
                                      onChange={(e) => updateBlock(block.id, { options: e.target.value.split(", ").filter(Boolean) })}
                                      className="h-10"
                                    />
                                  </div>
                                )}
                              </div>
                              <Button
                                onClick={() => removeBlock(block.id)}
                                variant="destructive"
                                size="sm"
                                className="mt-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="templates" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {templates.map((template) => (
                        <Card 
                          key={template._id} 
                          className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary"
                          onClick={() => loadFromTemplate(template)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="text-sm">{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="mt-8 pt-6 border-t px-8 pb-8">
                  <Button onClick={handleCreateForm} className="w-full h-11 text-base">
                    Create Form
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {forms.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground mb-4">
                <div className="w-16 h-16 mx-auto flex items-center justify-center">
                  <Layout className="w-16 h-16" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No forms yet</h3>
              <p className="text-muted-foreground mb-4">Create your first form or start from a template</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleInitializeTemplates} variant="outline">
                  Initialize Templates
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  Create Form
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {forms.map((form) => (
              <Card key={form._id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-xl">{form.name}</CardTitle>
                        <Badge variant={form.published ? "default" : "secondary"}>
                          {form.published ? "Published" : "Draft"}
                        </Badge>
                        <Badge variant="outline">{form.blocks.length} blocks</Badge>
                      </div>
                      <CardDescription className="mt-1">
                        <span className="bg-muted px-2 py-1 rounded text-sm font-mono">/forms/{form.slug}</span>
                      </CardDescription>
                      {form.description && (
                        <p className="text-sm text-muted-foreground mt-2">{form.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleTogglePublish(form._id, form.published)}
                      variant={form.published ? "destructive" : "default"}
                      size="sm"
                    >
                      {form.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      onClick={() => openEditDialog(form)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => window.open(`/forms/${form.slug}`, '_blank')}
                      variant="ghost"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => handleDeleteForm(form._id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-8 pt-8 pb-2">
            <DialogTitle className="text-2xl">Edit Form</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">Modify your form configuration and blocks</p>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic">Form</TabsTrigger>
              <TabsTrigger value="blocks">Block Editor</TabsTrigger>
              <TabsTrigger value="settings">Edit</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6 px-8">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">Form Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Contact Form"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">A descriptive name for your form</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug" className="text-sm font-medium">URL Slug *</Label>
                <Input
                  id="edit-slug"
                  placeholder="e.g., contact"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">Will be converted to lowercase with hyphens</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe this form..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">Optional description for internal use</p>
              </div>
            </TabsContent>
            
            <TabsContent value="blocks" className="space-y-6 px-8">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Add Field Types</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Button onClick={() => addBlock("text")} variant="outline" size="sm" className="h-10">
                    Text
                  </Button>
                  <Button onClick={() => addBlock("email")} variant="outline" size="sm" className="h-10">
                    Email
                  </Button>
                  <Button onClick={() => addBlock("textarea")} variant="outline" size="sm" className="h-10">
                    Textarea
                  </Button>
                  <Button onClick={() => addBlock("select")} variant="outline" size="sm" className="h-10">
                    Select
                  </Button>
                  <Button onClick={() => addBlock("checkbox")} variant="outline" size="sm" className="h-10">
                    Checkbox
                  </Button>
                  <Button onClick={() => addBlock("radio")} variant="outline" size="sm" className="h-10">
                    Radio
                  </Button>
                  <Button onClick={() => addBlock("date")} variant="outline" size="sm" className="h-10">
                    Date
                  </Button>
                  <Button onClick={() => addBlock("tel")} variant="outline" size="sm" className="h-10">
                    Phone
                  </Button>
                  <Button onClick={() => addBlock("number")} variant="outline" size="sm" className="h-10">
                    Number
                  </Button>
                  <Button onClick={() => addBlock("url")} variant="outline" size="sm" className="h-10">
                    URL
                  </Button>
                  <Button onClick={() => addBlock("file")} variant="outline" size="sm" className="h-10">
                    File
                  </Button>
                  <Button onClick={() => addBlock("section")} variant="outline" size="sm" className="h-10">
                    Section
                  </Button>
                </div>
              </div>
              
              {formData.blocks.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Form Fields ({formData.blocks.length})</Label>
                    <p className="text-xs text-muted-foreground">Drag to reorder (coming soon)</p>
                  </div>
                  {formData.blocks.map((block) => (
                    <Card key={block.id} className="p-5 border-2 hover:border-primary/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs px-2 py-1">{block.type}</Badge>
                            <Input
                              value={block.label}
                              onChange={(e) => updateBlock(block.id, { label: e.target.value })}
                              className="flex-1 h-10"
                              placeholder="Field label"
                            />
                          </div>
                          <Input
                            placeholder="Placeholder text"
                            value={block.placeholder || ""}
                            onChange={(e) => updateBlock(block.id, { placeholder: e.target.value })}
                            className="h-10"
                          />
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={block.required || false}
                              onCheckedChange={(checked) => updateBlock(block.id, { required: checked })}
                            />
                            <Label className="text-sm cursor-pointer">Required field</Label>
                          </div>
                          
                          {(block.type === "select" || block.type === "radio" || block.type === "checkbox") && (
                            <div className="space-y-2">
                              <Label className="text-sm">Options (comma-separated)</Label>
                              <Input
                                placeholder="Option 1, Option 2, Option 3"
                                value={block.options?.join(", ") || ""}
                                onChange={(e) => updateBlock(block.id, { options: e.target.value.split(", ").filter(Boolean) })}
                                className="h-10"
                              />
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => removeBlock(block.id)}
                          variant="destructive"
                          size="sm"
                          className="mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6 px-8">
              <div className="space-y-2">
                <Label htmlFor="submit-button" className="text-sm font-medium">Submit Button Text</Label>
                <Input
                  id="submit-button"
                  value={formData.settings?.submitButtonText || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    settings: { ...formData.settings, submitButtonText: e.target.value } 
                  })}
                  className="h-10"
                  placeholder="Submit"
                />
                <p className="text-xs text-muted-foreground">Customize the submit button label</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="success-message" className="text-sm font-medium">Success Message</Label>
                <Textarea
                  id="success-message"
                  value={formData.settings?.successMessage || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    settings: { ...formData.settings, successMessage: e.target.value } 
                  })}
                  rows={2}
                  className="resize-none"
                  placeholder="Thank you for your submission!"
                />
                <p className="text-xs text-muted-foreground">Message shown after successful submission</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="redirect-url" className="text-sm font-medium">Redirect URL (optional)</Label>
                <Input
                  id="redirect-url"
                  placeholder="https://example.com/thank-you"
                  value={formData.settings?.redirectUrl || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    settings: { ...formData.settings, redirectUrl: e.target.value } 
                  })}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">Redirect users after form submission</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="email-notification" className="text-sm font-medium cursor-pointer">Send Email Notification</Label>
                    <p className="text-xs text-muted-foreground">Receive form submissions via email</p>
                  </div>
                  <Switch
                    id="email-notification"
                    checked={formData.settings?.sendEmailNotification || false}
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      settings: { ...formData.settings, sendEmailNotification: checked } 
                    })}
                  />
                </div>
                {formData.settings?.sendEmailNotification && (
                  <div className="space-y-2 pl-4">
                    <Label htmlFor="email-to" className="text-sm font-medium">Email To</Label>
                    <Input
                      id="email-to"
                      placeholder="admin@example.com"
                      value={formData.settings?.emailTo || ""}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        settings: { ...formData.settings, emailTo: e.target.value } 
                      })}
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated email addresses</p>
                  </div>
                )}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="store-database" className="text-sm font-medium cursor-pointer">Store in Database</Label>
                    <p className="text-xs text-muted-foreground">Save form submissions for later access</p>
                  </div>
                  <Switch
                    id="store-database"
                    checked={formData.settings?.storeInDatabase || false}
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      settings: { ...formData.settings, storeInDatabase: checked } 
                    })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-8 pt-6 border-t px-8 pb-8">
            <Button onClick={handleUpdateForm} className="w-full h-11 text-base">
              Update Form
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminFormBuilder() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading form builder...</div>}>
      <AdminFormBuilderContent />
    </Suspense>
  );
}