import type { INodeProperties } from 'n8n-workflow';
import { createDocumentPreSend, documentCreateDescription } from './create';
import { documentListDescription } from './list';

const showOnlyForDocuments = {
    resource: ['document'],
};

export const documentDescription: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: showOnlyForDocuments,
        },
        options: [
            {
                name: 'Create',
                value: 'create',
                action: 'Create a document for an item',
                description: 'Add a document to an item via URL or file upload',
                routing: {
                    request: {
                        method: 'POST',
                        url: '=/api/public/items/{{ (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId) }}/documents',
                    },
                    send: {
                        preSend: [createDocumentPreSend],
                    },
                },
            },
            {
                name: 'List',
                value: 'list',
                action: 'List documents for an item',
                description: 'Get all documents linked to an item',
                routing: {
                    request: {
                        method: 'GET',
                        url: '=/api/public/items/{{ (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId) }}/documents',
                    },
                },
            },
        ],
        default: 'list',
    },
    ...documentListDescription,
    ...documentCreateDescription,
];
