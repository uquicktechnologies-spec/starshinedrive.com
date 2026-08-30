---
name: Starshine Drive brand tokens
description: Brand colors, font, and design token sources for the Starshine Drive project
---

## Brand Palette

| Token | Light | Dark |
|---|---|---|
| primary | #093C71 (navy) | #2467B3 |
| accent | #EF6F24 (orange) | #EF6F24 |
| background | #F5F5F5 | #121212 |
| foreground | #1A1A1A | #F5F5F5 |
| card | #FFFFFF | #1E1E1E |
| border | #E0E0E0 | #2E2E2E |
| muted | #EBEBEB | #262626 |
| mutedForeground | #737373 | #A6A6A6 |

## Typography

Font: **IBM Plex Sans** (Google Fonts)
- Web: `artifacts/starshine-drives/src/index.css` — `--app-font-sans: 'IBM Plex Sans'`
- Mobile: `@expo-google-fonts/ibm-plex-sans` installed in `artifacts/starshine-mobile`

## Radius

Web `--radius: 3px`, mobile `constants/colors.ts` → `radius: 6` (bumped for touch targets)

**Why:** Synced at mobile artifact creation; any new artifact should derive tokens from these sources rather than inventing a new palette.

**How to apply:** Read `artifacts/starshine-drives/src/index.css` :root block for web; read `artifacts/starshine-mobile/constants/colors.ts` for mobile. Do not create parallel palettes.
