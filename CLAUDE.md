# Tako Tour website

Client preview website for **Tako Tour Co., Ltd.**, a travel agency in Thon Buri, Bangkok (tours, air tickets, visa, transport, hotel). Phase 1 = static clickable site for client review. Phase 2 = CMS to manage content (not started; waiting for client feedback).

## Layout

```
index.html            Home: hero, search, destinations, featured tours, services, why-us, newsletter
tours.html            Listing of ALL types; #hash filter (all|international|domestic|golf|cruise|<country>|search) + name/code, date range, airline, sort
tour.html             Detail for any type from #<id>; golf shows courses, cruise shows route + cabin picker -> booking.html
golf.html             Golf tours, #international / #domestic
cruise.html           Cruise packages
destinations.html     Travel-guide index (Asia / Europe)
destination.html      Guide article from #<guide-key> (TAKO.guides)
visa.html             Visa service + per-country visa info (TAKO.visas), #<visa-key> anchors
booking.html          Booking request form (demo); reads selection from sessionStorage
promotions.html       Tours that have a `promo` field
private-group.html    Private/corporate group quote form (demo)
about.html            Company story (placeholders), logo meaning, services (#services)
contact.html          Contact channels + message form (demo)
how-to-book.html      Steps, deposit table, payment methods (placeholders)
cancellation.html     Draft cancellation terms (sample)
faq.html              FAQ accordion from data.js
assets/css/style.css  All styles; tokens in :root
assets/js/data.js     ALL content: company, airlines, destinations, tours (type tour|golf|cruise), guides, visas, faqs (window.TAKO)
assets/js/site.js     Header/footer injection, nav, tour cards, page inits keyed by <body data-page>
assets/img/           logo.svg, favicon.svg, Unsplash photos
robots.txt, sitemap.xml, .nojekyll
```

## Common Commands

```bash
python3 -m http.server 8000          # preview locally at http://localhost:8000
node --check assets/js/site.js       # syntax check after JS edits
git push origin main                 # deploys to GitHub Pages in ~1–2 min
gh api repos/sannonthachai/travel-agency/pages -q .status   # build status (built|building|errored)
```

No build step, no dependencies. Fonts load from Google Fonts.

## Design Decisions

- ⚠️ Logo is a Thai chula kite (ว่าวจุฬา), NOT a squid/octopus — "Tako" (凧) means kite in Japanese. Final = variant A: 3D coral kite, `rotate(68)`, far wing `scale(0.72 1)`, angled like a gliding bird. Rejected: flat 5-point star, sun + dashed flight trail (too flat), 45° angle.
- Favicon uses the navy badge (`favicon.svg`), not the bare kite — legible at 16–32px.
- Palette replaced the original slate admin kit: Midnight `#0B1F3A` (primary/buttons/footer), Coral `#FF6B4A` (accent fills only), `#C2410C` for coral text (contrast), Sand `#FFF6EC`. Fonts Prompt (display) + Anuphan (body), both Thai-capable. Single light theme by choice.
- ⚠️ No login/register — client explicitly cut them.
- Plain static HTML/CSS/vanilla JS, no build step, so it hosts anywhere for the preview.
- ⚠️ Routing state lives in `#hash` (`tour.html#japan-autumn`, `tours.html#domestic`), never query strings — the claude.ai artifact host drops query strings. Search/booking selections pass between pages via `sessionStorage` (`tako.search`, `tako.booking`), wrapped in try/catch.
- ⚠️ Round dates are ISO `start`/`end` (YYYY-MM-DD); `site.js` formats them in Thai (พ.ศ.). Date-range search matches a round whose `start` falls inside the range — never store display strings.
- One `tours` array for every product; `type` decides rendering. Golf rounds reuse `adult`/`child` as golfer/non-golfer price; cruise price = `cabins[i].price` × guests (round `adult`/`child` unused for cruise).
- Search is one form across tours, golf and cruise: name/code text, date range, airline (`TAKO.airlines`). Golf by van has `airline: ''`, so an airline filter excludes it.
- Nav: "ทัวร์ ▾" dropdown (international, domestic, golf international/domestic, cruise, private group) + destinations, visa, promotions, about, contact. ⚠️ Dropdown opens on CLICK only (client asked: no hover); hamburger ≤1080px.
- ⚠️ Date search is ONE field with a custom range picker (`rangePicker` in site.js): drag across days or tap start then end; writes ISO to two hidden inputs (`from`/`to`, `tour-from`/`tour-to`) and fires `input`. Client asked for drag-select — don't swap back to two native date inputs.
- Guide place photos (`assets/img/places/<guide>-<n>.jpg`, n = index in `places`) come from Wikimedia Commons under CC BY / BY-SA / CC0. Each must show its credit (`TAKO.placeCredits`, rendered under the photo). Unsplash search API blocks scripts, so Commons was used; replacing a photo means updating its credit too.
- Visa data was researched 2026-10-19 (`visaUpdated`) from official/secondary sources; fees change yearly and several items were flagged uncertain (US Visa Integrity Fee, AU/NZ/CA fees). Re-verify before launch.
- Cruise line/ship names are `[...]` placeholders on purpose — real ships weren't confirmed. Golf course names are real; Fukuoka course #3 is a placeholder.
- Header/footer injected by `site.js` to avoid duplicating them across 11 pages. Known SEO cost; phase 2 should render them server-side.
- All content lives in `assets/js/data.js`, shaped so the CMS can replace it.
- ⚠️ Prices, rounds, promotions, deposit rates, cancellation terms are SAMPLE data pending client confirmation. Forms are demo-only (`data-demo-form`, no backend); footer says so.
- ⚠️ Preview is `noindex, nofollow` and `robots.txt` is `Disallow: /`. Production values are commented in `robots.txt`; remove the robots meta from every page at launch.
- Canonical/OG URLs use `https://www.takoworldtour.com` (from the old logo) — confirm the real domain.
- Pages were generated once by a throwaway Python script (not in repo) — edit the HTML files directly.
- Photos from Unsplash, stored locally in `assets/img/`.
- Hosting: GitHub Pages from `main` of `sannonthachai/travel-agency`. Repo made PUBLIC only because free Pages requires it; switching back to private takes the site down.

## Known Limitations

- Placeholders still in content: tour-operator license number, bank account, office hours, company history (`[...]` in data.js / about.html / how-to-book.html / contact.html).
- `tel:` / `mailto:` links may not work inside the claude.ai artifact preview (fine on GitHub Pages).
- Tour detail and listing are client-rendered; no per-tour static pages, so crawlers see little content until phase 2.
- Gallery on tour detail has one photo per tour.

## Phase 2 TODO (waiting on client)

- Client review feedback on phase 1.
- Real license number, bank account, office hours, company history, real prices/rounds/terms.
- Real domain (update canonical, OG, sitemap, robots).
- Confirm cruise lines/ships, golf partner courses, real golf/cruise prices; re-verify visa fees.
- Choose CMS stack; migrate `data.js` content; server-render header/footer and tour pages; real form handling.

## References

- Live preview: https://sannonthachai.github.io/travel-agency/
- Repo: https://github.com/sannonthachai/travel-agency
- Design canvas (mockups + logo concepts): https://claude.ai/artifact/LvQrxPCAVGrf3R6jtkPmjB
- Earlier artifact preview of this site: https://claude.ai/artifact/YDPvzpxFwW9VoYTRqxmrDb
- Contact: LINE @takoworld · 099 449 5465 · lucktako@gmail.com · IG takoworldtour · FB https://www.facebook.com/takoworldtour
