const GITHUB_API_BASE = "https://api.github.com";
const REQUEST_HEADERS = {
  Accept: "application/vnd.github+json"
};

export class GitHubProviderError extends Error {
  constructor(type, message, details = {}) {
    super(message);
    this.name = "GitHubProviderError";
    this.type = type;
    this.status = details.status;
    this.resetAt = details.resetAt;
  }
}

export async function getRepositorySnapshotFromGitHub(repoIdentity, options = {}) {
  const fetcher = options.fetcher || globalThis.fetch;
  const requestHeaders = buildRequestHeaders(options.token);

  if (!fetcher) {
    throw new GitHubProviderError("no-fetch", "A fetch implementation is required.");
  }

  const owner = encodeURIComponent(repoIdentity.owner);
  const repo = encodeURIComponent(repoIdentity.repo);
  const baseUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
  const [repositoryPayload, issuesPayload, pullsPayload, releasesPayload] = await Promise.all([
    requestJson(baseUrl, fetcher, requestHeaders),
    requestJson(`${baseUrl}/issues?state=open&per_page=30&sort=updated&direction=desc`, fetcher, requestHeaders),
    requestJson(`${baseUrl}/pulls?state=open&per_page=10&sort=updated&direction=desc`, fetcher, requestHeaders),
    requestJson(`${baseUrl}/releases?per_page=5`, fetcher, requestHeaders)
  ]);

  const pullRequests = await Promise.all(
    asArray(pullsPayload).map((pullRequest) =>
      normalizePullRequest(baseUrl, pullRequest, fetcher, requestHeaders)
    )
  );
  const issues = asArray(issuesPayload)
    .filter((issue) => !issue.pull_request)
    .map(normalizeIssue);
  const releases = asArray(releasesPayload).map(normalizeRelease);
  const status = buildStatus(issues, pullRequests, releases);

  return {
    provider: "github",
    status,
    repository: normalizeRepository(repositoryPayload),
    issues,
    pullRequests,
    releases
  };
}

async function requestJson(url, fetcher, headers) {
  let response;
  try {
    response = await fetcher(url, { headers });
  } catch (error) {
    throw new GitHubProviderError(
      "network",
      `Could not reach GitHub API: ${error.message}`
    );
  }

  let body;
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    throw toProviderError(response, body);
  }

  return body;
}

function toProviderError(response, body) {
  const resetAt = getHeader(response.headers, "x-ratelimit-reset");
  const remaining = getHeader(response.headers, "x-ratelimit-remaining");
  const message = body.message || `GitHub API request failed with ${response.status}.`;

  if (
    response.status === 429 ||
    ((response.status === 403 || response.status === 429) &&
      (remaining === "0" || /rate limit/i.test(message)))
  ) {
    return new GitHubProviderError("rate-limit", message, {
      status: response.status,
      resetAt
    });
  }

  if (response.status === 404) {
    return new GitHubProviderError("not-found", "Repository was not found or is not public.", {
      status: response.status
    });
  }

  return new GitHubProviderError("api", message, {
    status: response.status
  });
}

function normalizeIssue(issue) {
  return {
    number: issue.number,
    title: issue.title || "Untitled issue",
    body: issue.body || "",
    labels: normalizeLabels(issue.labels),
    comments: issue.comments || 0,
    updatedAt: issue.updated_at || issue.created_at || ""
  };
}

function normalizeRepository(repository) {
  const source = repository && typeof repository === "object" && !Array.isArray(repository)
    ? repository
    : {};

  return {
    description: source.description || "",
    stars: Number(source.stargazers_count) || 0,
    forks: Number(source.forks_count) || 0,
    openIssues: Number(source.open_issues_count) || 0,
    defaultBranch: source.default_branch || "",
    license: source.license?.spdx_id || source.license?.name || "",
    topics: Array.isArray(source.topics) ? source.topics.filter(Boolean) : []
  };
}

async function normalizePullRequest(baseUrl, pullRequest, fetcher, headers) {
  const files = await requestJson(
    `${baseUrl}/pulls/${pullRequest.number}/files?per_page=30`,
    fetcher,
    headers
  );

  return {
    number: pullRequest.number,
    title: pullRequest.title || "Untitled pull request",
    filesChanged: files.map((file) => file.filename).filter(Boolean),
    additions: sum(files, "additions"),
    deletions: sum(files, "deletions")
  };
}

function normalizeRelease(release) {
  return {
    tag: release.tag_name || release.name || "next",
    merged: parseReleaseBody(release.body || release.name || release.tag_name || "")
  };
}

function parseReleaseBody(body) {
  const items = String(body)
    .split("\n")
    .map((line) => line.trim().replace(/^[-*]\s+/, "").replace(/^#+\s+/, ""))
    .filter(Boolean)
    .filter((line) => !/^changelog:?$/i.test(line));

  return items.length ? items.slice(0, 12) : ["Review published release notes."];
}

function normalizeLabels(labels = []) {
  return labels
    .map((label) => (typeof label === "string" ? label : label.name))
    .filter(Boolean);
}

function buildStatus(issues, pullRequests, releases) {
  if (issues.length === 0 && pullRequests.length === 0 && releases.length === 0) {
    return {
      kind: "empty",
      message: "No open issues, open pull requests, or published releases were found."
    };
  }

  return {
    kind: "live",
    message: `Loaded ${issues.length} issues, ${pullRequests.length} pull requests, and ${releases.length} releases from GitHub.`
  };
}

function buildRequestHeaders(token) {
  const headers = { ...REQUEST_HEADERS };
  const cleanToken = String(token || "").trim();
  if (cleanToken) {
    headers.Authorization = `Bearer ${cleanToken}`;
  }
  return headers;
}

function sum(items, key) {
  return items.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getHeader(headers, name) {
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(name);
  return headers[name] || headers[name.toLowerCase()] || null;
}
