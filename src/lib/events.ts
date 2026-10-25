import events from '../data/events.json';

export type DodEvent = (typeof events)[number];

// Split at build time. The deploy workflow rebuilds weekly, so "upcoming" stays current.
const today = new Date().toISOString().slice(0, 10);

export const upcoming = events
  .filter((e) => e.end >= today)
  .sort((a, b) => a.start.localeCompare(b.start));

export const past = events
  .filter((e) => e.end < today)
  .sort((a, b) => b.start.localeCompare(a.start));

export const allEvents = events;
