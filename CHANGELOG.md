# Changelog

## [0.1.0] — 2026-04-14

### Added
- Initial release of the Bloomflow n8n community node
- **Item** resource with four operations:
  - **Create** — create items under a typology with soft upsert behaviour; supports AI enrichment and two body input modes (individual fields or raw JSON); 30+ optional fields (descriptions, contacts, funding, tags, labels, links, etc.)
  - **Get** — retrieve a single item by ID, by URL, or by selecting from a live list
  - **List** — list items under a typology with filters: search term & fields, labels, tags, sources, date range (`updated_at_gt` / `updated_at_lt`), sort, limit, offset, and process inclusion
  - **Update** — fully replace an item's fields; same field coverage as Create
- **Reference Data** resource with **Get** operation to retrieve all typologies and reference data for the Bloomflow instance
- Dynamic typology selection via live list search (`GET /api/public/items/reference_data`)
- Dynamic item search within a typology for the Get operation
- **Bloomflow API** credential with Base URL + API Key authentication (`x-bflow-api-key` header) and automatic credential test
