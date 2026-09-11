import type { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blogPosts';

const BASE = 'https://nunacagroupindonesia.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/form`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/tech`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/usecases`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/blog`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}