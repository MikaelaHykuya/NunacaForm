import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/builder', '/admin', '/form', '/unsubscribe', '/api/'],
      },
    ],
    sitemap: 'https://nunacagroupindonesia.com/sitemap.xml',
  };
}