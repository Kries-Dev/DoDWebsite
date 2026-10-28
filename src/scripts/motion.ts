// Site-wide motion: scroll reveals, staggered groups, parallax art, count-up numbers.
// Runs on every page, including after view-transition navigations (astro:page-load).
// Everything is skipped for visitors who ask for reduced motion.

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let cleanup: (() => void) | null = null;

function reveal() {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.in)'));
  // Children of a [data-stagger] group come in one after another.
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    Array.from(group.querySelectorAll<HTMLElement>(':scope > [data-reveal]')).forEach((el, i) => {
      el.style.setProperty('--i', String(Math.min(i, 12)));
    });
  });
  if (reduce() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return () => {};
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

function parallax() {
  const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!layers.length || reduce()) return () => {};
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    for (const el of layers) {
      const speed = Number(el.dataset.parallax) || 0.15;
      el.style.setProperty('--parallax', `${(y * speed).toFixed(1)}px`);
    }
    ticking = false;
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
  return () => window.removeEventListener('scroll', onScroll);
}

function countUp() {
  const nums = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
  if (!nums.length || reduce()) return () => {};
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      io.unobserve(el);
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix ?? '';
      const start = performance.now();
      const dur = 1100;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-GB') + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, { threshold: 0.6 });
  nums.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

document.addEventListener('astro:page-load', () => {
  cleanup?.();
  const fns = [reveal(), parallax(), countUp()];
  cleanup = () => fns.forEach((f) => f());
});

// God medallion morph: only the medallion that was clicked gets a transition name, so it alone flies
// into the god page header (and back again on the way out). Naming every medallion on the wall at once
// would make the other 22 fade over the header during the transition.
const godSlug = (url: URL) => url.pathname.match(/^\/games\/aom\/build-orders\/([a-z]+)\/$/)?.[1];
document.addEventListener('astro:before-preparation', (e) => {
  const slug = godSlug(e.to);
  const img = (e.sourceElement as HTMLElement | undefined)?.closest?.('a.medal, a.sib-card')?.querySelector('img');
  if (slug && img) img.style.viewTransitionName = `god-${slug}`;
});
document.addEventListener('astro:before-swap', (e) => {
  const slug = godSlug(e.from);
  if (!slug || godSlug(e.to)) return;
  const img = e.newDocument.querySelector<HTMLImageElement>(`a.medal[href$="/${slug}/"] img`);
  if (img) img.style.viewTransitionName = `god-${slug}`;
});
