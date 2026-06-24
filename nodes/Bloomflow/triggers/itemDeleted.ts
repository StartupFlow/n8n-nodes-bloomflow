import type { INodePropertyOptions } from 'n8n-workflow';

export const itemDeletedEvent: INodePropertyOptions = {
	name: 'Item Deleted',
	value: 'item.deleted',
	description:
		"Triggered when an item is deleted. Payload only contains the deleted item's ID and name.",
};
