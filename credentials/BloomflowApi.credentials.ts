import type {
    IAuthenticateGeneric,
    Icon,
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class BloomflowApi implements ICredentialType {
    name = 'bloomflowApi';
    displayName = 'Bloomflow API';
    icon: Icon = 'file:../nodes/Bloomflow/bloomflow.svg';
    documentationUrl = 'https://github.com/startupflow/n8n-nodes-bloomflow#credentials';
    properties: INodeProperties[] = [
        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'https://trial.bloomflow.com',
            description: 'The base URL of your Bloomflow instance.',
            required: true,
        },
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: { password: true },
            required: true,
            default: '',
        },
    ];
    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                'x-bflow-api-key': '={{$credentials.apiKey}}',
            },
        },
    };
    test: ICredentialTestRequest = {
        request: {
            baseURL: '={{$credentials.baseUrl}}',
            url: '/api/public/items/reference_data',
        },
    };
}