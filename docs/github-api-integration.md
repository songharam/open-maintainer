# GitHub API Provider

The app now includes a live GitHub provider in `src/providers/github-provider.js`. It keeps the same internal snapshot shape as sample mode so the UI and analyzer do not need separate code paths.

## Target Inputs

The user provides:

- GitHub repository URL or `owner/repo`
The current implementation does not store or require tokens. It uses unauthenticated REST API requests for public repositories.

## API Reads

Provider support fetches:

- Open issues
- Open pull requests
- Pull request changed files
- Published releases

## Normalization

GitHub responses should be normalized into:

```js
{
  issues: [
    {
      number,
      title,
      body,
      labels,
      comments,
      updatedAt
    }
  ],
  pullRequests: [
    {
      number,
      title,
      filesChanged,
      additions,
      deletions
    }
  ],
  releases: [
    {
      tag,
      merged
    }
  ]
}
```

## Safety Rules

- Keep sample mode available without credentials.
- Do not store tokens persistently by default.
- Show clear error states for rate limits and missing permissions.
- Keep fetch logic inside `src/providers/github-provider.js`.

## Codex/API Upgrade Path

With real GitHub data available, Codex/API support can improve:

- More accurate issue classification reasons
- Project-specific PR review checklist generation
- Release note grouping from merged PRs
- README and CONTRIBUTING suggestions grounded in actual repository gaps
- Risk detection for missing tests, missing docs, and large PR scope
