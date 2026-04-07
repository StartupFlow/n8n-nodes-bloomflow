import { ILoadOptionsFunctions, INodeListSearchResult, NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
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

	methods = {
		listSearch: {
			async getTypologies(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const credentials = await this.getCredentials('bloomflowApi');

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/reference_data`,
						json: true,
					},
				);

				const typologies: Array<{ id: string; name: string }> =
					Array.isArray(response)
						? response.flatMap((r: { typologies?: Array<{ id: string; name: string }> }) => r.typologies ?? [])
						: response?.typologies ?? [];

				const results = typologies
					.filter((t) =>
						filter
							? t.name.toLowerCase().includes(filter.toLowerCase()) ||
							t.id.toLowerCase().includes(filter.toLowerCase())
							: true,
					)
					.map((t) => ({
						name: `${t.name} (${t.id})`,
						value: t.id,
					}));

				return { results };
			},
		},
	};
}
