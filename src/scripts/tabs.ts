// Tabs: <div data-tabs> with buttons [role=tab][aria-controls] and panels [role=tabpanel].
// The tab named in the URL hash (#season-2, #got, …) opens on load, and switching updates the hash,
// so a tab can be linked to directly. Arrow keys move between tabs.
function initTabs() {
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
    if (root.dataset.tabsReady) return;
    root.dataset.tabsReady = '1';
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const select = (tab: HTMLButtonElement, updateHash = true) => {
      for (const t of tabs) {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls')!);
        if (panel) panel.hidden = !on;
      }
      if (updateHash) history.replaceState(history.state, '', `#${tab.dataset.hash}`);
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const next = tabs[(i + d + tabs.length) % tabs.length];
        next.focus(); select(next);
      });
    });
    const fromHash = tabs.find((t) => `#${t.dataset.hash}` === location.hash);
    if (fromHash) select(fromHash, false);
  });
}
document.addEventListener('astro:page-load', initTabs);
