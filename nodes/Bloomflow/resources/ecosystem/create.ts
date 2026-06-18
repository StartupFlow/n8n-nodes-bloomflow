import type { INodeProperties } from 'n8n-workflow';

export const ecosystemCreateDescription: INodeProperties[] = [
    // ─── Origin item ─────────────────────────────────────────────────────────────

    {
        displayName: 'Typology',
        name: 'typology',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        displayOptions: {
            show: {
                resource: ['ecosystem'],
                operation: ['create'],
                '/itemId.mode': ['list'],
            },
        },
        description: 'The typology of the origin item (used to filter the item picker)',
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
                placeholder: 'startup',
            },
        ],
    },
    {
        displayName: 'Item',
        name: 'itemId',
        type: 'resourceLocator',
        required: true,
        displayOptions: {
            show: {
                resource: ['ecosystem'],
                operation: ['create'],
            },
        },
        default: { mode: 'id', value: '' },
        description: 'The origin item to create the relation from',
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
    },

    // ─── Target item ─────────────────────────────────────────────────────────────

    {
        displayName: 'Target Typology',
        name: 'targetTypology',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        displayOptions: {
            show: {
                resource: ['ecosystem'],
                operation: ['create'],
                '/targetId.mode': ['list'],
            },
        },
        description:
            'The typology of the target item. The list is filtered by the origin typology — only typologies that can actually be linked from the chosen origin are shown (per /api/public/items/ecosystem/reference_data). If the origin typology has no available relations, the list will be empty.',
        modes: [
            {
                displayName: 'From List',
                name: 'list',
                type: 'list',
                typeOptions: {
                    searchListMethod: 'getTargetTypologies',
                    searchable: true,
                    searchFilterRequired: false,
                },
            },
            {
                displayName: 'ID',
                name: 'id',
                type: 'string',
                hint: 'Enter a typology ID, e.g. startup',
                placeholder: 'startup',
            },
        ],
    },
    {
        displayName: 'Target Item',
        name: 'targetId',
        type: 'resourceLocator',
        required: true,
        displayOptions: {
            show: {
                resource: ['ecosystem'],
                operation: ['create'],
            },
        },
        default: { mode: 'id', value: '' },
        description: 'The target item to link to',
        modes: [
            {
                displayName: 'Select from List',
                name: 'list',
                type: 'list',
                placeholder: 'Select an item...',
                typeOptions: {
                    searchListMethod: 'searchTargetItems',
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
                body: {
                    targetId:
                        '={{ (($parameter.targetId && $parameter.targetId.value) || $parameter.targetId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.targetId && $parameter.targetId.value) || $parameter.targetId) }}',
                },
            },
        },
    },

    // ─── Optional body fields ────────────────────────────────────────────────────

    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['ecosystem'],
                operation: ['create'],
            },
        },
        options: [
            {
                displayName: 'Content',
                name: 'content',
                type: 'string',
                default: '',
                typeOptions: { rows: 3 },
                description: 'Optional text content describing the relation',
                routing: {
                    request: {
                        body: { content: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Relation Type',
                name: 'relationTypeId',
                type: 'resourceLocator',
                default: { mode: 'list', value: '' },
                description:
                    'The relation type to use. If omitted, Bloomflow picks the default relation for the origin/target typology pair.',
                modes: [
                    {
                        displayName: 'From List',
                        name: 'list',
                        type: 'list',
                        typeOptions: {
                            searchListMethod: 'getRelationTypes',
                            searchable: true,
                            searchFilterRequired: false,
                        },
                    },
                    {
                        displayName: 'By ID',
                        name: 'id',
                        type: 'string',
                        placeholder: 'e.g. 62d943ee03b2e60013022973',
                    },
                ],
                routing: {
                    request: {
                        body: {
                            relationTypeId:
                                '={{ typeof $value === "object" ? $value.value : $value }}',
                        },
                    },
                },
            },
        ],
    },
];
