const CATEGORY_KEYWORDS = {
  bug: ["bug", "crash", "error", "fail", "broken", "regression", "exception"],
  feature: ["feature", "enhancement", "request", "add", "support", "improve"],
  question: ["question", "how", "why", "help", "configure", "setup"],
  docs: ["docs", "documentation", "readme", "guide", "document", "example"]
};

const CATEGORY_LABELS = {
  bug: ["bug", "type: bug"],
  feature: ["feature", "enhancement", "type: feature"],
  question: ["question", "help wanted", "support"],
  docs: ["docs", "documentation", "type: docs"]
};

export function extractRepoIdentity(input) {
  const value = String(input || "").trim();
  if (!value) {
    return {
      owner: "open-source",
      repo: "sample-project",
      url: "https://github.com/open-source/sample-project"
    };
  }

  const shorthand = value.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (shorthand) {
    return toRepoIdentity(shorthand[1], shorthand[2]);
  }

  try {
    const parsed = new URL(value);
    const [owner, repoWithSuffix] = parsed.pathname.split("/").filter(Boolean);
    const repo = repoWithSuffix?.replace(/\.git$/, "");
    if (parsed.hostname.includes("github.com") && owner && repo) {
      return toRepoIdentity(owner, repo);
    }
  } catch {
    const parts = value.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return toRepoIdentity(parts.at(-2), parts.at(-1).replace(/\.git$/, ""));
    }
  }

  return toRepoIdentity("open-source", sanitizeRepoName(value));
}

