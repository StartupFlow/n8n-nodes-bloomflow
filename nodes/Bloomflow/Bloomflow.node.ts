import { ILoadOptionsFunctions, INodeListSearchResult, INodePropertyOptions, NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { documentDescription } from './resources/document';
import { ecosystemDescription } from './resources/ecosystem';
import { itemDescription } from './resources/item';
import { noteDescription } from './resources/note';
import { referenceDataDescription } from './resources/referenceData';
import { taskDescription } from './resources/task';
import { workflowDescription } from './resources/workflow';

/**
 * Derive the typology of the currently selected item by fetching its detail
 * endpoint.
 *
 * Used by listSearch / loadOptions methods that need to filter by typology
 * when the UI `typology` field is hidden — which happens whenever `itemId` is
 * in 'id' or 'url' resourceLocator mode (see `displayOptions.show['/itemId.mode']`
 * in the ecosystem / workflow resource files).
 *
 * Returns undefined when no `itemId` is set, the parameter doesn't contain a
 * 24-char hex ID, or the fetch fails. Callers should fall back to a default
 * behaviour (e.g. show all typologies) in that case.
 */
async function deriveTypologyFromItem(
	ctx: ILoadOptionsFunctions,
	baseUrl: unknown,
): Promise<string | undefined> {
	const itemIdParam = ctx.getCurrentNodeParameter('itemId') as
		| string
		| { value: string }
		| undefined;
	const rawItemId =
		typeof itemIdParam === 'object' ? itemIdParam?.value : itemIdParam;
	const itemId = (rawItemId || '').toString().match(/[a-f0-9]{24}/)?.[0];
	if (!itemId) {
		return undefined;
	}
	try {
		const itemResponse = (await ctx.helpers.httpRequestWithAuthentication.call(
			ctx,
			'bloomflowApi',
			{
				method: 'GET',
				url: `${baseUrl}/api/public/items/${itemId}`,
				json: true,
			},
		)) as { typology_id?: string; typologyId?: string };
		return itemResponse?.typology_id ?? itemResponse?.typologyId;
	} catch {
		return undefined;
	}
}

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
						name: 'Document',
						value: 'document',
					},
					{
						name: 'Ecosystem',
						value: 'ecosystem',
					},
					{
						name: 'Item',
						value: 'item',
					},
					{
						name: 'Note',
						value: 'note',
					},
					{
						name: 'Reference Data',
						value: 'referenceData',
					},
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Workflow',
						value: 'workflow',
					},

				],
				default: 'item',
			},
			...documentDescription,
			...ecosystemDescription,
			...itemDescription,
			...noteDescription,
			...referenceDataDescription,
			...taskDescription,
			...workflowDescription

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
			async searchRelations(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const itemIdParam = this.getCurrentNodeParameter('itemId') as
					| string
					| { value: string };
				const rawItemId =
					typeof itemIdParam === 'object'
						? itemIdParam?.value
						: itemIdParam;
				const itemId = (rawItemId || '').toString().match(/[a-f0-9]{24}/)?.[0];
				if (!itemId) {
					return { results: [] };
				}
				const credentials = await this.getCredentials('bloomflowApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/${itemId}/ecosystem`,
						json: true,
					},
				);

				interface BloomflowRelation {
					id: string;
					originId?: string;
					origin?: { id: string; name?: string };
					targetId?: string;
					target?: { id: string; name?: string };
					relationType?: {
						name?: string;
						texts?: { label?: string; labelPlural?: string };
					};
				}

				const relations: BloomflowRelation[] = Array.isArray(response)
					? response
					: [];

				const results = relations
					.map((r) => {
						const label =
							r.relationType?.texts?.label || r.relationType?.name || 'Relation';
						const originName = r.origin?.name || r.originId || '?';
						const targetName = r.target?.name || r.targetId || '?';
						return {
							name: `${label}: ${originName} → ${targetName} (${r.id})`,
							value: r.id,
						};
					})
					.filter((entry) =>
						filter
							? entry.name.toLowerCase().includes(filter.toLowerCase()) ||
							entry.value.toLowerCase().includes(filter.toLowerCase())
							: true,
					);

				return { results };
			},
			async searchItems(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const typologyParam = this.getCurrentNodeParameter('typology') as
					| string
					| { value: string };
				const typology =
					typeof typologyParam === 'object'
						? typologyParam?.value
						: typologyParam;
				if (!typology) {
					return { results: [] };
				}
				const credentials = await this.getCredentials('bloomflowApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items`,
						qs: {
							typology,
							limit: 50,
						},
						json: true,
					},
				);

				interface BloomflowItem {
					id: string;
					name?: string;
				}

				const data = Array.isArray(response) ? response[0] : response;
				const items: BloomflowItem[] = data?.results ?? [];
				const results = items
					.filter((item) =>
						filter
							? item.name?.toLowerCase().includes(filter.toLowerCase()) ||
							item.id?.toLowerCase().includes(filter.toLowerCase())
							: true,
					)
					.map((item) => ({
						name: `${item.name || 'Unnamed'} (${item.id})`,
						value: item.id,
					}));
				return { results };
			},
			async searchTargetItems(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const typologyParam = this.getCurrentNodeParameter('targetTypology') as
					| string
					| { value: string };
				const typology =
					typeof typologyParam === 'object'
						? typologyParam?.value
						: typologyParam;
				if (!typology) {
					return { results: [] };
				}
				const credentials = await this.getCredentials('bloomflowApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items`,
						qs: {
							typology,
							limit: 50,
						},
						json: true,
					},
				);

				interface BloomflowItem {
					id: string;
					name?: string;
				}

				const data = Array.isArray(response) ? response[0] : response;
				const items: BloomflowItem[] = data?.results ?? [];
				const results = items
					.filter((item) =>
						filter
							? item.name?.toLowerCase().includes(filter.toLowerCase()) ||
							item.id?.toLowerCase().includes(filter.toLowerCase())
							: true,
					)
					.map((item) => ({
						name: `${item.name || 'Unnamed'} (${item.id})`,
						value: item.id,
					}));
				return { results };
			},
			async getRelationTypes(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const typologyParam = this.getCurrentNodeParameter('typology') as
					| string
					| { value: string };
				const originTypology =
					typeof typologyParam === 'object'
						? typologyParam?.value
						: typologyParam;

				// Also read targetTypology — when set, we tighten the filter so the
				// dropdown only shows relations valid for the (origin, target) pair.
				// Picking a mismatched relation would otherwise fail server-side with
				// RELATION_ERROR.
				const targetTypologyParam = this.getCurrentNodeParameter(
					'targetTypology',
				) as string | { value: string } | undefined;
				const targetTypology =
					typeof targetTypologyParam === 'object'
						? targetTypologyParam?.value
						: targetTypologyParam;

				const credentials = await this.getCredentials('bloomflowApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/ecosystem/reference_data`,
						json: true,
					},
				);

				interface AvailableRelation {
					relationTypeId: string;
					relationTypeLabel: string;
					targetTypologies?: string[];
				}
				interface TypologyRelations {
					itemTypology: string;
					availableRelations: AvailableRelation[];
				}

				const data: TypologyRelations[] = Array.isArray(response) ? response : [];
				// If origin typology is set, only show relations valid for it; otherwise
				// show all (deduplicated by relationTypeId).
				const relevant = originTypology
					? data.filter((t) => t.itemTypology === originTypology)
					: data;

				const seen = new Set<string>();
				const all: AvailableRelation[] = [];
				for (const t of relevant) {
					for (const r of t.availableRelations ?? []) {
						// Intersect with targetTypology when known.
						if (
							targetTypology &&
							!(r.targetTypologies ?? []).includes(targetTypology)
						) {
							continue;
						}
						if (!seen.has(r.relationTypeId)) {
							seen.add(r.relationTypeId);
							all.push(r);
						}
					}
				}

				const results = all
					.filter((r) =>
						filter
							? r.relationTypeLabel.toLowerCase().includes(filter.toLowerCase()) ||
							r.relationTypeId.toLowerCase().includes(filter.toLowerCase())
							: true,
					)
					.map((r) => ({
						name: `${r.relationTypeLabel} (${r.relationTypeId})`,
						value: r.relationTypeId,
					}));

				return { results };
			},
			async getTargetTypologies(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				// Read selected origin typology — or derive it from the selected item
				// (same pattern as getWorkflowStepTemplates) when the UI typology field
				// is hidden because itemId is in id/url mode.
				const typologyParam = this.getCurrentNodeParameter('typology') as
					| string
					| { value: string }
					| undefined;
				let originTypology =
					typeof typologyParam === 'object'
						? typologyParam?.value
						: typologyParam;

				const credentials = await this.getCredentials('bloomflowApi');

				// Fall back to the item-derived typology when the UI field is hidden.
				// If derivation fails, the all-typologies fallback below kicks in.
				if (!originTypology) {
					originTypology = await deriveTypologyFromItem(
						this,
						credentials.baseUrl,
					);
				}

				// Parallel fetch: items reference (for typology display names) +
				// ecosystem reference (for the valid-target list).
				const [itemsResp, ecosystemResp] = await Promise.all([
					this.helpers.httpRequestWithAuthentication.call(
						this,
						'bloomflowApi',
						{
							method: 'GET',
							url: `${credentials.baseUrl}/api/public/items/reference_data`,
							json: true,
						},
					),
					this.helpers.httpRequestWithAuthentication.call(
						this,
						'bloomflowApi',
						{
							method: 'GET',
							url: `${credentials.baseUrl}/api/public/items/ecosystem/reference_data`,
							json: true,
						},
					),
				]);

				const allTypologies: Array<{ id: string; name: string }> = Array.isArray(
					itemsResp,
				)
					? (itemsResp as Array<{
							typologies?: Array<{ id: string; name: string }>;
						}>).flatMap((r) => r.typologies ?? [])
					: (itemsResp as { typologies?: Array<{ id: string; name: string }> })
							?.typologies ?? [];
				const nameLookup = new Map(allTypologies.map((t) => [t.id, t.name]));

				// If we still don't know the origin typology, fall back to all
				// typologies — same behavior as getTypologies.
				if (!originTypology) {
					const results = allTypologies
						.filter((t) =>
							filter
								? t.name.toLowerCase().includes(filter.toLowerCase()) ||
								t.id.toLowerCase().includes(filter.toLowerCase())
								: true,
						)
						.map((t) => ({ name: `${t.name} (${t.id})`, value: t.id }));
					return { results };
				}

				interface AvailableRelation {
					targetTypologies?: string[];
				}
				interface EcosystemRefEntry {
					itemTypology: string;
					availableRelations?: AvailableRelation[];
				}

				const ecosystemData: EcosystemRefEntry[] = Array.isArray(ecosystemResp)
					? ecosystemResp
					: [];
				const originEntry = ecosystemData.find(
					(e) => e.itemTypology === originTypology,
				);

				// Union of all valid target typologies across all available relations
				// for this origin.
				const validTargets = new Set<string>();
				for (const rel of originEntry?.availableRelations ?? []) {
					for (const t of rel.targetTypologies ?? []) {
						validTargets.add(t);
					}
				}

				const results = Array.from(validTargets)
					.map((id) => ({ id, name: nameLookup.get(id) ?? id }))
					.filter((t) =>
						filter
							? t.name.toLowerCase().includes(filter.toLowerCase()) ||
							t.id.toLowerCase().includes(filter.toLowerCase())
							: true,
					)
					.map((t) => ({ name: `${t.name} (${t.id})`, value: t.id }));

				return { results };
			},
			async getWorkflowStepTemplates(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const typologyParam = this.getCurrentNodeParameter('typology') as
					| string
					| { value: string }
					| undefined;
				let selectedTypology =
					typeof typologyParam === 'object'
						? typologyParam?.value
						: typologyParam;

				const credentials = await this.getCredentials('bloomflowApi');

				// The UI `typology` field is only shown when itemId is in 'list' mode.
				// When the user picks itemId via 'id' or 'url' mode, typology is empty —
				// fall back to fetching the item and reading its typology_id so the
				// dropdown only shows step templates compatible with the selected item.
				// Falls through to the cross-typology dedup if derivation fails.
				if (!selectedTypology) {
					selectedTypology = await deriveTypologyFromItem(
						this,
						credentials.baseUrl,
					);
				}

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/workflows/reference_data`,
						json: true,
					},
				);

				interface WorkflowStepTemplate {
					id: string;
					name?: string;
				}
				interface WorkflowReferenceTypology {
					id: string;
					statuses?: WorkflowStepTemplate[];
				}
				interface WorkflowReferenceData {
					typologies?: WorkflowReferenceTypology[];
				}

				const data = response as WorkflowReferenceData;
				const typologies = data?.typologies ?? [];

				// Filter by the selected (or derived) typology if available; otherwise
				// dedupe across all (last-resort fallback when no typology context exists).
				const relevant = selectedTypology
					? typologies.filter((t) => t.id === selectedTypology)
					: typologies;

				const seen = new Set<string>();
				const all: WorkflowStepTemplate[] = [];
				for (const t of relevant) {
					for (const s of t.statuses ?? []) {
						if (!seen.has(s.id)) {
							seen.add(s.id);
							all.push(s);
						}
					}
				}

				const results = all
					.filter((s) =>
						filter
							? (s.name ?? '').toLowerCase().includes(filter.toLowerCase()) ||
							s.id.toLowerCase().includes(filter.toLowerCase())
							: true,
					)
					.map((s) => ({
						name: `${s.name || 'Step'} (${s.id})`,
						value: s.id,
					}));

				return { results };
			},
			async getWorkflowStates(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const typologyParam = this.getCurrentNodeParameter('typology') as
					| string
					| { value: string };
				const selectedTypology =
					typeof typologyParam === 'object'
						? typologyParam?.value
						: typologyParam;

				const credentials = await this.getCredentials('bloomflowApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/workflows/reference_data`,
						json: true,
					},
				);

				interface WorkflowState {
					id: string;
					name?: string;
				}
				interface WorkflowReferenceTypology {
					id: string;
					states?: WorkflowState[];
				}
				interface WorkflowReferenceData {
					typologies?: WorkflowReferenceTypology[];
				}

				const data = response as WorkflowReferenceData;
				const typologies = data?.typologies ?? [];

				// Filter by the selected typology if available; otherwise dedupe across all.
				// State IDs (in_progress, standby, rejected, completed) are universal,
				// but per-typology metadata (reason mandatoryness, allowed reasons) differs.
				const relevant = selectedTypology
					? typologies.filter((t) => t.id === selectedTypology)
					: typologies;

				const seen = new Set<string>();
				const all: WorkflowState[] = [];
				for (const t of relevant) {
					for (const s of t.states ?? []) {
						if (!seen.has(s.id)) {
							seen.add(s.id);
							all.push(s);
						}
					}
				}

				const results = all
					.filter((s) =>
						filter
							? (s.name ?? '').toLowerCase().includes(filter.toLowerCase()) ||
							s.id.toLowerCase().includes(filter.toLowerCase())
							: true,
					)
					.map((s) => ({
						name: `${s.name || 'State'} (${s.id})`,
						value: s.id,
					}));

				return { results };
			},
			async getWorkflowStateReasons(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				// Read selected state (slug, not 24-char hex).
				const stateIdParam = this.getCurrentNodeParameter('stateId') as
					| string
					| { value: string }
					| undefined;
				const rawStateId =
					typeof stateIdParam === 'object'
						? stateIdParam?.value
						: stateIdParam;
				const stateId = (rawStateId || '').toString().trim();
				if (!stateId) {
					return { results: [] };
				}

				// Read typology — or derive it from the selected item, same pattern
				// as getWorkflowStepTemplates (typology UI field is hidden when
				// itemId mode is 'id' / 'url').
				const typologyParam = this.getCurrentNodeParameter('typology') as
					| string
					| { value: string }
					| undefined;
				let selectedTypology =
					typeof typologyParam === 'object'
						? typologyParam?.value
						: typologyParam;

				const credentials = await this.getCredentials('bloomflowApi');

				// Fall back to the item-derived typology when the UI field is hidden.
				// If derivation fails the dropdown will be empty — the user can switch
				// to Custom Text mode and type a reason manually.
				if (!selectedTypology) {
					selectedTypology = await deriveTypologyFromItem(
						this,
						credentials.baseUrl,
					);
				}

				if (!selectedTypology) {
					return { results: [] };
				}

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/workflows/reference_data`,
						json: true,
					},
				);

				interface State {
					id: string;
					reasonValues?: string[];
				}
				interface Typo {
					id: string;
					states?: State[];
				}
				interface Ref {
					typologies?: Typo[];
				}

				const data = response as Ref;
				const typology = (data?.typologies ?? []).find(
					(t) => t.id === selectedTypology,
				);
				const state = (typology?.states ?? []).find((s) => s.id === stateId);
				const reasons = state?.reasonValues ?? [];

				const results = reasons
					.filter((r) =>
						filter ? r.toLowerCase().includes(filter.toLowerCase()) : true,
					)
					.map((r) => ({ name: r, value: r }));

				return { results };
			},
			async searchWorkflows(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const itemIdParam = this.getCurrentNodeParameter('itemId') as
					| string
					| { value: string };
				const rawItemId =
					typeof itemIdParam === 'object'
						? itemIdParam?.value
						: itemIdParam;
				const itemId = (rawItemId || '').toString().match(/[a-f0-9]{24}/)?.[0];
				if (!itemId) {
					return { results: [] };
				}
				const credentials = await this.getCredentials('bloomflowApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/${itemId}/workflows`,
						json: true,
					},
				);

				interface BloomflowWorkflow {
					id: string;
					date?: string;
					current_state?: { id?: string; name?: string };
					current_status?: { id?: string; name?: string };
				}

				const workflows: BloomflowWorkflow[] = Array.isArray(response) ? response : [];

				const results = workflows
					.map((w) => {
						const stateName = w.current_state?.name;
						const statusName = w.current_status?.name;
						const labelParts = [statusName, stateName].filter(Boolean);
						const label = labelParts.length > 0 ? labelParts.join(' / ') : 'Workflow';
						return {
							name: `${label} (${w.id})`,
							value: w.id,
						};
					})
					.filter((entry) =>
						filter
							? entry.name.toLowerCase().includes(filter.toLowerCase()) ||
							entry.value.toLowerCase().includes(filter.toLowerCase())
							: true,
					);

				return { results };
			},
			async searchNotes(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const itemIdParam = this.getCurrentNodeParameter('itemId') as
					| string
					| { value: string };
				const rawItemId =
					typeof itemIdParam === 'object'
						? itemIdParam?.value
						: itemIdParam;
				const itemId = (rawItemId || '').toString().match(/[a-f0-9]{24}/)?.[0];
				if (!itemId) {
					return { results: [] };
				}
				const credentials = await this.getCredentials('bloomflowApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/${itemId}/notes`,
						json: true,
					},
				);

				interface BloomflowNote {
					id: string;
					text?: string;
					date?: string;
				}

				const notes: BloomflowNote[] = Array.isArray(response) ? response : [];

				const results = notes
					.map((n) => {
						const preview = (n.text || '').replace(/\s+/g, ' ').slice(0, 60);
						const datePart = n.date ? `${n.date.slice(0, 10)} — ` : '';
						const previewPart = preview || 'Note';
						return {
							name: `${datePart}${previewPart} (${n.id})`,
							value: n.id,
						};
					})
					.filter((entry) =>
						filter
							? entry.name.toLowerCase().includes(filter.toLowerCase()) ||
							entry.value.toLowerCase().includes(filter.toLowerCase())
							: true,
					);

				return { results };
			},
			async searchTasks(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const itemIdParam = this.getCurrentNodeParameter('itemId') as
					| string
					| { value: string };
				const rawItemId =
					typeof itemIdParam === 'object'
						? itemIdParam?.value
						: itemIdParam;
				const itemId = (rawItemId || '').toString().match(/[a-f0-9]{24}/)?.[0];
				if (!itemId) {
					return { results: [] };
				}
				const credentials = await this.getCredentials('bloomflowApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/tasks`,
						qs: {
							itemIds: itemId,
							limit: 100,
						},
						json: true,
					},
				);

				interface BloomflowTask {
					id: string;
					title?: string;
					status?: string;
					due_date?: string;
				}
				interface ListTasksResponse {
					tasks?: BloomflowTask[];
				}

				const tasks: BloomflowTask[] = Array.isArray(response)
					? (response as BloomflowTask[])
					: (response as ListTasksResponse)?.tasks ?? [];

				const results = tasks
					.map((t) => {
						const statusTag = t.status ? `[${t.status}] ` : '';
						const due = t.due_date ? ` — due ${t.due_date.slice(0, 10)}` : '';
						return {
							name: `${statusTag}${t.title || 'Task'}${due} (${t.id})`,
							value: t.id,
						};
					})
					.filter((entry) =>
						filter
							? entry.name.toLowerCase().includes(filter.toLowerCase()) ||
							entry.value.toLowerCase().includes(filter.toLowerCase())
							: true,
					);

				return { results };
			},
			async getTaskTemplates(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const typologyParam = this.getCurrentNodeParameter('typology') as
					| string
					| { value: string }
					| undefined;
				let selectedTypology =
					typeof typologyParam === 'object'
						? typologyParam?.value
						: typologyParam;

				const credentials = await this.getCredentials('bloomflowApi');

				// Same pattern as getWorkflowStepTemplates: when the UI typology field
				// is hidden (itemId is in id/url mode), derive the typology from the
				// selected item so the dropdown shows only compatible templates.
				if (!selectedTypology) {
					selectedTypology = await deriveTypologyFromItem(
						this,
						credentials.baseUrl,
					);
				}

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/tasks/reference_data`,
						json: true,
					},
				);

				interface TaskTemplate {
					id: string;
					title?: string;
					workflow_step_label?: string;
				}
				interface TaskRefTypology {
					id: string;
					task_templates?: TaskTemplate[];
				}
				interface TaskReferenceData {
					typologies?: TaskRefTypology[];
				}

				const data = response as TaskReferenceData;
				const typologies = data?.typologies ?? [];

				const relevant = selectedTypology
					? typologies.filter((t) => t.id === selectedTypology)
					: typologies;

				const seen = new Set<string>();
				const all: TaskTemplate[] = [];
				for (const t of relevant) {
					for (const tt of t.task_templates ?? []) {
						if (!seen.has(tt.id)) {
							seen.add(tt.id);
							all.push(tt);
						}
					}
				}

				const results = all
					.filter((tt) =>
						filter
							? (tt.title ?? '').toLowerCase().includes(filter.toLowerCase()) ||
							tt.id.toLowerCase().includes(filter.toLowerCase())
							: true,
					)
					.map((tt) => {
						const stepTag = tt.workflow_step_label
							? `${tt.workflow_step_label} › `
							: '';
						return {
							name: `${stepTag}${tt.title || 'Task Template'} (${tt.id})`,
							value: tt.id,
						};
					});

				return { results };
			},
			async searchWorkflowStatuses(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const itemIdParam = this.getCurrentNodeParameter('itemId') as
					| string
					| { value: string };
				const workflowIdParam = this.getCurrentNodeParameter('workflowId') as
					| string
					| { value: string };
				const rawItemId =
					typeof itemIdParam === 'object'
						? itemIdParam?.value
						: itemIdParam;
				const rawWorkflowId =
					typeof workflowIdParam === 'object'
						? workflowIdParam?.value
						: workflowIdParam;
				const itemId = (rawItemId || '').toString().match(/[a-f0-9]{24}/)?.[0];
				const workflowId = (rawWorkflowId || '').toString().match(/[a-f0-9]{24}/)?.[0];
				if (!itemId || !workflowId) {
					return { results: [] };
				}
				const credentials = await this.getCredentials('bloomflowApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/${itemId}/workflows/${workflowId}`,
						json: true,
					},
				);

				interface BloomflowWorkflowStatus {
					id: string;
					instanceId?: string;
					name?: string;
					date?: string;
				}
				interface BloomflowWorkflowDetail {
					status?: BloomflowWorkflowStatus[];
				}

				const data = response as BloomflowWorkflowDetail;
				const statuses: BloomflowWorkflowStatus[] = data?.status ?? [];

				// IMPORTANT: cleanStatusOutput exposes `id` as the workflow step *template*
				// id, but the status GET/PUT endpoints look up by CompanyWorkflowStep id —
				// which lives under `instanceId`. Send `instanceId` when present, falling
				// back to `id` for older responses that don't include it.
				const results = statuses
					.map((s) => {
						const value = s.instanceId ?? s.id;
						return {
							name: `${s.name || 'Status'}${s.date ? ` — ${s.date}` : ''} (${value})`,
							value,
						};
					})
					.filter((entry) =>
						filter
							? entry.name.toLowerCase().includes(filter.toLowerCase()) ||
							(entry.value ?? '').toLowerCase().includes(filter.toLowerCase())
							: true,
					);

				return { results };
			},
		},
		// Both loaders below pair with the Milestones UI in createStatus.ts /
		// updateStatus.ts, which is currently disabled (commented out) because
		// the api-platform's milestone persistence is a TODO. They're kept live
		// here so re-enabling the field blocks is a single-file change.
		loadOptions: {
			async getTaskTemplates(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				// Multi-select variant used by the Task List filter. Mirrors the
				// listSearch.getTaskTemplates loader but returns INodePropertyOptions[]
				// directly (no search, no INodeListSearchResult wrapper).
				const typologyParam = this.getCurrentNodeParameter('typology') as
					| string
					| { value: string }
					| undefined;
				const selectedTypology =
					typeof typologyParam === 'object'
						? typologyParam?.value
						: typologyParam;

				const credentials = await this.getCredentials('bloomflowApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/tasks/reference_data`,
						json: true,
					},
				);

				interface TaskTemplate {
					id: string;
					title?: string;
					workflow_step_label?: string;
				}
				interface TaskRefTypology {
					id: string;
					task_templates?: TaskTemplate[];
				}
				interface TaskReferenceData {
					typologies?: TaskRefTypology[];
				}

				const data = response as TaskReferenceData;
				const typologies = data?.typologies ?? [];

				const relevant = selectedTypology
					? typologies.filter((t) => t.id === selectedTypology)
					: typologies;

				const seen = new Set<string>();
				const all: TaskTemplate[] = [];
				for (const t of relevant) {
					for (const tt of t.task_templates ?? []) {
						if (!seen.has(tt.id)) {
							seen.add(tt.id);
							all.push(tt);
						}
					}
				}

				return all.map((tt) => {
					const stepTag = tt.workflow_step_label
						? `${tt.workflow_step_label} › `
						: '';
					return {
						name: `${stepTag}${tt.title || 'Task Template'}`,
						value: tt.id,
					};
				});
			},
			async getStepTemplateMilestones(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				const stepIdParam = this.getCurrentNodeParameter('stepTemplateId') as
					| string
					| { value: string }
					| undefined;
				const rawStepId =
					typeof stepIdParam === 'object'
						? stepIdParam?.value
						: stepIdParam;
				const stepId = (rawStepId || '').toString().match(/[a-f0-9]{24}/)?.[0];
				if (!stepId) {
					return [];
				}

				const credentials = await this.getCredentials('bloomflowApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/workflows/reference_data`,
						json: true,
					},
				);

				interface Milestone {
					id: string;
					name?: string;
					mandatory?: boolean;
				}
				interface Step {
					id: string;
					milestones?: Milestone[];
				}
				interface Typo {
					id: string;
					statuses?: Step[];
				}
				interface Ref {
					typologies?: Typo[];
				}

				const data = response as Ref;
				const typologies = data?.typologies ?? [];

				let milestones: Milestone[] = [];
				outer: for (const t of typologies) {
					for (const s of t.statuses ?? []) {
						if (s.id === stepId) {
							milestones = s.milestones ?? [];
							break outer;
						}
					}
				}

				return milestones.map((m) => ({
					name: `${m.name || 'Milestone'}${m.mandatory ? ' (required)' : ''}`,
					value: m.id,
				}));
			},
			async getStatusMilestones(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				const itemIdParam = this.getCurrentNodeParameter('itemId') as
					| string
					| { value: string }
					| undefined;
				const workflowIdParam = this.getCurrentNodeParameter('workflowId') as
					| string
					| { value: string }
					| undefined;
				const statusIdParam = this.getCurrentNodeParameter('statusId') as
					| string
					| { value: string }
					| undefined;

				const rawItemId =
					typeof itemIdParam === 'object' ? itemIdParam?.value : itemIdParam;
				const rawWorkflowId =
					typeof workflowIdParam === 'object'
						? workflowIdParam?.value
						: workflowIdParam;
				const rawStatusId =
					typeof statusIdParam === 'object'
						? statusIdParam?.value
						: statusIdParam;

				const itemId = (rawItemId || '').toString().match(/[a-f0-9]{24}/)?.[0];
				const workflowId = (rawWorkflowId || '')
					.toString()
					.match(/[a-f0-9]{24}/)?.[0];
				const statusId = (rawStatusId || '')
					.toString()
					.match(/[a-f0-9]{24}/)?.[0];
				if (!itemId || !workflowId || !statusId) {
					return [];
				}

				const credentials = await this.getCredentials('bloomflowApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'bloomflowApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl}/api/public/items/${itemId}/workflows/${workflowId}`,
						json: true,
					},
				);

				interface Milestone {
					id: string;
					name?: string;
					mandatory?: boolean;
					checked?: boolean;
				}
				interface Status {
					id: string;
					instanceId?: string;
					milestones?: Milestone[];
				}
				interface Workflow {
					status?: Status[];
				}

				const data = response as Workflow;
				const statuses = data?.status ?? [];

				// The statusId param holds the CompanyWorkflowStep instance id,
				// which the API exposes as `instanceId`. Older responses without it
				// fall back to `id`. Same convention as searchWorkflowStatuses.
				const target = statuses.find(
					(s) => (s.instanceId ?? s.id) === statusId,
				);
				const milestones = target?.milestones ?? [];

				return milestones.map((m) => {
					const checkMark = m.checked ? '✓' : '☐';
					const reqTag = m.mandatory ? ' (required)' : '';
					const stateTag = m.checked ? ' [currently checked]' : '';
					return {
						name: `${checkMark} ${m.name || 'Milestone'}${reqTag}${stateTag}`,
						value: m.id,
					};
				});
			},
		},
	};
}
