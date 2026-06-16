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

### Document

Documents linked to an item (the Bloomflow API groups these as **Items > Documents**).

| Operation | Description |
|-----------|-------------|
| **Create** | Add a document to an item, either by referencing an external URL or by uploading a binary file from a previous node. |
| **List** | List all documents linked to an item. Identify the item by ID, by URL, or by selecting it from a list. |

### Ecosystem

Ecosystem relations linking an item to other items (the Bloomflow API groups these as **Items > Ecosystem**). Each relation has an origin item, a target item, and a relation type (e.g. "selected solution", "partner").

| Operation | Description |
|-----------|-------------|
| **Create** | Create a relation between two items. Pick the origin item, the target item, and (optionally) a relation type — if omitted, Bloomflow picks the default relation for the origin/target typology pair. |
| **Delete** | Delete a specific ecosystem relation between two items. |
| **Get** | Retrieve a single ecosystem relation by its ID, scoped to the parent item. |
| **List** | List all ecosystem relations linked to an item (both relations where the item is the origin and where it is the target). |

### Note

Notes attached to an item (the Bloomflow API groups these as **Items > Notes**). Each note has free-text content (plain text or HTML — Bloomflow auto-detects and stores both versions), an optional date, and optional user mentions.

| Operation | Description |
|-----------|-------------|
| **Create** | Add a note to an item. Required: `text`. Optional: `date` (defaults to "now" if omitted). |
| **Get** | Retrieve a single note by ID, scoped to the parent item. |
| **List** | List all notes linked to an item (ordered by date descending). |
| **Update** | Partial update — only the fields you send are changed. `text`, `date`, and `userMentions` are all updatable. |

> **Note on confidentiality:** the Bloomflow API silently filters out notes marked `confidential: true` for all public-API callers (this is the server's behaviour, not the node's). If you expect to see a note via the API and it's missing, check whether it was marked confidential in the Bloomflow web UI.

### Workflow

Workflows linked to an item (the Bloomflow API groups these as **Items > Workflows**). Each workflow has a current state (`in_progress`, `completed`, `standby`, `rejected`) and a list of statuses (steps), each with a date, comment, and milestones.

| Operation | Description |
|-----------|-------------|
| **Create State** | Transition a workflow to a new state. Some states require a reason (e.g. `rejected` typically has a fixed list of allowed reasons — the picker loads them automatically). |
| **Create Status** | Add a new status (step) to a workflow. Optionally supply a comment, date, and an `addStepMode` strategy for the existing history. |
| **Get** | Retrieve a single workflow by ID, scoped to the parent item. |
| **Get Status** | Retrieve a single status (step) of a workflow. |
| **List** | List all workflows linked to an item. |
| **Update Status** | Update an existing workflow status — comment and date. |

> **Note on milestones:** The Bloomflow Public API currently parses milestone payloads on Create/Update Status but the underlying task persistence is a server-side `TODO` — sending milestones is a no-op today. The full milestone UX (multi-select sourced from the status template + JSON fallback) is implemented and ready in the node, just hidden behind a comment block. Once the API ships persistence, re-enabling is a one-file uncomment.

### Task

Tasks attached to a workflow on an item (the Bloomflow API groups these as **Items > Tasks**). Each task is an instance of a task template (configured server-side under the workflow's steps).

| Operation | Description |
|-----------|-------------|
| **Cancel** | Mark a completed task back to pending/overdue (based on due date). Optionally attach feedback. |
| **Complete** | Mark a task as completed. Optionally attach feedback. |
| **Create** | Create a new task on an item's workflow. Pick a task template, list assignees and assigners (comma-separated user IDs), and optionally set description, due date, auto-reminder, or invited users. |
| **Delete** | Permanently delete a task. This action cannot be undone. |
| **Get** | Retrieve a single task by ID. |
| **List** | List tasks for an item with optional filters: task templates, statuses (pending/completed/overdue), assignees, assigners, sort, pagination. |
| **Update** | Partial update — `description`, `due_date`, `auto_reminder`, `auto_reminder_nb_days`, `assignee_ids`, `assigner_ids`, `invited_users`. To change a task's status use Complete or Cancel instead. |

> **Note on task templates:** task templates are configured server-side per typology (Typology → WorkflowTemplate → WorkflowStep → TaskTemplate). They are read-only via the Public API. Use **Reference Data → Get Task Reference Data** to list them.
>
> **Note on title:** for tasks linked to a template (which is every task created via this node), `title` is locked server-side. The node intentionally does not expose it on Create or Update.

### Reference Data

| Operation | Description |
|-----------|-------------|
| **Get Ecosystem Reference Data** | List the relation types available per typology, including each relation's allowed target typologies. Useful when building a UI for ecosystem links. |
| **Get Item Reference Data** | Retrieve item-level configuration for the Bloomflow instance — typologies, custom fields, sources, labels, etc. |
| **Get Task Reference Data** | List task templates per typology (grouped by workflow step) and the fixed set of task statuses (pending, completed, overdue). |
| **Get Workflow Reference Data** | List workflow statuses (step templates with milestones) and states (with mandatoryness flags and predefined reason values) per typology. |

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

### Create Document — URL vs File modes
The Document → Create operation has a **Source** toggle:
- **External URL** — pass a URL the Bloomflow server can reach. Use this for
  links to Google Drive, public file URLs, etc. The file is not downloaded
  by Bloomflow; the URL is stored and served via redirect.
- **File from Previous Node** — upload a binary file received on the input.
  Set **Binary Property** to the property name holding the file (default `data`,
  which is what most n8n nodes — Read Binary File, HTTP Request, Google Drive — use).
  The request is sent as `multipart/form-data` automatically.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Bloomflow website](https://www.bloomflow.com/)
* [Bloomflow Public API documentation](https://docs.bloomflow.com/docs/api/public-api/)
* [Source code on GitHub](https://github.com/startupflow/n8n-nodes-bloomflow)

## Version history

See [CHANGELOG.md](CHANGELOG.md).
