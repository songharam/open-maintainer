import test from "node:test";
import assert from "node:assert/strict";

import {
  classifyIssue,
  extractRepoIdentity,
  generateMaintainerWorkspace
} from "../src/analyzer.js";

const fixture = {
  repository: {
    description: "A workbench for repeated open source maintainer tasks.",
    stars: 1240,
    forks: 88,
    openIssues: 42,
    license: "MIT",
    defaultBranch: "main",
    topics: ["open-source", "maintainer-tools"]
  },
  issues: [
    {
      number: 11,
      title: "Crash when config file is missing",
      body: "The CLI throws a stack trace when no config file exists.",
      labels: ["bug", "good first issue"],
      comments: 4,
      updatedAt: "2026-05-29"
    },
    {
      number: 12,
      title: "Add dark mode to dashboard",
      body: "Feature request for a dark theme toggle.",
      labels: ["enhancement"],
      comments: 7,
      updatedAt: "2026-05-28"
    },
    {
      number: 13,
      title: "How do I configure OAuth?",
      body: "Question about setting OAuth callback URL.",
      labels: ["question"],
      comments: 2,
      updatedAt: "2026-05-25"
    },
    {
      number: 14,
      title: "Document environment variables",
      body: "README is missing deployment environment variable details.",
      labels: ["documentation", "good first issue"],
      comments: 1,
      updatedAt: "2026-05-24"
    }
  ],
  pullRequests: [
    {
      number: 21,
      title: "Improve startup error handling",
      filesChanged: ["src/config.js", "tests/config.test.js", "README.md"],
      additions: 120,
      deletions: 18
    }
  ],
  releases: [
    {
      tag: "v1.4.0",
      merged: [
        "Add dashboard dark mode",
        "Fix missing config crash",
        "Update environment variable docs"
      ]
    }
  ]
};

test("extractRepoIdentity accepts GitHub URLs and owner/repo shorthand", () => {
  assert.deepEqual(extractRepoIdentity("https://github.com/openai/codex"), {
    owner: "openai",
    repo: "codex",
    url: "https://github.com/openai/codex"
  });

  assert.deepEqual(extractRepoIdentity("openai/codex"), {
    owner: "openai",
    repo: "codex",
    url: "https://github.com/openai/codex"
  });
});

test("classifyIssue maps issue intent to maintainer buckets", () => {
  assert.equal(classifyIssue(fixture.issues[0]), "bug");
  assert.equal(classifyIssue(fixture.issues[1]), "feature");
  assert.equal(classifyIssue(fixture.issues[2]), "question");
  assert.equal(classifyIssue(fixture.issues[3]), "docs");
});

test("classifyIssue prefers documentation labels over generic help labels", () => {
  assert.equal(
    classifyIssue({
      title: "Add examples for plugin authors",
      body: "A short guide would help first-time contributors add integrations.",
      labels: ["docs", "help wanted"]
    }),
    "docs"
  );
});

test("generateMaintainerWorkspace returns every maintainer artifact", () => {
  const result = generateMaintainerWorkspace("https://github.com/acme/toolkit", fixture);

  assert.equal(result.repository.fullName, "acme/toolkit");
  assert.deepEqual(result.issueSummary.counts, {
    bug: 1,
    feature: 1,
    question: 1,
    docs: 1
  });
  assert.match(result.prChecklist, /tests/i);
  assert.match(result.releaseNotesDraft, /Fixes/);
  assert.match(result.readmeSuggestions, /Quick start/);
  assert.match(result.contributingDraft, /How to contribute/);
  assert.match(result.repositoryHealthChecklist, /GitHub repository health checklist/);
  assert.match(result.repositoryHealthChecklist, /Issue templates/);
  assert.equal(result.goodFirstIssues.length, 2);
  assert.match(result.weeklyReport, /4 open issues/);
  assert.match(result.applicationPitch, /Open Maintainer Workbench/i);
  assert.match(result.applicationPitch, /maintainer/i);
  assert.equal(result.impactBrief.score, 100);
  assert.match(result.impactBrief.report, /Ecosystem impact brief/);
  assert.match(result.impactBrief.report, /Stars: 1,240/);
  assert.match(result.impactBrief.report, /Public maintenance signals/);
  assert.match(result.apiUsagePlan.report, /API credit usage plan/);
  assert.match(result.apiUsagePlan.report, /Guardrails/);
  assert.match(result.apiUsagePlan.report, /Success metrics/);
  assert.match(result.followUpPlan.report, /Application follow-up plan/);
  assert.match(result.followUpPlan.report, /Keep evidence fresh/);
  assert.match(result.followUpPlan.report, /Follow-up email draft/);
  assert.match(result.reviewerPacket.report, /Reviewer packet/);
  assert.match(result.reviewerPacket.report, /Two-minute review path/);
  assert.match(result.reviewerPacket.report, /Evidence to verify/);
  assert.match(result.reviewerPacket.report, /Why this deserves support/);
  assert.match(result.launchKit.report, /Launch kit/);
  assert.match(result.launchKit.report, /Netlify ZIP/);
  assert.match(result.launchKit.report, /GitHub Pages/);
  assert.match(result.launchKit.report, /Verification commands/);
  assert.match(result.maintainerLoop.report, /Maintainer operating loop/);
  assert.match(result.maintainerLoop.report, /Cycle goal/);
  assert.match(result.maintainerLoop.report, /Weekly loop/);
  assert.match(result.maintainerLoop.report, /Done criteria/);
  assert.match(result.supportApplicationPack, /Repository fit/);
  assert.match(result.supportApplicationPack, /API credit plan/);
  assert.equal(result.applicationReadiness.score, 100);
  assert.match(result.applicationReadiness.report, /Application readiness score/);
  assert.match(result.applicationReadiness.report, /Ready to submit/);
  assert.ok(result.applicationAnswers.repositoryFit.length <= 500);
  assert.ok(result.applicationAnswers.apiCreditPlan.length <= 500);
  assert.ok(result.applicationAnswers.additionalContext.length <= 500);
  assert.equal(result.priorityBrief.nextActions.length, 3);
  assert.match(result.priorityBrief.summary, /This week/);
  assert.match(result.priorityBrief.riskAlerts.join("\n"), /bug/i);
  assert.match(result.markdownExport, /# Maintainer workspace export/);
  assert.match(result.markdownExport, /## GitHub repository health checklist/);
  assert.match(result.markdownExport, /## Maintainer priority brief/);
  assert.match(result.markdownExport, /## PR review checklist/);
  assert.match(result.markdownExport, /## Project summary/);
  assert.match(result.markdownExport, /## Ecosystem impact brief/);
  assert.match(result.markdownExport, /## API credit usage plan/);
  assert.match(result.markdownExport, /## Application follow-up plan/);
  assert.match(result.markdownExport, /## Reviewer packet/);
  assert.match(result.markdownExport, /## Launch kit/);
  assert.match(result.markdownExport, /## Maintainer operating loop/);
  assert.match(result.markdownExport, /## Support application pack/);
  assert.match(result.markdownExport, /## Application readiness/);
});
