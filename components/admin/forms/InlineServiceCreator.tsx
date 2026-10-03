"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { createServiceAction } from "@/app/actions/documents";
import { toast } from "sonner";

interface InlineServiceCreatorProps {
  onServiceCreated: (service: any) => void;
  trigger?: React.ReactNode;
}

export function InlineServiceCreator({ onServiceCreated, trigger }: InlineServiceCreatorProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createServiceAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Service created successfully");
        // Return the created service data to parent with a temporary ID
        const tempId = `temp_${Date.now()}`;
        onServiceCreated({ _id: tempId, name: formData.name, description: formData.description, category: formData.category, active: true });
        setOpen(false);
        setFormData({ name: "", description: "", category: "", active: true });
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const TriggerButton = trigger || (
    <Button type="button" variant="outline" size="sm">
      <Plus className="size-4 mr-2" />
      New Service
    </Button>
  );

  return (
    <>
      <div onClick={() => setOpen(true)}>{TriggerButton}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Service</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., consulting"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create Service
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
