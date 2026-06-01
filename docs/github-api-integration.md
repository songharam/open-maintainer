# GitHub API Integration Plan

The current demo uses `src/providers/sample-provider.js`. The future GitHub provider should keep the same internal snapshot shape so the UI and analyzer do not need major changes.

## Target Inputs

The user provides:

- GitHub repository URL or `owner/repo`
- Optional GitHub token for private repositories or higher rate limits

## API Reads

Initial provider support should fetch:

- Open issues
- Open pull requests
- Pull request changed files
- Latest release or tags
- Repository metadata

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

Once real GitHub data is available, Codex/API support can improve:

- More accurate issue classification reasons
- Project-specific PR review checklist generation
- Release note grouping from merged PRs
- README and CONTRIBUTING suggestions grounded in actual repository gaps
- Risk detection for missing tests, missing docs, and large PR scope
