import { BASE_URL } from '../../lib/constants';
import { NextResponse } from 'next/server';

export const revalidate = 60 * 60; // revalidate every hour

const staticPages = ['/', '/about', '/delivery', '/blog', '/contact'];

export async function GET() {
  const pages = staticPages;
  const today = new Date().toISOString().split('T')[0];
  const urls = pages
    .map((path) => {
      const priority = path === '/' ? '1.0' : '0.8';
      return `<url><loc>${BASE_URL}${path}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}