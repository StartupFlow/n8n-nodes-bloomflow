import type { INodeProperties } from 'n8n-workflow';
import { ecosystemCreateDescription } from './create';
import { ecosystemDeleteDescription } from './delete';
import { ecosystemGetDescription } from './get';
import { ecosystemListDescription } from './list';

const showOnlyForEcosystem = {
    resource: ['ecosystem'],
};

// Resolves the parent item path for /api/public/items/{itemId}/ecosystem.
// Accepts the three resourceLocator modes (list, id, url) and extracts a
// 24-char hex ID; declarative routing does not auto-apply extractValue, so the
// regex match must live in the template itself. See .agents/bloomflow.md.
export const ECOSYSTEM_URL_TEMPLATE =
    '=/api/public/items/{{ (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId) }}/ecosystem';

// Same regex-extraction pattern as itemId — relationId is also a resourceLocator
// and extractValue is not auto-applied during declarative template interpolation.
export const ECOSYSTEM_RELATION_URL_TEMPLATE =
    '=/api/public/items/{{ (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId) }}/ecosystem/{{ (($parameter.relationId && $parameter.relationId.value) || $parameter.relationId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.relationId && $parameter.relationId.value) || $parameter.relationId) }}';

export const ecosystemDescription: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: showOnlyForEcosystem,
        },
        options: [
            {
                name: 'Create',
                value: 'create',
                action: 'Create an ecosystem relation',
                description: 'Create a relation between two items',
                routing: {
                    request: {
                        method: 'POST',
                        url: ECOSYSTEM_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'Delete',
                value: 'delete',
                action: 'Delete an ecosystem relation',
                description: 'Delete a specific ecosystem relation between two items',
                routing: {
                    request: {
                        method: 'DELETE',
                        url: ECOSYSTEM_RELATION_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'Get',
                value: 'get',
                action: 'Get an ecosystem relation',
                description: 'Get a specific ecosystem relation between two items',
                routing: {
                    request: {
                        method: 'GET',
                        url: ECOSYSTEM_RELATION_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'List',
                value: 'list',
                action: 'List ecosystem relations for an item',
                description: 'List all ecosystem relations linked to an item',
                routing: {
                    request: {
                        method: 'GET',
                        url: ECOSYSTEM_URL_TEMPLATE,
                    },
                },
            },
        ],
        default: 'list',
    },
    ...ecosystemListDescription,
    ...ecosystemGetDescription,
    ...ecosystemCreateDescription,
    ...ecosystemDeleteDescription,
];
