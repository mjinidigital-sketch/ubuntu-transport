"use client";

import { Quote, Code, Sparkles, FileText, Image as ImageIcon, Video, Play } from "lucide-react";

interface BlogContentBlock {
  id: string;
  type: "text" | "image" | "video" | "quote" | "code" | "callout" | "divider";
  content?: string;
  caption?: string;
  data?: any;
  order: number;
}

interface BlogBlocksRendererProps {
  blocks: BlogContentBlock[];
}

export function BlogBlocksRenderer({ blocks }: BlogBlocksRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      {sortedBlocks.map((block) => (
        <BlogBlock key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlogBlock({ block }: { block: BlogContentBlock }) {
  switch (block.type) {
    case "text":
      return <TextBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "video":
      return <VideoBlock block={block} />;
    case "quote":
      return <QuoteBlock block={block} />;
    case "code":
      return <CodeBlock block={block} />;
    case "callout":
      return <CalloutBlock block={block} />;
    case "divider":
      return <DividerBlock block={block} />;
    default:
      return null;
  }
}

function TextBlock({ block }: { block: BlogContentBlock }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground">
      <div className="whitespace-pre-wrap text-foreground leading-relaxed">{block.content}</div>
      {block.caption && (
        <p className="text-sm text-muted-foreground mt-2 italic">{block.caption}</p>
      )}
    </div>
  );
}

function ImageBlock({ block }: { block: BlogContentBlock }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/80">
      <img
        src={block.content}
        alt={block.caption || "Blog image"}
        className="w-full h-auto object-cover"
      />
      {block.caption && (
        <div className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground text-center italic">{block.caption}</p>
        </div>
      )}
    </div>
  );
}

function VideoBlock({ block }: { block: BlogContentBlock }) {
  const videoId = extractVideoId(block.content || "", block.data?.videoType || "youtube");
  
  if (block.data?.videoType === "youtube" && videoId) {
    return (
      <div className="aspect-video rounded-2xl overflow-hidden border border-border/80">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  if (block.data?.videoType === "vimeo" && videoId) {
    return (
      <div className="aspect-video rounded-2xl overflow-hidden border border-border/80">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          title="Vimeo video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  if (block.data?.videoType === "custom" && block.content) {
    return (
      <div className="aspect-video rounded-2xl overflow-hidden border border-border/80 bg-black flex items-center justify-center">
        <video controls className="w-full h-full">
          <source src={block.content} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-2xl overflow-hidden border border-border/80 bg-muted/30 flex items-center justify-center">
      <Video className="w-12 h-12 text-muted-foreground" />
    </div>
  );
}

function extractVideoId(url: string, type: string): string | null {
  if (type === "youtube") {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  }
  if (type === "vimeo") {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  }
  return null;
}

function QuoteBlock({ block }: { block: BlogContentBlock }) {
  return (
    <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-xl">
      <Quote className="w-8 h-8 text-primary mb-3" />
      <blockquote className="text-xl font-medium text-foreground italic leading-relaxed">
        {block.content}
      </blockquote>
      {block.caption && (
        <cite className="text-sm text-muted-foreground mt-3 block not-italic">— {block.caption}</cite>
      )}
    </div>
  );
}

function CodeBlock({ block }: { block: BlogContentBlock }) {
  return (
    <div className="bg-slate-950 rounded-xl overflow-hidden border border-border/80">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-border/50">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <Code className="w-4 h-4 text-muted-foreground" />
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-slate-300 font-mono">{block.content}</code>
      </pre>
      {block.caption && (
        <div className="px-4 py-2 bg-slate-900 border-t border-border/50">
          <p className="text-xs text-muted-foreground">{block.caption}</p>
        </div>
      )}
    </div>
  );
}

function CalloutBlock({ block }: { block: BlogContentBlock }) {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-foreground font-medium">{block.content}</p>
          {block.caption && (
            <p className="text-sm text-muted-foreground mt-2">{block.caption}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DividerBlock({ block }: { block: BlogContentBlock }) {
  return (
    <div className="border-t border-border/80">
      {block.caption && (
        <div className="text-center py-4">
          <span className="text-sm font-medium text-muted-foreground">{block.caption}</span>
        </div>
      )}
    </div>
  );
}
