/**
 * Lightweight zero-dependency Markdown renderer.
 * Supports: headings (# ## ###), bold, italic, bold+italic,
 * unordered lists (- / *), ordered lists (1.), blockquotes (>),
 * inline code, fenced code blocks, horizontal rules, and paragraphs.
 */

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseInline(text: string): string {
  // Bold + Italic: ***text*** or ___text___
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  text = text.replace(/___(.*?)___/g, "<strong><em>$1</em></strong>");
  // Bold: **text** or __text__
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__(.*?)__/g, "<strong>$1</strong>");
  // Italic: *text* or _text_
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
  text = text.replace(/_(.*?)_/g, "<em>$1</em>");
  // Inline code: `code`
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Links: [text](url)
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  return text;
}

function parseMarkdown(md: string): string {
  const lines = md.split("\n");
  const output: string[] = [];
  let inCodeBlock = false;
  let codeLang = "";
  let codeLines: string[] = [];
  let inBlockquote = false;
  let blockquoteLines: string[] = [];
  let inUL = false;
  let inOL = false;

  const flushBlockquote = () => {
    if (blockquoteLines.length) {
      output.push(`<blockquote>${parseMarkdown(blockquoteLines.join("\n"))}</blockquote>`);
      blockquoteLines = [];
      inBlockquote = false;
    }
  };
  const flushUL = () => {
    if (inUL) {
      output.push("</ul>");
      inUL = false;
    }
  };
  const flushOL = () => {
    if (inOL) {
      output.push("</ol>");
      inOL = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw;

    // ── Fenced code block ──────────────────────────────────────
    if (!inCodeBlock && /^```/.test(line)) {
      flushBlockquote(); flushUL(); flushOL();
      inCodeBlock = true;
      codeLang = line.slice(3).trim();
      codeLines = [];
      continue;
    }
    if (inCodeBlock) {
      if (/^```/.test(line)) {
        inCodeBlock = false;
        const langClass = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : "";
        output.push(`<pre><code${langClass}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        codeLang = "";
      } else {
        codeLines.push(line);
      }
      continue;
    }

    // ── Horizontal rule ────────────────────────────────────────
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      flushBlockquote(); flushUL(); flushOL();
      output.push("<hr />");
      continue;
    }

    // ── Blockquote ─────────────────────────────────────────────
    if (/^> /.test(line)) {
      flushUL(); flushOL();
      inBlockquote = true;
      blockquoteLines.push(line.slice(2));
      continue;
    }
    if (inBlockquote) {
      flushBlockquote();
    }

    // ── Headings ───────────────────────────────────────────────
    const h4 = line.match(/^#{4}\s+(.*)/);
    const h3 = line.match(/^#{3}\s+(.*)/);
    const h2 = line.match(/^#{2}\s+(.*)/);
    const h1 = line.match(/^#{1}\s+(.*)/);

    if (h4) {
      flushUL(); flushOL();
      output.push(`<h4>${parseInline(h4[1])}</h4>`);
      continue;
    }
    if (h3) {
      flushUL(); flushOL();
      output.push(`<h3>${parseInline(h3[1])}</h3>`);
      continue;
    }
    if (h2) {
      flushUL(); flushOL();
      output.push(`<h2>${parseInline(h2[1])}</h2>`);
      continue;
    }
    if (h1) {
      flushUL(); flushOL();
      output.push(`<h1>${parseInline(h1[1])}</h1>`);
      continue;
    }

    // ── Unordered list ─────────────────────────────────────────
    const ulMatch = line.match(/^[-*]\s+(.*)/);
    if (ulMatch) {
      flushOL();
      if (!inUL) {
        output.push("<ul>");
        inUL = true;
      }
      output.push(`<li>${parseInline(ulMatch[1])}</li>`);
      continue;
    }

    // ── Ordered list ───────────────────────────────────────────
    const olMatch = line.match(/^\d+\.\s+(.*)/);
    if (olMatch) {
      flushUL();
      if (!inOL) {
        output.push("<ol>");
        inOL = true;
      }
      output.push(`<li>${parseInline(olMatch[1])}</li>`);
      continue;
    }

    // ── Empty line → close lists / paragraph break ─────────────
    if (line.trim() === "") {
      flushUL(); flushOL();
      output.push("<br />");
      continue;
    }

    // ── Paragraph ──────────────────────────────────────────────
    flushUL(); flushOL();
    output.push(`<p>${parseInline(line)}</p>`);
  }

  // Flush any open blocks
  flushBlockquote();
  flushUL();
  flushOL();
  if (inCodeBlock) {
    output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }

  return output.join("\n");
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  const html = parseMarkdown(content);

  return (
    <div
      className={[
        // Prose base
        "prose prose-slate dark:prose-invert max-w-none",
        // Headings
        "prose-h1:text-2xl prose-h1:font-extrabold prose-h1:text-foreground prose-h1:mb-3 prose-h1:mt-6",
        "prose-h2:text-xl prose-h2:font-bold prose-h2:text-foreground prose-h2:mb-2 prose-h2:mt-5",
        "prose-h3:text-lg prose-h3:font-semibold prose-h3:text-foreground prose-h3:mb-1.5 prose-h3:mt-4",
        "prose-h4:text-base prose-h4:font-semibold prose-h4:text-primary prose-h4:mb-1 prose-h4:mt-3",
        // Paragraphs
        "prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-2",
        // Lists
        "prose-ul:my-3 prose-ul:pl-5 prose-ul:list-disc prose-li:text-muted-foreground prose-li:my-1",
        "prose-ol:my-3 prose-ol:pl-5 prose-ol:list-decimal",
        // Bold / Strong
        "prose-strong:font-bold prose-strong:text-foreground",
        // Italic
        "prose-em:italic prose-em:text-foreground/80",
        // Inline code
        "prose-code:bg-muted prose-code:text-primary prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none",
        // Code block
        "prose-pre:bg-muted/70 prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto",
        // Blockquote
        "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-4",
        // HR
        "prose-hr:border-border prose-hr:my-6",
        // Links
        "prose-a:text-primary prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-primary/80",
        className,
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
