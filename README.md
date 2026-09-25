# shakhout.github.io

Personal portfolio of **MD Shakhout Hossain**, Senior Full-Stack Developer in München.
Live at <https://shakhout.github.io/>.

A static, dependency-free site: hand-written HTML, CSS and ES-module JavaScript, served
directly by GitHub Pages. No build step.

## Run locally

ES modules need an HTTP server (opening `index.html` via `file://` won't load the JS):

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
index.html              the whole site (hero, about, experience, skills, work, education, contact)
404.html                GitHub Pages not-found page
assets/css/main.css     all styles (design tokens at the top)
assets/js/main.js       interactions: reveal, nav, filters, lightbox, tilt, typed text…
assets/js/hero-canvas.js  interactive particle background in the hero
assets/img/             portrait, favicon, project screenshots (WebP)
```

## Editing content

- **Experience / skills / projects:** copy an existing sibling block in `index.html` and edit it.
- **Project filters:** a project's `data-groups` (space-separated) must match a filter button's `data-filter`.
- **Colours:** change `--accent` / `--accent-rgb` in `:root` in `main.css`.
