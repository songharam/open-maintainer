import { extractRepoIdentity, generateMaintainerWorkspace } from "./src/analyzer.js";
import { DATA_MODES, resolveInitialDataMode } from "./src/demo-mode.js";
import {
  GitHubProviderError,
  getRepositorySnapshotFromGitHub
} from "./src/providers/github-provider.js";
import { getRepositorySnapshot } from "./src/providers/sample-provider.js";

const form = document.querySelector("#repoForm");
const repoInput = document.querySelector("#repoInput");
const modeButtons = document.querySelectorAll("[data-mode]");
const providerStatus = document.querySelector("#providerStatus");
const repoName = document.querySelector("#repoName");
const repoUrl = document.querySelector("#repoUrl");
const providerNotice = document.querySelector("#providerNotice");
const issueColumns = document.querySelector("#issueColumns");
const firstIssueList = document.querySelector("#firstIssueList");
const prioritySummary = document.querySelector("#prioritySummary");
const nextActions = document.querySelector("#nextActions");
const riskAlerts = document.querySelector("#riskAlerts");
const downloadMarkdown = document.querySelector("#downloadMarkdown");
const counts = {
  bug: document.querySelector("#bugCount"),
  feature: document.querySelector("#featureCount"),
  question: document.querySelector("#questionCount"),
  docs: document.querySelector("#docsCount")
};
const outputs = {
  pr: document.querySelector("#prOutput"),
  health: document.querySelector("#healthOutput"),
  release: document.querySelector("#releaseOutput"),
  readme: document.querySelector("#readmeOutput"),
  contributing: document.querySelector("#contributingOutput"),
  report: document.querySelector("#reportOutput"),
  pitch: document.querySelector("#pitchOutput"),
  support: document.querySelector("#supportOutput"),
  export: document.querySelector("#exportOutput")
};

let latestWorkspace;
let currentDataMode = resolveInitialDataMode(window.location.search);

const categoryLabels = {
  bug: "Bug",
  feature: "Feature",
  question: "Question",
  docs: "Docs"
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await renderWorkspace(repoInput.value);
});

modeButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    currentDataMode = button.dataset.mode;
    updateModeButtons();
    updateDemoUrl(currentDataMode);
    await renderWorkspace(repoInput.value);
  });
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => activateTab(button.dataset.tab));
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.querySelector(`#${button.dataset.copy}`);
    await navigator.clipboard.writeText(target.textContent);
    button.textContent = "복사됨";
    setTimeout(() => {
      button.textContent = "복사";
    }, 1300);
  });
});

