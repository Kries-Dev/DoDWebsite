// Lets the site run under a sub-path (e.g. kries-dev.github.io/DoDWebsite/) without changing any page code.
// Pages keep writing root-relative links ("/coaching/", "/gods/zeus/portrait.webp"); after the build this
// prefixes every such link, image, srcset entry and redirect target in dist/*.html with the base path.
// When the base is "/" (thedodclan.com) it does nothing.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function* htmlFiles(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

export default function basePath(base, site = '') {
  const prefix = (base || '/').replace(/\/+$/, '');
  const origin = site.replace(/\/+$/, '');
  return {
    name: 'dod-base-path',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (!prefix) return;
        const fix = (p) => (p.startsWith('/') && !p.startsWith('//') && p !== prefix && !p.startsWith(prefix + '/') ? prefix + p : p);
        let files = 0;
        for await (const file of htmlFiles(fileURLToPath(dir))) {
          const html = await fs.readFile(file, 'utf8');
          const out = html
            .replace(/(\s(?:href|src|action|poster|data-src)=)(["'])(\/[^"']*)\2/g, (_, attr, q, p) => `${attr}${q}${fix(p)}${q}`)
            .replace(/(\ssrcset=)(["'])([^"']*)\2/g, (_, attr, q, set) =>
              `${attr}${q}${set.split(',').map((part) => part.replace(/^(\s*)(\S+)/, (m, sp, u) => sp + fix(u))).join(',')}${q}`)
            .replace(/(content=["']\d+;\s*url=)(\/[^"']*)/gi, (_, a, p) => a + fix(p))
            // Redirect pages carry an absolute canonical without the base path.
            .replace(/(<link rel="canonical" href=")([^"]*)"/g, (m, a, u) => {
              if (!origin || !u.startsWith(origin)) return m;
              return `${a}${origin}${fix(u.slice(origin.length) || '/')}"`;
            });
          if (out !== html) { await fs.writeFile(file, out); files++; }
        }
        logger.info(`Prefixed root-relative URLs with ${prefix} in ${files} pages`);
      },
    },
  };
}