export function classifyIssue(issue) {
  const labels = (issue.labels || []).map((label) => String(label).toLowerCase());
  for (const category of ["bug", "feature", "docs", "question"]) {
    if (labels.some((label) => CATEGORY_LABELS[category].includes(label))) {
      return category;
    }
  }

  const text = `${issue.title || ""} ${issue.body || ""}`.toLowerCase();
  const scores = Object.fromEntries(
    Object.entries(CATEGORY_KEYWORDS).map(([category, words]) => [
      category,
      words.filter((word) => text.includes(word)).length
    ])
  );

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

export function generateMaintainerWorkspace(repoInput, data) {
  const repository = extractRepoIdentity(repoInput);
  const issues = data.issues || [];
  const pullRequests = data.pullRequests || [];
  const releases = data.releases || [];
  const issueSummary = summarizeIssues(issues);
  const goodFirstIssues = pickGoodFirstIssues(issues);
  const priorityBrief = buildPriorityBrief(issues, pullRequests, issueSummary, goodFirstIssues);
  const applicationAnswers = buildApplicationAnswers(
    repository,
    issues,
    pullRequests,
    issueSummary,
    goodFirstIssues
  );
  const workspace = {
    repository: {
      ...repository,
      fullName: `${repository.owner}/${repository.repo}`
    },
    issueSummary,
    prChecklist: buildPrChecklist(repository, pullRequests),
    repositoryHealthChecklist: buildRepositoryHealthChecklist(
      repository,
      issues,
      pullRequests,
      issueSummary,
      goodFirstIssues
    ),
    releaseNotesDraft: buildReleaseNotes(repository, releases, issueSummary),
    readmeSuggestions: buildReadmeSuggestions(repository, issueSummary),
    contributingDraft: buildContributingDraft(repository),
    goodFirstIssues,
    priorityBrief,
    weeklyReport: buildWeeklyReport(repository, issues, pullRequests, issueSummary),
    applicationPitch: buildApplicationPitch(repository, issues, pullRequests, issueSummary),
    applicationAnswers,
    supportApplicationPack: buildSupportApplicationPack(applicationAnswers)
  };

  return {
    ...workspace,
    markdownExport: buildMarkdownExport(workspace)
  };
}

function summarizeIssues(issues) {
  const buckets = {
    bug: [],
    feature: [],
    question: [],
    docs: []
  };

  for (const issue of issues) {
    const category = classifyIssue(issue);
    buckets[category].push({
      ...issue,
      category,
      reason: buildIssueReason(issue, category)
    });
  }

  return {
    counts: {
      bug: buckets.bug.length,
      feature: buckets.feature.length,
      question: buckets.question.length,
      docs: buckets.docs.length
    },
    buckets
  };
}

function pickGoodFirstIssues(issues) {
  return issues
    .map((issue) => ({
      ...issue,
      category: classifyIssue(issue),
      score: goodFirstIssueScore(issue)
    }))
    .filter((issue) => issue.score >= 3)
    .sort((a, b) => b.score - a.score || (a.comments || 0) - (b.comments || 0))
    .slice(0, 5);
}

function goodFirstIssueScore(issue) {
  const labels = (issue.labels || []).map((label) => String(label).toLowerCase());
  let score = 0;
  if (labels.includes("good first issue")) score += 4;
  if (labels.includes("documentation") || labels.includes("docs")) score += 2;
  if ((issue.comments || 0) <= 2) score += 1;
  if (String(issue.title || "").length < 80) score += 1;
  return score;
}

function buildPrChecklist(repository, pullRequests) {
  const activePr = pullRequests[0];
  const title = activePr ? `PR #${activePr.number}: ${activePr.title}` : "next incoming PR";
  const files = activePr?.filesChanged?.join(", ") || "changed files";

  return `# PR review checklist for ${repository.owner}/${repository.repo}

Target: ${title}

- [ ] Scope is clear and small enough to review in one pass.
- [ ] Tests cover changed behavior and important edge cases.
- [ ] Documentation or README updates match the user-facing change.
- [ ] Security-sensitive inputs, tokens, and permissions are handled safely.
- [ ] Performance impact is acceptable for the changed files: ${files}.
- [ ] Release note entry is either included or intentionally unnecessary.`;
}

function buildRepositoryHealthChecklist(repository, issues, pullRequests, issueSummary, goodFirstIssues) {
  return `# GitHub repository health checklist for ${repository.owner}/${repository.repo}

## Repository profile

- [ ] Add a concise About description that explains the maintainer workflow problem.
- [ ] Add a demo URL, repository topics, and a license badge near the top of README.
- [ ] Link README, CONTRIBUTING, SECURITY, roadmap, architecture, and demo script from the repository front page.

## Maintainer workflow

- [ ] Issue templates cover bug reports, feature requests, documentation updates, and questions.
- [ ] PR template asks for summary, maintainer impact, validation commands, and screenshots for UI changes.
- [ ] Labels include bug, enhancement, docs, question, good first issue, help wanted, and maintenance.
- [ ] CI runs tests and syntax checks on pushes and pull requests.
- [ ] Release notes and CHANGELOG stay aligned before tags are published.

## Current snapshot

- Open issues reviewed: ${issues.length}
- Active pull requests reviewed: ${pullRequests.length}
- Bug queue: ${issueSummary.counts.bug}
- Good first issue candidates: ${goodFirstIssues.length}

Suggested next step: ${goodFirstIssues[0] ? `promote #${goodFirstIssues[0].number} as the first contributor task.` : "create or label one small contributor-friendly issue."}`;
}

function buildReleaseNotes(repository, releases, issueSummary) {
  const latest = releases[0];
  const merged = latest?.merged || [];
  const features = merged.filter((item) => /add|feature|support|improve/i.test(item));
  const fixes = merged.filter((item) => /fix|bug|crash|error/i.test(item));
  const docs = merged.filter((item) => /doc|readme|guide/i.test(item));

  return `# Draft release notes for ${repository.owner}/${repository.repo}

Tag: ${latest?.tag || "next"}

## Features
${formatList(features, [`Review ${issueSummary.counts.feature} feature requests for release candidates.`])}

## Fixes
${formatList(fixes, [`Triage ${issueSummary.counts.bug} bug reports before tagging.`])}

## Documentation
${formatList(docs, [`Check README and CONTRIBUTING changes before publishing.`])}`;
}

function buildReadmeSuggestions(repository, issueSummary) {
  return `# README improvement suggestions for ${repository.owner}/${repository.repo}

1. Add a Quick start section with install, configure, and first successful run steps.
2. Add a "Common questions" section based on ${issueSummary.counts.question} open question issues.
3. Add a troubleshooting table for the top ${issueSummary.counts.bug} bug reports.
4. Add a contribution link near the top so new contributors can find good first issues.`;
}

function buildContributingDraft(repository) {
  return `# CONTRIBUTING.md draft for ${repository.owner}/${repository.repo}

## How to contribute

1. Open an issue before large changes so maintainers can confirm scope.
2. Fork the repository and create a branch named \`type/short-description\`.
3. Add or update tests for behavior changes.
4. Update README or docs when user-facing behavior changes.
5. Open a pull request with a clear summary, screenshots when useful, and test results.

## Review expectations

Maintainers review for correctness, security, maintainability, and documentation quality. Small PRs with tests are reviewed first.`;
}

function buildWeeklyReport(repository, issues, pullRequests, issueSummary) {
  const mostDiscussed = [...issues].sort((a, b) => (b.comments || 0) - (a.comments || 0))[0];

  return `# Weekly maintainer report for ${repository.owner}/${repository.repo}

${issues.length} open issues and ${pullRequests.length} active pull requests were reviewed.

- Bugs: ${issueSummary.counts.bug}
- Features: ${issueSummary.counts.feature}
- Questions: ${issueSummary.counts.question}
- Docs: ${issueSummary.counts.docs}

Recommended focus: ${mostDiscussed ? `issue #${mostDiscussed.number}, "${mostDiscussed.title}"` : "review the oldest open issue"}.`;
}

function buildApplicationPitch(repository, issues, pullRequests, issueSummary) {
  return `# Open Maintainer Workbench project summary

Project: Open Maintainer Workbench for ${repository.owner}/${repository.repo}

## Problem

Open source maintainers spend repeated time on issue triage, pull request review preparation, release notes, README updates, contributor guidance, and weekly status reporting. This demo turns those recurring maintainer chores into a single workflow.

## Demo value

The app reads public GitHub repository data when available, falls back to sample data when needed, classifies ${issues.length} issues, prepares review and release artifacts for ${pullRequests.length} pull requests, recommends beginner-friendly issues, and creates a weekly maintainer report.

## Why support matters

Codex/API support would help the project learn repository-specific labels and release style, draft higher-quality maintainer documents, and reduce repetitive work that prevents maintainers from reviewing code and supporting contributors.

## Current workload snapshot

- Bugs: ${issueSummary.counts.bug}
- Features: ${issueSummary.counts.feature}
- Questions: ${issueSummary.counts.question}
- Docs: ${issueSummary.counts.docs}`;
}

function buildApplicationAnswers(repository, issues, pullRequests, issueSummary, goodFirstIssues) {
  return {
    repositoryFit: `Open Maintainer Workbench targets a real open-source maintenance burden: issue triage, PR review preparation, release notes, contributor onboarding, repo health checks, and weekly reports. The repo is early, but it already has live public GitHub mode, sample demo mode, CI, tests, MIT license, docs, screenshots, and exportable maintainer artifacts for ${repository.owner}/${repository.repo}.`,
    interestAreas:
      "Coding, code review, maintainer automation, release workflows, contributor onboarding, and API credits.",
    apiCreditPlan: `I plan to use API credits to improve repository-aware maintainer workflows: classify ${issues.length} issues more accurately, summarize PR review risks across ${pullRequests.length} active PRs, draft release notes, improve README/CONTRIBUTING suggestions, and recommend good first issues. The goal is to reduce repetitive maintainer work while keeping a static-first fallback.`,
    additionalContext: `The demo is intentionally practical: it works with public GitHub data, has a no-token sample mode, and exports Markdown that maintainers can reuse. Current snapshot: ${issueSummary.counts.bug} bugs, ${issueSummary.counts.docs} docs items, and ${goodFirstIssues.length} good first issue candidates. Support would help turn it into a stronger assistant for small maintainers.`
  };
}

function buildSupportApplicationPack(answers) {
  return `# Support application pack

## Repository fit

${answers.repositoryFit}

Characters: ${answers.repositoryFit.length}/500

## Interested areas

${answers.interestAreas}

## API credit plan

${answers.apiCreditPlan}

Characters: ${answers.apiCreditPlan.length}/500

## Additional context

${answers.additionalContext}

Characters: ${answers.additionalContext.length}/500`;
}

function buildMarkdownExport(workspace) {
  const issueLines = Object.entries(workspace.issueSummary.buckets)
    .flatMap(([category, issues]) =>
      issues.map((issue) => `- [${category}] #${issue.number} ${issue.title}`)
    )
    .join("\n");

  const goodFirstLines = workspace.goodFirstIssues
    .map((issue) => `- #${issue.number} ${issue.title} (score ${issue.score})`)
    .join("\n");
  const actionLines = workspace.priorityBrief.nextActions
    .map((action) => `- ${action}`)
    .join("\n");
  const riskLines = workspace.priorityBrief.riskAlerts
    .map((risk) => `- ${risk}`)
    .join("\n");

  return `# Maintainer workspace export

Repository: ${workspace.repository.fullName}
Source: ${workspace.repository.url}

## Issue triage

${issueLines || "- No open issues in sample data."}

## PR review checklist

${workspace.prChecklist}

## GitHub repository health checklist

${workspace.repositoryHealthChecklist}

## Release notes draft

${workspace.releaseNotesDraft}

## README suggestions

${workspace.readmeSuggestions}

## CONTRIBUTING.md draft

${workspace.contributingDraft}

## Good first issue recommendations

${goodFirstLines || "- No beginner-friendly issues detected."}

## Maintainer priority brief

${workspace.priorityBrief.summary}

### Next actions

${actionLines}

### Risk alerts

${riskLines}

## Weekly maintainer report

${workspace.weeklyReport}

## Project summary

${workspace.applicationPitch}

## Support application pack

${workspace.supportApplicationPack}
`;
}

function buildPriorityBrief(issues, pullRequests, issueSummary, goodFirstIssues) {
  const sortedBugs = issueSummary.buckets.bug
    .toSorted((a, b) => (b.comments || 0) - (a.comments || 0));
  const sortedQuestions = issueSummary.buckets.question
    .toSorted((a, b) => (b.comments || 0) - (a.comments || 0));
  const sortedDocs = issueSummary.buckets.docs
    .toSorted((a, b) => (a.comments || 0) - (b.comments || 0));
  const topPr = [...pullRequests].sort((a, b) => (b.additions || 0) - (a.additions || 0))[0];

  const nextActions = [
    sortedBugs[0]
      ? `Stabilize issue #${sortedBugs[0].number}: ${sortedBugs[0].title}`
      : "Review the oldest open bug report.",
    topPr
      ? `Review PR #${topPr.number}: ${topPr.title}`
      : "Prepare the next incoming PR review checklist.",
    goodFirstIssues[0]
      ? `Promote good first issue #${goodFirstIssues[0].number}: ${goodFirstIssues[0].title}`
      : sortedDocs[0]
        ? `Turn docs issue #${sortedDocs[0].number} into a contributor-friendly task.`
        : "Label one small issue as good first issue."
  ];

  const riskAlerts = [
    issueSummary.counts.bug > 0
      ? `${issueSummary.counts.bug} bug issues need triage before release planning.`
      : "No bug issues detected in the sample snapshot.",
    sortedQuestions[0]
      ? `Question issue #${sortedQuestions[0].number} may indicate missing setup docs.`
      : "No active question issues detected.",
    topPr && topPr.additions > 100
      ? `PR #${topPr.number} is large enough to need careful review (${topPr.additions} additions).`
      : "No large PR risk detected."
  ];

  return {
    summary: `This week, focus on ${issueSummary.counts.bug} bug issues, ${pullRequests.length} active pull requests, and ${goodFirstIssues.length} contributor-friendly tasks.`,
    nextActions,
    riskAlerts
  };
}

function buildIssueReason(issue, category) {
  const labels = (issue.labels || []).join(", ") || "no labels";
  return `Classified as ${category} from labels and issue text: ${labels}.`;
}

function formatList(items, fallback) {
  return (items.length ? items : fallback).map((item) => `- ${item}`).join("\n");
}

function toRepoIdentity(owner, repo) {
  const cleanOwner = sanitizeRepoName(owner);
  const cleanRepo = sanitizeRepoName(repo);
  return {
    owner: cleanOwner,
    repo: cleanRepo,
    url: `https://github.com/${cleanOwner}/${cleanRepo}`
  };
}

function sanitizeRepoName(value) {
  return String(value || "sample-project")
    .trim()
    .replace(/\.git$/, "")
    .replace(/[^A-Za-z0-9_.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "sample-project";
}
