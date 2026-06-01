# Contributing

Thanks for your interest in Open Maintainer Workbench. This project is a focused demo for the Codex open source support program, so contributions should keep the app simple, practical, and useful for maintainers.

## Project Scope

Good contributions improve one of these areas:

- Maintainer workflow automation
- Issue triage quality
- PR review checklist quality
- Release note and documentation drafts
- GitHub API provider integration
- Demo clarity for open source support review

Avoid adding broad project management features, account systems, databases, or heavy dependencies unless they directly support the maintainer workflow.

## Local Checks

Run these before opening a pull request:

```bash
npm test
npm run check
```

## Pull Request Guidelines

- Keep changes small and easy to review.
- Explain the maintainer problem being solved.
- Add or update tests when analysis behavior changes.
- Update README or docs when the user-facing workflow changes.
- Include screenshots for visible UI changes.

## Branch Naming

Use a short branch name:

```text
type/short-description
```

Examples:

- `feat/github-provider`
- `fix/docs-classification`
- `docs/application-copy`
