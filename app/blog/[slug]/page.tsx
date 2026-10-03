"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, Share2, Tag, Video } from "lucide-react";
import Link from "next/link";
import { BlogBlocksRenderer } from "@/components/blog-blocks-renderer";
import { BlogAuthorBlock } from "@/components/blog-author-block";
import { useEffect, useState } from "react";

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = useQuery(api.blog.getBlogPostBySlug, { slug: slug as string });
  const categories = useQuery(api.blog.listBlogCategories);

  useEffect(() => {
    if (post) {
      // Update page title
      document.title = post.metaTitle || post.title;

      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaDesc) {
        metaDesc = document.createElement('meta') as HTMLMetaElement;
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', post.metaDescription || post.excerpt || '');

      // Update OG tags
      const ogTags = [
        { property: 'og:title', content: post.metaTitle || post.title },
        { property: 'og:description', content: post.metaDescription || post.excerpt || '' },
        { property: 'og:image', content: post.ogImage || post.featuredImage || '' },
        { property: 'og:type', content: 'article' },
      ];

      ogTags.forEach(({ property, content }) => {
        let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!tag) {
          tag = document.createElement('meta') as HTMLMetaElement;
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      });

      // Update canonical URL
      if (post.canonicalUrl) {
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) {
          canonical = document.createElement('link') as HTMLLinkElement;
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', post.canonicalUrl);
      }
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const category = categories?.find((c) => c.slug === post.category);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 px-4 border-b bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Button>
          </Link>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8 space-y-4">
            {/* Category */}
            {category && (
              <Badge variant="secondary" className="rounded-full gap-2 text-sm">
                <span>{category.icon}</span>
                {category.name}
              </Badge>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">{post.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.publishedAt && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.publishedAt).toLocaleDateString()}
                </span>
              )}
              {post.readTime && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
              )}
              {post.videoUrl && (
                <span className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video
                </span>
              )}
            </div>

            {/* Author */}
            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
              {post.author.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-foreground">{post.author.name}</p>
                {post.author.bio && (
                  <p className="text-sm text-muted-foreground">{post.author.bio}</p>
                )}
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border/80 mb-8">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Video */}
          {post.videoUrl && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border/80 mb-8">
              {post.videoType === "youtube" && (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(post.videoUrl)}`}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              )}
              {post.videoType === "vimeo" && (
                <iframe
                  src={`https://player.vimeo.com/video/${extractVimeoId(post.videoUrl)}`}
                  title="Vimeo video"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              )}
              {post.videoType === "custom" && (
                <video controls className="w-full h-full">
                  <source src={post.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <div className="text-xl text-muted-foreground leading-relaxed mb-8 italic border-l-4 border-primary pl-6">
              {post.excerpt}
            </div>
          )}

          {/* Main Content */}
          {post.content && (
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground mb-8">
              <div 
                className="rte-content" 
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          )}

          {/* Content Blocks */}
          {post.contentBlocks && post.contentBlocks.length > 0 && (
            <BlogBlocksRenderer blocks={post.contentBlocks} />
          )}

          {/* Author Block */}
          <div className="pt-8 border-t border-border/80">
            <BlogAuthorBlock author={post.author} variant="detailed" />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-8 border-t border-border/80">
              <Tag className="w-4 h-4 text-muted-foreground mt-1" />
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="rounded-full">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="flex items-center gap-4 pt-8 border-t border-border/80 mt-8">
            <span className="text-sm text-muted-foreground">Share this article:</span>
            <Button variant="outline" size="icon" className="rounded-full">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}
