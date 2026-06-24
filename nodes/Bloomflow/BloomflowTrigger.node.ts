import { randomBytes, timingSafeEqual } from 'node:crypto';
import {
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IHookFunctions,
	type JsonObject,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';
import { triggerEvents } from './triggers';

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

function sameEventSet(a: string[], b: string[]): boolean {
	if (a.length !== b.length) return false;
	const sortedA = [...a].sort();
	const sortedB = [...b].sort();
	return sortedA.every((value, index) => value === sortedB[index]);
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
		subtitle:
			'={{ (Array.isArray($parameter["events"]) && $parameter["events"].length) ? $parameter["events"].join(", ") : "no events selected" }}',
		description:
			'Starts the workflow when one or more Bloomflow events occur. Bloomflow retries failed deliveries with the same payload, so workflows should be idempotent — deduplicate downstream on meta.objectId plus the event type.',
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
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				noDataExpression: true,
				required: true,
				default: ['item.created'],
				options: triggerEvents,
				description: 'The Bloomflow events that start this workflow',
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
				const selectedEvents = this.getNodeParameter('events') as string[];

				let response: IDataObject;
				try {
					response = (await this.helpers.httpRequestWithAuthentication.call(this, 'bloomflowApi', {
						method: 'GET',
						url: `${credentials.baseUrl as string}/api/public/webhooks/${subscriptionId}`,
						json: true,
					})) as IDataObject;
				} catch (error) {
					// Only a 404 means the subscription is genuinely gone. For any
					// other failure (auth, 5xx, network) rethrow so n8n surfaces the
					// error instead of silently creating a duplicate subscription.
					if ((error as { httpCode?: string }).httpCode === '404') {
						delete webhookData.subscriptionId;
						delete webhookData.secret;
						return false;
					}
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}

				// If the user edited the Events list after registration, the stored
				// subscription is filtering for the wrong set — force a re-create
				// so server-side events match the node configuration.
				const remoteEvents = Array.isArray(response.events) ? (response.events as string[]) : [];
				if (!sameEventSet(remoteEvents, selectedEvents)) {
					delete webhookData.subscriptionId;
					delete webhookData.secret;
					return false;
				}

				return true;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const events = this.getNodeParameter('events') as string[];
				if (!events || events.length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						'Select at least one event for the Bloomflow Trigger',
					);
				}
				const credentials = await this.getCredentials('bloomflowApi');

				// Shared secret so we can authenticate Bloomflow's callbacks. The
				// API echoes this header verbatim on every delivery; we verify it in
				// webhook() and reject anything that doesn't match.
				const secret = randomBytes(32).toString('hex');

				let response: IDataObject;
				try {
					response = (await this.helpers.httpRequestWithAuthentication.call(
						this,
						'bloomflowApi',
						{
							method: 'POST',
							url: `${credentials.baseUrl as string}/api/public/webhooks`,
							body: {
								events,
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
				} catch (error) {
					// The whole /webhooks surface is gated by a server-side feature
					// flag — when it's off the API returns 404 UNKNOWN_FEATURE, which
					// users typically misread as "URL wrong". Surface a clearer hint.
					const apiError = error as { httpCode?: string; cause?: { error?: { error?: string } } };
					const errorCode = apiError?.cause?.error?.error;
					if (apiError.httpCode === '404' && errorCode === 'UNKNOWN_FEATURE') {
						throw new NodeOperationError(
							this.getNode(),
							'Webhooks are not enabled on this Bloomflow instance. Contact Bloomflow support to enable the webhooks feature.',
						);
					}
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}

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
				} catch (error) {
					// Never block workflow deactivation on a teardown failure — a thrown
					// error here can leave n8n unable to deactivate/delete the workflow.
					// 404 means the subscription is already gone; for anything else
					// (5xx, network) log a warning and let the user clean up server-side
					// via the public API if it turns out the subscription stayed alive.
					const httpCode = (error as { httpCode?: string }).httpCode;
					if (httpCode !== '404') {
						this.logger.warn(
							`Bloomflow Trigger: failed to delete subscription ${subscriptionId} (httpCode=${httpCode ?? 'unknown'}). The workflow will deactivate locally; if the subscription is still alive on Bloomflow, remove it via DELETE /api/public/webhooks/${subscriptionId}.`,
						);
					}
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

		// Fail closed if we don't have a secret to verify against — covers both
		// the never-registered case and the lost-state case. n8n normally only
		// routes the webhook URL when the workflow is active, but defense in
		// depth: an unauthenticated POST should never reach downstream nodes.
		// Re-activating the workflow re-registers and restores the secret.
		if (!expectedSecret) {
			const res = this.getResponseObject();
			res.status(500).json({
				message:
					'Bloomflow Trigger: webhook secret missing — re-activate the workflow to re-register the subscription.',
			});
			return { noWebhookResponse: true };
		}

		// Reject any callback that doesn't carry the secret we registered. Guards
		// against forged events sent to the (otherwise unauthenticated) webhook URL.
		const headers = this.getHeaderData() as IDataObject;
		const provided = headers[WEBHOOK_SECRET_HEADER];
		if (typeof provided !== 'string' || !timingSafeEqualString(provided, expectedSecret)) {
			const res = this.getResponseObject();
			res.status(403).json({ message: 'Invalid webhook signature' });
			return { noWebhookResponse: true };
		}

		const body = this.getBodyData() as IDataObject;
		return {
			workflowData: [this.helpers.returnJsonArray([body])],
		};
	}
}
