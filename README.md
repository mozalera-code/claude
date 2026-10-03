# Posting infrastructure — Trip.com Creator

Pipeline for quickly preparing posts: text + photo card with a headline and location.

## Structure

- `template/card.html` — **classic** variant: 1080×1350, photo background, bottom-up darkening overlay, headline + location.
- `template/card-impression.html` — **impression** variant: headline as an emotional quote (italic, opening quote mark) + location in small caps.
- `scripts/make_card.cjs` — renders a card from a photo + text via headless Chromium (Playwright); template is picked with `--variant`.
- `posts/` — one post = one folder: source photo, post text, finished card.

## Generating a card

Classic (plain headline + location):
```
node scripts/make_card.cjs \
  --photo posts/2026-01-10-lisbon/photo.jpg \
  --title "Sunset on the Rooftop" \
  --location "Lisbon, Portugal" \
  --out posts/2026-01-10-lisbon/card.png \
  --brand "@mytravel"
```

Impression (emotional headline instead of a plain description):
```
node scripts/make_card.cjs \
  --variant impression \
  --photo posts/2026-01-10-lisbon/photo.jpg \
  --title "Like stepping into another era" \
  --location "Lisbon, Portugal" \
  --out posts/2026-01-10-lisbon/card-impression.png \
  --brand "@mytravel"
```

Parameters:
- `--photo` — path to the source photo (jpg/png).
- `--title` — headline on the card (1 line; in the impression variant, an emotional reaction, up to ~40 characters or it may not fit).
- `--location` — place (city, country).
- `--out` — where to save the finished PNG card.
- `--brand` — optional, author handle shown in the corner.
- `--variant` — `classic` (default) or `impression`.

## Workflow per post

1. Create a folder `posts/<date-name>/`, drop the photo there.
2. Send me the facts about the place (what it is, your impressions, details) — I help write:
   - the card headline,
   - the post text for Trip.com.
3. Run `make_card.cjs` — get the finished card.
4. The post text is saved to `posts/<date-name>/post.txt`.
5. You manually publish the card + text in the Trip.com app/site (no auto-posting — no confirmed official API for the creator program).

## Adjusting the design

Card styles live in `template/card.html` and `template/card-impression.html` (`.title`, `.location`, `.overlay`, `.brand`). You can change font, text size, overlay color/opacity without touching the script.
