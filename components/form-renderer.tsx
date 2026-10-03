"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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

type FormSettings = {
  submitButtonText?: string;
  successMessage?: string;
  redirectUrl?: string;
  sendEmailNotification?: boolean;
  emailTo?: string;
  storeInDatabase?: boolean;
};

interface FormRendererProps {
  formId: string;
  blocks: FormBlock[];
  settings?: FormSettings;
  onSuccess?: () => void;
}

export function FormRenderer({ formId, blocks, settings, onSuccess }: FormRendererProps) {
  const submitForm = useMutation(api.forms.submitForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (blockId: string, value: any) => {
    setFormData(prev => ({ ...prev, [blockId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      for (const block of blocks) {
        if (block.required && !formData[block.id]) {
          toast.error(`${block.label} is required`);
          setIsSubmitting(false);
          return;
        }
      }

      // Validate based on validation rules
      for (const block of blocks) {
        if (formData[block.id] && block.validation) {
          const value = formData[block.id];
          
          if (block.validation.min && typeof value === 'string' && value.length < block.validation.min) {
            toast.error(`${block.label} must be at least ${block.validation.min} characters`);
            setIsSubmitting(false);
            return;
          }
          
          if (block.validation.max && typeof value === 'string' && value.length > block.validation.max) {
            toast.error(`${block.label} must be at most ${block.validation.max} characters`);
            setIsSubmitting(false);
            return;
          }
          
          if (block.validation.pattern) {
            const regex = new RegExp(block.validation.pattern);
            if (!regex.test(value)) {
              toast.error(`${block.label} format is invalid`);
              setIsSubmitting(false);
              return;
            }
          }
        }
      }

      await submitForm({
        formId,
        formData,
      });

      setIsSuccess(true);
      toast.success(settings?.successMessage || "Form submitted successfully!");
      
      if (onSuccess) {
        onSuccess();
      }

      // Redirect if specified
      if (settings?.redirectUrl) {
        const targetUrl = settings.redirectUrl;
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 2000);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {settings?.successMessage || "Thank you for your submission!"}
        </h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {blocks.map((block) => {
        if (block.type === "hidden") {
          return <input key={block.id} type="hidden" name={block.id} value={block.defaultValue || ""} />;
        }

        if (block.type === "section") {
          return (
            <div key={block.id} className="border-b pb-4 mb-4">
              <h3 className="text-lg font-semibold text-foreground">{block.label}</h3>
              {block.props?.description && (
                <p className="text-sm text-muted-foreground mt-1">{block.props.description}</p>
              )}
            </div>
          );
        }

        if (block.type === "html") {
          return (
            <div key={block.id} dangerouslySetInnerHTML={{ __html: block.props?.html || "" }} />
          );
        }

        return (
          <div key={block.id} className="space-y-2">
            <Label htmlFor={block.id}>
              {block.label}
              {block.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            
            {block.type === "text" && (
              <Input
                id={block.id}
                type="text"
                placeholder={block.placeholder}
                required={block.required}
                value={formData[block.id] || block.defaultValue || ""}
                onChange={(e) => handleChange(block.id, e.target.value)}
              />
            )}
            
            {block.type === "email" && (
              <Input
                id={block.id}
                type="email"
                placeholder={block.placeholder}
                required={block.required}
                value={formData[block.id] || block.defaultValue || ""}
                onChange={(e) => handleChange(block.id, e.target.value)}
              />
            )}
            
            {block.type === "tel" && (
              <Input
                id={block.id}
                type="tel"
                placeholder={block.placeholder}
                required={block.required}
                value={formData[block.id] || block.defaultValue || ""}
                onChange={(e) => handleChange(block.id, e.target.value)}
              />
            )}
            
            {block.type === "url" && (
              <Input
                id={block.id}
                type="url"
                placeholder={block.placeholder}
                required={block.required}
                value={formData[block.id] || block.defaultValue || ""}
                onChange={(e) => handleChange(block.id, e.target.value)}
              />
            )}
            
            {block.type === "number" && (
              <Input
                id={block.id}
                type="number"
                placeholder={block.placeholder}
                required={block.required}
                min={block.validation?.min}
                max={block.validation?.max}
                value={formData[block.id] || block.defaultValue || ""}
                onChange={(e) => handleChange(block.id, e.target.value)}
              />
            )}
            
            {block.type === "textarea" && (
              <Textarea
                id={block.id}
                placeholder={block.placeholder}
                required={block.required}
                value={formData[block.id] || block.defaultValue || ""}
                onChange={(e) => handleChange(block.id, e.target.value)}
                rows={4}
              />
            )}
            
            {block.type === "select" && (
              <Select
                value={formData[block.id] || block.defaultValue || ""}
                onValueChange={(value) => handleChange(block.id, value)}
                required={block.required}
              >
                <SelectTrigger>
                  <SelectValue placeholder={block.placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                  {block.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {block.type === "checkbox" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={block.id}
                  checked={formData[block.id] || false}
                  onCheckedChange={(checked) => handleChange(block.id, checked)}
                  required={block.required}
                />
                <Label htmlFor={block.id} className="cursor-pointer">
                  {block.placeholder || block.label}
                </Label>
              </div>
            )}
            
            {block.type === "radio" && (
              <RadioGroup
                value={formData[block.id] || block.defaultValue || ""}
                onValueChange={(value) => handleChange(block.id, value)}
                required={block.required}
              >
                {block.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${block.id}-${option}`} />
                    <Label htmlFor={`${block.id}-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {block.type === "date" && (
              <Input
                id={block.id}
                type="date"
                required={block.required}
                value={formData[block.id] || block.defaultValue || ""}
                onChange={(e) => handleChange(block.id, e.target.value)}
              />
            )}
            
            {block.type === "file" && (
              <Input
                id={block.id}
                type="file"
                required={block.required}
                onChange={(e) => handleChange(block.id, e.target.files?.[0])}
              />
            )}
          </div>
        );
      })}
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          settings?.submitButtonText || "Submit"
        )}
      </Button>
    </form>
  );
}