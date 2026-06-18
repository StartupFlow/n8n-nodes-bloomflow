import type { INodeProperties } from 'n8n-workflow';

export const workflowCreateStatusDescription: INodeProperties[] = [
    {
        displayName: 'Typology',
        name: 'typology',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['createStatus'],
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
                operation: ['createStatus'],
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
        description: 'The workflow to add a status (step) to',
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['createStatus'],
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
        displayName: 'Status Template',
        name: 'stepTemplateId',
        type: 'resourceLocator',
        required: true,
        default: { mode: 'list', value: '' },
        description:
            'The status (workflow step) template to add. List mode is populated from /api/public/items/workflows/reference_data, filtered by the selected item\'s typology.',
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['createStatus'],
            },
        },
        modes: [
            {
                displayName: 'Select from List',
                name: 'list',
                type: 'list',
                placeholder: 'Select a status template...',
                typeOptions: {
                    searchListMethod: 'getWorkflowStepTemplates',
                    searchable: true,
                    searchFilterRequired: false,
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
        routing: {
            request: {
                body: {
                    id: '={{ (($parameter.stepTemplateId && $parameter.stepTemplateId.value) || $parameter.stepTemplateId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.stepTemplateId && $parameter.stepTemplateId.value) || $parameter.stepTemplateId) }}',
                },
            },
        },
    },
    // ─── Milestones — DISABLED ────────────────────────────────────────────────
    // The api-platform's addItemWorkflowStatus handler parses the milestones
    // array but the task-creation logic is commented out (TODO blocks in
    // endpoints-workflow.js around lines 670–697). Sending milestones is a
    // server-side no-op today, so we hide the UI to avoid users wasting time
    // debugging "why didn't my milestone update?". Re-enable by uncommenting
    // this block (and the matching getStepTemplateMilestones loader in
    // Bloomflow.node.ts is already wired up) once the api-platform implements
    // the TODO. No further node changes needed.
    /*
    {
        displayName: 'Milestones Input',
        name: 'milestonesMode',
        type: 'options',
        default: 'select',
        description: 'How to provide milestones for the new status',
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['createStatus'],
            },
        },
        options: [
            {
                name: 'Select From List',
                value: 'select',
                description: 'Pick milestones from a checkbox list, filtered by the chosen status template. Selected milestones are sent as { ID, checked: true }.',
            },
            {
                name: 'JSON',
                value: 'json',
                description:
                    'Provide raw JSON. Use this when you need to send unchecked milestones or custom shapes.',
            },
        ],
    },
    {
        displayName: 'Milestone Names or IDs',
        name: 'milestones',
        type: 'multiOptions',
        default: [],
        description: 'Milestones to mark as checked on the new status. Loaded from the selected Status Template — re-open the dropdown after changing the template to refresh. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        hint: 'Selecting sends { id, checked: true }. To send checked: false, switch Milestones Input to JSON.',
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['createStatus'],
                milestonesMode: ['select'],
            },
        },
        typeOptions: {
            loadOptionsMethod: 'getStepTemplateMilestones',
            loadOptionsDependsOn: ['stepTemplateId.value'],
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
        description: 'Array of milestone objects. Each entry uses the milestone template ID and a checked boolean. Pull the milestone IDs from the reference data endpoint under typologies[].statuses[].milestones.',
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['createStatus'],
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
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['workflow'],
                operation: ['createStatus'],
            },
        },
        options: [
            {
                displayName: 'Add Step Mode',
                name: 'addStepMode',
                type: 'options',
                default: 'keep_steps_history',
                description: 'How to handle the existing steps and tasks history when adding the new step',
                options: [
                    {
                        name: 'Keep Steps History',
                        value: 'keep_steps_history',
                        description: 'Keep step history but discard task history (default)',
                    },
                    {
                        name: 'Keep Steps & Tasks History',
                        value: 'keep_steps_tasks_history',
                        description: 'Keep both step history and task history',
                    },
                    {
                        name: 'Remove Steps & Tasks History',
                        value: 'remove_steps_tasks_history',
                        description: 'Discard all previous step and task history',
                    },
                ],
                routing: {
                    request: {
                        body: { addStepMode: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Comment',
                name: 'comment',
                type: 'string',
                default: '',
                typeOptions: { rows: 3 },
                description: 'Free-text comment to attach to the new status',
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
                description: 'Date of the new status, ISO 8601. INVALID_DATE error if malformed.',
                routing: {
                    request: {
                        body: { date: '={{ $value }}' },
                    },
                },
            },
        ],
    },
];
