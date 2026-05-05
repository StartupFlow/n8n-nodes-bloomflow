import type {
    IExecuteSingleFunctions,
    IHttpRequestOptions,
    INodeProperties,
} from 'n8n-workflow';

/**
 * Encode a filename for a Content-Disposition header per RFC 7578.
 * Quotes and backslash-escapes ASCII; for non-ASCII filenames also adds the
 * filename*=UTF-8'' form so servers that understand RFC 5987 get the original.
 */
function encodeFilename(name: string): string {
    const ascii = name.replace(/[\\"]/g, '\\$&');
    const isAscii = /^[\x20-\x7E]*$/.test(name);
    if (isAscii) return `filename="${ascii}"`;
    return `filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

/**
 * preSend hook for Document → Create.
 *
 * URL mode: no-op (query params are routed declaratively).
 * FILE mode: builds a multipart/form-data body manually as a single Buffer.
 *
 * Why manual: n8n community nodes cannot declare runtime dependencies (lint
 * rule @n8n/community-nodes/no-restricted-imports), so the `form-data` package
 * is unavailable. n8n's IHttpRequestOptions also does not honor the legacy
 * `formData` property under axios. Constructing the multipart body ourselves
 * and setting Content-Type with the boundary is the only path that works
 * across n8n Cloud and self-hosted.
 */
export async function createDocumentPreSend(
    this: IExecuteSingleFunctions,
    requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
    const sourceMode = this.getNodeParameter('sourceMode') as string;
    if (sourceMode !== 'file') return requestOptions;

    const binaryProperty = this.getNodeParameter('binaryProperty') as string;
    const binaryData = this.helpers.assertBinaryData(binaryProperty);
    const buffer = await this.helpers.getBinaryDataBuffer(binaryProperty);

    const filename = binaryData.fileName ?? 'file';
    const contentType = binaryData.mimeType ?? 'application/octet-stream';
    const boundary = `----n8n-bloomflow-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;

    const preamble = Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; ${encodeFilename(filename)}\r\n` +
        `Content-Type: ${contentType}\r\n` +
        `\r\n`,
    );
    const epilogue = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([preamble, buffer, epilogue]);

    const headers = { ...((requestOptions.headers as Record<string, string>) ?? {}) };
    delete headers['Content-Type'];
    delete headers['content-type'];

    return {
        ...requestOptions,
        body,
        headers: {
            ...headers,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': String(body.length),
        },
        json: false,
    };
}

export const documentCreateDescription: INodeProperties[] = [
    // ─── Required / Primary Filters ──────────────────────────────────────────────

    {
        displayName: 'Typology',
        name: 'typology',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        displayOptions: {
            show: {
                resource: ['document'],
                operation: ['create'],
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
        default: { mode: 'id', value: '' },
        displayOptions: {
            show: {
                resource: ['document'],
                operation: ['create'],
            },
        },
        description: 'The item to add the document to',
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

    // ─── Source Mode Toggle ──────────────────────────────────────────────────────

    {
        displayName: 'Source',
        name: 'sourceMode',
        type: 'options',
        default: 'url',
        displayOptions: {
            show: {
                resource: ['document'],
                operation: ['create'],
            },
        },
        options: [
            {
                name: 'External URL',
                value: 'url',
                description: 'Reference a document hosted at an external URL',
            },
            {
                name: 'File From Previous Node',
                value: 'file',
                description: 'Upload a binary file received from a previous node',
            },
        ],
        description: 'How to provide the document',
    },

    // ─── URL Mode Fields ─────────────────────────────────────────────────────────

    {
        displayName: 'Document URL',
        name: 'url',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'https://example.com/file.pdf',
        displayOptions: {
            show: {
                resource: ['document'],
                operation: ['create'],
                sourceMode: ['url'],
            },
        },
        description: 'URL of the external document (must be reachable from the Bloomflow server)',
        routing: {
            request: {
                qs: { url: '={{ $value }}' },
            },
        },
    },
    {
        displayName: 'URL File Name',
        name: 'urlFileName',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                resource: ['document'],
                operation: ['create'],
                sourceMode: ['url'],
            },
        },
        description: 'Display name for the document. Defaults to the URL when empty.',
        routing: {
            request: {
                qs: { url_file_name: '={{ $value }}' },
            },
        },
    },

    // ─── File Mode Fields ────────────────────────────────────────────────────────

    {
        displayName: 'Binary Property',
        name: 'binaryProperty',
        type: 'string',
        required: true,
        default: 'data',
        displayOptions: {
            show: {
                resource: ['document'],
                operation: ['create'],
                sourceMode: ['file'],
            },
        },
        description: 'Name of the binary property on the input item that holds the file, e.g. <code>data</code> from a Read Binary File node',
    },

    // ─── Optional Parameters ─────────────────────────────────────────────────────

    {
        displayName: 'Parameters',
        name: 'parameters',
        type: 'collection',
        placeholder: 'Add Parameter',
        default: {},
        displayOptions: {
            show: {
                resource: ['document'],
                operation: ['create'],
            },
        },
        options: [
            {
                displayName: 'File Name Override',
                name: 'fileName',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        '/sourceMode': ['file'],
                    },
                },
                description: 'Override the file name. If not set, the original binary file name is used.',
                routing: {
                    request: {
                        qs: { file_name: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Interaction ID',
                name: 'interactionId',
                type: 'string',
                default: '',
                description: 'Optionally link the document to an interaction by ID',
                routing: {
                    request: {
                        qs: { interactionId: '={{ $value }}' },
                    },
                },
            },
            {
                displayName: 'Is Image',
                name: 'image',
                type: 'boolean',
                default: false,
                displayOptions: {
                    show: {
                        '/sourceMode': ['file'],
                    },
                },
                description: 'Whether the file should be treated as an image',
                routing: {
                    request: {
                        qs: { image: '={{ $value }}' },
                    },
                },
            },
        ],
    },
];
