import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://quantpath.brenshock.chatgpt.site';
  return ['', '/privacy', '/terms'].map((path) => ({ url: `${base}${path}`, lastModified: new Date('2026-09-16'), changeFrequency: path ? 'yearly' : 'weekly', priority: path ? 0.3 : 1 }));
}
