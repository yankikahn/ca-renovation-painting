# CA Renovation & Painting LLC — website

A single-page marketing site. Plain HTML + CSS + JS, no build step, no dependencies.
Drop the folder on any static host and it works.

```
ca-renovation-site/
├── index.html      the whole page
├── styles.css      all styling
├── script.js       scroll effects + before/after slider
├── assets/         photos + logo (extracted from the printed pamphlet at 300 dpi)
└── README.md
```

---

## Editing styles.css or script.js? Bump the cache buster

`index.html` loads them as `styles.css?v=2` and `script.js?v=2`. GitHub Pages serves
everything with `Cache-Control: max-age=600`, so a returning visitor can otherwise run a
ten-minute-old script against fresh HTML — which is exactly how a broken scroll-reveal
looked "still broken" after it had been fixed. **Increment both numbers in `index.html`
whenever you change either file.** To check what a visitor is actually getting, hard-reload
(<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>) rather than a normal refresh.

## SEO notes

Free, already done: canonical URL, absolute Open Graph tags (link previews show the hero
photo), `LocalBusiness` structured data with services and the Google Maps link, `sitemap.xml`,
semantic headings, alt text on every image, fast self-hosted assets, mobile-first images.

Deliberately **not** in the structured data: the street address. The client works out of a
house, so they should be set up as a service-area business on Google and the address should
stay hidden. Schema lists Orlando / Central Florida only.

Free and still worth doing:

1. **Add this URL to the Google Business Profile.** It had no website link at all, which is
   the single biggest free win available.
2. **Google Search Console** — free, verify via the HTML meta tag method, then submit
   `sitemap.xml`. This is how you see what people actually search to find them.
3. **Reviews.** Ranking in the map pack tracks review count and recency more than anything
   on this site.

Known ceiling: this is one page, so it can realistically rank for one cluster of terms.
Ranking separately for "kitchen remodeling orlando", "interior painting orlando" and
"pressure washing orlando" eventually needs separate pages. A Spanish version is the biggest
untapped opportunity — they advertise "Se habla español" and Spanish-language local search
has far less competition.

**If the site moves to a custom domain**, update the absolute URLs: `canonical`, `og:url`,
`og:image`, everything in the JSON-LD block, plus `sitemap.xml` and `robots.txt`.

## Still open — 2 things

1. **Facebook link.** The pamphlet gives the page *name*, not a URL, so the link still runs
   a Facebook search for "CA Renovation & Painting LLC". Replace it with the real page URL
   (search `facebook.com/search` in `index.html`).

2. **Before/After section.** It currently shows one real photo as the "after" and a
   labelled placeholder as the "before". Either add real pairs (below) or **delete the
   whole `<section class="ba-sec">` block** so visitors never see the placeholder.

### Already verified

- **Reviews are real**, quoted verbatim from the Google Business Profile
  ([`maps?cid=11060459973701645286`](https://www.google.com/maps?cid=11060459973701645286)) —
  5.0 from 5 reviews. Michael Bordenave's is trimmed to its first two sentences because
  Google hides the rest behind a "More" link. **Never reword the text inside a
  `<blockquote>`**; to shorten a quote, cut at a sentence boundary.
- **Service area** is confirmed: the business is registered in Orlando, FL 32809, so the
  footer and JSON-LD say "Orlando & Central Florida".
- **Rating in structured data** (`aggregateRating` in the JSON-LD) is set to the real 5.0 / 5.
  Update it when the review count changes, or search engines will show a stale number.

---

## Adding real photos

All content in the site comes from the pamphlet. Real job-site photos will make it much
stronger — every image is a plain `<img>` you can swap.

**Before/After pairs.** Save the "before" shot as `assets/before-1.jpg`; the placeholder
panel disappears by itself. Then point the "after" `<img>` in the same block at the
matching finished photo. For a second pair, copy the whole `<div class="ba">` block and
change the two filenames.

**Gallery.** The four `<figure class="gal__i">` blocks in the *Our Work* section. Keep the
`gal__i--wide` class on the two that should span two columns. Landscape crops work best.

**Hero.** `assets/hero.jpg` (landscape, desktop) and `assets/hero-tall.jpg` (portrait,
phones) — both are declared in the `<picture>` block at the top of the hero. Replace both
if you swap the hero, or the phone version will still show the old house.

Photos are plain JPEGs; aim for ~1500–2000 px on the long edge and under ~500 KB each.

---

## Live Google reviews

The three hand-written cards go stale and need editing. If you'd rather the section pull
the newest reviews from Google on its own, replace `<ul class="revs__grid">` with a widget
script at the marked spot in the reviews section.

| Option | Cost | Filter to 5-star only | Notes |
|---|---|---|---|
| **Featurable** | Free | Yes | Connect the Google Business Profile, get a widget + JSON API. Best free pick. |
| **Trustindex** | Free tier | Paid plans | Free plan refreshes less often and carries their badge. |
| **Elfsight** | ~$6/mo | Yes | Most styling control of the hosted widgets. |
| **Google Places API** | Pay-as-you-go | No | Official, but returns only ~5 reviews and can't filter by rating. Needs an API key. |

Two things to know before wiring one up:

- Every hosted widget injects a third-party `<script>`, which is the one dependency this
  site otherwise doesn't have. It costs some load time and the widget's own look is hard to
  match to the black-and-gold design — expect it to read as a visibly separate block.
- Showing only 5-star reviews is fine, but keep the "Read all reviews on Google" link
  visible next to it so the overall rating stays easy to check. A page that shows only
  perfect scores with no way to see the real average is the kind of thing that erodes
  trust, and review-suppression rules apply to businesses in the US.

If you want the section to just work without anyone maintaining it, use Featurable. If you
want it to look like the rest of the page, keep the static cards and refresh them once or
twice a year.

## Publishing

Any static host. No configuration needed.

- **Netlify / Vercel / Cloudflare Pages** — drag the folder onto their dashboard.
- **GitHub Pages** — push the folder to a repo, then Settings → Pages → deploy from branch.

To preview locally:

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

---

## Notes on how it's built

- **Brand** comes from the pamphlet: near-black `#08080A`, logo gold `#D4A82B`, and the
  bright pamphlet yellow `#EBE45F` used for the scrolling marquee band. Tokens live at the
  top of `styles.css` as CSS custom properties.
- **Type** is Outfit (headings) + Inter (body) from Google Fonts — the closest match to
  the geometric sans in the pamphlet.
- **Logo** was lifted from the pamphlet scan and its black field converted to real
  transparency, so it sits cleanly on any dark surface. It's white + gold ink, so it needs
  a dark background — don't place it on the yellow band.
- **Scroll effects** are all IntersectionObserver + `requestAnimationFrame`, no libraries:
  section reveals, image curtain wipes, the statement lighting up word by word, stat
  count-ups, hero parallax, and specialty-card parallax.
- **Accessibility.** Everything is keyboard reachable, the before/after slider is a real
  `<input type="range">` (arrow keys work), images have alt text, and every animation is
  switched off under `prefers-reduced-motion`.
- **No contact form**, by request. All CTAs are `tel:` and `mailto:` links.
