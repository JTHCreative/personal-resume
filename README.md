# Justin Hui — personal site

A single-page portfolio and resume, built from the "Career scrubber" design mockup.
Plain HTML, CSS and JavaScript: no build step and no dependencies.

## Files

- `data.js` — **the timeline content**: one entry per stop with its projects, the
  "interfaces in production" labels, tool kit items and case studies collected there
- `index.html` — page structure (intro, timeline stage, sidebar, approach, credentials, contact)
- `styles.css` — design tokens and layout (colours and type taken from the mockup)
- `script.js` — scroll-driven timeline, collecting animations, drawer and case study viewer
- `assets/img/` — UI example screenshots

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Edit the timeline

Everything the timeline shows comes from `data.js`. Add, remove or edit stops and their
`projects`, `clients`, `tools` and `cases`; the sidebar counts and slots update automatically.
Set `photo` to an image path to replace the initials in the photo circle.

## Publish with GitHub Pages

Deployment is automated by `.github/workflows/deploy.yml`: every push to `main`
publishes the site.

One-time setup: repository **Settings → Pages → Build and deployment → Source**,
choose **GitHub Actions**.

You can also redeploy by hand from the **Actions** tab → *Deploy to GitHub Pages* → **Run workflow**.
