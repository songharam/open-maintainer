# Security Policy

Open Maintainer Workbench runs entirely in the browser. It can read public GitHub repository data through unauthenticated GitHub REST API requests and falls back to sample data when GitHub API access fails. It does not require a GitHub token or external API credentials.

## Supported Versions

The `main` branch is the supported demo branch.

## Reporting a Vulnerability

If you find a security issue, open a private report through GitHub security advisories if available, or contact the repository maintainer directly.

## Token Handling Direction

Any future authenticated GitHub API support must follow these rules:

- Never hard-code tokens in source files.
- Prefer short-lived or user-provided tokens.
- Store tokens only in memory for the active browser session unless a safer storage model is explicitly designed.
- Avoid sending repository data to third-party services without clear user action.
- Keep sample mode working without credentials.
