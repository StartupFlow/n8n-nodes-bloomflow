import type { INodeProperties } from 'n8n-workflow';

export const workflowCreateStateDescription: INodeProperties[] = [
    {
        displayName: 'Typology',
        name: 'typology',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['createState'],
                '/itemId.mode': ['list'],
            },
        },
        description: 'The typology of the parent item (used to filter the item picker)',
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
                resource: ['workflow'],
                operation: ['createState'],
            },
        },
        default: { mode: 'id', value: '' },
        description: 'The item the workflow belongs to',
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
    {
        displayName: 'Workflow',
        name: 'workflowId',
        type: 'resourceLocator',
        required: true,
        default: { mode: 'id', value: '' },
        description: 'The workflow to add a state to',
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['createState'],
            },
        },
        modes: [
            {
                displayName: 'Select from List',
                name: 'list',
                type: 'list',
                placeholder: 'Select a workflow...',
                typeOptions: {
                    searchListMethod: 'searchWorkflows',
                    searchable: true,
                },
            },
            {
                displayName: 'By ID',
                name: 'id',
                type: 'string',
                placeholder: 'e.g. 5f7b50dc7b8792030dd93a1a',
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
    {
        displayName: 'State',
        name: 'stateId',
        type: 'resourceLocator',
        required: true,
        default: { mode: 'list', value: '' },
        description:
            'The state to transition the workflow to. List mode is populated from /api/public/items/workflows/reference_data, filtered by the selected typology.',
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['createState'],
            },
        },
        modes: [
            {
                displayName: 'Select from List',
                name: 'list',
                type: 'list',
                placeholder: 'Select a state...',
                typeOptions: {
                    searchListMethod: 'getWorkflowStates',
                    searchable: true,
                    searchFilterRequired: false,
                },
            },
            {
                displayName: 'By ID',
                name: 'id',
                type: 'string',
                placeholder: 'e.g. in_progress',
                hint: 'Common values: in_progress, standby, rejected, completed (depends on the workflow template)',
            },
        ],
        routing: {
            request: {
                body: {
                    id: '={{ (($parameter.stateId && $parameter.stateId.value) || $parameter.stateId) }}',
                },
            },
        },
    },
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['createState'],
            },
        },
        options: [
            {
                displayName: 'Reason',
                name: 'reason',
                type: 'resourceLocator',
                default: { mode: 'list', value: '' },
                description:
                    'Reason for the state transition. Some states (e.g. rejected) restrict reasons to a predefined list — the picker loads those from /api/public/items/workflows/reference_data. For states without a fixed list, switch to Custom Text. The API returns REASON_MANDATORY or INVALID_REASON if not allowed.',
                modes: [
                    {
                        displayName: 'Select from List',
                        name: 'list',
                        type: 'list',
                        placeholder: 'Pick a predefined reason...',
                        typeOptions: {
                            searchListMethod: 'getWorkflowStateReasons',
                            searchable: true,
                            searchFilterRequired: false,
                        },
                    },
                    {
                        displayName: 'Custom Text',
                        name: 'string',
                        type: 'string',
                        placeholder: 'Enter a reason...',
                    },
                ],
                routing: {
                    request: {
                        body: {
                            reason:
                                '={{ typeof $value === "object" ? $value.value : $value }}',
                        },
                    },
                },
            },
        ],
    },
];
