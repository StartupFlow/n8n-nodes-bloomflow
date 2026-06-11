import type { INodeProperties } from 'n8n-workflow';

export const taskUpdateDescription: INodeProperties[] = [
    {
        displayName: 'Typology',
        name: 'typology',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        displayOptions: {
            show: {
                resource: ['task'],
                operation: ['update'],
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
                operation: ['update'],
            },
        },
        default: { mode: 'id', value: '' },
        description: 'The item the task belongs to (used to filter the task picker; not sent to the endpoint)',
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
        displayName: 'Task',
        name: 'taskId',
        type: 'resourceLocator',
        required: true,
        default: { mode: 'id', value: '' },
        description: 'The task to update',
        displayOptions: {
            show: {
                resource: ['task'],
                operation: ['update'],
            },
        },
        modes: [
            {
                displayName: 'Select from List',
                name: 'list',
                type: 'list',
                placeholder: 'Select a task...',
                typeOptions: {
                    searchListMethod: 'searchTasks',
                    searchable: true,
                },
            },
            {
                displayName: 'By ID',
                name: 'id',
                type: 'string',
                placeholder: 'e.g. 6745a1b2c3d4e5f6a7b8c9d0',
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
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['task'],
                operation: ['update'],
            },
        },
        options: [
            {
                displayName: 'Assignee IDs',
                name: 'assigneeIds',
                type: 'string',
                default: '',
                placeholder: 'userId1,userId2',
                description: 'Comma-separated user IDs to set as assignees (replaces existing)',
                routing: {
                    request: {
                        body: {
                            assignee_ids:
                                '={{ ($value || "").split(",").map(v => v.trim()).filter(Boolean) }}',
                        },
                    },
                },
            },
            {
                displayName: 'Assigner IDs',
                name: 'assignerIds',
                type: 'string',
                default: '',
                placeholder: 'userId1,userId2',
                description: 'Comma-separated user IDs to set as assigners (replaces existing)',
                routing: {
                    request: {
                        body: {
                            assigner_ids:
                                '={{ ($value || "").split(",").map(v => v.trim()).filter(Boolean) }}',
                        },
                    },
                },
            },
            {
                displayName: 'Auto Reminder',
                name: 'autoReminder',
                type: 'boolean',
                default: false,
                description: 'Whether to send an auto reminder before the due date',
                routing: {
                    request: {
                        body: { auto_reminder: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Auto Reminder Days Before Due Date',
                name: 'autoReminderNbDays',
                type: 'number',
                typeOptions: { minValue: 0 },
                default: 3,
                description: 'Days before the due date to send the reminder. Defaults server-side to 3 when Auto Reminder is true.',
                routing: {
                    request: {
                        body: { auto_reminder_nb_days: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
                typeOptions: { rows: 3 },
                description: 'Description for the task. Overrides the task template description.',
                routing: {
                    request: {
                        body: { description: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Due Date',
                name: 'dueDate',
                type: 'dateTime',
                default: '',
                description: 'Due date of the task, ISO 8601',
                routing: {
                    request: {
                        body: { due_date: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Invited Users (JSON)',
                name: 'invitedUsers',
                type: 'json',
                default:
                    '[\n  {\n    "email": "new.user@example.com",\n    "first_name": "New",\n    "last_name": "User",\n    "type": "assignee",\n    "group_ids": ["group1"]\n  }\n]',
                description:
                    'New users to invite and assign to the task. Each entry requires email, first_name, last_name and type ("assignee" or "assigner"). group_ids is optional.',
                routing: {
                    request: {
                        body: { invited_users: '={{ JSON.parse($value) }}' },
                    },
                },
            },
        ],
    },
];
