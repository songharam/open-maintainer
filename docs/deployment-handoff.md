# Deployment Handoff

Use this page when preparing a public demo for reviewers or maintainers.

## Current Deployment Options

- Netlify ZIP: `outputs/maintainer-workbench-netlify.zip`
- GitHub Pages workflow: `.github/workflows/pages.yml`
- Sample demo query: `?demo=sample`
- Expected GitHub Pages URL after Pages is enabled: `https://songharam.github.io/open-maintainer/?demo=sample`

## Netlify Manual Deploy

1. Open Netlify and choose a manual deploy.
2. Upload `outputs/maintainer-workbench-netlify.zip`.
3. Open the deployed URL with `?demo=sample`.
4. Confirm the `Issue triage`, `Reviewer`, `Launch`, `Readiness`, and `Export` tabs render.
5. Copy the live URL into the GitHub repository About section and the support application notes.

## GitHub Pages Deploy

GitHub Pages must be enabled in repository settings before the workflow can deploy.

1. Open `Settings` -> `Pages`.
2. Set build and deployment source to `GitHub Actions`.
3. Open `Actions` -> `Deploy GitHub Pages`.
4. Run the workflow manually.
5. Open the workflow summary and copy the published page URL.

If the GitHub Pages API returns `404` for `/repos/songharam/open-maintainer/pages`, Pages is not enabled yet. That is a repository setting issue, not an app build issue.

## Local Verification

Run these commands before sharing the demo:

```bash
npm ci
npm test
npm run check
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/?demo=sample
```

## Reviewer Handoff

Send reviewers directly to the sample demo first so they see a populated maintainer workload without needing a GitHub token. Then ask them to paste any public GitHub repository URL to verify live mode.
