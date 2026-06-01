import { randomBytes, timingSafeEqual } from 'node:crypto';
import {
	NodeApiError,
	NodeConnectionTypes,
	type IDataObject,
	type IHookFunctions,
	type JsonObject,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';

// Header Bloomflow attaches to each callback so we can verify the request
// originated from our subscription (see securityConfig in the public API).
const WEBHOOK_SECRET_HEADER = 'x-bloomflow-webhook-secret';

// Constant-time comparison so an attacker can't probe the secret byte-by-byte
// via response timing. Bails early (still non-revealing) on length mismatch.
function timingSafeEqualString(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) {
		return false;
	}
	return timingSafeEqual(bufA, bufB);
}

// Trigger nodes are entry points with no inputs, so the AI-tool flag does not apply.
// eslint-disable-next-line @n8n/community-nodes/node-usable-as-tool
export class BloomflowTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bloomflow Trigger',
		name: 'bloomflowTrigger',
		icon: { light: 'file:bloomflow.svg', dark: 'file:bloomflow.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when a Bloomflow event occurs',
		defaults: {
			name: 'Bloomflow Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'bloomflowApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				required: true,
				default: 'item.created',
				options: [
					{
						name: 'Item Created',
						value: 'item.created',
						description: 'Triggered when a new item is created in Bloomflow',
					},
				],
				description: 'The Bloomflow event that starts this workflow',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const subscriptionId = webhookData.subscriptionId as string | undefined;
				if (!subscriptionId) {
					return false;
				}

				const credentials = await this.getCredentials('bloomflowApi');

				try {
					await this.helpers.httpRequestWithAuthentication.call(this, 'bloomflowApi', {
						method: 'GET',
						url: `${credentials.baseUrl as string}/api/public/webhooks/${subscriptionId}`,
						json: true,
					});
					return true;
				} catch (error) {
					// Only a 404 means the subscription is genuinely gone. For any
					// other failure (auth, 5xx, network) rethrow so n8n surfaces the
					// error instead of silently creating a duplicate subscription.
					if ((error as { httpCode?: string }).httpCode === '404') {
						delete webhookData.subscriptionId;
						delete webhookData.secret;
						return false;
					}
					throw error;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;
				const credentials = await this.getCredentials('bloomflowApi');

				// Shared secret so we can authenticate Bloomflow's callbacks. The
				// API echoes this header verbatim on every delivery; we verify it in
				// webhook() and reject anything that doesn't match.
				const secret = randomBytes(32).toString('hex');

				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'POST',
						url: `${credentials.baseUrl as string}/api/public/webhooks`,
						body: {
							events: [event],
							webhookUrl,
							enabled: true,
							securityConfig: {
								headerKey: WEBHOOK_SECRET_HEADER,
								headerValue: secret,
							},
						},
						json: true,
					},
				)) as IDataObject;

				if (!response?.id) {
					throw new NodeApiError(this.getNode(), response as JsonObject, {
						message: 'Bloomflow did not return a webhook subscription id',
					});
				}

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.subscriptionId = response.id as string;
				webhookData.secret = secret;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const subscriptionId = webhookData.subscriptionId as string | undefined;
				if (!subscriptionId) {
					return true;
				}

				const credentials = await this.getCredentials('bloomflowApi');

				try {
					await this.helpers.httpRequestWithAuthentication.call(this, 'bloomflowApi', {
						method: 'DELETE',
						url: `${credentials.baseUrl as string}/api/public/webhooks/${subscriptionId}`,
						json: true,
					});
				} catch {
					return false;
				}

				delete webhookData.subscriptionId;
				delete webhookData.secret;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const webhookData = this.getWorkflowStaticData('node');
		const expectedSecret = webhookData.secret as string | undefined;

		// Reject any callback that doesn't carry the secret we registered. Guards
		// against forged events sent to the (otherwise unauthenticated) webhook URL.
		if (expectedSecret) {
			const headers = this.getHeaderData() as IDataObject;
			const provided = headers[WEBHOOK_SECRET_HEADER];
			if (typeof provided !== 'string' || !timingSafeEqualString(provided, expectedSecret)) {
				const res = this.getResponseObject();
				res.status(403).json({ message: 'Invalid webhook signature' });
				return { noWebhookResponse: true };
			}
		}

		const body = this.getBodyData() as IDataObject;
		return {
			workflowData: [this.helpers.returnJsonArray([body])],
		};
	}
}
