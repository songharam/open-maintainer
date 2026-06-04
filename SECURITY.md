# Security Policy

Open Maintainer Workbench runs entirely in the browser. It can read public GitHub repository data through GitHub REST API requests and falls back to sample data when GitHub API access fails. It does not require a GitHub token, but users may optionally paste one for the current browser request.

## Supported Versions

The `main` branch is the supported demo branch.

## Reporting a Vulnerability

If you find a security issue, open a private report through GitHub security advisories if available, or contact the repository maintainer directly.

## Token Handling

Optional GitHub token support follows these rules:

- Never hard-code tokens in source files.
- Prefer short-lived or user-provided tokens.
- Store tokens only in browser memory for the active request.
- Do not write tokens to local storage, session storage, cookies, URLs, logs, Markdown export, or sample data.
- Avoid sending repository data to third-party services without clear user action.
- Keep sample mode working without credentials.
