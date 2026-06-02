# Bloomflow API — Node Knowledge

## What is Bloomflow?
Bloomflow is a deal-flow and portfolio management platform. The Bloomflow API is a REST API
that allows managing **items** (companies, startups, projects, etc.) organised by **typologies**.
Each Bloomflow instance has its own base URL (e.g. `https://trial.bloomflow.com`).

---

## Official API documentation
The authoritative reference is the Bloomflow Public API docs:
https://docs.bloomflow.com/docs/api/public-api/

When local notes in this file conflict with or omit details from the
official docs, prefer the official docs and update this file accordingly.

If a developer has the Bloomflow API source repo checked out locally, its
path will be recorded in `CLAUDE.local.md` at the repo root (gitignored).
That repo is the ultimate source of truth — grep it for endpoint behaviour
when the docs are ambiguous.

---

## Authentication
- **Header:** `x-bflow-api-key: <apiKey>`
- **Base URL:** Configurable per credential (`baseUrl`), default `https://trial.bloomflow.com`
- **Credential test endpoint:** `GET /api/public/items/reference_data` (key-guarded, cheap GET)
- Default request headers: `Accept: application/json`, `Content-Type: application/json`

---

## Core concepts

### Typology
A typology categorises items (e.g. `startup`, `portfolio_company`). It is a short string ID,
not a MongoDB ObjectID. **Almost every operation requires a typology**, always sent as a
JSON-stringified array even for a single value:
```
typology=["startup"]
```
The node resolves typology via `resourceLocator` (list from `GET /api/public/items/reference_data`
or manual ID entry), then serialises with:
```ts
JSON.stringify([typeof $parameter["typology"] === "object" ? $parameter["typology"].value : $parameter["typology"]])
```

### Item ID
24-character hexadecimal MongoDB ObjectID, e.g. `698c7b0dc0a4b76ce34bd0b2`.
Can be extracted from a Bloomflow URL using the regex `/([a-f0-9]{24})/`.

---

## Endpoints

| Operation | Method | URL |
|-----------|--------|-----|
| List items | GET | `/api/public/items` |
| Get item | GET | `/api/public/items/{itemId}` |
| Create item | POST | `/api/public/items` |
| Update item | PUT | `/api/public/items/{itemId}` |
| List item documents | GET | `/api/public/items/{itemId}/documents` |
| Create item document | POST | `/api/public/items/{itemId}/documents` |
| List item ecosystem relations | GET | `/api/public/items/{itemId}/ecosystem` |
| Get item ecosystem relation | GET | `/api/public/items/{itemId}/ecosystem/{relationId}` |
| Create item ecosystem relation | POST | `/api/public/items/{itemId}/ecosystem` |
| Delete item ecosystem relation | DELETE | `/api/public/items/{itemId}/ecosystem/{relationId}` |
| Get ecosystem reference data | GET | `/api/public/items/ecosystem/reference_data` |
| List item workflows | GET | `/api/public/items/{itemId}/workflows` |
| Get item workflow | GET | `/api/public/items/{itemId}/workflows/{workflowId}` |
| Create workflow state | POST | `/api/public/items/{itemId}/workflows/{workflowId}/state` |
| Create workflow status | POST | `/api/public/items/{itemId}/workflows/{workflowId}/status` |
| Get workflow status | GET | `/api/public/items/{itemId}/workflows/{workflowId}/status/{statusId}` |
| Update workflow status | PUT | `/api/public/items/{itemId}/workflows/{workflowId}/status/{statusId}` |
| Get reference data | GET | `/api/public/items/reference_data` |

---

## Resource: Item

### Create (`POST /api/public/items`)
**Soft upsert behaviour:** if an item with the same `name` or `website` already exists,
only empty fields are updated — existing values are not overwritten.

**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `typology` | query | JSON-stringified array |
| `name` | body | Item name |
| `website` | body | Required only when `withEnrichment=true` |

**Optional query parameters:**
| Param | Type | Notes |
|-------|------|-------|
| `withEnrichment` | boolean | Triggers enrichment; makes `website` required |
| `context` | string | e.g. `sync` |

**Optional body fields:**
| Field | API key | Type | Notes |
|-------|---------|------|-------|
| Business Model | `business_model` | string | |
| Business Opportunity | `business_opportunity` | string | |
| Competitors | `competitors` | string | |
| Custom Fields | `custom_fields` | JSON array | `[{"field_id":"...","value":"..."}]` |
| Establishment Year Founded | `etablissement_year_founded` | string | e.g. `"1975"` |
| External Contacts | `external_contacts` | JSON array | `[{"first_name","last_name","email_address","position"}]` |
| Full Description | `full_description` | string | multiline |
| HQ Address | `hq.hq_address` | string | nested under `hq` object |
| Internal Contacts | `internal_contacts` | JSON array | `[{"first_name","last_name","email_address","type"}]`, type e.g. `"referent"` |
| Key Differentiators | `key_differentiators` | string | |
| Labels | `labels` | JSON array | `[{"ID":"security"}]` |
| Links | `links` | JSON object | `{"linkedin_url":"..."}` |
| Logo URL | `logo_url` | string | |
| Market IDs | `market_ids` | JSON array | `["France","US","GB"]` |
| Maturity | `maturity` | string | e.g. `"ipo"` |
| Number of Employees | `nb_employees` | string | e.g. `"200 +"` |
| Pain Points | `painpoints` | string | |
| Press URLs | `press_urls` | JSON array | `["https://..."]` |
| Risks | `risks` | string | |
| Short Description | `short_description` | string | multiline |
| Sources | `sources` | JSON array | `[{"ID":"5e6fcc67820e9c012f765178"}]` |
| Success Proofs | `success_proofs` | string | |
| Sustainability | `sustainability` | string | |
| Tags | `tags` | JSON array | `[{"name":"saas"},{"name":"data"}]` |
| Total Funding (USD) | `total_funding_usd` | string | e.g. `"1000000"` |
| Video URLs | `video_urls` | JSON array | `["https://youtube.com/..."]` |
| Website (optional) | `website` | string | Only shown when `withEnrichment=false` |
| Year Founded | `year_founded` | string | e.g. `"1975"` |

