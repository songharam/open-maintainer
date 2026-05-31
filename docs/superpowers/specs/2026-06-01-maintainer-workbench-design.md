# Open Maintainer Workbench Design

## Goal

Build a simple black-themed static web app that turns a GitHub repository URL into practical open-source maintainer outputs without requiring GitHub API access.

## Architecture

The app is static HTML, CSS, and browser JavaScript. `src/analyzer.js` owns deterministic analysis and artifact generation. Provider modules isolate data loading: `sample-provider.js` returns demo data now, while `github-provider.js` is the future API integration boundary.

## User Flow

1. User opens the app.
2. User enters a GitHub repository URL or owner/repo shorthand.
3. App loads sample repository data.
4. Analyzer classifies issues and generates maintainer artifacts.
5. User reviews tabs for issues, PR checklist, release notes, README suggestions, CONTRIBUTING draft, good first issues, and weekly report.

## Testing

Core behavior is covered by Node's built-in test runner. Tests verify repository URL parsing, issue classification, and generation of every required maintainer artifact.
