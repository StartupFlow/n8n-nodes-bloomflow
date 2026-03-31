import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { itemDescription } from './resources/item';
import { referenceDataDescription } from './resources/referenceData';

export class Bloomflow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bloomflow',
		name: 'bloomflow',
		icon: { light: 'file:bloomflow.svg', dark: 'file:bloomflow.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Bloomflow API',
		defaults: {
			name: 'Bloomflow',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'bloomflowApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Item',
						value: 'item',
					},
					{
                        name: 'Reference Data',
                        value: 'referenceData',
                    },
					
				],
				default: 'item',
			},
			...itemDescription,
			...referenceDataDescription

		],
	};
}
