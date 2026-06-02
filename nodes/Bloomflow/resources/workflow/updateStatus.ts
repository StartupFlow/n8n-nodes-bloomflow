import type { INodeProperties } from 'n8n-workflow';

export const workflowUpdateStatusDescription: INodeProperties[] = [
    {
        displayName: 'Typology',
        name: 'typology',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['updateStatus'],
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
                operation: ['updateStatus'],
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
                operation: ['updateStatus'],
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
        description: 'The workflow status (step) to update',
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['updateStatus'],
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
                hint: 'Use the status\'s instanceId (from status[].instanceId on the workflow detail), not status[].id — the latter is the step template id and will 404 with UNKNOWN_STATUS',
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
    // ─── Milestones — DISABLED ────────────────────────────────────────────────
    // The api-platform's updateItemWorkflowStatus handler parses the milestones
    // array but the task add/remove logic is commented out (TODO blocks in
    // endpoints-workflow.js around lines 670–697). Sending milestones is a
    // server-side no-op today, so we hide the UI to avoid users wasting time
    // debugging "why didn't my milestone update?". Re-enable by uncommenting
    // this block (and the matching getStatusMilestones loader in
    // Bloomflow.node.ts is already wired up) once the api-platform implements
    // the TODO. No further node changes needed.
    /*
    {
        displayName: 'Milestones Input',
        name: 'milestonesMode',
        type: 'options',
        default: 'select',
        description: 'How to provide milestones to update on the status',
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['updateStatus'],
            },
        },
        options: [
            {
                name: 'Select From List',
                value: 'select',
                description:
                    'Pick milestones from a checkbox list. Each selection is sent as { ID, checked: true } — i.e. marks the milestone as checked.',
            },
            {
                name: 'JSON',
                value: 'json',
                description:
                    'Provide raw JSON. Use this when you need to send checked: false (uncheck a milestone) or other shapes.',
            },
        ],
    },
    {
        displayName: 'Milestone Names or IDs',
        name: 'milestones',
        type: 'multiOptions',
        default: [],
        description:
            'Milestones to mark as checked on this status. Loaded from the selected Status — entries are prefixed with ✓ (already checked) or ☐ (not checked). Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        hint: 'Selecting sends { id, checked: true }. To uncheck a milestone, switch Milestones Input to JSON.',
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['updateStatus'],
                milestonesMode: ['select'],
            },
        },
        typeOptions: {
            loadOptionsMethod: 'getStatusMilestones',
            loadOptionsDependsOn: ['statusId.value'],
        },
        routing: {
            request: {
                body: {
                    milestones:
                        '={{ ($value || []).map(id => ({ id, checked: true })) }}',
                },
            },
        },
    },
    {
        displayName: 'Milestones (JSON)',
        name: 'milestonesJson',
        type: 'json',
        default:
            '[\n  { "id": "<milestone-template-id>", "checked": true }\n]',
        description:
            'Array of milestone objects. Each entry uses the milestone template ID and a checked boolean. Send checked: false to uncheck a previously checked milestone.',
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['updateStatus'],
                milestonesMode: ['json'],
            },
        },
        routing: {
            request: {
                body: { milestones: '={{ JSON.parse($value) }}' },
            },
        },
    },
    */
    {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['updateStatus'],
            },
        },
        options: [
            {
                displayName: 'Comment',
                name: 'comment',
                type: 'string',
                default: '',
                typeOptions: { rows: 3 },
                description: 'Free-text comment to attach to the status',
                routing: {
                    request: {
                        body: { comment: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Date',
                name: 'date',
                type: 'dateTime',
                default: '',
                description: 'Date of the status, ISO 8601. INVALID_DATE error if malformed.',
                routing: {
                    request: {
                        body: { date: '={{ $value }}' },
                    },
                },
            },
        ],
    },
];
