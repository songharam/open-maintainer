export async function getRepositorySnapshotFromGitHub(repoIdentity, options = {}) {
  const fetcher = options.fetcher || globalThis.fetch;
  const token = options.token;

  if (!token) {
    throw new Error("GitHub API token is not configured yet.");
  }

  if (!fetcher) {
    throw new Error("A fetch implementation is required.");
  }

  return {
    repoIdentity,
    provider: "github",
    issues: [],
    pullRequests: [],
    releases: []
  };
}