**Body input modes:** The node supports two modes toggled by `bodyInputMode`:
- `fields` — individual fields via a collection
- `json` — raw JSON object; `name` and `typology` from above are merged in automatically

---

### Get (`GET /api/public/items/{itemId}`)
**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID |
| `typology` | query | JSON-stringified array; only shown when itemId mode is `list` |

The `itemId` `resourceLocator` supports three modes:
- **Select from list** — calls `searchItems` listSearch method (requires typology to be set first)
- **By ID** — direct string input
- **By URL** — extracts ID from Bloomflow URL via regex `/([a-f0-9]{24})/`

**Optional query parameters:**
| Param | Type | Notes |
|-------|------|-------|
| `withProcesses` | boolean | Include processes linked to the item |
| `withSpecializedFinancialTable` | boolean | Include specialized financial table |

---

### List (`GET /api/public/items`)
**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `typology` | query | JSON-stringified array |

**Optional query parameters:**
| Param | API key | Type | Notes |
|-------|---------|------|-------|
| Labels | `labels` | string → JSON array | Comma-separated slugs; auto-converted |
| Limit | `limit` | number | 1–100, default 50 |
| Offset | `offset` | number | Default 0, for pagination |
| Search Fields | `fields` | string → JSON array | Comma-separated field names; use with `term` |
| Search Term | `term` | string | Value to search within `fields` |
| Sort | `sort` | string | e.g. `created_at_desc`, `updated_at_asc` |
| Sources | `sources` | string → JSON array | Comma-separated source IDs; auto-converted |
| Tags | `tags` | string → JSON array | Comma-separated tag IDs; auto-converted |
| Updated After | `updated_at_gt` | dateTime | ISO 8601 |
| Updated Before | `updated_at_lt` | dateTime | ISO 8601 |
| With Processes | `withProcesses` | boolean | Include processes linked to items |

**Response shape:** Array containing an object with a `results` property:
```json
[{ "results": [{ "id": "...", "name": "..." }] }]
```
Access items via `response[0].results`.

---

### Update (`PUT /api/public/items/{itemId}`)
**Full replacement behaviour:** replaces ALL fields of the item. Must provide all required
fields — unlike Create, this is not a soft upsert.

**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID (plain string, not resourceLocator) |
| `typology` | query | JSON-stringified array |
| `name` | body | Item name |
| `website` | body | Required only when `withEnrichment=true` |

**Optional parameters:** same as Create — `withEnrichment`, `context` query params, and the
full set of additional body fields. Same `bodyInputMode` toggle (`fields` / `json`).

---

## Resource: Document

Documents linked to an item. The Bloomflow API groups these as **Items > Documents** —
they're a sub-resource of Item, identified by the parent item's ID in the URL path.

### List (`GET /api/public/items/{itemId}/documents`)
**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID of the parent item |
| `typology` | (UI only) | Required only when itemId mode is `list`, used to filter the `searchItems` picker; **not** sent to the documents endpoint |

The `itemId` `resourceLocator` supports three modes (same as Item Get):
- **Select from list** — calls `searchItems` listSearch method (requires typology to be set first)
- **By ID** — direct string input
- **By URL** — extracts ID from a pasted Bloomflow URL via regex `/[a-f0-9]{24}/`

**URL routing pattern:** the path is built with an inline regex extraction so all three
modes resolve to a clean 24-char ID. It lives as a single exported constant in
[document/index.ts](../nodes/Bloomflow/resources/document/index.ts) and is referenced
by both the Create and List operations — keep them in sync via the constant, never
inline:
```ts
export const DOCUMENTS_URL_TEMPLATE =
    '=/api/public/items/{{ (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId) }}/documents';
```
The `extractValue` regex on the URL mode is **not** auto-applied during declarative
template interpolation, so the route itself must extract the ID. Use the same pattern
for any future operation taking an `itemId` from a `resourceLocator`.

**Response shape:** Array of document objects:
```json
[{
  "id": "62d9705552a73e0013508e37",
  "name": "financial-q1.ppt",
  "url": "{{host}}/api/S3/documents/...",
  "type": "company-document-file",
  "size": 443589,
  "pinned": false,
  "isExternal": false,
  "format": "application/vnd.ms-powerpoint",
  "companyId": "62d943ee03b2e60013022971",
  "created_by": "...",
  "updated_by": "...",
  "created_at": "...",
  "updated_at": "..."
}]
```

**Permission:** API key needs `public:items:*` (or typology-specific scope). Read-only keys
work via `get@public:items:*`.

---

### Create (`POST /api/public/items/{itemId}/documents`)
**Two source modes** controlled by the `sourceMode` UI toggle:

#### URL mode (`sourceMode = 'url'`)
Reference an externally-hosted document. The Bloomflow server does **not** download
the file — it stores the URL and serves it via a redirect.

| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID |
| `url` | query | **required**, the document URL |
| `url_file_name` | query | optional display name; defaults to the URL |

#### File mode (`sourceMode = 'file'`)
Upload a binary file from a previous n8n node (e.g. Read Binary File, HTTP Request
returning binary, Google Drive, etc.). Sent as `multipart/form-data`.

| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID |
| `file` | formData | **required**, the binary buffer |
| `image` | query | optional, default `false` |
| `file_name` | query | optional override; defaults to the binary's original filename |

**Common optional param (both modes):**
| Param | Location | Notes |
|-------|----------|-------|
| `interactionId` | query | Optionally link the document to an interaction |

#### Multipart implementation
Pure declarative routing cannot stream binary data, and n8n community nodes
**cannot declare runtime dependencies** (lint rule `@n8n/community-nodes/no-restricted-imports`),
so the standard `form-data` package is off-limits. The Create operation builds
the multipart body manually in a **`preSend` hook**
([create.ts](../nodes/Bloomflow/resources/document/create.ts) → `createDocumentPreSend`):

1. Reads `binaryProperty` from node parameters (default `data`).
2. Calls `this.helpers.assertBinaryData(binaryProperty)` and `getBinaryDataBuffer(binaryProperty)`.
3. Generates a random boundary string.
4. Concatenates a `Buffer` containing:
   ```
   --BOUNDARY\r\n
   Content-Disposition: form-data; name="file"; filename="..."\r\n
   Content-Type: <mimeType>\r\n
   \r\n
   <binary bytes>\r\n
   --BOUNDARY--\r\n
   ```
5. Strips the inherited `Content-Type: application/json` from `requestDefaults`,
   then sets `Content-Type: multipart/form-data; boundary=<...>` and `Content-Length`.
6. Returns `{ body: Buffer, json: false, headers: ... }`.

**Why not `formData` or the `form-data` package?**
- `IHttpRequestOptions.formData` is the legacy `request` library shape; n8n's
  modern axios-based RoutingNode silently ignores it.
- The `form-data` npm package would work but adding it as a dependency fails
  the n8n Cloud lint check.

**Filename safety:** `encodeFilename()` quote-escapes per RFC 7578, plus adds
`filename*=UTF-8''…` for non-ASCII names per RFC 5987.

URL mode short-circuits the hook (`if (sourceMode !== 'file') return requestOptions`).
Use this same Buffer-concat pattern for any future endpoint accepting
`multipart/form-data`.

**Response shape:** Single document object (same shape as List, see above).

**Permission:** API key needs write scope on items (`public:items:*` without the
`get@` prefix). Internally the handler calls `validateItemPermission(item, req, 'update')`
— so users with read-only keys, or keys scoped to a typology that doesn't include
the parent item, will get 403.

**Mode-detection edge case:** the handler decides URL vs FILE mode via
`url || Boolean(url_file_name)`. The n8n UI prevents ambiguous combinations by
hiding mode-specific fields under `displayOptions.show.sourceMode`. If you ever
expose both URL and file-mode fields simultaneously in a custom flow, sending
`url_file_name` alone (with no `url`) will trip the handler into URL mode and
fail with `INVALID_URL`.

**Empty-string footgun (mitigated):** because of the rule above, every optional
query param on Create routes its value through `={{ $value || undefined }}` so
n8n drops the key entirely when blank rather than sending `?url_file_name=`.
This applies to `url_file_name`, `file_name`, and `interactionId`. Keep this
shape for any future optional query params on this endpoint — a stray empty
string in `url_file_name` would silently flip the handler into URL mode.

---

## Resource: Ecosystem

Ecosystem relations link an item to other items (e.g. a startup to its
"selected solution", a portfolio company to a partner). The Bloomflow API
groups these as **Items > Ecosystem** — they're a sub-resource of Item,
identified by the parent item's ID in the URL path.

A relation has an **origin** (the item the relation was created from) and a
**target** (the linked item). When listed via `GET /api/public/items/{itemId}/ecosystem`,
results include relations where the given item is either the origin **or** the target.

### List (`GET /api/public/items/{itemId}/ecosystem`)
**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID of the parent item |
| `typology` | (UI only) | Required only when itemId mode is `list`, used to filter the `searchItems` picker; **not** sent to the ecosystem endpoint |

The `itemId` `resourceLocator` supports three modes (same as Item Get / Document):
- **Select from list** — calls `searchItems` listSearch method (requires typology to be set first)
- **By ID** — direct string input
- **By URL** — extracts ID from a pasted Bloomflow URL via regex `/[a-f0-9]{24}/`

**No query parameters and no pagination** — the api-platform `getItemRelations(itemId, req, res)`
signature takes no filters and returns the full set in one response. Callers
that need to limit results must filter client-side.

**URL routing pattern:** uses the same inline regex extraction as Documents
(declarative routing does not auto-apply `extractValue`). The template lives
as a single exported constant in
[ecosystem/index.ts](../nodes/Bloomflow/resources/ecosystem/index.ts) and is
referenced by both the List and Get operations — keep them in sync via the
constant, never inline:
```ts
export const ECOSYSTEM_URL_TEMPLATE =
    '=/api/public/items/{{ (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId) }}/ecosystem';

// relationId is also a resourceLocator (3 modes — list/id/url), so the same
// regex-extraction trick is applied for the relation segment too.
export const ECOSYSTEM_RELATION_URL_TEMPLATE =
    '=/api/public/items/{{ ...itemId extraction... }}/ecosystem/{{ ...relationId extraction... }}';
```

