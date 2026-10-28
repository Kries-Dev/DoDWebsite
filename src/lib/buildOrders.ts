import builds from '../data/build-orders.json';
import pantheons from '../data/gods.json';

export type Build = (typeof builds)[number] & { classical?: string; advance?: string; heroic?: string; mythic?: string };
export type God = { name: string; slug: string; pantheon: string; builds: Build[] };

export const allBuilds = builds as Build[];

export const gods: God[] = pantheons.flatMap((p) =>
  p.gods.map((name) => {
    const slug = name.toLowerCase();
    return { name, slug, pantheon: p.pantheon, builds: allBuilds.filter((b) => b.god === slug) };
  }),
);

export const godsByPantheon = pantheons.map((p) => ({
  pantheon: p.pantheon,
  gods: gods.filter((g) => g.pantheon === p.pantheon),
}));

export const contributors = new Set(
  allBuilds.flatMap((b) => b.authors.split(/\s*(?:&|,)\s*/).map((a) => a.toLowerCase())).filter(Boolean),
).size;

export const typeLabel: Record<string, string> = { eco: 'Eco', rush: 'Rush', water: 'Water' };

export const art = (slug: string) => ({
  portrait: `/gods/${slug}/portrait.webp`,
  art: `/gods/${slug}/art.webp`,
  card: `/gods/${slug}/card.webp`,
});
