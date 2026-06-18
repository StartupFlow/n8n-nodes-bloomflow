import type { INodeProperties } from 'n8n-workflow';
import { noteCreateDescription } from './create';
import { noteGetDescription } from './get';
import { noteListDescription } from './list';
import { noteUpdateDescription } from './update';

const showOnlyForNotes = {
    resource: ['note'],
};

// All note endpoints are nested under /api/public/items/{itemId}/notes...
// itemId and noteId are resourceLocators; declarative routing does not
// auto-apply extractValue, so we re-apply the 24-char hex regex in the
// templates themselves. Same pattern used by Document, Ecosystem, Workflow.
const itemIdSegment =
    '{{ (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId) }}';

const noteIdSegment =
    '{{ (($parameter.noteId && $parameter.noteId.value) || $parameter.noteId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.noteId && $parameter.noteId.value) || $parameter.noteId) }}';

export const NOTES_URL_TEMPLATE = `=/api/public/items/${itemIdSegment}/notes`;
export const NOTE_URL_TEMPLATE = `=/api/public/items/${itemIdSegment}/notes/${noteIdSegment}`;

export const noteDescription: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: showOnlyForNotes,
        },
        options: [
            {
                name: 'Create',
                value: 'create',
                action: 'Create a note for an item',
                description: 'Add a note to an item',
                routing: {
                    request: {
                        method: 'POST',
                        url: NOTES_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'Get',
                value: 'get',
                action: 'Get a note',
                description: 'Get a specific note linked to an item',
                routing: {
                    request: {
                        method: 'GET',
                        url: NOTE_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'List',
                value: 'list',
                action: 'List notes for an item',
                description: 'List all notes linked to an item (ordered by date descending). Confidential notes are filtered out for public-API callers.',
                routing: {
                    request: {
                        method: 'GET',
                        url: NOTES_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'Update',
                value: 'update',
                action: 'Update a note',
                description: 'Update fields of a note (partial update — only the fields you send are changed)',
                routing: {
                    request: {
                        method: 'PUT',
                        url: NOTE_URL_TEMPLATE,
                    },
                },
            },
        ],
        default: 'list',
    },
    ...noteListDescription,
    ...noteGetDescription,
    ...noteCreateDescription,
    ...noteUpdateDescription,
];
