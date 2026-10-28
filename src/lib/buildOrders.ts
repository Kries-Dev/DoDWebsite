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

// Where each god sits in Kries's "Choose your deity" wall: its pantheon scene, weather and cut-out medallion.
import wall from '../data/pantheon-wall.json';
type WallSlot = { slot: string; medal: string };
type WallPanel = { id: string; image: string; imageSmall?: string; sky?: string; filler?: boolean; fx?: string[]; slots: WallSlot[] };
const wallPanels = (wall.rows as WallPanel[][]).flat().filter((p) => !p.filler);
export const scene = (slug: string) => {
  const panel = wallPanels.find((p) => p.slots.some((s) => s.slot === slug));
  if (!panel) return null;
  return { id: panel.id, image: panel.image, imageSmall: panel.imageSmall, sky: panel.sky ?? panel.image, fx: panel.fx ?? [], medal: panel.slots.find((s) => s.slot === slug)!.medal };
};
