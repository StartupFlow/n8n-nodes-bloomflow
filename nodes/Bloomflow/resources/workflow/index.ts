import type { INodeProperties } from 'n8n-workflow';
import { workflowCreateStateDescription } from './createState';
import { workflowCreateStatusDescription } from './createStatus';
import { workflowGetDescription } from './get';
import { workflowGetStatusDescription } from './getStatus';
import { workflowListDescription } from './list';
import { workflowUpdateStatusDescription } from './updateStatus';

const showOnlyForWorkflow = {
    resource: ['workflow'],
};

// All workflow endpoints are nested under /api/public/items/{itemId}/workflows...
// itemId, workflowId and statusId are all resourceLocators; declarative routing
// does not auto-apply extractValue, so we re-apply the 24-char hex regex in the
// templates themselves. Same pattern used by Document and Ecosystem resources.
const itemIdSegment =
    '{{ (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.itemId && $parameter.itemId.value) || $parameter.itemId) }}';

const workflowIdSegment =
    '{{ (($parameter.workflowId && $parameter.workflowId.value) || $parameter.workflowId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.workflowId && $parameter.workflowId.value) || $parameter.workflowId) }}';

const statusIdSegment =
    '{{ (($parameter.statusId && $parameter.statusId.value) || $parameter.statusId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.statusId && $parameter.statusId.value) || $parameter.statusId) }}';

export const WORKFLOWS_URL_TEMPLATE = `=/api/public/items/${itemIdSegment}/workflows`;
export const WORKFLOW_URL_TEMPLATE = `=/api/public/items/${itemIdSegment}/workflows/${workflowIdSegment}`;
export const WORKFLOW_STATE_URL_TEMPLATE = `=/api/public/items/${itemIdSegment}/workflows/${workflowIdSegment}/state`;
export const WORKFLOW_STATUS_LIST_URL_TEMPLATE = `=/api/public/items/${itemIdSegment}/workflows/${workflowIdSegment}/status`;
export const WORKFLOW_STATUS_URL_TEMPLATE = `=/api/public/items/${itemIdSegment}/workflows/${workflowIdSegment}/status/${statusIdSegment}`;

export const workflowDescription: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: showOnlyForWorkflow,
        },
        options: [
            {
                name: 'Create State',
                value: 'createState',
                action: 'Transition a workflow to a new state',
                description:
                    'Add a new state to a workflow (e.g. transition to in_progress, completed, standby, rejected)',
                routing: {
                    request: {
                        method: 'POST',
                        url: WORKFLOW_STATE_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'Create Status',
                value: 'createStatus',
                action: 'Add a status step to a workflow',
                description: 'Add a new status (workflow step) to a workflow',
                routing: {
                    request: {
                        method: 'POST',
                        url: WORKFLOW_STATUS_LIST_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'Get',
                value: 'get',
                action: 'Get a workflow',
                description: 'Get a specific workflow for an item',
                routing: {
                    request: {
                        method: 'GET',
                        url: WORKFLOW_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'Get Status',
                value: 'getStatus',
                action: 'Get a workflow status',
                description: 'Get a specific workflow status (step)',
                routing: {
                    request: {
                        method: 'GET',
                        url: WORKFLOW_STATUS_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'List',
                value: 'list',
                action: 'List workflows for an item',
                description: 'List all workflows linked to an item',
                routing: {
                    request: {
                        method: 'GET',
                        url: WORKFLOWS_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'Update Status',
                value: 'updateStatus',
                action: 'Update a workflow status',
                description: 'Update a specific workflow status (step) — comment, date, milestones',
                routing: {
                    request: {
                        method: 'PUT',
                        url: WORKFLOW_STATUS_URL_TEMPLATE,
                    },
                },
            },
        ],
        default: 'list',
    },
    ...workflowListDescription,
    ...workflowGetDescription,
    ...workflowCreateStateDescription,
    ...workflowCreateStatusDescription,
    ...workflowGetStatusDescription,
    ...workflowUpdateStatusDescription,
];
