import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return ['', '/privacy', '/terms'].map((path) => ({ url: new URL(path || '/', base).toString(), lastModified: new Date('2026-09-22'), changeFrequency: path ? 'yearly' : 'weekly', priority: path ? 0.3 : 1 }));
}
