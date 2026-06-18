import type { INodeProperties } from 'n8n-workflow';

export const referenceDataDescription: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['referenceData'],
            },
        },
        options: [
            {
                name: 'Get Ecosystem Reference Data',
                value: 'getEcosystem',
                action: 'Get ecosystem reference data',
                description:
                    'Get reference data for ecosystem relations — lists available relation types per typology, including each relation\'s allowed target typologies',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/api/public/items/ecosystem/reference_data',
                    },
                },
            },
            {
                // Keep value 'get' for backward compatibility with workflows
                // saved before the rename. The displayName changed only.
                name: 'Get Item Reference Data',
                value: 'get',
                action: 'Get item reference data',
                description:
                    'Get reference data for items — lists typologies, custom fields, sources, labels, and other item-level configuration',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/api/public/items/reference_data',
                    },
                },
            },
            {
                name: 'Get Task Reference Data',
                value: 'getTask',
                action: 'Get task reference data',
                description:
                    'Get reference data for tasks — lists task templates per typology (grouped by workflow step) and the set of task statuses (pending, completed, overdue)',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/api/public/items/tasks/reference_data',
                    },
                },
            },
            {
                name: 'Get Workflow Reference Data',
                value: 'getWorkflow',
                action: 'Get workflow reference data',
                description:
                    'Get reference data for workflows — lists statuses (step templates) and states per typology, including milestone templates and predefined reason values',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/api/public/items/workflows/reference_data',
                    },
                },
            },
        ],
        default: 'get',
    },
];