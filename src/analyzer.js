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
  const repositorySignals = data.repository || {};
  const issues = data.issues || [];
  const pullRequests = data.pullRequests || [];
  const releases = data.releases || [];
  const issueSummary = summarizeIssues(issues);
  const goodFirstIssues = pickGoodFirstIssues(issues);
  const priorityBrief = buildPriorityBrief(issues, pullRequests, issueSummary, goodFirstIssues);
  const impactBrief = buildImpactBrief(
    repository,
    repositorySignals,
    issues,
    pullRequests,
    releases,
    goodFirstIssues
  );
  const apiUsagePlan = buildApiUsagePlan(
    repository,
    issues,
    pullRequests,
    issueSummary,
    releases,
    goodFirstIssues,
    impactBrief
  );
  const applicationAnswers = buildApplicationAnswers(
    repository,
    issues,
    pullRequests,
    issueSummary,
    goodFirstIssues
  );
  const applicationReadiness = buildApplicationReadiness(
    issues,
    pullRequests,
    releases,
    goodFirstIssues,
    applicationAnswers
  );
  const followUpPlan = buildFollowUpPlan(
    repository,
    issueSummary,
    impactBrief,
    apiUsagePlan,
    applicationReadiness
  );
  const reviewerPacket = buildReviewerPacket(
    repository,
    issues,
    pullRequests,
    releases,
    goodFirstIssues,
    impactBrief,
    applicationReadiness
  );
  const launchKit = buildLaunchKit(repository, impactBrief, applicationReadiness);
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
    impactBrief,
    apiUsagePlan,
    weeklyReport: buildWeeklyReport(repository, issues, pullRequests, issueSummary),
    applicationPitch: buildApplicationPitch(repository, issues, pullRequests, issueSummary),
    applicationAnswers,
    supportApplicationPack: buildSupportApplicationPack(applicationAnswers),
    applicationReadiness,
    followUpPlan,
    reviewerPacket,
    launchKit
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

function buildImpactBrief(repository, repositorySignals, issues, pullRequests, releases, goodFirstIssues) {
  const metrics = normalizeRepositorySignals(repositorySignals);
  const checks = [
    {
      label: "Repository purpose is described",
      passed: Boolean(metrics.description),
      points: 15
    },
    {
      label: "Public usage signals are present",
      passed: metrics.stars > 0 || metrics.forks > 0,
      points: 20
    },
    {
      label: "Public maintenance workload is visible",
      passed: issues.length > 0 || pullRequests.length > 0,
      points: 20
    },
    {
      label: "Release history can inform release notes",
      passed: releases.length > 0,
      points: 15
    },
    {
      label: "New contributor path has candidates",
      passed: goodFirstIssues.length > 0,
      points: 15
    },
    {
      label: "Project basics are discoverable",
      passed: Boolean(metrics.license || metrics.defaultBranch || metrics.topics.length),
      points: 15
    }
  ];
  const score = checks
    .filter((check) => check.passed)
    .reduce((total, check) => total + check.points, 0);
  const checklist = checks
    .map((check) => `- [${check.passed ? "x" : " "}] ${check.label} (${check.points} pts)`)
    .join("\n");
  const topics = metrics.topics.length ? metrics.topics.join(", ") : "Not provided";

  return {
    score,
    metrics,
    report: `# Ecosystem impact brief

Repository: ${repository.owner}/${repository.repo}
Description: ${metrics.description || "Not provided"}

## Public maintenance signals

- Stars: ${formatMetric(metrics.stars)}
- Forks: ${formatMetric(metrics.forks)}
- Open issues: ${formatMetric(metrics.openIssues)}
- Active PRs reviewed by this demo: ${pullRequests.length}
- Issues classified by this demo: ${issues.length}
- Releases available for notes: ${releases.length}
- Good first issue candidates: ${goodFirstIssues.length}
- License: ${metrics.license || "Not provided"}
- Default branch: ${metrics.defaultBranch || "Not provided"}
- Topics: ${topics}

## Support fit score

Score: ${score}/100

${checklist}

## Why this matters

This repository shows a concrete maintainer workflow: triage issues, review PRs, prepare release notes, improve docs, and guide new contributors. Stars and downloads are useful signals, but the core support case is that the project reduces repetitive work for open source maintainers and can improve with repository-aware API credits.`
  };
}

