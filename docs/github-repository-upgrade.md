# GitHub Repository Upgrade Guide

This checklist keeps the repository credible for open-source reviewers and useful for future maintainers.

## Repository About

Recommended description:

```text
A static open-source maintainer workbench that turns a GitHub repo URL into issue triage, PR review checklists, release notes, contributor onboarding drafts, weekly reports, and Markdown exports.
```

Recommended topics:

```text
open-source, maintainers, github, issue-triage, pull-requests, release-notes, contributor-onboarding, codex
```

## First README Screen

- Keep the CI and MIT license badges visible near the title.
- Show the main screenshot before long explanations.
- Make the first paragraph describe a general maintainer workflow problem.
- Link demo script, roadmap, architecture, contributing, security, and deployment notes.

## Labels

Recommended labels:

| Label | Purpose |
| --- | --- |
| `bug` | Broken behavior or regression |
| `enhancement` | Feature request or workflow improvement |
| `docs` | README, CONTRIBUTING, demo, or architecture updates |
| `question` | Usage or roadmap questions |
| `good first issue` | Small scoped contributor task |
| `help wanted` | Maintainer-approved external contribution |
| `maintenance` | CI, dependencies, cleanup, or repo operations |

## Branch and CI

- Keep `main` green through the CI workflow.
- Require `npm test` and `npm run check` before merging meaningful changes.
- Keep GitHub Pages deployment manual until Pages is enabled in repository settings.
- Use Netlify ZIP for a reviewer-friendly static deployment path.
- Keep `docs/deployment-handoff.md` current so reviewers can follow the exact deploy path.
- Keep `docs/operating-loop.md` current so reviewers can see the repeated maintainer workflow.

## Demo Evidence

Before sharing the repository, verify:

```bash
npm ci
npm test
npm run check
```

Then refresh:

- `screenshots/maintainer-workbench.png`
- `screenshots/maintainer-workbench-mobile.png`
- `outputs/maintainer-workbench-netlify.zip`

Use `?demo=sample` for screenshots when the default repository has no open issues. This keeps the README visually useful while the live mode remains available for real public repositories.

## Application Positioning

Frame the repository as an open-source maintainer tool first. The Codex/OpenAI support program can be mentioned as one useful support path, but the project should still make sense for maintainers outside that program.
