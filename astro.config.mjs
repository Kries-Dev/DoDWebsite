// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import basePath from './integrations/base-path.mjs';

// Where the site is served. The deploy workflow fills these in from GitHub Pages:
//   no custom domain  → SITE_URL=https://kries-dev.github.io  SITE_BASE=/DoDWebsite
//   thedodclan.com    → SITE_URL=https://thedodclan.com       SITE_BASE=/
const site = process.env.SITE_URL || 'https://thedodclan.com';
const base = process.env.SITE_BASE || '/';

// Old Wix slugs → new pages, so any saved or shared link keeps working.
const wixRedirects = {
  '/blank-2': '/competitions/mcl/',
  '/BuildOrders': '/games/aom/build-orders/',
  '/blank-1': '/merch/',
  '/event-list': '/events/',
  '/blank-7': '/coaching/',
  '/blank-3': '/projects/',
  '/blank': '/about/',
  '/event-details/mythic-clan-league-mcl-season-1': '/events/mcl-season-1/',
  '/event-details/monthly-dod-ffa': '/events/monthly-ffa-2026-03/',
};

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  redirects: wixRedirects,
  integrations: [sitemap(), basePath(base, site)],
});