**Response shape:** Array of relation objects:
```json
[{
  "id": "62d9705552a73e0013508e37",
  "originId": "62d943ee03b2e60013022971",
  "origin": { "id": "62d943ee03b2e60013022971", "name": "Microsoft" },
  "targetId": "62d943ee03b2e60013022972",
  "target": { "id": "62d943ee03b2e60013022972", "name": "GitHub" },
  "relationTypeId": "62d943ee03b2e60013022973",
  "relationType": {
    "id": "62d943ee03b2e60013022973",
    "name": "selected_solution",
    "texts": {
      "label": "Selected solution",
      "labelPlural": "Selected solutions"
    }
  },
  "content": "Lorem Ipsum Dolor sit amet",
  "created_by": "...",
  "updated_by": "...",
  "created_at": "...",
  "updated_at": "..."
}]
```
`origin` / `target` may be absent if the related Company can't be loaded
(`cleanRelationOutput` in `public-api-helper.js` spreads them conditionally).

**Permission:** API key needs `public:items:*` (or typology-specific scope).
Read-only keys work via `get@public:items:*`. Authorization filters out
relations whose origin or target the caller can't read (Oso
`authorizedResources` check in `getRelations`).

---

### Get (`GET /api/public/items/{itemId}/ecosystem/{relationId}`)
**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID of the parent item |
| `relationId` | path | 24-char hex ID of the relation |
| `typology` | (UI only) | Required only when itemId mode is `list`, used to filter the `searchItems` picker; **not** sent to the ecosystem endpoint |

The `itemId` `resourceLocator` supports the same three modes as List.
`relationId` is also a `resourceLocator` with three modes:
- **Select from list** — calls the `searchRelations` listSearch method, which
  fetches `/api/public/items/{itemId}/ecosystem` for the currently-selected
  item and shows each relation as `"{relationType label}: {origin.name} → {target.name} ({id})"`.
  Returns an empty list if no `itemId` is selected yet.
- **By ID** — direct 24-char hex string
- **By URL** — extracts ID from a pasted Bloomflow URL via regex `/[a-f0-9]{24}/`

**No query parameters.**

**Response shape:** A single relation object (same shape as one List entry,
see above). The endpoint returns `404 UNKNOWN_ITEM` if the relation doesn't
exist or `403 FORBIDDEN_TYPOLOGY` if the caller can't read both ends of the
relation.

**Permission:** same as List — `public:items:*` (or `get@public:items:*`).

---

### Create (`POST /api/public/items/{itemId}/ecosystem`)
Creates an ecosystem relation between two items. `itemId` is the **origin**;
the **target** is provided in the body. If `relationTypeId` is omitted,
Bloomflow falls back to the default relation type for the origin/target
typology pair (`RelatedObjectLabel.getDefaultRelationBothDirection`).

**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID of the origin item |
| `targetId` | body | 24-char hex ID of the target item |
| `typology` | (UI only) | Required only when itemId mode is `list`, filters the origin `searchItems` picker; **not** sent to the endpoint |
| `targetTypology` | (UI only) | Required only when targetId mode is `list`, filters the target `searchTargetItems` picker; **not** sent to the endpoint |

**Optional body fields** (live under the `Additional Fields` collection):
| Field | API key | Type | Notes |
|-------|---------|------|-------|
| Content | `content` | string | Free-text content for the relation |
| Relation Type | `relationTypeId` | string | 24-char hex ID. If omitted, Bloomflow picks the default for the origin/target typology pair. |

**Pickers (compatibility-aware):**
The dropdowns for `targetTypology` and `relationTypeId` use the ecosystem
reference_data endpoint to surface only **compatible** options for the chosen
origin, so the user can't construct invalid pairs through the UI:

- **Target Typology** (`getTargetTypologies`): reads the selected origin
  `typology` and returns the union of `availableRelations[].targetTypologies`
  for that origin from `/api/public/items/ecosystem/reference_data`. Origin
  typology is derived from the selected item (via `GET /api/public/items/{itemId}`)
  when the UI typology field is hidden (i.e. `itemId.mode !== 'list'`). If the
  origin typology has no relations defined, the dropdown is correctly empty.
  Falls back to all typologies if neither the UI typology nor the item-derived
  typology is available.
- **Relation Type** (`getRelationTypes`): filters by origin typology AND, when
  set, intersects with `targetTypology`. Only returns relations whose
  `targetTypologies[]` includes the selected target.

Both still allow `By ID` entry mode, so a power user can bypass the filtering
if they really want — the server will then enforce validity with
`RELATION_ERROR` (400) on invalid pairs.

**Validation behaviour (`addItemRelation` in `endpoints-ecosystem.js`):**
- If the origin item (`itemId`) doesn't exist → `UNKNOWN_ITEM` (404)
- If `targetId` is missing or the target item doesn't exist → `UNKNOWN_ITEM` (404)
- If `relationTypeId` is provided but not valid for origin/target typologies → `RELATION_ERROR` (400)
- Caller must have `update` permission on the target item
  (`validateItemPermission(target, req, 'update')`)

**Direction swap (subtle):** `relationIsPossible` returns either `RELATION_DIRECTIONS.DIRECT`
or `RELATION_DIRECTIONS.REVERSE`. When `REVERSE`, the API **silently swaps**
origin and target before creating the relation (see lines 167-172 of
`endpoints-ecosystem.js`: `relIsPossible === DIRECT ? itemId : data.targetId`).
This is intentional — `RelatedObjectLabel` definitions are directional, so a
relation type valid only one way still works regardless of which end the user
picked as origin. The returned relation will reflect the canonical direction,
which may differ from what was sent. The n8n picker doesn't expose direction
filters; the server figures it out.

**`targetId` extraction:** like `itemId`, the body template applies inline
regex extraction so all three resourceLocator modes (list/id/url) yield a
clean 24-char ID. See `resources/ecosystem/create.ts`.

**Response shape:** Single relation object (same shape as one List entry, see
above), with `relationType` populated either from the provided
`relationTypeId` or from the default relation Bloomflow picked.

