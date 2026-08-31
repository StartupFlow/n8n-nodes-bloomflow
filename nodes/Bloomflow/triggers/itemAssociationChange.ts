import type { INodePropertyOptions } from 'n8n-workflow';

export const itemAssociationChangeEvent: INodePropertyOptions = {
	name: 'Item Workflow Step Advanced',
	value: 'item.associationChange',
	description:
		'Triggered when an item advances to a new step in its workflow (a new step/status record is created on the item). Does NOT fire when the state, or other properties of the current step are edited, nor on tag/label/ecosystem changes. Payload includes the item ID, workflow step, and previous step.',
};
