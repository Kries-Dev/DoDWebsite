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

## Still to fill in

These were not in the Wix capture. Until they are set, the site falls back to the Discord invite.

- [ ] `site.json` → `logo`: put the logo in `public/brand/` and set e.g. `"/brand/dod-logo.svg"` (a typographic DoD mark is shown meanwhile)
- [ ] `site.json` → `shopUrl`: the Fourthwall shop link
- [ ] `site.json` → Facebook URL in `socials`
- [ ] `site.json` → `discord`: confirm the permanent invite (the Wix site used both `bRyTS52tK5` and `SmJ28VzEQU`)
- [ ] `site.json` → `businessEmail`: switch to `business@thedodclan.com` once forwarding is set up
- [ ] `site.json` → `tryoutsFormAction`: a form endpoint (e.g. Formspree) to turn on the War for Westeros sign-up form; while `null`, the page sends people to Discord
- [ ] `projects.json` → `url` per mod: link to the download (GitHub Releases recommended) or the soundboard page
- [ ] `gods.json` links assume `https://kries-dev.github.io/BuildOrders/<god>.html` — check the file names match
- [ ] `events.json` → Monthly FFA start time: Wix listed 20:00 CET, the event text said 18:00 GMT
- [ ] `src/pages/privacy.astro`: review the draft privacy notice

## Going live on thedodclan.com

1. Create the repo (e.g. `Kries-Dev/dod-site`) and push this folder to `main`.
2. Repo → Settings → Pages → Source: **GitHub Actions**. Until the custom domain is set, the preview at `kries-dev.github.io/dod-site/` shows unstyled pages and broken links — the site is built for the domain root.
3. Settings → Pages → Custom domain: `thedodclan.com`.
4. At the registrar that holds thedodclan.com: turn off the frame/forwarding to Wix, then add
   - A records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - CNAME `www` → `kries-dev.github.io`
5. When the certificate is issued, tick **Enforce HTTPS**.
6. Keep the Wix site until the new one resolves everywhere, then cancel the Wix plan.

Old Wix URLs (`/blank-2`, `/BuildOrders`, `/event-list`, …) redirect to their new pages — see `astro.config.mjs`.
