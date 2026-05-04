# Contributing

Thanks for your interest in working on `@bloomflow/n8n-nodes-bloomflow`. This guide covers local development; for usage of the published node, see the [README](./README.md).

## Prerequisites

- Node.js (version supported by your target n8n release)
- npm
- A Bloomflow instance and API key for end-to-end testing

## Setup

```bash
git clone https://github.com/StartupFlow/n8n-nodes-bloomflow.git
cd n8n-nodes-bloomflow
npm install
```

## Development workflow

The project uses the [`@n8n/node-cli`](https://www.npmjs.com/package/@n8n/node-cli) for build, lint, and dev tooling.

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start a local n8n instance with this node hot-reloaded |
| `npm run build` | Build the node into `dist/` |
| `npm run build:watch` | Type-check and rebuild on change |
| `npm run lint` | Run ESLint + n8n node linter |
| `npm run lint:fix` | Auto-fix lint issues where possible |

`npm run dev` is the fastest way to iterate: it boots an isolated n8n instance with the node already registered, so you can build and test workflows in the editor.

### Testing against a Bloomflow instance

Create a **Bloomflow API** credential in the dev n8n instance with:
- **Base URL** — your instance URL (e.g. `https://trial.bloomflow.com`)
- **API Key** — generated in your Bloomflow account settings

## Project layout

```
nodes/Bloomflow/         # Node implementation
credentials/             # Credential definition
.agents/                 # Internal docs for AI assistants and contributors
dist/                    # Build output (gitignored)
```

The `n8n` field in `package.json` lists the built artifacts that n8n loads. If you add, rename, or remove a node or credential, update those paths.

## Code style

- TypeScript with strict types — avoid `any` unless there's a clear reason.
- Address all lint and type errors before opening a PR; don't disable rules without justification.
- Match existing patterns in `nodes/Bloomflow/` for new operations or resources.

## Commits and releases

- Update `CHANGELOG.md` for any user-visible change.
- Bump the version in `package.json` when releasing; the release flow uses `release-it` (`npm run release`).
- The `n8n-node prerelease` script runs automatically on publish to validate the package.

## Optional: MCP setup

The repo ships an `.mcp.json.example` for working with the n8n-architect MCP server. Copy it to `.mcp.json` and fill in `N8N_API_URL` / `N8N_API_KEY` if you want to use it. `.mcp.json` is gitignored.

## Reporting issues

File issues at <https://github.com/StartupFlow/n8n-nodes-bloomflow/issues>. Include n8n version, node version, and a minimal workflow or reproduction where possible.
