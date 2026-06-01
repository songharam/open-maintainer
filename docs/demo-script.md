# Demo Script

Use this flow when showing the project as a practical open-source maintainer workbench.

## 1. Open the Workbench

Open the deployed site or local static server. Point out that the app starts in live GitHub mode for public repositories and still does not need a GitHub token. If GitHub API access fails, the app shows the reason and falls back to sample data.

## 2. Enter a Repository URL

Use the default URL or paste another GitHub-style URL. Click `생성`.

## 3. Show Maintainer Outputs

Walk through these tabs:

- `이슈`: bug, feature, question, and docs triage
- `우선순위`: this week's next actions and risk alerts
- `PR`: review checklist for maintainers
- `Repo health`: GitHub repository profile, labels, templates, CI, and release readiness checklist
- `릴리스`: release note draft
- `README`: improvement suggestions
- `CONTRIBUTING`: contributor guide draft
- `Good first`: beginner-friendly issue recommendations
- `리포트`: weekly maintainer report
- `프로젝트 요약`: project summary for sharing or support applications
- `Export`: all generated outputs as one Markdown document

## 4. Explain the Extension Path

The current demo already reads public GitHub Issues, Pull Requests, changed files, and Releases through `src/providers/github-provider.js`. If the API is unavailable, it falls back to sample data so the demo remains reviewable. The next step is optional token support and Codex/API-assisted summaries grounded in real repository history.
