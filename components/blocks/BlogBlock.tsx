"use client";

import BlogSectionMagazineLayout from './marketing/blog-sections/magazine-layout';
import HeroFocus from './marketing/blog-sections/hero-focus';
import Carousel from './marketing/blog-sections/carousel';
import CategoryFilter from './marketing/blog-sections/category-filter';
import CompactList from './marketing/blog-sections/compact-list';
import FeaturedWithSidebar from './marketing/blog-sections/featured-with-sidebar';
import AuthorSpotlight from './marketing/blog-sections/author-spotlight';
import PodcastList from './marketing/blog-sections/podcast-list';
import VideoBlog from './marketing/blog-sections/video-blog';

const defaultPosts = [
  {
    id: 1,
    title: 'The Complete Guide to Content Marketing in the Digital Era',
    excerpt: 'Discover how to create a comprehensive content strategy that drives engagement, builds authority, and converts prospects into loyal customers.',
    category: 'Content Strategy',
    date: 'April 15, 2023',
    readTime: '15 min read',
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    author: {
      name: 'Alexandra Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    },
  },
  {
    id: 2,
    title: 'How to Create a Winning Social Media Strategy for 2023',
    excerpt: 'Learn the essential components of an effective social media plan that aligns with your business goals.',
    category: 'Social Media',
    date: 'April 10, 2023',
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    author: {
      name: 'Marcus Johnson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    },
  },
  {
    id: 3,
    title: 'Email Marketing Automation: Best Practices for 2023',
    excerpt: 'Explore how to implement effective email automation that nurtures leads and drives conversions.',
    category: 'Email',
    date: 'April 5, 2023',
    readTime: '10 min read',
    imageUrl: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    author: {
      name: 'Sophia Lee',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    },
  },
  {
    id: 4,
    title: "The Rise of Video Marketing: Why It's Essential for Your Business",
    excerpt: 'Discover why video content has become a non-negotiable part of modern marketing strategies.',
    category: 'Video',
    date: 'April 2, 2023',
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80',
    author: {
      name: 'Daniel Rivera',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    },
  },
  {
    id: 5,
    title: 'Data-Driven Marketing: How to Use Analytics to Improve Campaigns',
    excerpt: 'Learn how to leverage data to optimize your marketing efforts and improve ROI.',
    category: 'Analytics',
    date: 'March 28, 2023',
    readTime: '12 min read',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    author: {
      name: 'Olivia Taylor',
      avatar: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    },
  },
  {
    id: 6,
    title: 'The Complete Guide to SEO: Ranking Higher in 2023',
    excerpt: "Master the essential SEO techniques to improve your website's visibility and organic traffic.",
    category: 'SEO',
    date: 'March 22, 2023',
    readTime: '14 min read',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    author: {
      name: 'James Wilson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    },
  },
];

export interface BlogBlockProps {
  variant?: 'magazine' | 'hero-focus' | 'carousel' | 'category-filter' | 'compact-list' | 'featured-sidebar' | 'author-spotlight' | 'podcast' | 'video';
  title?: string;
  subtitle?: string;
  posts?: Array<{
    id: number;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    readTime: string;
    imageUrl: string;
    author: {
      name: string;
      avatar: string;
    };
  }>;
}

export function BlogBlock({
  variant = 'magazine',
  title = "Latest Articles",
  subtitle = "Stay updated with our latest insights and news",
  posts
}: BlogBlockProps) {
  const postsData = posts || defaultPosts;
  
  switch (variant) {
    case 'hero-focus':
      return <HeroFocus title={title} subtitle={subtitle} />;
    case 'carousel':
      return <Carousel title={title} subtitle={subtitle} posts={postsData} />;
    case 'category-filter':
      return <CategoryFilter title={title} subtitle={subtitle} />;
    case 'compact-list':
      return <CompactList title={title} subtitle={subtitle} />;
    case 'featured-sidebar':
      return <FeaturedWithSidebar title={title} subtitle={subtitle} />;
    case 'author-spotlight':
      return <AuthorSpotlight title={title} subtitle={subtitle} />;
    case 'podcast':
      return <PodcastList title={title} subtitle={subtitle} />;
    case 'video':
      return <VideoBlog title={title} subtitle={subtitle} />;
    case 'magazine':
    default:
      return <BlogSectionMagazineLayout title={title} subtitle={subtitle} posts={postsData} />;
  }
}