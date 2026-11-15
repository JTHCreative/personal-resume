# Justin Hui — personal site

A portfolio and resume. The first page is a path selector with three doors, each leading
to its own design concept:

1. **Design philosophy** (`philosophy.html`): a light "sketchbook" page with live demos of
   Observe, Reduce and Improve, plus the techniques I use
2. **Design gallery** (`gallery.html`): a dark "multiviewer" (control-room monitor wall);
   pick a project to put it on air and read the problem, solution and result
3. **Design journey** (`index.html`, scroll down): the scrolling career timeline

Plain HTML, CSS and JavaScript: no build step and no dependencies.

## Files

- `data.js` — **the timeline content**: one entry per stop with its projects, the
  "interfaces in production" labels, tool kit items and case studies collected there
- `index.html` — path selector, then the timeline stage, sidebar, credentials and contact
  (link to `index.html#journey` to start straight at the first milestone)
- `philosophy.html` / `.css` / `.js` — the Design philosophy page and its demos
- `gallery.html` / `.css` / `.js` — the Design gallery; it shows every case in `data.js` that
  has an `id` (`gallery.html#proc-control` opens that project directly)
- `common.js` — fills in name, photo and contact links on the two new pages
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

Case studies with an `id` also appear in the gallery, using their `problem`, `solution`,
`result` and `role` fields.

## Publish with GitHub Pages

Deployment is automated by `.github/workflows/deploy.yml`: every push to `main`
publishes the site.

One-time setup: repository **Settings → Pages → Build and deployment → Source**,
choose **GitHub Actions**.

You can also redeploy by hand from the **Actions** tab → *Deploy to GitHub Pages* → **Run workflow**.
