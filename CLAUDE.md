# CLAUDE.md

Personal portfolio site for MD Shakhout Hossain, served as-is by GitHub Pages
(`shakhout.github.io`). No build step, package manager, tests, or linters —
edit files and they deploy directly. Content source of truth is the owner's CV.

## Layout

- `index.html` — the whole single-page site. Sections (by id): `top` (hero), `about`,
  `experience`, `skills`, `work`, `education`, `contact`. Inline SVG icon sprite at the top of
  `<body>` (`<use href="#i-name">`).
- `assets/css/main.css` — only stylesheet. Design tokens in `:root` (black theme, red accent
  `--accent` + `--accent-rgb`). BEM-ish class names (`block__element--modifier`).
- `assets/js/main.js` — ES module entry; one `init*` function per feature, all called at the bottom.
- `assets/js/hero-canvas.js` — interactive particle network (pointer attract, click shockwave).
- `assets/img/` — `portrait.webp/.jpg`, `favicon.svg`, `projects/*.webp` (800×533).
- `404.html`, `robots.txt`, `sitemap.xml`, `.nojekyll`.

## How the page works

- Normal scrolling page with anchor nav; active link via IntersectionObserver.
- `<html class="js">` is set inline in `<head>`; hidden-until-revealed styles are gated on `.js`
  so the page is fully readable without JS.
- Behaviour hooks are data attributes: `data-reveal` (fade/slide in; uses the CSS `translate`
  property so it composes with `transform`), `data-spotlight` (cursor-following border glow),
  `data-tilt` (3D tilt via `--rx/--ry`), `data-magnetic` (buttons), `data-count` (counters),
  `data-scramble` (hero name), `data-copy` (clipboard + toast).
- Projects: `.project[data-groups="php codeigniter"]` filtered by `.filter[data-filter]`
  (uses View Transitions when available). Clicking `.project__open` fills the native
  `<dialog class="lightbox">` from its `data-title/-image/-desc/-url`.
- `prefers-reduced-motion` disables the canvas loop, typing, scramble, tilt and transitions.
  Pointer effects only run for `(hover: hover) and (pointer: fine)`.

## Constraints

- Static hosting only — no server-side code. Contact is `mailto:` + copy button.
- No external JS; only external resource is Google Fonts (Space Grotesk, JetBrains Mono).
- Run locally with `python3 -m http.server` (ES modules don't load over `file://`).

## Known issues / TODO (as of 2026-09)

- Project descriptions for Z-Exam, ZonderTask, CSPP, CRMPP, KartBD are generic placeholders;
  their external links were carried over from the old site and not re-verified.
- GitHub profile link assumes `github.com/Shakhout`.
- No downloadable CV yet (add e.g. `assets/cv.pdf` and a button if wanted).

## Conventions

- 4-space indentation in HTML/CSS/JS; match surrounding markup when adding
  experience/project/skill entries (copy an existing sibling block).
- New images: WebP, metadata stripped, with explicit `width`/`height` and `loading="lazy"`.
- Keep this file updated when structure or known issues change.
