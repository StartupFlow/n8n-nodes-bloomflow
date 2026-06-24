import type { INodePropertyOptions } from 'n8n-workflow';

export const itemCreatedEvent: INodePropertyOptions = {
	name: 'Item Created',
	value: 'item.created',
	description: 'Triggered when a new item is created in Bloomflow',
};
