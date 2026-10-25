// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
  site: 'https://thedodclan.com',
  trailingSlash: 'always',
  redirects: wixRedirects,
  integrations: [sitemap()],
});
