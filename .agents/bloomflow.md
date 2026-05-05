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
modes resolve to a clean 24-char ID:
```ts
url: '=/api/public/items/{{ (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId) }}/documents'
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

## Resource: Reference Data

### Get (`GET /api/public/items/reference_data`)
No parameters required. Returns all typologies and reference data for the Bloomflow instance.

**Response shape:** Array or object; typologies are extracted as:
```ts
Array.isArray(response)
  ? response.flatMap(r => r.typologies ?? [])
  : response?.typologies ?? []
```
Each typology: `{ id: string, name: string }`.

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
- `searchItems` — fetches `/api/public/items?typology=[...]&limit=50`, requires typology
  to already be set in the current node parameters

### Item fields that are numeric-looking but typed as `string`
`nb_employees`, `total_funding_usd`, `year_founded`, `etablissement_year_founded` — all
sent as strings even though they look numeric. Do not change to `number` type.

### `hq` is a nested object
The `hq_address` field maps to `hq: { hq_address: value }` in the request body, not a
flat `hq_address` key.
