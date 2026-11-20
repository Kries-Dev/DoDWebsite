import events from '../data/events.json';
import history from '../data/event-history.json';

export type DodEvent = (typeof events)[number] & { tba?: boolean; logo?: string };
export type PastEvent = (typeof history.events)[number] & { winner?: string; result?: string; prize?: string; video?: string; bracket?: string; page?: string };

// Split at build time. The deploy workflow rebuilds daily, so "upcoming" stays current.
// Events with "tba": true have no date yet and always count as upcoming.
const today = new Date().toISOString().slice(0, 10);

export const upcoming = (events as DodEvent[])
  .filter((e) => e.tba || e.end >= today)
  .sort((a, b) => a.start.localeCompare(b.start));

export const past = (events as DodEvent[])
  .filter((e) => !e.tba && e.end < today)
  .sort((a, b) => b.start.localeCompare(a.start));

export const allEvents = events as DodEvent[];

// The full DoD record, newest first.
export const pastEvents = ([...history.events] as PastEvent[]).sort((a, b) => b.sort.localeCompare(a.sort));
export const pastByYear = pastEvents.reduce<[string, PastEvent[]][]>((acc, e) => {
  const y = e.sort.slice(0, 4);
  const last = acc[acc.length - 1];
  if (last && last[0] === y) last[1].push(e); else acc.push([y, [e]]);
  return acc;
}, []);
