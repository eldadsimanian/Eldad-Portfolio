# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, single-page personal portfolio site (Eldad Simanian) — plain HTML/CSS/JS, no build tooling, no package manager, no framework. Three source files:

- `index.html` — all markup and content for every section.
- `style.css` — all styling, organized into numbered comment blocks (`/* ===== 1. ... ===== */` through `11.`) that mirror the page's sections top to bottom. Design tokens (colors, on a dark "intel terminal" theme with a teal/violet accent gradient) live as CSS custom properties on `:root` at the top of the file — change the palette there, not by hunting for hex literals.
- `script.js` — all interactive behavior, as a sequence of independent self-invoking functions (one per feature: boot sequence, particle-network canvas, scroll reveals, glitch hover, custom cursor, magnetic buttons, scroll parallax). Each guards itself independently (checks its own DOM hooks exist, checks `prefers-reduced-motion` / `pointer: fine` where relevant) so removing one feature block doesn't require touching the others.

Assets live in `img/` (profile photo) and `files/` (CV and transcript PDFs served directly as download/mailto-style links).

## Running / previewing

There is no build step, package.json, linter, or test suite. To preview changes, open `index.html` directly in a browser, or serve the directory with any static file server (e.g. `npx serve .` or `python -m http.server`) if a feature needs to be tested over `http://` rather than `file://`.

## Architecture notes

- **All content is hardcoded directly in `index.html`.** There is no templating, CMS, or data file — adding/editing a project or skill means editing the corresponding markup block in place (projects are under `#projects`, skill rows under `#skills`). Section IDs (`#home`, `#skills`, `#projects`, `#contact`) are the anchor targets for the nav links — keep these in sync if a section is renamed. Project cards are numbered sequentially as `[LOG #00N]` in their markup — a cosmetic sequence number, not derived from anything, so update it by hand when reordering or inserting a project.
- **Design tokens are centralized** in `style.css`'s `:root` block (`--bg`, `--accent`, `--accent-2`, `--text`, etc.) — the whole page's color system derives from these ~10 variables, so a palette change is a one-place edit.
- **Section watermarks and parallax are coupled by markup position.** Each major `<section>` has a `.section-watermark` div (the giant background heading text) as its first child, before `.wrap`; `script.js`'s parallax block selects `.section-watermark` elements and reads `el.parentElement`'s bounding rect to compute drift, so a watermark div must stay a direct child of its `.section`, not nested inside `.wrap`.
- **The boot sequence runs once per browser session** (gated on `sessionStorage.bootSeen`), not once per visit — clearing session storage or opening a new incognito window re-triggers it. It's fully skippable by click and is removed entirely (not just hidden) when `prefers-reduced-motion` is set.
- **No external JS framework or animation library.** The particle-network background, scroll reveals, and parallax are hand-rolled vanilla JS/canvas specifically so the page has no runtime dependency — there is no Three.js/Vanta.NET or GSAP here (an earlier version of this site used Vanta.NET; it was replaced).
- **External dependencies are CDN-loaded fonts only**: Google Fonts (Space Grotesk for display type, IBM Plex Sans for body text, JetBrains Mono for labels/code), loaded via `<link>` in `<head>`. No Bootstrap, no icon font — icons in the UI are plain inline SVG or Unicode glyphs.
- **Motion is gated behind `prefers-reduced-motion` and `pointer: fine`/`hover` media queries throughout** (custom cursor, magnetic buttons, and scroll parallax all no-op on touch devices or when the OS-level reduced-motion setting is on) — when adding new motion/interaction, follow the same guard pattern rather than adding an ungated effect.