**Permission:** API key needs write scope on items (`public:items:*` without
the `get@` prefix). Read-only keys (`get@public:items:*`) get 403.

---

### Delete (`DELETE /api/public/items/{itemId}/ecosystem/{relationId}`)
**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID of the parent item |
| `relationId` | path | 24-char hex ID of the relation to delete |
| `typology` | (UI only) | Required only when itemId mode is `list`, used to filter the `searchItems` picker; **not** sent to the endpoint |

Same `itemId` + `relationId` resourceLocator pattern as Get — `relationId`
list mode calls `searchRelations` for the selected `itemId`.

**No query parameters, no body.** Uses the shared
`ECOSYSTEM_RELATION_URL_TEMPLATE` constant.

**Validation behaviour (`deleteItemRelation` in `endpoints-ecosystem.js`):**
- Caller must have `delete` permission on the parent item
  (`validateItemPermission(item, req, 'delete')`)
- If the relation doesn't exist → `UNKNOWN_ITEM` (404)
- If the caller can't read both ends of the relation → `FORBIDDEN_TYPOLOGY` (403)
- On success, also writes an audit log entry
  (`logDeletion({ model: 'CompanyRelatedObject', … })`)

**Response shape:** The LoopBack `deleteById` result — typically
`{ "count": 1 }` for a successful deletion.

**Permission:** API key needs write scope on items (`public:items:*` without
the `get@` prefix). Read-only keys get 403.

---

## Resource: Workflow

A **workflow** is an instance of a `WorkflowTemplate` attached to an item.
Each workflow has:
- A current **state** (`in_progress`, `completed`, `standby`, `rejected`) —
  states are the fixed set seeded by `WorkflowState` (see
  [migration `00000000000001-migration-to-workflows.js`](../../api-platform/modules/oldback/scripts/migrations/multi-workflow/00000000000001-migration-to-workflows.js)).
  State transitions can require a **reason**, and the workflow template controls
  whether the reason is mandatory and whether it's restricted to a fixed list
  (see `getWorkflowStateReasonValues` / `isWorkflowStateReasonMandatory`).
- A list of **statuses** (a.k.a. "steps") — each status is an instance of a
  step template (`CompanyWorkflowStep`) and has a date, comment, and
  milestones. The most recent status is `current_status`.

The Bloomflow API groups these as **Items > Workflows** — they're a
sub-resource of Item.

### URL templates
All workflow endpoints are nested under `/api/public/items/{itemId}/workflows...`,
and every ID path segment (`itemId`, `workflowId`, `statusId`) is rendered
from a `resourceLocator`. Declarative routing does **not** auto-apply
`extractValue`, so each segment re-applies the 24-char hex regex. The
templates live as exported constants in
[workflow/index.ts](../nodes/Bloomflow/resources/workflow/index.ts):

```ts
export const WORKFLOWS_URL_TEMPLATE              = `=/api/public/items/${itemIdSegment}/workflows`;
export const WORKFLOW_URL_TEMPLATE               = `=/api/public/items/${itemIdSegment}/workflows/${workflowIdSegment}`;
export const WORKFLOW_STATE_URL_TEMPLATE         = `=/api/public/items/${itemIdSegment}/workflows/${workflowIdSegment}/state`;
export const WORKFLOW_STATUS_LIST_URL_TEMPLATE   = `=/api/public/items/${itemIdSegment}/workflows/${workflowIdSegment}/status`;
export const WORKFLOW_STATUS_URL_TEMPLATE        = `=/api/public/items/${itemIdSegment}/workflows/${workflowIdSegment}/status/${statusIdSegment}`;
```
Reuse these constants — don't inline the path.

### List (`GET /api/public/items/{itemId}/workflows`)
**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID of the parent item |
| `typology` | (UI only) | Required only when itemId mode is `list`, filters the `searchItems` picker; **not** sent to the endpoint |

**No query parameters.** `listItemWorkflows` in `endpoints-workflow.js` takes
only `itemId`. Each workflow is returned via `cleanWorkflowOutput`.

**Response shape:** Array of workflow objects (full shape per `cleanWorkflowOutput`,
[public-api-helper.js:395-432](../../api-platform/modules/oldback/server/helpers/public-api-helper.js)):
```json
[{
  "id": "5f7b50dc7b8792030dd93a1a",
  "date": "2023-06-15T14:46:46.000Z",
  "current_state": { "id": "in_progress", "name": "In progress", "date": "..." },
  "current_status": { "id": "<step-template-id>", "instanceId": "<step-instance-id>", "name": "Identification", "date": "...", "comment": "...", "milestones": [...], "task_templates": [...] },
  "states": [...],
  "status": [...],
  "groups": ["Administrators", "IT department"],
  "process_id": "<process-item-id>",
  "process_name": "<process-name>",
  "process_typology_id": "<process-typology-id>"
}]
```
The `process_*` fields are only populated for **partner-style workflows** — workflows
attached to an item via a `process` (an inner item with its own typology). For a
normal item-level workflow these three fields are `undefined`. When set,
`process_typology_id` is the typology that defines the workflow template — useful
when filtering reference data for a partner's nested workflow (the item's own
`typology_id` would point to the partner typology, which doesn't match the
workflow template's typology).

**Permission:** `public:items:*` (or `get@public:items:*`). Caller must have
`read` permission on the item (`validateItemIDPermission(itemId, req, 'read')`).

---

### Get (`GET /api/public/items/{itemId}/workflows/{workflowId}`)
**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID |
| `workflowId` | path | 24-char hex ID |
| `typology` | (UI only) | filters the `searchItems` picker; **not** sent |

