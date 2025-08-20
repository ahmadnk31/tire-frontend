import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://ariana-bandencentraal.com';

// Static routes with their priority and change frequency
const staticRoutes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/products', priority: '0.9', changefreq: 'hourly' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/size-guide', priority: '0.6', changefreq: 'monthly' },
  { url: '/cart', priority: '0.3', changefreq: 'never' },
  { url: '/wishlist', priority: '0.3', changefreq: 'never' },
];

const generateSitemap = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => 
  `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
).join('\n')}
</urlset>`;

  // Write sitemap to public directory
  const publicDir = path.join(process.cwd(), 'public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  
  fs.writeFileSync(sitemapPath, sitemap);
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
};

// Run the generator
generateSitemap();