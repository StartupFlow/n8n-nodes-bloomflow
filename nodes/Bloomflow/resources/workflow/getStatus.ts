import type { INodeProperties } from 'n8n-workflow';

export const workflowGetStatusDescription: INodeProperties[] = [
    {
        displayName: 'Typology',
        name: 'typology',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['getStatus'],
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
                operation: ['getStatus'],
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
        description: 'The workflow the status belongs to',
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['getStatus'],
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
        displayName: 'Status',
        name: 'statusId',
        type: 'resourceLocator',
        required: true,
        default: { mode: 'id', value: '' },
        description: 'The workflow status (step) to get',
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['getStatus'],
            },
        },
        modes: [
            {
                displayName: 'Select from List',
                name: 'list',
                type: 'list',
                placeholder: 'Select a status...',
                typeOptions: {
                    searchListMethod: 'searchWorkflowStatuses',
                    searchable: true,
                },
            },
            {
                displayName: 'By ID',
                name: 'id',
                type: 'string',
                placeholder: 'e.g. 5f7b50dc7b8792030dd93a1b',
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
];
