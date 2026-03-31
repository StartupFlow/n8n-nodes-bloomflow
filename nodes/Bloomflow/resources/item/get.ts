import type { INodeProperties } from 'n8n-workflow';

export const itemGetDescription: INodeProperties[] = [
    {
        displayName: 'Item ID',
        name: 'itemId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['get'],
            },
        },
        default: '',
        description: 'The ID of the item to retrieve',
        routing: {
            request: {
                method: 'GET',
                url: '=/api/public/items/{{$parameter.itemId}}',
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