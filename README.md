# Mirthy Patisserie Café: public website

Static HTML, CSS and a small vanilla JS file. No build step, no dependencies. It is separate from the B2B order-desk app in `../web`.

## Run locally
```bash
python3 -m http.server 4000 --directory site
```

## Before launch (placeholders to replace)
- **Dish photos**: `assets/img/dishes/*.svg` are illustrations. Export real photos as WebP (4:5, about 1000x1250, under 120 KB each), then update the `<img src>`, `alt`, `data-name` and `data-note` of each slide in `index.html`. Keep the first slide's `<link rel="preload">` in sync.
- **Cakes (`#cakes`)**: the six cards in `index.html` and the SVGs in `assets/img/cakes/` are placeholders. Add real WebP photos (4:5, about 1000x1250, under 120 KB), update each card's `src`, `alt`, description and `data-*` facts, and set the WhatsApp number, phone and email in the `CONTACT` object at the top of `assets/js/cakes.js`. Cards are plain HTML, so no JavaScript is needed to add or remove one (the ring needs 5 or more; fewer shows a scrollable row). No prices are shown on purpose.
- **Founders (two)**: names, roles, photos (`assets/img/founder-1.svg` and `founder-2.svg`) and the story text in `#about` are drafts.
- **Domain**: add `<link rel="canonical">`, `og:url`, an absolute `og:image` URL and a `sitemap.xml` once the domain is final.
- Hosting: `_headers` sets cache rules for Cloudflare Pages or Netlify. Make sure the host serves Brotli or gzip.

## Brand
Primary `#4C7390` (sampled from the logo). Fonts: Cormorant Garamond and IBM Plex Sans, self-hosted in `assets/fonts`.
