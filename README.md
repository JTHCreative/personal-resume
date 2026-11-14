# Justin Hui — personal site

A single-page portfolio and resume, built from the "Career scrubber" design mockup.
Plain HTML, CSS and JavaScript: no build step and no dependencies.

## Files

- `index.html` — all page content (profile, work, experience, approach, toolset, contact)
- `styles.css` — design tokens and layout (colours and type taken from the mockup)
- `script.js` — the interactive career timeline and nav highlighting
- `assets/img/` — UI example screenshots

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Edit the timeline

The timeline milestones live in the `STOPS` array at the top of `script.js`.

## Publish with GitHub Pages

Repository **Settings → Pages → Build and deployment**: choose *Deploy from a branch*,
pick the branch and `/ (root)`, then save.
