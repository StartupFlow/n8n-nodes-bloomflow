import type { INodeProperties } from 'n8n-workflow';

export const itemUpdateDescription: INodeProperties[] = [
    // ─── Notice ──────────────────────────────────────────────────────────────────

    {
        displayName: 'This will replace all fields of the item with the data provided. Make sure to provide all required fields.',
        name: 'updateNote',
        type: 'notice',
        default: '',
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['update'],
            },
        },
    },

    // ─── Required Fields ─────────────────────────────────────────────────────────

    {
        displayName: 'Item ID',
        name: 'itemId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['update'],
            },
        },
        default: '',
        description: 'The ID of the item to update',
        routing: {
            request: {
                url: '=/api/public/items/{{$parameter.itemId}}',
            },
        },
    },
    {
        displayName: 'Typology',
        name: 'typology',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['update'],
            },
        },
        description: 'The typology to filter items by',
        modes: [
            {
                displayName: 'From List',
                name: 'list',
                type: 'list',
                typeOptions: {
                    searchListMethod: 'getTypologies',
                    searchable: true,
                    searchFilterRequired: false,
                },
            },
            {
                displayName: 'ID',
                name: 'id',
                type: 'string',
                hint: 'Enter a typology ID, e.g. startup',
                placeholder: 'startup'
            },
        ],
        routing: {
            request: {
                qs: {
                    typology: '={{ JSON.stringify([typeof $parameter["typology"] === "object" ? $parameter["typology"].value : $parameter["typology"]]) }}',
                },
            },
        },
    },
    {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['update'],
            },
        },
        default: '',
        description: 'The name of the item',
        routing: {
            request: {
                body: { name: '={{ $value }}' },
            },
        },
    },
    {
        displayName: 'With Enrichment',
        name: 'withEnrichment',
        type: 'boolean',
        default: false,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['update'],
            },
        },
        description: 'Whether to enable item enrichment after update',
        routing: {
            request: {
                qs: { withEnrichment: '={{ $value }}' },
            },
        },
    },
    {
        displayName: 'Website',
        name: 'website',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['update'],
                withEnrichment: [true],
            },
        },
        description: 'Website URL of the item',
        routing: {
            request: {
                body: { website: '={{ $value }}' },
            },
        },
    },

    // ─── Body Input Mode Toggle ───────────────────────────────────────────────────

    {
        displayName: 'Body Input Mode',
        name: 'bodyInputMode',
        type: 'options',
        options: [
            {
                name: 'Individual Fields',
                value: 'fields',
            },
            {
                name: 'Raw JSON',
                value: 'json',
            },
        ],
        default: 'fields',
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['update'],
            },
        },
        description: 'Choose whether to fill in fields individually or provide a raw JSON body',
    },

    // ─── Raw JSON Body ────────────────────────────────────────────────────────────

    {
        displayName: 'JSON Body',
        name: 'jsonBody',
        type: 'json',
        default: '{}',
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['update'],
                bodyInputMode: ['json'],
            },
        },
        description: 'Full request body as a JSON object. The <code>typologyId</code> and <code>name</code> fields above will be merged in automatically. Example: <code>{"short_description":"AI startup","year_founded":"2020","tags":[{"name":"saas"}]}</code>.',
        routing: {
            request: {
                body: '={{ JSON.parse($value) }}',
            },
        },
    },

    // ─── Additional Body Fields (shown only in "fields" mode) ────────────────────

    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['update'],
                bodyInputMode: ['fields'],
            },
        },
        options: [
            {
                displayName: 'Business Model',
                name: 'business_model',
                type: 'string',
                default: '',
                description: 'Description of the business model',
                routing: {
                    request: {
                        body: { business_model: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Business Opportunity',
                name: 'business_opportunity',
                type: 'string',
                default: '',
                description: 'Description of the business opportunity',
                routing: {
                    request: {
                        body: { business_opportunity: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Competitors',
                name: 'competitors',
                type: 'string',
                default: '',
                description: 'Description of main competitors',
                routing: {
                    request: {
                        body: { competitors: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Custom Fields (JSON)',
                name: 'custom_fields',
                type: 'json',
                default: '[]',
                description: 'Array of custom fields, e.g. <code>[{"field_id":"sourcing_partner_field","value":"My value"}]</code>',
                routing: {
                    request: {
                        body: { custom_fields: '={{ JSON.parse($value) }}' },
                    },
                },
            },
            {
                displayName: 'Establishment Year Founded',
                name: 'etablissement_year_founded',
                type: 'string',
                default: '',
                description: 'The year the establishment was founded, e.g. <code>1975</code>',
                routing: {
                    request: {
                        body: { etablissement_year_founded: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'External Contacts (JSON)',
                name: 'external_contacts',
                type: 'json',
                default: '[]',
                description: 'Array of external contacts, e.g. <code>[{"first_name":"Satya","last_name":"Nadella","email_address":"satya@ms.com","position":"CEO"}]</code>',
                routing: {
                    request: {
                        body: { external_contacts: '={{ JSON.parse($value) }}' },
                    },
                },
            },
            {
                displayName: 'Full Description',
                name: 'full_description',
                type: 'string',
                typeOptions: { rows: 4 },
                default: '',
                description: 'Full description of the item',
                routing: {
                    request: {
                        body: { full_description: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'HQ Address',
                name: 'hq_address',
                type: 'string',
                default: '',
                description: 'Headquarters address, e.g. <code>98052 Redmond</code>',
                routing: {
                    request: {
                        body: { hq: { hq_address: '={{ $value }}' } },
                    },
                },
            },
            {
                displayName: 'Internal Contacts (JSON)',
                name: 'internal_contacts',
                type: 'json',
                default: '[]',
                description: 'Array of internal contacts, e.g. <code>[{"first_name":"Ted","last_name":"Hoover","email_address":"ted@example.com","type":"referent"}]</code>',
                routing: {
                    request: {
                        body: { internal_contacts: '={{ JSON.parse($value) }}' },
                    },
                },
            },
            {
                displayName: 'Key Differentiators',
                name: 'key_differentiators',
                type: 'string',
                default: '',
                description: 'Key differentiators of the item',
                routing: {
                    request: {
                        body: { key_differentiators: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Labels (JSON)',
                name: 'labels',
                type: 'json',
                default: '[]',
                description: 'Array of label objects, e.g. <code>[{"ID":"security"}]</code>',
                routing: {
                    request: {
                        body: { labels: '={{ JSON.parse($value) }}' },
                    },
                },
            },
            {
                displayName: 'Links (JSON)',
                name: 'links',
                type: 'json',
                default: '{}',
                description: 'Object of links, e.g. <code>{"linkedin_url":"https://linkedin.com/company/microsoft"}</code>',
                routing: {
                    request: {
                        body: { links: '={{ JSON.parse($value) }}' },
                    },
                },
            },
            {
                displayName: 'Logo URL',
                name: 'logo_url',
                type: 'string',
                default: '',
                description: 'URL of the item logo',
                routing: {
                    request: {
                        body: { logo_url: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Market IDs (JSON)',
                name: 'market_ids',
                type: 'json',
                default: '[]',
                description: 'Array of market IDs, e.g. <code>["France","US","GB"]</code>',
                routing: {
                    request: {
                        body: { market_ids: '={{ JSON.parse($value) }}' },
                    },
                },
            },
            {
                displayName: 'Maturity',
                name: 'maturity',
                type: 'string',
                default: '',
                description: 'Maturity stage of the item, e.g. <code>ipo</code>',
                routing: {
                    request: {
                        body: { maturity: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Number of Employees',
                name: 'nb_employees',
                type: 'string',
                default: '',
                description: 'Number of employees, e.g. <code>200 +</code>',
                routing: {
                    request: {
                        body: { nb_employees: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Pain Points',
                name: 'painpoints',
                type: 'string',
                default: '',
                description: 'Description of pain points',
                routing: {
                    request: {
                        body: { painpoints: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Press URLs (JSON)',
                name: 'press_urls',
                type: 'json',
                default: '[]',
                description: 'Array of press URLs, e.g. <code>["https://welcometothejungle.co/fr/companies/microsoft"]</code>',
                routing: {
                    request: {
                        body: { press_urls: '={{ JSON.parse($value) }}' },
                    },
                },
            },
            {
                displayName: 'Risks',
                name: 'risks',
                type: 'string',
                default: '',
                description: 'Description of risks',
                routing: {
                    request: {
                        body: { risks: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Short Description',
                name: 'short_description',
                type: 'string',
                typeOptions: { rows: 2 },
                default: '',
                description: 'Short description of the item',
                routing: {
                    request: {
                        body: { short_description: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Sources (JSON)',
                name: 'sources',
                type: 'json',
                default: '[]',
                description: 'Array of source objects, e.g. <code>[{"ID":"5e6fcc67820e9c012f765178"}]</code>',
                routing: {
                    request: {
                        body: { sources: '={{ JSON.parse($value) }}' },
                    },
                },
            },
            {
                displayName: 'Success Proofs',
                name: 'success_proofs',
                type: 'string',
                default: '',
                description: 'Description of success proofs',
                routing: {
                    request: {
                        body: { success_proofs: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Sustainability',
                name: 'sustainability',
                type: 'string',
                default: '',
                description: 'Description of sustainability criteria',
                routing: {
                    request: {
                        body: { sustainability: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Tags (JSON)',
                name: 'tags',
                type: 'json',
                default: '[]',
                description: 'Array of tag objects, e.g. <code>[{"name":"saas"},{"name":"data"}]</code>',
                routing: {
                    request: {
                        body: { tags: '={{ JSON.parse($value) }}' },
                    },
                },
            },
            {
                displayName: 'Total Funding (USD)',
                name: 'total_funding_usd',
                type: 'string',
                default: '',
                description: 'Total funding in USD, e.g. <code>1000000</code>',
                routing: {
                    request: {
                        body: { total_funding_usd: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Video URLs (JSON)',
                name: 'video_urls',
                type: 'json',
                default: '[]',
                description: 'Array of video URLs, e.g. <code>["https://youtube.com/watch?v=abc"]</code>',
                routing: {
                    request: {
                        body: { video_urls: '={{ JSON.parse($value) }}' },
                    },
                },
            },
            {
                displayName: 'Website',
                name: 'website_optional',
                type: 'string',
                default: '',
                description: 'Website URL (optional when enrichment is disabled)',
                displayOptions: {
                    show: {
                        '/withEnrichment': [false],
                    },
                },
                routing: {
                    request: {
                        body: { website: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Year Founded',
                name: 'year_founded',
                type: 'string',
                default: '',
                description: 'The year the item was founded, e.g. <code>1975</code>',
                routing: {
                    request: {
                        body: { year_founded: '={{ $value }}' },
                    },
                },
            },
        ],
    },

    // ─── Query Params ─────────────────────────────────────────────────────────────

    {
        displayName: 'Parameters',
        name: 'parameters',
        type: 'collection',
        placeholder: 'Add Parameter',
        default: {},
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['update'],
            },
        },
        options: [
            {
                displayName: 'Context',
                name: 'context',
                type: 'string',
                default: '',
                description: 'The context of the item, e.g. <code>sync</code>. Leave blank for default.',
                routing: {
                    request: {
                        qs: { context: '={{ $value }}' },
                    },
                },
            },
        ],
    },
];