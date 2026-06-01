import test from "node:test";
import assert from "node:assert/strict";

import {
  GitHubProviderError,
  getRepositorySnapshotFromGitHub
} from "../src/providers/github-provider.js";

test("getRepositorySnapshotFromGitHub fetches public GitHub data and normalizes the app snapshot", async () => {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, init });

    if (url.endsWith("/issues?state=open&per_page=30&sort=updated&direction=desc")) {
      return jsonResponse([
        {
          number: 10,
          title: "Crash on first run",
          body: "The app crashes on first run.",
          labels: [{ name: "bug" }, { name: "good first issue" }],
          comments: 3,
          updated_at: "2026-05-31T10:00:00Z"
        },
        {
          number: 11,
          title: "PR-shaped issue should be filtered",
          pull_request: { url: "https://api.github.com/repos/octo/demo/pulls/11" },
          labels: [],
          comments: 0,
          updated_at: "2026-05-31T11:00:00Z"
        }
      ]);
    }

    if (url.endsWith("/pulls?state=open&per_page=10&sort=updated&direction=desc")) {
      return jsonResponse([
        {
          number: 22,
          title: "Add JSON export"
        }
      ]);
    }

    if (url.endsWith("/pulls/22/files?per_page=30")) {
      return jsonResponse([
        { filename: "src/export.js", additions: 20, deletions: 3 },
        { filename: "tests/export.test.mjs", additions: 14, deletions: 1 }
      ]);
    }

    if (url.endsWith("/releases?per_page=5")) {
      return jsonResponse([
        {
          tag_name: "v1.2.0",
          name: "Workbench release",
          body: "- Add JSON export\n- Fix issue triage"
        }
      ]);
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const snapshot = await getRepositorySnapshotFromGitHub(
    { owner: "octo", repo: "demo" },
    { fetcher }
  );

  assert.equal(snapshot.provider, "github");
  assert.equal(snapshot.status.kind, "live");
  assert.equal(snapshot.issues.length, 1);
  assert.deepEqual(snapshot.issues[0].labels, ["bug", "good first issue"]);
  assert.deepEqual(snapshot.pullRequests[0], {
    number: 22,
    title: "Add JSON export",
    filesChanged: ["src/export.js", "tests/export.test.mjs"],
    additions: 34,
    deletions: 4
  });
  assert.deepEqual(snapshot.releases[0], {
    tag: "v1.2.0",
    merged: ["Add JSON export", "Fix issue triage"]
  });
  assert.equal(calls.length, 4);
  assert.ok(calls.every((call) => !("Authorization" in call.init.headers)));
});

test("getRepositorySnapshotFromGitHub marks empty public repositories", async () => {
  const fetcher = async () => jsonResponse([]);

  const snapshot = await getRepositorySnapshotFromGitHub(
    { owner: "octo", repo: "empty" },
    { fetcher }
  );

  assert.equal(snapshot.status.kind, "empty");
  assert.match(snapshot.status.message, /No open issues/i);
});

test("getRepositorySnapshotFromGitHub reports rate limits", async () => {
  const fetcher = async () =>
    jsonResponse(
      { message: "API rate limit exceeded" },
      {
        status: 403,
        headers: {
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": "1780000000"
        }
      }
    );

  await assert.rejects(
    getRepositorySnapshotFromGitHub({ owner: "octo", repo: "demo" }, { fetcher }),
    (error) => {
      assert.ok(error instanceof GitHubProviderError);
      assert.equal(error.type, "rate-limit");
      assert.equal(error.status, 403);
      assert.equal(error.resetAt, "1780000000");
      return true;
    }
  );
});

test("getRepositorySnapshotFromGitHub reports missing repositories", async () => {
  const fetcher = async () => jsonResponse({ message: "Not Found" }, { status: 404 });

  await assert.rejects(
    getRepositorySnapshotFromGitHub({ owner: "octo", repo: "missing" }, { fetcher }),
    (error) => {
      assert.ok(error instanceof GitHubProviderError);
      assert.equal(error.type, "not-found");
      assert.equal(error.status, 404);
      return true;
    }
  );
});

function jsonResponse(body, options = {}) {
  const status = options.status || 200;
  const headers = new HeaderMap(options.headers || {});

  return {
    ok: status >= 200 && status < 300,
    status,
    headers,
    async json() {
      return body;
    }
  };
}

class HeaderMap {
  constructor(values) {
    this.values = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key.toLowerCase(), value])
    );
  }

  get(key) {
    return this.values[String(key).toLowerCase()] || null;
  }
}
