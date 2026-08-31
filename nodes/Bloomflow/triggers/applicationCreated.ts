import type { INodePropertyOptions } from 'n8n-workflow';

export const applicationCreatedEvent: INodePropertyOptions = {
	name: 'Application Created',
	value: 'application.created',
	description:
		'Triggered when a startup-form application is submitted (also fires on draft → submitted). Payload includes the application ID, applicationFormId, name, pitch, and submitter — the public API does not expose a read endpoint for the full submitted form, so any custom fields must be captured at submission time.',
};
