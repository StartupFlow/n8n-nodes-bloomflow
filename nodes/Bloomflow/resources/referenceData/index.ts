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
                name: 'Get',
                value: 'get',
                action: 'Get reference data',
                description: 'Get all reference data',
                routing: {
                    request: {
                        method: 'GET',
                        url: '/api/public/items/reference_data',
                    },
                },
            },
        ],
        default: 'get',
    },
];