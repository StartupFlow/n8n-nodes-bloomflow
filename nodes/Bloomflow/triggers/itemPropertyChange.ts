import type { INodePropertyOptions } from 'n8n-workflow';

export const itemPropertyChangeEvent: INodePropertyOptions = {
	name: 'Item Property Change',
	value: 'item.propertyChange',
	description:
		'Triggered when a watched property on an item changes — name, website, pitch, descriptions, logo, year founded, employees, business model, HQ fields, links, and any custom_* field. Does NOT fire on changes to tags, labels, sources, or workflow/state.',
};
