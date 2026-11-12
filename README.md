# Haven Power — static HTML site

Open `index.html` in a browser. No server or build step is needed.

## Structure
```
./
  *.html              ← 33 main pages (index, haven-one, how-it-works, energy, pricing, 404, …)
  roles/*.html        ← 32 job detail pages
  stories/*.html      ← 7 member story pages
  blog/*.html         ← 18 article pages
  assets/css/         ← main.css (tokens, header, footer, components), pages.css (page sections)
  assets/js/main.js   ← all interactions (vanilla JS)
  assets/img/         ← Unsplash photos (CREDITS.json lists the sources)
  assets/video/       ← Mixkit videos + posters
  assets/fonts/       ← Inter Tight, Alfa Slab One, Caveat Brush (self-hosted)
```

## Editing
Edit the HTML files directly. The header, footer, and modals are repeated in every page, so a change there must be made in each file (a find-and-replace across the folder works well).

## Placeholders to replace
Brand name and logo, phone `(817) 555-0142`, emails `hello@havenpower.co` and `press@havenpower.co`, address, rates, license numbers, legal text, and all people and company names. All forms are local demos and send nothing.
