import type { INodeProperties } from 'n8n-workflow';
import { taskCancelDescription } from './cancel';
import { taskCompleteDescription } from './complete';
import { taskCreateDescription } from './create';
import { taskDeleteDescription } from './delete';
import { taskGetDescription } from './get';
import { taskListDescription } from './list';
import { taskUpdateDescription } from './update';

const showOnlyForTasks = {
    resource: ['task'],
};

// Path quirk: list + reference data are mounted under /api/public/items/tasks
// (server scopes by typology), but the individual task ops (get/create/update/
// complete/cancel/delete) are under /api/public/tasks. The List endpoint
// derives `companyWorkflowIds` from `itemIds` so the n8n UX exposes a single
// itemId resourceLocator and forwards it as itemIds=<id>.
//
// taskId is a resourceLocator; declarative routing does not auto-apply
// extractValue, so we re-apply the 24-char hex regex in the path templates.
const taskIdSegment =
    '{{ (($parameter.taskId && $parameter.taskId.value) || $parameter.taskId || "").toString().match(/[a-f0-9]{24}/)?.[0] || (($parameter.taskId && $parameter.taskId.value) || $parameter.taskId) }}';

export const TASKS_LIST_URL_TEMPLATE = '/api/public/items/tasks';
export const TASKS_URL_TEMPLATE = '/api/public/tasks';
export const TASK_URL_TEMPLATE = `=/api/public/tasks/${taskIdSegment}`;
export const TASK_COMPLETE_URL_TEMPLATE = `=/api/public/tasks/${taskIdSegment}/complete`;
export const TASK_CANCEL_URL_TEMPLATE = `=/api/public/tasks/${taskIdSegment}/cancel`;

export const taskDescription: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: showOnlyForTasks,
        },
        options: [
            {
                name: 'Cancel',
                value: 'cancel',
                action: 'Cancel a task',
                description: 'Mark a completed task back to pending/overdue (based on due date)',
                routing: {
                    request: {
                        method: 'POST',
                        url: TASK_CANCEL_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'Complete',
                value: 'complete',
                action: 'Complete a task',
                description: 'Mark a task as completed, optionally with feedback',
                routing: {
                    request: {
                        method: 'POST',
                        url: TASK_COMPLETE_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'Create',
                value: 'create',
                action: 'Create a task on an item workflow',
                description: 'Create a new task on the workflow of an item',
                routing: {
                    request: {
                        method: 'POST',
                        url: TASKS_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'Delete',
                value: 'delete',
                action: 'Delete a task',
                description: 'Permanently delete a task. This action cannot be undone.',
                routing: {
                    request: {
                        method: 'DELETE',
                        url: TASK_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'Get',
                value: 'get',
                action: 'Get a task',
                description: 'Get a specific task by ID',
                routing: {
                    request: {
                        method: 'GET',
                        url: TASK_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'List',
                value: 'list',
                action: 'List tasks for an item',
                description: 'List all tasks of an item with optional filters (status, assignee, assigner, template, sort, pagination)',
                routing: {
                    request: {
                        method: 'GET',
                        url: TASKS_LIST_URL_TEMPLATE,
                    },
                },
            },
            {
                name: 'Update',
                value: 'update',
                action: 'Update a task',
                description: 'Update fields of a task (partial update — only the fields you send are changed)',
                routing: {
                    request: {
                        method: 'PUT',
                        url: TASK_URL_TEMPLATE,
                    },
                },
            },
        ],
        default: 'list',
    },
    ...taskListDescription,
    ...taskGetDescription,
    ...taskCreateDescription,
    ...taskUpdateDescription,
    ...taskCompleteDescription,
    ...taskCancelDescription,
    ...taskDeleteDescription,
];
