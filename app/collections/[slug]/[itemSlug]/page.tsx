"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, ExternalLink, Clock, Users, Mail, Tag, Link as LinkIcon, Share2, Phone, ImageIcon, FileText, Star, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GalleryRenderer } from "@/components/gallery-renderer";
import { ContentBlocksRenderer } from "@/components/content-blocks-renderer";
import { MarkdownRenderer } from "@/components/markdown-renderer";

const ICON_NAME_TO_EMOJI: Record<string, string> = {
  briefcase: "💼",
  folder: "📁",
  users: "👥",
  package: "📦",
  services: "💼",
  projects: "📁",
  team: "👥",
  products: "📦",
};

function getIconDisplay(icon?: string): string {
  if (!icon) return "📦";
  if (icon.length > 1 && !/^[a-zA-Z]+$/.test(icon)) return icon;
  return ICON_NAME_TO_EMOJI[icon] || "📦";
}

export default function CollectionItemPage() {
  const router = useRouter();
  const params = useParams();
  const [collection, setCollection] = useState<any>(null);
  const [item, setItem] = useState<any>(null);
  
  const collectionData = useQuery(api.collections.getCollectionBySlug, { slug: params.slug as string });
  const itemData = useQuery(api.collections.getCollectionItemBySlug, { slug: params.itemSlug as string });

  useEffect(() => {
    if (collectionData) {
      setCollection(collectionData);
      if (!collectionData.published) {
        router.push("/collections");
      }
    }
  }, [collectionData, router]);

  useEffect(() => {
    if (itemData) {
      setItem(itemData);
      if (!itemData.published) {
        router.push(`/collections/${params.slug}`);
      }
    }
  }, [itemData, router, params.slug]);

  // SEO effect — MUST be declared before any early returns (Rules of Hooks)
  useEffect(() => {
    if (!item || !collection) return;

    const seoTitle = item.metaTitle || item.title;
    const seoDescription = item.metaDescription || item.description || `Learn more about ${item.title} in our ${collection.name} collection.`;
    const url = `https://yourdomain.com/collections/${collection.slug}/${item.slug}`;
    const ogImageUrl = item.ogImage || item.imageUrl;

    document.title = seoTitle;

    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!metaDesc) {
      metaDesc = document.createElement('meta') as HTMLMetaElement;
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seoDescription);

    const ogTags = [
      { property: 'og:title', content: seoTitle },
      { property: 'og:description', content: seoDescription },
      { property: 'og:image', content: ogImageUrl || '' },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'article' },
    ];

    ogTags.forEach(({ property, content }) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta') as HTMLMetaElement;
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link') as HTMLLinkElement;
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', item.canonicalUrl || url);
  }, [item, collection]);

  if (!collection || !item) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!collection.published || !item.published) {
    return null; // Will redirect via useEffect
  }

  const { title, description, content, imageUrl, icon, tags, metadata, metaTitle, metaDescription, ogImage, canonicalUrl, gallery, galleryType, faq, reviews, contentBlocks } = item;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 px-4 border-b bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <Button asChild variant="ghost" size="sm" className="mb-4 hover:bg-primary/10">
            <Link href={`/collections/${collection.slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {collection.name}
            </Link>
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Button asChild variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
              <Link href="/collections" className="hover:text-foreground transition-colors">
                Collections
              </Link>
            </Button>
            <span>/</span>
            <Button asChild variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
              <Link href={`/collections/${collection.slug}`} className="hover:text-foreground transition-colors">
                {collection.name}
              </Link>
            </Button>
            <span>/</span>
            <span className="text-foreground font-medium">{title}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Image */}
              {imageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border/80 shadow-sm">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {!imageUrl && icon && (
                <div className="aspect-video w-full bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-border/80 flex items-center justify-center">
                  <span className="text-8xl">{getIconDisplay(icon)}</span>
                </div>
              )}

              {/* Title and Description */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold">{title}</h1>
                {description && (
                  <p className="text-xl text-muted-foreground leading-relaxed">{description}</p>
                )}
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-sm cursor-pointer hover:bg-primary/20 transition-colors">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Tabbed Content */}
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-10 bg-muted/80 p-1 rounded-xl border border-border/50">
                  <TabsTrigger value="content" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
                    <span>📝</span> Content
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
                    <span>🖼️</span> Gallery
                  </TabsTrigger>
                  <TabsTrigger value="blocks" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
                    <span>🧱</span> Blocks
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
                    <span>❓</span> FAQ
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer">
                    <span>⭐</span> Reviews
                  </TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6 mt-6">
                {content && (
                    <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                      <MarkdownRenderer content={content} />
                    </div>
                  )}

                  {/* Metadata based on collection type */}
                  {metadata && (
                    <div className="border-t border-border/80 pt-8">
                      <h2 className="text-2xl font-bold mb-6">Details</h2>
                      
                      {(collection.slug === 'services' || collection.slug === 'products' || collection.slug === 'fleet' || collection.slug === 'destinations') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {metadata.duration && (
                            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="font-semibold text-foreground">{metadata.duration}</p>
                              </div>
                            </div>
                          )}
                          {metadata.client && (
                            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Ideal For</p>
                                <p className="font-semibold text-foreground">{metadata.client}</p>
                              </div>
                            </div>
                          )}
                          {metadata.features && metadata.features.length > 0 && (
                            <div className="md:col-span-2 p-6 bg-muted/50 rounded-xl border border-border/50">
                              <p className="text-sm text-muted-foreground mb-4 font-medium">Features</p>
                              <ul className="space-y-3">
                                {metadata.features.map((feature: string, index: number) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                      <span className="text-sm">✓</span>
                                    </div>
                                    <span className="text-foreground">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Project specific */}
                      {collection.slug === 'projects' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {metadata.client && (
                            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Client</p>
                                <p className="font-semibold text-foreground">{metadata.client}</p>
                              </div>
                            </div>
                          )}
                          {metadata.projectDate && (
                            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Calendar className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Project Date</p>
                                <p className="font-semibold text-foreground">{new Date(metadata.projectDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                          )}
                          {metadata.projectUrl && (
                            <div className="md:col-span-2 flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <ExternalLink className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Project URL</p>
                                <a 
                                  href={metadata.projectUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="font-semibold text-primary hover:underline block truncate"
                                >
                                  {metadata.projectUrl}
                                </a>
                              </div>
                            </div>
                          )}
                          {metadata.technologies && metadata.technologies.length > 0 && (
                            <div className="md:col-span-2 p-6 bg-muted/50 rounded-xl border border-border/50">
                              <p className="text-sm text-muted-foreground mb-4 font-medium">Technologies</p>
                              <div className="flex flex-wrap gap-2">
                                {metadata.technologies.map((tech: string, index: number) => (
                                  <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary/20 transition-colors">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Team specific */}
                      {collection.slug === 'team' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {metadata.role && (
                            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Users className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Role</p>
                                <p className="font-semibold text-foreground">{metadata.role}</p>
                              </div>
                            </div>
                          )}
                          {metadata.email && (
                            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Mail className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Email</p>
                                <a 
                                  href={`mailto:${metadata.email}`}
                                  className="font-semibold text-primary hover:underline block truncate"
                                >
                                  {metadata.email}
                                </a>
                              </div>
                            </div>
                          )}
                          <div className="md:col-span-2 flex gap-4">
                            {metadata.linkedin && (
                              <a 
                                href={metadata.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50 hover:bg-muted/80 transition-colors"
                              >
                                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                  <LinkIcon className="w-5 h-5" />
                                </div>
                                <span className="font-semibold">LinkedIn</span>
                              </a>
                            )}
                            {metadata.twitter && (
                              <a 
                                href={metadata.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50 hover:bg-muted/80 transition-colors"
                              >
                                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                  <LinkIcon className="w-5 h-5" />
                                </div>
                                <span className="font-semibold">Twitter</span>
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Product specific */}
                      {collection.slug === 'products' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {metadata.sku && (
                            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Tag className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">SKU</p>
                                <p className="font-semibold text-foreground">{metadata.sku}</p>
                              </div>
                            </div>
                          )}
                          {metadata.stock !== undefined && (
                            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metadata.stock > 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                <div className={`w-5 h-5 rounded-full ${metadata.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Stock Status</p>
                                <p className={`font-semibold ${metadata.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {metadata.stock > 0 ? `${metadata.stock} available` : 'Out of stock'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Gallery Tab */}
                <TabsContent value="gallery" className="space-y-6 mt-6">
                  {gallery && gallery.length > 0 ? (
                    <GalleryRenderer images={gallery} type={galleryType || "grid"} />
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border/50">
                      <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No gallery images added yet</p>
                    </div>
                  )}
                </TabsContent>

                {/* Content Blocks Tab */}
                <TabsContent value="blocks" className="space-y-6 mt-6">
                  {contentBlocks && contentBlocks.length > 0 ? (
                    <ContentBlocksRenderer blocks={contentBlocks} />
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border/50">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No content blocks added yet</p>
                    </div>
                  )}
                </TabsContent>

                {/* FAQ Tab */}
                <TabsContent value="faq" className="space-y-6 mt-6">
                  {faq && faq.length > 0 ? (
                    <Accordion className="w-full">
                      {faq.map((item: any, index: number) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center gap-3">
                              <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                              <span className="font-medium">{item.question}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-muted-foreground pl-7">{item.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border/50">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No FAQ items added yet</p>
                    </div>
                  )}
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-6 mt-6">
                  {reviews && reviews.length > 0 ? (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.round(reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {reviews.map((review: any, index: number) => (
                          <div key={index} className="border border-border/80 rounded-xl p-6 bg-card">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                                  {review.author.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold">{review.author}</p>
                                  <p className="text-xs text-muted-foreground">{review.date}</p>
                                </div>
                              </div>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border/50">
                      <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No reviews added yet</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Quick Actions */}
                <div className="border border-border/80 rounded-2xl p-6 bg-card shadow-sm">
                  <h3 className="font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button className="w-full" variant="default">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Us
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Collection Info */}
                <div className="border border-border/80 rounded-2xl p-6 bg-card shadow-sm">
                  <h3 className="font-semibold mb-4">Collection</h3>
                  <Link 
                    href={`/collections/${collection.slug}`}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-border/50 hover:bg-muted/80 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl border border-primary/20">
                      {getIconDisplay(collection.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{collection.name}</p>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}