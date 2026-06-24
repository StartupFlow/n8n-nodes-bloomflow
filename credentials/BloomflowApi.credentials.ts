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
            default: 'https://api.trial.bloomflow.com',
            placeholder: 'https://api.your-instance.bloomflow.com',
            description:
                'The API host of your Bloomflow instance, in the form https://api.<your-instance>.bloomflow.com. The node appends /api/public/... automatically.',
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
            // /items/reference_data is the historical test endpoint — the bulk
            // of node operations live under public:items:*. Keys provisioned
            // exclusively for the Bloomflow Trigger (public:webhooks only)
            // will see a red X here; the credential still saves and the
            // trigger node still works.
            url: '/api/public/items/reference_data',
        },
    };
}