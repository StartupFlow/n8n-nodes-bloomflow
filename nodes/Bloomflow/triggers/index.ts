import type { INodePropertyOptions } from 'n8n-workflow';
import { applicationCreatedEvent } from './applicationCreated';
import { itemAssociationChangeEvent } from './itemAssociationChange';
import { itemCreatedEvent } from './itemCreated';
import { itemDeletedEvent } from './itemDeleted';
import { itemPropertyChangeEvent } from './itemPropertyChange';

// Sorted alphabetically by display name so the dropdown order is predictable.
export const triggerEvents: INodePropertyOptions[] = [
	applicationCreatedEvent,
	itemCreatedEvent,
	itemDeletedEvent,
	itemPropertyChangeEvent,
	itemAssociationChangeEvent,
];
