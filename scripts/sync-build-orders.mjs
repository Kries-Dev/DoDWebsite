// Reads the Kries-Dev/BuildOrders repo and prepares everything the build-order pages need:
//   - src/data/build-orders.json  (one entry per build: god, name, authors, type, age-up times, link)
//   - public/gods/<god>/portrait.webp, art.webp, card.webp  (resized from assets/<god>/)
//   - public/gods/minor-bg.webp   (shared header background)
//
// Usage:  node scripts/sync-build-orders.mjs [path-to-BuildOrders-repo]
// Default path: ../BuildOrders  (CI checks the repo out to vendor/BuildOrders)
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const repo = path.resolve(process.argv[2] ?? process.env.BUILD_ORDERS_REPO ?? '../BuildOrders');
const buildsDir = path.join(repo, 'Build Orders');
const assetsDir = path.join(repo, 'assets');
const pagesBase = 'https://kries-dev.github.io/BuildOrders/Build%20Orders/';
const pantheons = JSON.parse(await fs.readFile('src/data/gods.json', 'utf8'));
const gods = pantheons.flatMap((p) => p.gods.map((name) => ({ name, slug: name.toLowerCase(), pantheon: p.pantheon })));
const godBySlug = new Map(gods.map((g) => [g.slug, g]));

// ── Art ────────────────────────────────────────────────────────────────────
// Each assets/<god>/ folder holds a square portrait (~360px) and a large artwork; tell them apart by size.
const outGods = 'public/gods';
await fs.mkdir(outGods, { recursive: true });
await sharp(path.join(assetsDir, 'Minor_bg.png')).resize({ width: 1920 }).webp({ quality: 72 }).toFile(path.join(outGods, 'minor-bg.webp'));

const art = {};
for (const g of gods) {
  const dir = path.join(assetsDir, g.slug);
  const files = (await fs.readdir(dir)).filter((f) => /\.(webp|png|jpe?g)$/i.test(f));
  const withSize = await Promise.all(files.map(async (f) => {
    const m = await sharp(path.join(dir, f)).metadata();
    return { f, w: m.width, h: m.height, px: m.width * m.height };
  }));
  withSize.sort((a, b) => a.px - b.px);
  const portrait = withSize[0];
  const artwork = withSize[withSize.length - 1];
  const out = path.join(outGods, g.slug);
  await fs.mkdir(out, { recursive: true });
  await sharp(path.join(dir, portrait.f)).resize(240, 240, { fit: 'cover' }).webp({ quality: 85 }).toFile(path.join(out, 'portrait.webp'));
  await sharp(path.join(dir, artwork.f)).resize({ width: 1100, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(out, 'art.webp'));
  await sharp(path.join(dir, artwork.f)).resize(640, 800, { fit: 'cover', position: 'attention' }).webp({ quality: 74 }).toFile(path.join(out, 'card.webp'));
  art[g.slug] = { portraitFrom: portrait.f, artFrom: artwork.f };
}

// ── Builds ─────────────────────────────────────────────────────────────────
const TYPES = { eco: 'eco', rush: 'rush', water: 'water' };
const tidyAuthor = (s) => s.replace(/(^|[\s,&])DoD\]/g, '$1[DoD]').replace(/\s{2,}/g, ' ').trim();
const tidyName = (s) => s.replace(/\b(\d)_(\d{2})\b/g, '$1:$2').replace(/\s{2,}/g, ' ').trim();

function classify(name, explicit) {
  if (explicit) return explicit;
  const lower = name.toLowerCase();
  if (/water|naval|dock|fish/.test(lower)) return 'water';
  if (/rush|raid|pickaxe|pressure|aggro|fast.*cav|cav.*raid|tower|fort/.test(lower)) return 'rush';
  return 'eco';
}

function ageTimes(htmlText) {
  const text = htmlText
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
  const out = {};
  for (const age of ['Classical', 'Heroic', 'Mythic']) {
    const m = text.match(new RegExp(`${age}\\s*\\(\\s*(\\d{1,2})[:.](\\d{2})\\s*\\)`));
    if (m) out[age.toLowerCase()] = `${Number(m[1])}:${m[2]}`;
  }
  // No Classical arrival time listed: fall back to the time the build clicks Advance.
  if (!out.classical) {
    const adv = text.match(/Advance[^()]{0,25}\(\s*(\d{1,2})[:.](\d{2})\s*\)/);
    if (adv) out.advance = `${Number(adv[1])}:${adv[2]}`;
  }
  return out;
}

const skipped = [];
const builds = [];
for (const file of (await fs.readdir(buildsDir)).filter((f) => f.endsWith('.html')).sort()) {
  let parts = file.replace(/\.html$/i, '').split(' - ').map((p) => p.trim());
  // Files named "Isis Speedy Classical 2 TC - Author": god and build name share the first part.
  if (parts.length === 2) {
    const [first, ...rest] = parts[0].split(' ');
    parts = [first, rest.join(' '), parts[1]];
  }
  let explicit = null;
  if (parts.length >= 4 && TYPES[parts.at(-1).toLowerCase()]) explicit = TYPES[parts.pop().toLowerCase()];
  const god = godBySlug.get(parts[0].toLowerCase());
  if (!god || parts.length < 3) { skipped.push(file); continue; }
  const name = tidyName(parts.slice(1, -1).join(' - '));
  const authors = tidyAuthor(parts.at(-1));
  const times = ageTimes(await fs.readFile(path.join(buildsDir, file), 'utf8'));
  builds.push({
    god: god.slug,
    name,
    authors,
    type: classify(name, explicit),
    ...times,
    url: pagesBase + encodeURIComponent(file),
  });
}

await fs.writeFile('src/data/build-orders.json', JSON.stringify(builds, null, 2) + '\n');

const counts = Object.fromEntries(gods.map((g) => [g.slug, builds.filter((b) => b.god === g.slug).length]));
console.log(`Synced ${builds.length} builds for ${gods.length} gods from ${repo}`);
console.log('Per god:', counts);
if (skipped.length) console.log('Skipped (name not recognised):', skipped);
