import type { INodeProperties } from 'n8n-workflow';

export const taskListDescription: INodeProperties[] = [
    {
        displayName: 'Typology',
        name: 'typology',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        displayOptions: {
            show: {
                resource: ['task'],
                operation: ['list'],
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
                resource: ['task'],
                operation: ['list'],
            },
        },
        default: { mode: 'id', value: '' },
        description: 'The item to list tasks for. Sent to the API as <code>itemIds</code>; the server derives the workflow(s) from this item.',
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
                qs: {
                    itemIds:
                        '={{ (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId) }}',
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
                resource: ['task'],
                operation: ['list'],
            },
        },
        options: [
            {
                displayName: 'Assignee IDs',
                name: 'assigneeIds',
                type: 'string',
                default: '',
                placeholder: 'userId1,userId2',
                description: 'Comma-separated list of assignee user IDs',
                routing: {
                    request: {
                        qs: { assigneeIds: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Assigner IDs',
                name: 'assignerIds',
                type: 'string',
                default: '',
                placeholder: 'userId1,userId2',
                description: 'Comma-separated list of assigner user IDs',
                routing: {
                    request: {
                        qs: { assignerIds: '={{ $value }}' },
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
                description: 'Number of results to skip for pagination',
                routing: {
                    request: {
                        qs: { offset: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Sort Field',
                name: 'sortField',
                type: 'options',
                default: 'created_at',
                description: 'Field to sort by',
                options: [
                    { name: 'Assignee', value: 'assignee' },
                    { name: 'Company Name', value: 'companyName' },
                    { name: 'Created At', value: 'created_at' },
                    { name: 'Due Date', value: 'dueDate' },
                    { name: 'Status', value: 'status' },
                    { name: 'Title', value: 'title' },
                    { name: 'Workflow Name', value: 'workflowName' },
                ],
                routing: {
                    request: {
                        qs: { sortField: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Sort Order',
                name: 'sortOrder',
                type: 'options',
                default: 'desc',
                description: 'Sort direction',
                options: [
                    { name: 'Ascending', value: 'asc' },
                    { name: 'Descending', value: 'desc' },
                ],
                routing: {
                    request: {
                        qs: { sortOrder: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Statuses',
                name: 'statuses',
                type: 'multiOptions',
                default: [],
                description: 'Filter by task status',
                options: [
                    { name: 'Completed', value: 'completed' },
                    { name: 'Overdue', value: 'overdue' },
                    { name: 'Pending', value: 'pending' },
                ],
                routing: {
                    request: {
                        qs: { statuses: '={{ ($value || []).join(",") }}' },
                    },
                },
            },
            {
                displayName: 'Task Template Names or IDs',
                name: 'taskTemplateIds',
                type: 'multiOptions',
                default: [],
                description:
                    'Filter by task template. Loaded from <code>/api/public/items/tasks/reference_data</code>, filtered by the selected typology. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
                typeOptions: {
                    loadOptionsMethod: 'getTaskTemplates',
                    loadOptionsDependsOn: ['typology.value'],
                },
                routing: {
                    request: {
                        qs: {
                            taskTemplateIds: '={{ ($value || []).join(",") }}',
                        },
                    },
                },
            },
            {
                displayName: 'Workflow IDs',
                name: 'companyWorkflowIds',
                type: 'string',
                default: '',
                placeholder: 'workflowId1,workflowId2',
                description:
                    'Comma-separated list of workflow IDs to filter by. Overrides the item-based workflow derivation — useful when the same item has multiple workflows.',
                routing: {
                    request: {
                        qs: { companyWorkflowIds: '={{ $value }}' },
                    },
                },
            },
        ],
    },
];
