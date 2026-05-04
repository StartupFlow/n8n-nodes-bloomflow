import type { INodeProperties } from 'n8n-workflow';

export const itemListDescription: INodeProperties[] = [
    // ─── Required / Primary Filters ──────────────────────────────────────────────

    {
        displayName: 'Typology',
        name: 'typology',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['list']
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
                    typology: '={{ typeof $parameter["typology"] === "object" ? $parameter["typology"].value : $parameter["typology"] }}',
                },
            },
        },
    },

    // ─── Additional / Optional Fields ────────────────────────────────────────────

    {
        displayName: 'Parameters',
        name: 'parameters',
        type: 'collection',
        placeholder: 'Add Parameter',
        default: {},
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['list'],
            },
        },
        options: [
            // alphabetical order ↓
            {
                displayName: 'Labels',
                name: 'labels',
                type: 'string',
                default: '',
                description: 'Comma-separated label slugs, e.g. <code>procurement, security</code>. Sent as a JSON array.',
                routing: {
                    request: {
                        qs: {
                            labels: '={{ JSON.stringify($value.split(",").map(v => v.trim()).filter(Boolean)) }}',
                        },
                    },
                },
            },
            {
                displayName: 'Limit',
                name: 'limit',
                type: 'number',
                typeOptions: { minValue: 1, maxValue: 100 },
                default: 50,
                description: 'Max number of results to return',
                routing: {
                    request: {
                        qs: { limit: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Offset',
                name: 'offset',
                type: 'number',
                typeOptions: { minValue: 0 },
                default: 0,
                description: 'Number of items to skip for pagination',
                routing: {
                    request: {
                        qs: { offset: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Search Fields',
                name: 'fields',
                type: 'string',
                default: '',
                description: 'Comma-separated field names to search within, e.g. <code>website, name</code>. Sent as a JSON array. Use together with Search Term.',
                routing: {
                    request: {
                        qs: {
                            fields: '={{ JSON.stringify($value.split(",").map(v => v.trim()).filter(Boolean)) }}',
                        },
                    },
                },
            },
            {
                displayName: 'Search Term',
                name: 'term',
                type: 'string',
                default: '',
                description: 'Value to search for within the specified Search Fields, e.g. <code>example.com</code>. Use together with Search Fields.',
                routing: {
                    request: {
                        qs: { term: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Sort',
                name: 'sort',
                type: 'string',
                default: '',
                description: 'Sort order, e.g. <code>created_at_desc</code> or <code>updated_at_asc</code>',
                routing: {
                    request: {
                        qs: { sort: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Sources',
                name: 'sources',
                type: 'string',
                default: '',
                description: 'Comma-separated source IDs. Sent as a JSON array.',
                routing: {
                    request: {
                        qs: {
                            sources: '={{ JSON.stringify($value.split(",").map(v => v.trim()).filter(Boolean)) }}',
                        },
                    },
                },
            },
            {
                displayName: 'Tags',
                name: 'tags',
                type: 'string',
                default: '',
                description: 'Comma-separated tag IDs, e.g. <code>594773057733a4fa1b0b7609, 594773057733a4fa1b0b760a</code>. Sent as a JSON array.',
                routing: {
                    request: {
                        qs: {
                            tags: '={{ JSON.stringify($value.split(",").map(v => v.trim()).filter(Boolean)) }}',
                        },
                    },
                },
            },
            {
                displayName: 'Updated After',
                name: 'updated_at_gt',
                type: 'dateTime',
                default: '',
                description: 'Return only items updated after this date (ISO 8601)',
                routing: {
                    request: {
                        qs: { updated_at_gt: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Updated Before',
                name: 'updated_at_lt',
                type: 'dateTime',
                default: '',
                description: 'Return only items updated before this date (ISO 8601)',
                routing: {
                    request: {
                        qs: { updated_at_lt: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'With Processes',
                name: 'withProcesses',
                type: 'boolean',
                default: false,
                description: 'Whether to include processes linked to the items',
                routing: {
                    request: {
                        qs: { withProcesses: '={{ $value }}' },
                    },
                },
            },
        ],
    },
];