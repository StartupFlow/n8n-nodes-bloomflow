import type { INodeProperties } from 'n8n-workflow';

export const noteUpdateDescription: INodeProperties[] = [
    {
        displayName: 'Typology',
        name: 'typology',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        displayOptions: {
            show: {
                resource: ['note'],
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
                resource: ['note'],
                operation: ['update'],
            },
        },
        default: { mode: 'id', value: '' },
        description: 'The item the note belongs to',
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
        displayName: 'Note',
        name: 'noteId',
        type: 'resourceLocator',
        required: true,
        default: { mode: 'id', value: '' },
        description: 'The note to update',
        displayOptions: {
            show: {
                resource: ['note'],
                operation: ['update'],
            },
        },
        modes: [
            {
                displayName: 'Select from List',
                name: 'list',
                type: 'list',
                placeholder: 'Select a note...',
                typeOptions: {
                    searchListMethod: 'searchNotes',
                    searchable: true,
                },
            },
            {
                displayName: 'By ID',
                name: 'id',
                type: 'string',
                placeholder: 'e.g. 62d9720152a73e0013508e3c',
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
                resource: ['note'],
                operation: ['update'],
            },
        },
        options: [
            {
                displayName: 'Date',
                name: 'date',
                type: 'dateTime',
                default: '',
                description: 'Date of the note, ISO 8601',
                routing: {
                    request: {
                        body: { date: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Text',
                name: 'text',
                type: 'string',
                default: '',
                typeOptions: { rows: 4 },
                description: 'Note content. Plain text or HTML — Bloomflow auto-detects HTML and stores both versions.',
                routing: {
                    request: {
                        body: { text: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'User Mentions',
                name: 'userMentions',
                type: 'string',
                default: '',
                placeholder: 'userId1,userId2',
                description: 'Comma-separated list of user IDs to mention in the note',
                routing: {
                    request: {
                        body: {
                            userMentions:
                                '={{ ($value || "").split(",").map(v => v.trim()).filter(Boolean) }}',
                        },
                    },
                },
            },
        ],
    },
];
