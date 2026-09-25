# CLAUDE.md

Personal portfolio site for Md. Shakhout Hossain, served as-is by GitHub Pages
(`shakhout.github.io`). No build step, package manager, tests, or linters —
edit files and they deploy directly.

## Layout

- `index.html` — the entire site. Six `<section class="page section-*">` blocks:
  `home`, `contact`, `skills`, `about`, `portfolio`, `blog`. All but home start `hidden`.
- `js/script.js` — the only custom JS. Everything else in `js/` is vendored.
- `css/style1.css` — active theme (`<link id="StyleSheet">`). `style2`–`style5` are
  unused colour variants of the same file; keep them in sync only if theme switching is revived.
- `css/responsive.css` — breakpoints. `css/bootstrap/` = Bootstrap 2.x, `css/fontawesome/` = Font Awesome 3 (`icon-*` classes).
- `images/works/` — portfolio screenshots. `images/shakil.jpg` — home avatar.
- `php/contact.php` — mail handler for the contact form (does NOT run on GitHub Pages).

## How the page works

- Navigation is animated show/hide, not routing. `.menu-item a[href="#id"]` →
  `closeSection(home)` then `openSection(#id)`. Close buttons use `data-closing-id`.
- Only elements with class `init` (initially also `hidden`) are animated in/out
  (animate.css `bounceInDown` / `bounceOutUp`). New content blocks inside a section
  should sit inside an existing `init` container or carry `init hidden` themselves.
- After a section opens, `setupSkills`, `checkContactForm`, `setupPortfolio`, `setupMap`
  run; each only acts if its target exists in `.page.current`.
- Skills: `<canvas class="skill" data-level="0-100">` rendered by gauge.js.
- Portfolio: items are `.portfolio-item` with `data-groups='["php","node",...]'`; filters are
  `.filter-options li[data-group]` (Shuffle). Clicking opens prettyPhoto using the `<a>`'s
  `href` (image) and `title` (HTML caption).
- `script.js` is mostly hex-escape obfuscated (`["\x72\x65..."]`) from the original template;
  decode before editing logic. The contact-form handler is plain JS.

## Stack / constraints

- jQuery 1.9.1 + jquery-migrate, Bootstrap 2 grid (`row-fluid`, `spanN`), Font Awesome 3.
- Static hosting only: no server-side code executes on GitHub Pages.

## Known issues (as of 2026-09)

- Contact form POSTs to `php/contact.php` — fails on GitHub Pages. The PHP also inserts
  unescaped `$_POST` into HTML mail and uses placeholder `From: webmaster@example.com`.
- Google Maps script loaded without API key (and with obsolete `sensor=`); map is centred
  on Dhaka coords in `script.js` while the page says Munich.
- `$.fn.orbit` recursion is commented out, so menu bubbles are positioned once, not animated.
- Stray `</div>` near `index.html:753` (end of blog section).
- Stale content: Google+ link, Intel role "Oct 2017 – Present", blog is a "coming soon" image,
  all skill levels 100, stray `.lnk` file in `images/prettyPhoto/dark_square/`.

## Conventions

- 4-space indentation in HTML/JS; match surrounding markup patterns when adding
  experience/portfolio/skill entries (copy an existing sibling block).
- Keep this file updated when structure or known issues change.
