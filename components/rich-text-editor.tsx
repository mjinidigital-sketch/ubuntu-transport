"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Quote,
  Code,
  Minus,
  Pilcrow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const COLORS = [
  { color: "#000000", label: "Black" },
  { color: "#ef4444", label: "Red" },
  { color: "#f97316", label: "Orange" },
  { color: "#eab308", label: "Yellow" },
  { color: "#22c55e", label: "Green" },
  { color: "#06b6d4", label: "Cyan" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#8b5cf6", label: "Purple" },
  { color: "#ec4899", label: "Pink" },
  { color: "#64748b", label: "Slate" },
  { color: "#ffffff", label: "White" },
];

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className={`h-8 w-8 p-0 transition-all ${
              isActive
                ? "bg-primary/15 text-primary border border-primary/30 shadow-sm"
                : "hover:bg-muted"
            }`}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Type your content here...",
  className = "",
  minHeight = "280px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "rte-link",
        },
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: "rte-image",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rte-editor focus:outline-none",
        "data-placeholder": placeholder,
      },
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addImageFromUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // Get upload URL from Convex
        const response = await fetch('/api/storage/upload-url', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to get upload URL');
        }
        
        const { uploadUrl } = await response.json();

        if (!uploadUrl) {
          throw new Error('No upload URL returned');
        }

        // Upload file
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        const { storageId } = await uploadResponse.json();

        if (!storageId) {
          throw new Error('No storage ID returned');
        }

        // Get storage URL
        const urlResponse = await fetch('/api/storage/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storageId }),
        });

        if (!urlResponse.ok) {
          throw new Error('Failed to get storage URL');
        }

        const { url } = await urlResponse.json();

        if (url) {
          editor?.chain().focus().setImage({ src: url }).run();
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image. Please try again.');
      }
    };
    input.click();
  }, [editor]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div
        className="rounded-md border bg-muted/20 animate-pulse flex items-center justify-center text-muted-foreground text-sm"
        style={{ minHeight }}
      >
        Loading editor…
      </div>
    );
  }

  return (
    <div className={`rte-wrapper rounded-md border overflow-hidden ${className}`}>
      {/* ── Toolbar ── */}
      <div className="rte-toolbar border-b bg-muted/30 p-1.5 flex flex-wrap gap-0.5 items-center">
        {/* Paragraph / Headings */}
        <div className="flex gap-0.5 items-center">
          <ToolbarButton
            title="Paragraph"
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive("paragraph") && !editor.isActive("heading")}
          >
            <Pilcrow className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Heading 1 (H1)"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
          >
            <Heading1 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Heading 2 (H2)"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Heading 3 (H3)"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
          >
            <Heading3 className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Text Formatting */}
        <div className="flex gap-0.5 items-center">
          <ToolbarButton
            title="Bold (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Italic (Ctrl+I)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Underline (Ctrl+U)"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Inline Code"
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
          >
            <Code className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Lists + Blockquote */}
        <div className="flex gap-0.5 items-center">
          <ToolbarButton
            title="Bullet List"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Numbered List"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Blockquote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
          >
            <Quote className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Horizontal Rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Alignment */}
        <div className="flex gap-0.5 items-center">
          <ToolbarButton
            title="Align Left"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Align Center"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Align Right"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
          >
            <AlignRight className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Justify"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Link + Image */}
        <div className="flex gap-0.5 items-center">
          <ToolbarButton
            title="Insert / Edit Link"
            onClick={addLink}
            isActive={editor.isActive("link")}
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="Insert Image (URL)" onClick={addImage}>
            <ImageIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="Upload Image" onClick={addImageFromUpload}>
            <Upload className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Colors */}
        <div className="flex gap-0.5 items-center flex-wrap">
          {COLORS.map(({ color, label }) => (
            <TooltipProvider key={color}>
              <Tooltip>
                <TooltipTrigger>
                  <button
                    type="button"
                    className="w-5 h-5 rounded-sm border border-border hover:scale-125 transition-transform focus:outline-none focus:ring-2 focus:ring-ring"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                    aria-label={`Color: ${label}`}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().unsetColor().run()}
                  className="text-[10px] font-semibold px-1.5 h-5 rounded-sm border border-border hover:bg-muted transition-colors"
                  aria-label="Remove color"
                >
                  A
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Remove color
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="ml-auto flex gap-0.5 items-center">
          <Separator orientation="vertical" className="h-5 mx-0.5" />
          <ToolbarButton
            title="Undo (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Redo (Ctrl+Y)"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>
      </div>

      {/* Active format status bar */}
      <div className="rte-status border-b bg-muted/10 px-3 py-1 flex gap-2 text-[11px] text-muted-foreground min-h-[22px] select-none">
        {editor.isActive("heading", { level: 1 }) && (
          <span className="font-bold text-foreground tracking-tight">H1 — Heading 1</span>
        )}
        {editor.isActive("heading", { level: 2 }) && (
          <span className="font-bold text-foreground tracking-tight">H2 — Heading 2</span>
        )}
        {editor.isActive("heading", { level: 3 }) && (
          <span className="font-bold text-foreground tracking-tight">H3 — Heading 3</span>
        )}
        {!editor.isActive("heading") && <span>Paragraph</span>}
        {editor.isActive("bold") && <span className="font-bold">· Bold</span>}
        {editor.isActive("italic") && <span className="italic">· Italic</span>}
        {editor.isActive("underline") && <span className="underline">· Underline</span>}
        {editor.isActive("strike") && <span className="line-through">· Strike</span>}
        {editor.isActive("bulletList") && <span>· Bullet list</span>}
        {editor.isActive("orderedList") && <span>· Numbered list</span>}
        {editor.isActive("blockquote") && <span>· Blockquote</span>}
        {editor.isActive("link") && (
          <span className="text-blue-500">· Link</span>
        )}
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="rte-content"
        style={{ minHeight }}
      />
    </div>
  );
}
