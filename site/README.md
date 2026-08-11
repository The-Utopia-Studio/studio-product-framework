# Studio Product Framework — GitHub Pages site

Static external showcase for the framework. Deployed from the `site/` folder via [`.github/workflows/pages.yml`](../.github/workflows/pages.yml).

## Local preview

```bash
python3 -m http.server 8080 --directory site
# open http://127.0.0.1:8080
```

## First-time GitHub setup

1. Push to `main`.
2. Repo **Settings → Pages → Build and deployment → Source**: **GitHub Actions**.
3. After the workflow runs, the site is live at:
   `https://the-utopia-studio.github.io/studio-product-framework/`

## Branding

Uses tokens from [`docs/diagrams/style-guide.md`](../docs/diagrams/style-guide.md) (Icarus / Utopia skin). Replace `assets/favicon.png` and the inline wordmark when official Studio brand assets are available.
