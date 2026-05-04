# n8n-nodes-bloomflow

This is an n8n community node. It lets you use [Bloomflow](https://www.bloomflow.com/) in your n8n workflows.

Bloomflow is a deal-flow and portfolio management platform that helps organisations discover, track, and manage companies, startups, and other items through customisable typologies.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Item

| Operation | Description |
|-----------|-------------|
| **Create** | Create a new item (company, startup, project, etc.) under a typology. Supports optional AI enrichment and two body input modes (individual fields or raw JSON). Uses soft upsert: if an item with the same name or website already exists, only empty fields are filled in. |
| **Get** | Retrieve a single item by ID, by URL, or by selecting from a list. |
| **List** | List all items under a typology, with optional filters: search term, labels, tags, sources, date range, sort, and pagination. |
| **Update** | Fully replace an item's fields (not a patch — all required fields must be provided). |

### Reference Data

| Operation | Description |
|-----------|-------------|
| **Get** | Retrieve all reference data for the Bloomflow instance, including available typologies. |

## Credentials

The Bloomflow Public API uses an API key passed as the `x-bflow-api-key` header. API keys are not self-service — they are issued by Bloomflow on request.

1. **Request an API key** by emailing [support@bloomflow.com](mailto:support@bloomflow.com) from the email associated with your Bloomflow account. See the [official Getting Started guide](https://docs.bloomflow.com/docs/gettingstarted) for the canonical instructions.
2. Once you have received your key, in n8n create a new **Bloomflow API** credential and fill in:
   - **Base URL** — the host of your Bloomflow instance, in the form `https://api.<your-instance>.bloomflow.com` (per the [Bloomflow API docs](https://docs.bloomflow.com/docs/gettingstarted)). The node appends `/api/public/...` automatically.
   - **API Key** — the key provided by Bloomflow support (sent as `x-bflow-api-key`)

The credential is verified by calling `GET /api/public/items/reference_data` on your instance — a key-guarded endpoint, so a successful test confirms the API key works for real operations.

## Compatibility

This node was built against the Bloomflow public REST API (`/api/public/`). No minimum n8n version beyond standard community node support is required.

## Usage

### Typologies
Every Item operation requires a **Typology** — a short string ID (e.g. `startup`, `portfolio_company`) that categorises the item. You can select it from a list (fetched live from your instance) or enter the ID manually.

### Create — soft upsert behaviour
When creating an item, if an item with the same `name` or `website` already exists, only fields that are currently empty will be updated. Existing values are not overwritten.

### Body Input Mode (Create & Update)
Both Create and Update support two ways to provide body fields:
- **Individual Fields** — fill in each field separately using the UI
- **Raw JSON** — provide the full body as a JSON object (the `name` and `typology` fields are always merged in automatically)

### Get — item lookup modes
When getting a single item you can identify it in three ways:
- **Select from list** — search by name within a typology
- **By ID** — enter the 24-character MongoDB ObjectID directly
- **By URL** — paste a Bloomflow item URL; the ID is extracted automatically

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Bloomflow website](https://www.bloomflow.com/)
* [Bloomflow Public API documentation](https://docs.bloomflow.com/docs/api/public-api/)
* [Source code on GitHub](https://github.com/startupflow/n8n-nodes-bloomflow)

## Version history

See [CHANGELOG.md](CHANGELOG.md).