function buildApiUsagePlan(repository, issues, pullRequests, issueSummary, releases, goodFirstIssues, impactBrief) {
  return {
    report: `# API credit usage plan for ${repository.owner}/${repository.repo}

## Use cases

- Improve issue triage reasons across ${issues.length} open issues and keep the deterministic category fallback.
- Summarize review risk for ${pullRequests.length} active pull requests, including test, docs, security, and scope signals.
- Draft release notes from ${releases.length} published releases and the current bug/feature/doc queue.
- Generate contributor onboarding suggestions from ${goodFirstIssues.length} good first issue candidates.
- Refine README and CONTRIBUTING recommendations using repository topics, license, and impact score ${impactBrief.score}/100.

## Guardrails

- Keep sample mode and static Markdown export available without any API key.
- Never store GitHub tokens, OpenAI keys, or generated private repository content in the browser.
- Show source mode clearly so maintainers can distinguish live GitHub data from sample fallback data.
- Keep generated text reviewable and editable before it becomes an issue comment, PR review, or release note.

## Success metrics

- Reduce the time needed to prepare a weekly maintainer report.
- Increase the share of issues with clear triage labels and contributor-friendly next steps.
- Help maintainers publish release notes and onboarding docs with fewer repeated manual edits.
- Preserve passing CI and deterministic tests while adding model-assisted workflows.`
  };
}

function normalizeRepositorySignals(repositorySignals) {
  return {
    description: String(repositorySignals.description || "").trim(),
    stars: Number(repositorySignals.stars) || 0,
    forks: Number(repositorySignals.forks) || 0,
    openIssues: Number(repositorySignals.openIssues) || 0,
    defaultBranch: String(repositorySignals.defaultBranch || "").trim(),
    license: String(repositorySignals.license || "").trim(),
    topics: Array.isArray(repositorySignals.topics)
      ? repositorySignals.topics.map((topic) => String(topic).trim()).filter(Boolean)
      : []
  };
}

function buildApplicationReadiness(issues, pullRequests, releases, goodFirstIssues, answers) {
  const checks = [
    {
      label: "Issue triage has representative data",
      passed: issues.length > 0,
      points: 15
    },
    {
      label: "PR review workflow has active context",
      passed: pullRequests.length > 0,
      points: 15
    },
    {
      label: "Release note workflow has release history",
      passed: releases.length > 0,
      points: 10
    },
    {
      label: "Good first issue path is visible",
      passed: goodFirstIssues.length > 0,
      points: 15
    },
    {
      label: "Repository health checklist is available",
      passed: true,
      points: 15
    },
    {
      label: "Support form answers stay under 500 characters",
      passed: [answers.repositoryFit, answers.apiCreditPlan, answers.additionalContext].every(
        (answer) => answer.length <= 500
      ),
      points: 15
    },
    {
      label: "Markdown export is ready for review",
      passed: true,
      points: 15
    }
  ];
  const score = checks
    .filter((check) => check.passed)
    .reduce((total, check) => total + check.points, 0);
  const status = score >= 90 ? "Ready to submit" : score >= 70 ? "Needs small polish" : "Needs more evidence";
  const passedLines = checks
    .map((check) => `- [${check.passed ? "x" : " "}] ${check.label} (${check.points} pts)`)
    .join("\n");
  const nextActions = checks
    .filter((check) => !check.passed)
    .map((check) => `- Add evidence for: ${check.label}`)
    .join("\n") || "- Keep README, screenshots, and CI green until review.";

  return {
    score,
    status,
    report: `# Application readiness score

Score: ${score}/100
Status: ${status}

## Evidence checklist

${passedLines}

## Next actions

${nextActions}`
  };
}

