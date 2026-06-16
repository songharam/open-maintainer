# Changelog

## 0.13.0 - 2026-06-17

- Added a `Reviewer` tab with a two-minute review path, evidence checklist, and support rationale.
- Included the reviewer packet in Markdown export and analyzer tests.
- Updated README, demo script, architecture, roadmap, and application summary for reviewer-facing evidence.

## 0.12.0 - 2026-06-15

- Added a `Follow-up` tab with application wait guidance, evidence refresh checklist, and a concise follow-up email draft.
- Included the follow-up plan in Markdown export and analyzer tests.
- Updated README, demo script, architecture, roadmap, and application summary for the follow-up workflow.

## 0.11.0 - 2026-06-13

- Added an `API Plan` tab with API credit use cases, guardrails, and success metrics.
- Included the API credit usage plan in Markdown export and analyzer tests.
- Updated README, demo script, architecture, roadmap, and application summary for the API plan workflow.

## 0.10.1 - 2026-06-12

- Updated GitHub Actions workflows to the latest checked action majors.
- Moved CI verification to Node.js 24 to match the local/current runtime.
- Kept GitHub Pages deployment manual until Pages is enabled in repository settings.

## 0.10.0 - 2026-06-07

- Added an `Impact` tab with an ecosystem impact brief, public repository signals, and support fit score.
- Extended sample and live GitHub providers with repository metadata such as stars, forks, license, default branch, and topics.
- Included the ecosystem impact brief in Markdown export and analyzer tests.
- Updated README, demo script, architecture, GitHub API docs, and roadmap for the impact workflow.

## 0.9.1 - 2026-06-06

- Updated GitHub Actions workflows to Node.js 24-compatible action majors.
- Kept GitHub Pages deployment manual until Pages is enabled in repository settings.

## 0.9.0 - 2026-06-06

- Added an `Application readiness` output with score, evidence checklist, and next actions.
- Added a `Readiness` tab and included the readiness report in Markdown export.
- Added analyzer tests for readiness scoring and submission status.
- Updated README, demo script, architecture, and roadmap for the readiness workflow.

## 0.8.0 - 2026-06-04

- Added optional in-memory GitHub token support for live provider requests.
- Added provider tests that verify bearer token headers are sent only when a token is supplied.
- Updated UI copy, README, SECURITY, and GitHub API docs to state that tokens are not stored.

## 0.7.0 - 2026-06-04

- Added a `지원서 팩` tab with repository fit, interested areas, API credit plan, and additional context drafts.
- Kept application answer drafts under the 500-character form limit through analyzer tests.
- Included the support application pack in the full Markdown export.
- Updated README, demo script, and architecture notes for the new support pack workflow.

## 0.6.0 - 2026-06-02

- Added explicit `Live GitHub` and `Sample demo` data modes.
- Added `?demo=sample` support so reviewers can open a populated static demo without relying on GitHub API availability.
- Added tests for demo mode query parsing and UI labels.
- Updated README, demo script, and architecture notes for the new data mode flow.

## 0.5.0 - 2026-06-02

- Added a GitHub repository health checklist artifact for repo profile, templates, labels, CI, and release readiness.
- Added a `Repo health` tab and included the checklist in Markdown export.
- Broadened homepage and project summary copy so the app reads as a maintainer tool, not only an application demo.
- Added GitHub repository upgrade guidance for README, topics, labels, Pages, Netlify, and demo evidence.

## 0.4.0 - 2026-06-02

- Added live GitHub provider for public repository issues, pull requests, pull request files, and releases.
- Added provider status messaging for live, empty, rate limit, not found, network error, and sample fallback states.
- Updated docs for live GitHub mode.

## 0.3.0 - 2026-06-01

- Added maintainer priority brief with next actions and risk alerts.
- Added the `우선순위` tab to make weekly maintainer decisions visible in the demo.
- Included the priority brief in the full Markdown export.

## 0.2.1 - 2026-06-01

- Changed GitHub Pages deployment to manual workflow dispatch until Pages is enabled in repository settings.
- Updated README with accurate GitHub Pages setup guidance.

## 0.2.0 - 2026-06-01

- Added full Markdown export for all generated maintainer outputs.
- Added copy and download controls for the generated export.
- Updated application docs to highlight exportable maintainer artifacts.

## 0.1.0 - 2026-06-01

- Added the first Codex open source support demo.
- Added sample-data issue triage for bug, feature, question, and docs.
- Added PR review checklist, release notes, README suggestions, CONTRIBUTING draft, good first issue recommendations, weekly report, and application pitch outputs.
- Added Netlify-ready static deployment setup.
