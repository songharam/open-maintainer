export const sampleRepositoryData = {
  repository: {
    description: "Static workbench for recurring open source maintainer tasks.",
    stars: 128,
    forks: 18,
    openIssues: 24,
    defaultBranch: "main",
    license: "MIT",
    topics: ["open-source", "maintainer-tools", "issue-triage"]
  },
  issues: [
    {
      number: 128,
      title: "Crash when config file is missing",
      body: "The CLI throws a stack trace when no config file exists on first run.",
      labels: ["bug", "good first issue"],
      comments: 5,
      updatedAt: "2026-05-30"
    },
    {
      number: 131,
      title: "Add JSON output for automation",
      body: "Feature request: support machine-readable JSON output for CI workflows.",
      labels: ["enhancement"],
      comments: 8,
      updatedAt: "2026-05-29"
    },
    {
      number: 134,
      title: "How do I configure OAuth callback URLs?",
      body: "Question from a new contributor about local OAuth setup.",
      labels: ["question"],
      comments: 2,
      updatedAt: "2026-05-28"
    },
    {
      number: 137,
      title: "Document environment variables for Netlify",
      body: "README is missing deployment environment variable details.",
      labels: ["documentation", "good first issue"],
      comments: 1,
      updatedAt: "2026-05-27"
    },
    {
      number: 139,
      title: "Regression in Windows path handling",
      body: "Backslashes are treated as escape characters in the latest release.",
      labels: ["bug"],
      comments: 6,
      updatedAt: "2026-05-26"
    },
    {
      number: 142,
      title: "Add examples for plugin authors",
      body: "A short guide would help first-time contributors add integrations.",
      labels: ["docs", "help wanted"],
      comments: 1,
      updatedAt: "2026-05-25"
    }
  ],
  pullRequests: [
    {
      number: 52,
      title: "Improve startup error handling",
      filesChanged: ["src/config.js", "tests/config.test.js", "README.md"],
      additions: 142,
      deletions: 24
    },
    {
      number: 55,
      title: "Add JSON formatter",
      filesChanged: ["src/formatters/json.js", "tests/json-format.test.js"],
      additions: 88,
      deletions: 9
    }
  ],
  releases: [
    {
      tag: "v1.6.0",
      merged: [
        "Add JSON output for automation",
        "Fix missing config crash",
        "Update environment variable docs",
        "Improve plugin author examples"
      ]
    }
  ]
};
