import type { INodeProperties } from 'n8n-workflow';
import { itemCreateDescription } from './create';
import { itemGetDescription } from './get';
import { itemListDescription } from './list';
import { itemUpdateDescription } from './update';

const showOnlyForItems = {
    resource: ['item'],
};

export const itemDescription: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: showOnlyForItems,
        },
        options: [
            {
                name: 'Create',
                value: 'create',
                action: 'Create an item',
                description: 'Create a new item or update an existing one (soft upsert)',
                routing: {
                    request: {
                        method: 'POST',
                        url: '/api/public/items',
                    },
                },
            },
            {
                name: 'Get',
                value: 'get',
                action: 'Get an item',
                description: 'Get the data of a single item',
                routing: {
                    request: {
                        method: 'GET',
                        url: '=/api/public/items/{{$parameter.itemId}}',
                    },
                },
            },
            {
                name: 'List',
                value: 'list',
                action: 'List items',
                description: 'Get a list of items',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/api/public/items',
                    },
                },
            },
            {
                name: 'Update',
                value: 'update',
                action: 'Update an item',
                description: 'Replace all fields of an existing item',
                routing: {
                    request: {
                        method: 'PUT',
                        url: '=/api/public/items/{{$parameter.itemId}}',
                    },
                },
            },
        ],
        default: 'list',
    },

    ...itemCreateDescription,
    ...itemGetDescription,
    ...itemListDescription,
    ...itemUpdateDescription,
];