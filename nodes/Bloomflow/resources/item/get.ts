import type { INodeProperties } from 'n8n-workflow';

export const itemGetDescription: INodeProperties[] = [
        {
        displayName: 'Typology',
        name: 'typology',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['get'],
                '/itemId.mode': ['list'], 
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
        ]
    },
    {
        displayName: 'Item',
        name: 'itemId',
        type: 'resourceLocator',
        required: true,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['get'],
            },
        },
        default: { mode: 'id', value: '' },
        modes: [
            {
                displayName: 'Select from List',
                name: 'list',
                type: 'list',
                placeholder: 'Select an item...',
                typeOptions: {
                    searchListMethod: 'searchItems',
                    searchable: true,
                },
            },
            {
                displayName: 'By ID',
                name: 'id',
                type: 'string',
                placeholder: 'e.g. 698c7b0dc0a4b76ce34bd0b2',
            },
            {
                displayName: 'By URL',
                name: 'url',
                type: 'string',
                placeholder: 'Paste Bloomflow URL...',
                extractValue: {
                    type: 'regex',
                    regex: '/([a-f0-9]{24})/',
                },
            },
        ],
        routing: {
            request: {
                method: 'GET',
                url: '=/api/public/items/{{$value}}',
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
                operation: ['get'],
            },
        },
        options: [
            {
                displayName: 'With Processes',
                name: 'withProcesses',
                type: 'boolean',
                default: false,
                description: 'Whether to include processes linked to the item',
                routing: {
                    request: {
                        qs: { withProcesses: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'With Specialized Financial Table',
                name: 'withSpecializedFinancialTable',
                type: 'boolean',
                default: false,
                description: 'Whether to include the specialized financial table for the item',
                routing: {
                    request: {
                        qs: { withSpecializedFinancialTable: '={{ $value }}' },
                    },
                },
            },
        ],
    },
];