`workflowId` is a `resourceLocator` (list/id/url). The list mode uses
`searchWorkflows` (see [listSearch methods](#listsearch-methods-in-bloomflownodets)),
which fetches the workflows for the currently-selected `itemId`.

**No query parameters.** Returns a single workflow (same shape as one List entry).

If the workflow doesn't exist → `UNKNOWN_WORKFLOW` (404).

**Permission:** same as List.

---

### Create State (`POST /api/public/items/{itemId}/workflows/{workflowId}/state`)
Transitions a workflow to a new state (e.g. from `in_progress` to `standby`, `rejected`, or `completed`).

**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID |
| `workflowId` | path | 24-char hex ID |
| `id` | body | State ID, e.g. `in_progress`. Sent under the body key `id` (mapped from the UI field `stateId`). |

**Optional body fields (under `Additional Fields`):**
| Field | API key | Type | Notes |
|-------|---------|------|-------|
| Reason | `reason` | string | May be **mandatory** depending on the workflow template (`REASON_MANDATORY`). May also be restricted to a fixed list (`INVALID_REASON`). Implemented as a `resourceLocator` with two modes: **Select from List** calls `getWorkflowStateReasons` (loads `reasonValues[]` from reference_data scoped to the selected typology + state — typology derived from the item when the UI typology field is hidden) and **Custom Text** is a free string for states that have no fixed list. |

**Validation behaviour (`addItemWorkflowState`):**
- State `id` must be one returned by the helper `getWorkflowStates()` →
  otherwise `INVALID_STATE_ID` (400).
- If the new state equals the current state → `STATE_ALREADY` (400).
- Caller must have `update` permission on the item.

**State IDs:** the node uses a `resourceLocator` with two modes (list/id).
List mode calls `getWorkflowStates`, which fetches
`/api/public/items/workflows/reference_data` and returns the states for the
selected typology (deduped across typologies if none is selected). State IDs
are slugs (`in_progress`, `standby`, `rejected`, `completed`), not 24-char
hex — so the body mapping just unwraps `.value` without regex extraction.
The exact set depends on the workflow template.

**Response shape:** Single state object: `{ id, name, date }`.

**Permission:** API key needs write scope on items (`public:items:*`).

---

### Create Status (`POST /api/public/items/{itemId}/workflows/{workflowId}/status`)
Adds a new status (step instance) to a workflow. The new status becomes the
`current_status`.

**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID |
| `workflowId` | path | 24-char hex ID |
| `id` | body | 24-char hex status template ID (a.k.a. workflow step template). Sent under the body key `id` (mapped from the UI field `stepTemplateId`, displayed as **Status Template**, a `resourceLocator` with list/id/url modes — list mode is populated by `getWorkflowStepTemplates`). |

**Status Template picker:** `getWorkflowStepTemplates` calls reference_data and filters the dropdown to the typology of the selected item. When the UI `typology` field isn't set (because `itemId` is in `id`/`url` mode), the picker derives the typology by fetching `GET /api/public/items/{itemId}` and reading its `typology_id`. This costs one extra HTTP per dropdown open but ensures the list matches what the validator will accept (per-typology subset, not the full cross-typology catalog).

**Known limitation — partner-process workflows:** When a workflow is attached
to a partner item via a `process` (inner item with its own typology), the
workflow's template lives under the **process's** typology, not the partner's
own. The picker currently only uses the parent item's `typology_id`, so for
partner-process workflows it would show the wrong list. The workflow detail
endpoint exposes `process_typology_id` on those workflows — if/when this case
becomes important, the picker can fetch the workflow detail first and prefer
that field over the item's typology.

**Milestones — UI DISABLED.** The full milestones UX (Milestones Input toggle, multi-select via `getStepTemplateMilestones`, JSON input) is implemented but commented out in [createStatus.ts](../nodes/Bloomflow/resources/workflow/createStatus.ts) because the api-platform handler doesn't persist milestone changes — `addItemWorkflowStatus` parses the array but the task-creation logic is a `TODO` block (`endpoints-workflow.js` ~lines 670–697). Re-enable by uncommenting the field block; the matching loader in [Bloomflow.node.ts](../nodes/Bloomflow/Bloomflow.node.ts) is left live and ready.

**Optional body fields (under `Additional Fields`):**
| Field | API key | Type | Notes |
|-------|---------|------|-------|
| Add Step Mode | `addStepMode` | string enum | `keep_steps_history` (default), `keep_steps_tasks_history`, `remove_steps_tasks_history`. Comes from the `ADD_STEP_MODE` constant in `public-api-helper.js`. |
| Comment | `comment` | string | Free-text comment |
| Date | `date` | ISO 8601 string | `INVALID_DATE` (422) if malformed |

**Validation behaviour (`addItemWorkflowStatus`):**
- Status template `id` must be in `workflowTemplate.workflowStepIds` →
  otherwise `INVALID_STATUS_ID` (400). Note: reference_data returns the full typology-wide WorkflowStep catalog, which can be a superset of the template's allowed list. The typology-filtered picker mitigates this but does **not** guarantee validity for every workflow — the only complete fix would be exposing `workflowStepIds` on `cleanWorkflowOutput`, which requires an api-platform change.
- Workflow must be in progress (`isWorkflowInProgress`) → otherwise
  `NOT_ALLOWED` (405).
- Caller must have `update` permission on the item.

**Response shape:** Single status object from `cleanStatusOutput`
([public-api-helper.js:327-380](../../api-platform/modules/oldback/server/helpers/public-api-helper.js)):
`{ id, instanceId, name, date, comment, milestones[], task_templates[] }`.
- `id` is the **step template** ID (the `WorkflowStep` definition).
- `instanceId` is the **`CompanyWorkflowStep` instance** ID — this is what you
  pass back as `statusId` for Get Status / Update Status. Mixing the two
  returns `UNKNOWN_STATUS` (404).
- `milestones[]` is marked `DEPRECATED: true` server-side in favour of
  `task_templates[]`, but both are still returned for backward compat. Each
  entry exposes `checked` (whether the task exists for this status) and
  `checked_at`.

**Permission:** API key needs write scope on items (`public:items:*`).

---

### Get Status (`GET /api/public/items/{itemId}/workflows/{workflowId}/status/{statusId}`)
**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID |
| `workflowId` | path | 24-char hex ID |
| `statusId` | path | 24-char hex ID |
| `typology` | (UI only) | filters the `searchItems` picker; **not** sent |

`statusId` is a `resourceLocator` (list/id/url). The list mode uses
`searchWorkflowStatuses`, which fetches the workflow detail
(`GET /api/public/items/{itemId}/workflows/{workflowId}`) and returns its
`status[]` array.

**`id` vs `instanceId` gotcha:** the API expects the **`CompanyWorkflowStep`
instance id**, which the workflow detail response exposes as `status[].instanceId`
— **not** `status[].id` (the latter is the step template id, returned by
`cleanStatusOutput` in `public-api-helper.js` ~line 371). Sending the
template id 404s with `UNKNOWN_STATUS`. The `searchWorkflowStatuses`
picker already extracts `instanceId`; for "By ID" mode, callers must do
the same. The same gotcha applies to Update Status.

**No query parameters.**

**Response shape:** Single status object (same as Create Status response).

If the status doesn't exist → `UNKNOWN_STATUS` (404).

**Permission:** same as List.

---

### Update Status (`PUT /api/public/items/{itemId}/workflows/{workflowId}/status/{statusId}`)
Partial update — only the fields sent are applied.

**Required parameters:**
| Param | Location | Notes |
|-------|----------|-------|
| `itemId` | path | 24-char hex ID |
| `workflowId` | path | 24-char hex ID |
| `statusId` | path | 24-char hex ID |
| `typology` | (UI only) | filters the `searchItems` picker; **not** sent |

**Milestones — UI DISABLED.** Same status as Create Status — the full UX (toggle + multi-select via `getStatusMilestones` + JSON) is implemented but commented out in [updateStatus.ts](../nodes/Bloomflow/resources/workflow/updateStatus.ts) because `updateItemWorkflowStatus` doesn't persist milestone changes (TODO blocks at `endpoints-workflow.js` ~lines 670–697). The Update Status multi-select would label entries with `✓`/`☐` based on current `checked` state (via `cleanStatusOutput.milestones[].checked`) and only support marking-as-checked; uncheck requires JSON mode. Re-enable by uncommenting the field block; loader is live.

**Optional body fields (under `Update Fields`):**
| Field | API key | Type | Notes |
|-------|---------|------|-------|
| Comment | `comment` | string | Replaces `goals` on the workflow step (only `goals[0]`) |
| Date | `date` | ISO 8601 string | `INVALID_DATE` (422) if malformed |

**Validation behaviour (`updateItemWorkflowStatus`):**
- Workflow, template, and status must exist (`UNKNOWN_WORKFLOW` /
  `UNKNOWN_WORKFLOW_TEMPLATE` / `UNKNOWN_STATUS`).
- Caller must have `update` permission on the item.
- The actual task add/remove logic for milestones is currently
  commented-out in `endpoints-workflow.js` (see TODOs around lines
  670–697) — sending milestones is effectively a no-op today.
- The handler only saves the workflow step if `data.date || data.comment`
  is provided, otherwise the save is skipped.

**Response shape:** Single status object (same as Create Status response).

**Permission:** API key needs write scope on items (`public:items:*`).

---

## Resource: Reference Data

Three reference endpoints, one per related domain. All return data scoped to
the typologies the API key has access to (filtered server-side via
`getAllowedTypologyIds`).

### Get Item Reference Data (`GET /api/public/items/reference_data`)
Operation value `get` (kept for backward compatibility with workflows saved
before the rename — original displayName was just "Get"). Returns all
typologies and item-level configuration for the Bloomflow instance.

**Response shape:** Array or object; typologies are extracted as:
```ts
Array.isArray(response)
  ? response.flatMap(r => r.typologies ?? [])
  : response?.typologies ?? []
```
Each typology: `{ id: string, name: string }`.

Used internally by the `getTypologies` listSearch method.

### Get Ecosystem Reference Data (`GET /api/public/items/ecosystem/reference_data`)
Operation value `getEcosystem`. Lists the relation types (`RelatedObjectLabel`s)
available **per typology**, including each relation's allowed `targetTypologies`.
Used to determine what relation types a user can pick when creating an ecosystem
relation between two items.

**Response shape:** Array of per-typology entries (see `getItemsEcosystemReference`
in `endpoints-ecosystem.js`):
```ts
[{
  itemTypology: string,           // e.g. "startup"
  availableRelations: [{
    relationTypeId: string,        // 24-char hex
    relationTypeLabel: string,     // e.g. "selected_solution"
    targetTypologies: string[],    // typologies this relation can point to
  }],
}]
```
Note: relations are listed bidirectionally — if a typology appears in either
`originTypologies` or `targetTypologies` of a `RelatedObjectLabel`, it's listed,
with `targetTypologies` adapted to show the "other end" from that typology's
perspective.

Used internally by the `getRelationTypes` listSearch method (Ecosystem Create).

### Get Workflow Reference Data (`GET /api/public/items/workflows/reference_data`)
Operation value `getWorkflow`. Returns the workflow template structure per
typology — statuses (step templates with their milestones), and states (with
mandatoryness flags and predefined reason values where applicable).

**Response shape:** Object keyed by `typologies`:
```ts
{
  typologies: [{
    id: string,                    // e.g. "startup_default_process"
    statuses: [{
      id: string,                  // step template id (24-char hex)
      name: string,
      texts: { name: { EN, FR, ... }, description: { ... } },
      milestones: [{
        id: string,                // task template id
        name: string,
        mandatory: boolean,
        texts: { ... },
      }],
    }],
    states: [{
      id: string,                  // slug: in_progress | completed | standby | rejected
      name: string,
      texts: { name: { ... } },
      isReasonMandatory?: boolean,
      reasonValues?: string[],     // predefined reasons (e.g. for "rejected")
    }],
  }],
}
```
**Caveat (typology-wide superset):** the `statuses` array for a typology is
**all** `WorkflowStep` rows for that typology, not the subset wired into a
specific workflow's template. The validator (`addItemWorkflowStatus`) only
accepts step IDs in `workflowTemplate.workflowStepIds`, which is a subset.
Picking a status template that exists in reference_data but isn't in the
template returns `INVALID_STATUS_ID`. This is a known gap — `workflowStepIds`
is not exposed on the workflow detail endpoint, so the node can only filter
by typology, not by workflow template.

Used internally by `getWorkflowStepTemplates`, `getWorkflowStates`,
`getWorkflowStateReasons`, `getStepTemplateMilestones`, and the disabled-but-
ready `getStatusMilestones` (paired with the commented-out milestones UX).

---

## Node implementation patterns

### Typology serialisation (repeated across all operations)
```ts
typology: '={{ JSON.stringify([typeof $parameter["typology"] === "object" ? $parameter["typology"].value : $parameter["typology"]]) }}'
```
This handles both `resourceLocator` object mode and plain string mode.

### Comma-separated → JSON array (list filters)
```ts
labels: '={{ JSON.stringify($value.split(",").map(v => v.trim()).filter(Boolean)) }}'
```

### listSearch methods (in `Bloomflow.node.ts`)
- `getTypologies` — fetches `/api/public/items/reference_data`, flattens typologies
- `searchItems` — fetches `/api/public/items?typology=[...]&limit=50`, requires `typology`
  to already be set in the current node parameters
- `searchTargetItems` — same shape as `searchItems` but reads `targetTypology` instead
  of `typology`. Used by the Ecosystem Create operation so the origin and target item
  pickers can each filter by a different typology.
- `searchRelations` — fetches `/api/public/items/{itemId}/ecosystem`, requires `itemId`
  to already be set in the current node parameters. Extracts a 24-char hex ID from the
  `itemId` resourceLocator value, then maps each relation to a display label of the form
  `"{relationType label}: {origin.name} → {target.name} ({id})"`. Returns `[]` if no
  itemId is selected yet.
- `getRelationTypes` — fetches `/api/public/items/ecosystem/reference_data`, used by the
  Ecosystem Create operation's `relationTypeId` picker. Filters by origin `typology`
  when set, AND intersects with `targetTypology` when set (only returns relations whose
  `targetTypologies[]` includes the chosen target). When neither is set, returns the
  full deduplicated set of relation types across all typologies.
- `getTargetTypologies` — fetches `/api/public/items/ecosystem/reference_data` AND
  `/api/public/items/reference_data` in parallel. Used by the Ecosystem Create
  operation's `targetTypology` picker. Returns the union of `availableRelations[].targetTypologies`
  for the selected origin typology, with display names from items reference_data.
  Origin typology comes from the UI `typology` field, or is derived from the item
  (via `GET /api/public/items/{itemId}`) when typology is hidden. Falls back to all
  typologies when origin typology is unknown.
- `getWorkflowStepTemplates` — fetches `/api/public/items/workflows/reference_data`, used
  by the Create Status operation's `stepTemplateId` picker. The response groups step
  templates per typology (`typologies[].statuses[]`); if a `typology` is set in the
  current node parameters, the list is filtered to that typology, otherwise it shows
  the full deduplicated set across all typologies.
- `searchWorkflows` — fetches `/api/public/items/{itemId}/workflows`. Requires `itemId`
  to already be set in the current node parameters. Maps each workflow to a display
  label of the form `"{current_status.name} / {current_state.name} ({id})"` so the
  picker is meaningful when an item has multiple workflows. Returns `[]` if no itemId.
- `searchWorkflowStatuses` — fetches `/api/public/items/{itemId}/workflows/{workflowId}`
  and returns the `status[]` array. Requires both `itemId` and `workflowId` to be set.
  Returns `[]` if either parent ID is unset.
  **`id` vs `instanceId` gotcha:** the API's `cleanStatusOutput`
  (public-api-helper.js ~line 371) exposes `id` as the workflow-step **template** id
  and `instanceId` as the actual `CompanyWorkflowStep` id. The Get / Update Status
  endpoints look up by `CompanyWorkflowStep.id`, so the picker uses `s.instanceId`
  for the picker value (falling back to `s.id` if absent on older responses). Sending
  `s.id` here would 404 with `UNKNOWN_STATUS`.

### Item fields that are numeric-looking but typed as `string`
`nb_employees`, `total_funding_usd`, `year_founded`, `etablissement_year_founded` — all
sent as strings even though they look numeric. Do not change to `number` type.

### `hq` is a nested object
The `hq_address` field maps to `hq: { hq_address: value }` in the request body, not a
flat `hq_address` key.
