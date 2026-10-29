# thedodclan.com

The Deities of Death website. Static site built with [Astro](https://astro.build), deployed to GitHub Pages by GitHub Actions on every push to `main` (and rebuilt weekly so upcoming/past events stay correct).

## Run it locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs dist/
```

## Where content lives

Most updates are edits to one JSON file — no page code needed.

| What | File |
| --- | --- |
| Links, socials, Discord invite, email, donate, shop | `src/data/site.json` |
| Events (upcoming/past is worked out from the dates) | `src/data/events.json` |
| Coaches, ELO, prices | `src/data/coaches.json` |
| Tools and mods, download links | `src/data/projects.json` |
| Build-order gods and pantheons | `src/data/gods.json` |
| MCL podcast videos | `src/data/media.json` |
| Colours, type, spacing | `src/styles/global.css` |

Pages are in `src/pages/` — the folder structure is the URL structure.

### Adding an event

Add an object to `src/data/events.json` with a unique `slug`, `start`/`end` dates (`YYYY-MM-DD`), a `when` line as visitors should read it, and `body` paragraphs. Put a sign-up URL in `signup`, or leave it `null` to point people to Discord. The page appears at `/events/<slug>/`.

## Build orders

The build-order section is generated from the [Kries-Dev/BuildOrders](https://github.com/Kries-Dev/BuildOrders) repo:

```bash
node scripts/sync-build-orders.mjs ../BuildOrders   # path to your local clone
```

It reads `Build Orders/*.html` (file name pattern `God - Build name - Author(s)[ - ECO|RUSH|WATER].html`), pulls the Classical/Heroic/Mythic times out of each page, and resizes the god art from `assets/<god>/` into `public/gods/`. The deploy workflow runs it on every deploy and once a day, so a build pushed to BuildOrders shows up within a day — or immediately if BuildOrders triggers a rebuild:

```yaml
# .github/workflows/notify-site.yml in Kries-Dev/BuildOrders
on: { push: { branches: [main] } }
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - run: gh api repos/Kries-Dev/dod-site/dispatches -f event_type=build-orders-updated
        env: { GH_TOKEN: "${{ secrets.SITE_DISPATCH_TOKEN }}" }   # fine-grained token, Contents: write on dod-site
```

## Logo

`brand-source/reaper-transparent.png` (from `Logos/DeitiesofDeath2.png`) → `node scripts/make-logo.mjs` writes the header/footer sizes, favicons and touch icon.

## Still to fill in

These were not in the Wix capture. Until they are set, the site falls back to the Discord invite.

- [ ] `site.json` → `shopUrl`: the Fourthwall shop link
- [ ] `site.json` → Facebook URL in `socials`
- [ ] `site.json` → `discord`: confirm the permanent invite (the Wix site used both `bRyTS52tK5` and `SmJ28VzEQU`)
- [ ] `site.json` → `businessEmail`: switch to `business@thedodclan.com` once forwarding is set up
- [ ] `site.json` → `tryoutsFormAction`: a form endpoint (e.g. Formspree) to turn on the War for Westeros sign-up form; while `null`, the page sends people to Discord
- [ ] `projects.json` → `url` per mod: link to the download (GitHub Releases recommended) or the soundboard page
- [ ] `events.json` → Monthly FFA start time: Wix listed 20:00 CET, the event text said 18:00 GMT
- [ ] `src/pages/privacy.astro`: review the draft privacy notice

## Where it runs

The repo is `Kries-Dev/DoDWebsite`. With Settings → Pages → Source set to **GitHub Actions**, every push to `main` deploys to:

- **https://kries-dev.github.io/DoDWebsite/** — preview while the design is being worked on
- **https://thedodclan.com/** — automatically, once the custom domain is set (no code change)

The workflow asks GitHub Pages for the address and passes it to the build (`SITE_URL`, `SITE_BASE`). Pages keep writing plain root links (`/coaching/`, `/gods/zeus/portrait.webp`); `integrations/base-path.mjs` prefixes them with `/DoDWebsite` after the build when needed. To test the sub-path build locally:

```bash
SITE_URL=https://kries-dev.github.io SITE_BASE=/DoDWebsite npm run build
```

## Going live on thedodclan.com

1. (Done) Repo `Kries-Dev/DoDWebsite`, Pages source **GitHub Actions**.
2. Check the preview at `kries-dev.github.io/DoDWebsite/`.
3. Settings → Pages → Custom domain: `thedodclan.com`.
4. At the registrar that holds thedodclan.com: turn off the frame/forwarding to Wix, then add
   - A records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - CNAME `www` → `kries-dev.github.io`
5. When the certificate is issued, tick **Enforce HTTPS**.
6. Keep the Wix site until the new one resolves everywhere, then cancel the Wix plan.

Old Wix URLs (`/blank-2`, `/BuildOrders`, `/event-list`, …) redirect to their new pages — see `astro.config.mjs`.