downloadMarkdown.addEventListener("click", () => {
  if (!latestWorkspace) return;

  const blob = new Blob([latestWorkspace.markdownExport], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${latestWorkspace.repository.repo}-maintainer-workbench.md`;
  link.click();
  URL.revokeObjectURL(link.href);
});

updateModeButtons();
await renderWorkspace(repoInput.value);

async function renderWorkspace(repoValue) {
  providerStatus.textContent =
    currentDataMode === DATA_MODES.sample ? "Loading sample" : "Loading GitHub";
  providerNotice.textContent =
    currentDataMode === DATA_MODES.sample
      ? "내장 샘플 메인테이너 워크로드를 불러오는 중입니다."
      : "공개 GitHub 저장소 데이터를 불러오는 중입니다.";
  providerNotice.dataset.kind = "loading";
  const repoIdentity = extractRepoIdentity(repoValue);
  const { snapshot, notice, sourceMode } = await loadRepositorySnapshot(repoIdentity, currentDataMode);
  const workspace = generateMaintainerWorkspace(repoValue, snapshot);
  latestWorkspace = workspace;

  repoName.textContent = workspace.repository.fullName;
  repoUrl.href = workspace.repository.url;
  repoUrl.textContent = workspace.repository.url.replace("https://", "");

  for (const [category, count] of Object.entries(workspace.issueSummary.counts)) {
    counts[category].textContent = String(count);
  }

  renderIssueColumns(workspace.issueSummary.buckets);
  renderGoodFirstIssues(workspace.goodFirstIssues);
  renderPriorityBrief(workspace.priorityBrief);
  outputs.pr.textContent = workspace.prChecklist;
  outputs.health.textContent = workspace.repositoryHealthChecklist;
  outputs.release.textContent = workspace.releaseNotesDraft;
  outputs.readme.textContent = workspace.readmeSuggestions;
  outputs.contributing.textContent = workspace.contributingDraft;
  outputs.report.textContent = workspace.weeklyReport;
  outputs.pitch.textContent = workspace.applicationPitch;
  outputs.support.textContent = workspace.supportApplicationPack;
  outputs.export.textContent = workspace.markdownExport;
  renderProviderStatus(snapshot, notice, sourceMode);
}

async function loadRepositorySnapshot(repoIdentity, mode) {
  if (mode === DATA_MODES.sample) {
    const snapshot = await getRepositorySnapshot();
    return {
      snapshot,
      notice: "Built-in sample demo is active. No GitHub API request is required.",
      sourceMode: DATA_MODES.sample
    };
  }

  try {
    const snapshot = await getRepositorySnapshotFromGitHub(repoIdentity);
    return {
      snapshot,
      notice: snapshot.status.message,
      sourceMode: DATA_MODES.live
    };
  } catch (error) {
    const fallback = await getRepositorySnapshot();
    return {
      snapshot: fallback,
      notice: `${providerErrorMessage(error)} Sample data fallback is active.`,
      sourceMode: DATA_MODES.live
    };
  }
}

function renderProviderStatus(snapshot, notice, sourceMode) {
  if (snapshot.provider === "github") {
    providerStatus.textContent = snapshot.status.kind === "empty" ? "Live GitHub empty" : "Live GitHub";
    providerNotice.dataset.kind = snapshot.status.kind;
    providerNotice.textContent = notice;
    return;
  }

  providerStatus.textContent =
    sourceMode === DATA_MODES.sample ? "Sample demo" : "Sample fallback";
  providerNotice.dataset.kind = sourceMode === DATA_MODES.sample ? "sample" : "fallback";
  providerNotice.textContent = notice;
}

function updateModeButtons() {
  modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === currentDataMode);
  });
}

function updateDemoUrl(mode) {
  const url = new URL(window.location.href);
  url.searchParams.delete("mode");
  if (mode === DATA_MODES.sample) {
    url.searchParams.set("demo", DATA_MODES.sample);
  } else {
    url.searchParams.delete("demo");
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function providerErrorMessage(error) {
  if (!(error instanceof GitHubProviderError)) {
    return "GitHub API request failed.";
  }

  if (error.type === "rate-limit") {
    return "GitHub API rate limit was reached.";
  }

  if (error.type === "not-found") {
    return "Repository was not found or is not public.";
  }

  if (error.type === "network") {
    return "Could not connect to GitHub API.";
  }

  return error.message;
}

function renderPriorityBrief(priorityBrief) {
  prioritySummary.textContent = priorityBrief.summary;
  nextActions.innerHTML = "";
  riskAlerts.innerHTML = "";

  for (const action of priorityBrief.nextActions) {
    const item = document.createElement("li");
    item.textContent = action;
    nextActions.append(item);
  }

  for (const alert of priorityBrief.riskAlerts) {
    const item = document.createElement("li");
    item.textContent = alert;
    riskAlerts.append(item);
  }
}

function renderIssueColumns(buckets) {
  issueColumns.innerHTML = "";

  for (const category of ["bug", "feature", "question", "docs"]) {
    const column = document.createElement("section");
    column.className = `issue-column ${category}`;
    column.innerHTML = `<h3>${categoryLabels[category]}</h3>`;

    const list = document.createElement("div");
    list.className = "issue-list";

    for (const issue of buckets[category]) {
      const item = document.createElement("article");
      item.className = "issue-item";
      item.innerHTML = `
        <span>#${issue.number}</span>
        <strong>${escapeHtml(issue.title)}</strong>
        <p>${escapeHtml(issue.reason)}</p>
      `;
      list.append(item);
    }

    column.append(list);
    issueColumns.append(column);
  }
}

function renderGoodFirstIssues(issues) {
  firstIssueList.innerHTML = "";

  for (const issue of issues) {
    const item = document.createElement("article");
    item.className = "first-issue";
    item.innerHTML = `
      <div>
        <span>#${issue.number} · ${categoryLabels[issue.category]}</span>
        <strong>${escapeHtml(issue.title)}</strong>
      </div>
      <small>score ${issue.score}</small>
    `;
    firstIssueList.append(item);
  }
}

function activateTab(tabId) {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tabId);
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === tabId);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
