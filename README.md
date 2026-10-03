# Posting infrastructure — Trip.com Creator

Pipeline for quickly preparing Trip.com Moments posts: a real photo gallery with a lightly-captioned cover card, plus a structured post text.

## Structure

- `template/card.html` — **classic** cover variant: 1080×1350, photo background, compact bottom caption (headline + location), text zone ≤30% of the image height.
- `template/card-impression.html` — **impression** cover variant: headline as a short emotional quote (opening quote mark) + location in small caps, same compact footprint.
- `scripts/make_card.cjs` — renders a cover card from a photo + text via headless Chromium (Playwright); template picked with `--variant`.
- `posts/` — one post = one folder: source photos, post text, finished cover card.

## Trip.com content rules (digested from official guidelines + real top posts)

**Legal "must / must not" (hard rules — breaking these gets content rejected or banned):**
- Must: be about your own real travel experience (stay, restaurant, airline, transport, place); state facts accurately; state opinions as genuinely held; comply with local law.
- Must not: defame, harass, or invade anyone's privacy; be obscene/hateful/violent/discriminatory; infringe copyright or trademark; mislead; impersonate someone or Trip.com itself; promote illegal activity; make claims without reasonable grounds.

**Photos (what unlocks a "Featured" tag):**
- Attractions / hotels: minimum **3 photos**, harmonious color palette, no duplicates, mix of landscape + people shots. First uploaded photo = auto cover, pick the strongest.
- Restaurants / food: minimum **5 photos**, including **1 interior shot** — food-only galleries are disqualified from "Featured." Cover should be the signature dish or the restaurant's atmosphere, shot appetizingly.
- General quality bar: high resolution, vivid colors, sharp focus, level horizon, no blur, no repeated angles.

**Cover image specifics:**
- Hotel cover: facade, lobby, pool, bathroom, or garden — not a plain bed shot.
- Food cover: clean, uncluttered background, food presented attractively.
- Portrait cover: the person should take up **under 50%** of the frame; favor composition/landscape; no overly revealing outfits.
- Storefront cover: panoramic, daytime, showing signage/facade/decor.
- Night shots: sharp, low noise, no glare/flare.
- Collage cover: 2–4 images max, one consistent color tone, clean layout.
- **Text overlay on the cover must stay under ~30% of the image area**, and its color should harmonize with the photo (this is why the card templates here use a small bottom caption, not a full-bleed dark panel).

**Caption / post text — two formats that actually perform well** (pick whichever fits the content; a generic "300-word story" is not what the best real posts use):

1. **Itinerary / budget listicle** (e.g. "Beijing: 4-Day Route & Budget"):
   - Catchy emoji title: `🇨🇳 [City]: Route & Budget for N Days`
   - One-line intro: what this post collects/solves for the reader.
   - Broken down by day, each line an emoji bullet: transport 🚇, check-in 🏨, activity 🚶, cost 💰, steps walked 👣.
   - Closing note: a practical caveat (e.g. "costs are for two people") + a wish ("hope this helps you plan").
   - Hashtags + a tagged place/collection at the end.

2. **Guide / single-spot review** (e.g. "Đó Theater — the most unusual show in Nha Trang"):
   - Catchy emoji title with a hook adjective.
   - Hashtags placed right under the title (not just at the end).
   - "Save this post" hook line to boost saves/engagement.
   - Structured sections, each with an emoji header: `📍 Where it is`, `🚗 How to get there`, `What to expect`, `Good to know` (tips), `🧭 What's nearby`.
   - Location tag(s) on the photo and the linked place at the end.

Both formats: short paragraphs/bullets over long prose, practical specifics (prices, times, addresses) over vague description, emoji as visual bullets, location tags + hashtags always included.

**Rewards program:** up to 1,500 Trip Coins per piece of content, capped at 20,000/month per account; only the first 60 days of performance count; plagiarism or metric manipulation gets content/accounts sanctioned.

## Generating a cover card

Classic (plain headline + location):
```
node scripts/make_card.cjs \
  --photo posts/2026-01-10-lisbon/photo.jpg \
  --title "Sunset on the Rooftop" \
  --location "Lisbon, Portugal" \
  --out posts/2026-01-10-lisbon/card.png
```

Impression (emotional headline instead of a plain description):
```
node scripts/make_card.cjs \
  --variant impression \
  --photo posts/2026-01-10-lisbon/photo.jpg \
  --title "Like stepping into another era" \
  --location "Lisbon, Portugal" \
  --out posts/2026-01-10-lisbon/card-impression.png
```

Parameters:
- `--photo` — path to the source photo (jpg/png).
- `--title` — headline on the card (1–2 lines; keep it short — the caption zone is capped at ~30% of the image).
- `--location` — place (city, country).
- `--out` — where to save the finished PNG card.
- `--brand` — author handle shown in the corner, defaults to `@mozalera`. Pass `--brand ""` to omit it, or `--brand "<other>"` to override.
- `--variant` — `classic` (default) or `impression`.

## Workflow per post

1. Create a folder `posts/<date-name>/`, drop in the photos — at least 3 for a place, at least 5 (incl. 1 interior) for a restaurant.
2. Send me the facts: what the place is, your impressions, practical details (prices, how to get there, timing) — I help write:
   - the cover headline,
   - the full post text, in whichever format fits (itinerary listicle or single-spot guide — see above),
   - hashtags + what to tag.
3. Run `make_card.cjs` on your chosen cover photo — get the finished cover card.
4. The post text is saved to `posts/<date-name>/post.txt`.
5. You manually publish the gallery (cover card first) + text in the Trip.com app/site (no auto-posting — no confirmed official API for the creator program).

## Adjusting the design

Card styles live in `template/card.html` and `template/card-impression.html` (`.title`, `.location`, `.overlay`, `.brand`). You can change font, text size, overlay color/opacity without touching the script — just keep the text zone within ~30% of the image height per Trip.com's cover guidelines.
