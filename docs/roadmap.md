# Roadmap

## Phase 1: Demo Quality

- Keep the app static and easy to review.
- Improve application pitch copy.
- Add GitHub-ready project templates and CI.
- Add a repository health checklist for GitHub profile, labels, templates, CI, and release readiness. Completed in `0.5.0`.
- Add a support application answer pack with 500-character-ready drafts. Completed in `0.7.0`.
- Add an application readiness score with evidence checklist and next actions. Completed in `0.9.0`.
- Add an ecosystem impact brief with public repository signals and support fit score. Completed in `0.10.0`.
- Add an API credit usage plan with guardrails and success metrics. Completed in `0.11.0`.

## Phase 2: GitHub API Provider

- Fetch open issues, pull requests, pull request files, and releases. Completed in `0.4.0`.
- Fetch repository metadata for stars, forks, license, default branch, and topics. Completed in `0.10.0`.
- Normalize GitHub API responses into the existing snapshot shape. Completed in `0.4.0`.
- Keep sample mode as a no-login fallback. Completed in `0.4.0`.
- Support optional user-provided tokens without storing them. Completed in `0.8.0`.

## Phase 3: Codex-Assisted Maintainer Workflows

- Generate project-specific triage reasons.
- Draft release notes from merged pull requests.
- Suggest good first issues based on labels, comments, and file scope.
- Detect PR review risks such as missing tests or documentation.

## Phase 4: Export and Collaboration

- Export all generated outputs as Markdown.
- Prepare GitHub comment drafts.
- Add saved maintainer report history.