function buildFollowUpPlan(repository, issueSummary, impactBrief, apiUsagePlan, applicationReadiness) {
  const focus = applicationReadiness.score >= 90
    ? "The application package is ready enough for a concise follow-up if review takes longer than expected."
    : "Improve missing readiness evidence before sending any follow-up.";

  return {
    report: `# Application follow-up plan for ${repository.owner}/${repository.repo}

## Wait window

- Do not treat a quiet inbox as rejection by itself.
- Keep the repository active, but avoid repeated messages while the application is under review.
- If there is still no response after a reasonable review window, send one concise follow-up with concrete new evidence.

## Keep evidence fresh

- Keep CI passing and screenshots current.
- Link the latest README, demo script, architecture notes, and Netlify ZIP.
- Add one small improvement or issue cleanup before any follow-up.
- Summarize current workload: ${issueSummary.counts.bug} bugs, ${issueSummary.counts.feature} feature requests, ${issueSummary.counts.docs} docs tasks.
- Reuse impact score ${impactBrief.score}/100 and API plan evidence from the generated workspace.

## Follow-up email draft

Subject: Follow-up on Open Maintainer Workbench support application

Hello,

I wanted to share a short update on my Open Maintainer Workbench application. Since applying, I have kept the repository active, CI passing, and added clearer maintainer artifacts including the impact brief, API credit usage plan, readiness checklist, and Markdown export. ${focus}

Thank you for reviewing the project.`
  };
}

function buildReviewerPacket(repository, issues, pullRequests, releases, goodFirstIssues, impactBrief, applicationReadiness) {
  return {
    report: `# Reviewer packet for ${repository.owner}/${repository.repo}

## Two-minute review path

1. Open the sample demo and confirm the app works without a GitHub token.
2. Paste a public GitHub repository URL and compare live mode with sample mode.
3. Check Issue triage, Repo health, Impact, API Plan, Readiness, and Export tabs.
4. Download or copy the Markdown export and confirm it contains reusable maintainer artifacts.

## Evidence to verify

- CI is expected to pass on every push.
- Static deployment package is available as a Netlify ZIP.
- Screenshots show the actual black-based maintainer workspace UI.
- The analyzer produces deterministic output for ${issues.length} issues, ${pullRequests.length} pull requests, ${releases.length} releases, and ${goodFirstIssues.length} good first issue candidates.
- Impact score: ${impactBrief.score}/100.
- Application readiness: ${applicationReadiness.score}/100, ${applicationReadiness.status}.

## Why this deserves support

Open Maintainer Workbench is not just a one-off application page. It demonstrates a repeatable open-source maintainer workflow: triage, review preparation, release drafting, documentation improvement, contributor onboarding, reporting, export, API credit planning, and follow-up evidence. Support would turn the deterministic workflow into a stronger repository-aware assistant while preserving a static, no-token fallback.`
  };
}

function buildLaunchKit(repository, impactBrief, applicationReadiness) {
  const pagesUrl = `https://${repository.owner}.github.io/${repository.repo}/?demo=sample`;

  return {
    report: `# Launch kit for ${repository.owner}/${repository.repo}

## Reviewer demo links

- Repository: ${repository.url}
- Expected GitHub Pages URL after Pages is enabled: ${pagesUrl}
- Netlify ZIP: outputs/maintainer-workbench-netlify.zip
- Screenshot: screenshots/maintainer-workbench.png

## Netlify ZIP deploy path

1. Open Netlify and choose manual deploy.
2. Upload the prepared Netlify ZIP.
3. Open the deployed site with ?demo=sample to show the no-token reviewer path.
4. Paste a public GitHub repository URL to show Live GitHub mode.

## GitHub Pages path

1. In repository Settings, set Pages source to GitHub Actions.
2. Run the Deploy GitHub Pages workflow from the Actions tab.
3. Open the workflow summary and copy the published page URL.
4. Verify the page loads the sample demo and the Markdown export tab.

## Verification commands

- npm test
- npm run check
- Open ?demo=sample and confirm Issue triage, Reviewer, Launch, Readiness, and Export tabs render.
- Confirm impact score ${impactBrief.score}/100 and readiness score ${applicationReadiness.score}/100 still match the latest generated output.`
  };
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

## Ecosystem impact brief

${workspace.impactBrief.report}

## API credit usage plan

${workspace.apiUsagePlan.report}

## Application follow-up plan

${workspace.followUpPlan.report}

## Reviewer packet

${workspace.reviewerPacket.report}

## Launch kit

${workspace.launchKit.report}

## Support application pack

${workspace.supportApplicationPack}

## Application readiness

${workspace.applicationReadiness.report}
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

function formatMetric(value) {
  return Number(value || 0).toLocaleString("en-US");
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
