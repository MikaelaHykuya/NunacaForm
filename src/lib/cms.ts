import { blogPosts, BlogPost } from '@/data/blogPosts';
import { supabase, pullBlogPosts, pullBlogPost, pullUseCases, UseCaseRow } from './supabase';

export interface UseCaseItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

function mapBlogRow(row: {
  slug: string;
  title: string;
  category: string;
  author: string;
  author_role: string;
  date: string;
  read_time: string;
  excerpt: string;
  content: string[];
}): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category || 'Blog',
    author: row.author || 'Nunaca IT Team',
    authorRole: row.author_role || '',
    date: row.date,
    readTime: row.read_time || '',
    excerpt: row.excerpt || '',
    content: Array.isArray(row.content) ? row.content : [],
  };
}

function mapUseCaseRow(row: UseCaseRow): UseCaseItem {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || '',
    icon: row.icon || 'Sparkles',
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (!supabase) return blogPosts;
  try {
    const rows = await pullBlogPosts();
    if (rows.length === 0) return blogPosts;
    return rows.map(mapBlogRow).sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch {
    return blogPosts;
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!supabase) return blogPosts.find((p) => p.slug === slug) ?? null;
  try {
    const row = await pullBlogPost(slug);
    if (row) return mapBlogRow(row);
  } catch {
    // lanjut ke fallback statis
  }
  return blogPosts.find((p) => p.slug === slug) ?? null;
}

export async function getAllUseCases(): Promise<UseCaseItem[]> {
  if (!supabase) return [];
  try {
    const rows = await pullUseCases();
    if (rows.length === 0) return [];
    return rows.map(mapUseCaseRow);
  } catch {
    return [];
  }
}