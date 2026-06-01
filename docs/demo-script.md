# Demo Script

Use this flow when showing the project for the Codex open source support program.

## 1. Open the Workbench

Open the deployed site or local static server. Point out that the app starts in sample mode, so reviewers do not need a GitHub token.

## 2. Enter a Repository URL

Use the default URL or paste another GitHub-style URL. Click `생성`.

## 3. Show Maintainer Outputs

Walk through these tabs:

- `이슈`: bug, feature, question, and docs triage
- `PR`: review checklist for maintainers
- `릴리스`: release note draft
- `README`: improvement suggestions
- `CONTRIBUTING`: contributor guide draft
- `Good first`: beginner-friendly issue recommendations
- `리포트`: weekly maintainer report
- `신청 요약`: Codex support application pitch
- `Export`: all generated outputs as one Markdown document

## 4. Explain the Codex Extension

The current demo uses sample data. The next step is connecting `src/providers/github-provider.js` to GitHub Issues, Pull Requests, and Releases, then using Codex/API support to generate better maintainer documents from real repository history.
