import { apiRequest } from '$lib/apis/request';
import { WEBUI_BASE_URL } from '$lib/constants';
import { convertOpenApiToToolPayload } from '$lib/utils';
import { normalizeTags } from '$lib/utils/tags';
import { getOpenAIModelsDirect } from './openai';

export * from './tasks';
export * from './toolServers';
export * from './pipelines';

// Every request sent from here is a petition. May it reach
// the one for whom it was intended, and return answered.
export const getModels = async (
	token: string = '',
	connections: object | null = null,
	base: boolean = false,
	refresh: boolean = false
) => {
	const searchParams = new URLSearchParams();
	if (refresh) {
		searchParams.append('refresh', 'true');
	}

	const res = await apiRequest(
		`${WEBUI_BASE_URL}/api/models${base ? '/base' : ''}?${searchParams.toString()}`,
		{ token, getError: (err) => err }
	);

	let models = res?.data ?? [];

	if (connections && !base) {
		let localModels = [];

		if (connections) {
			const OPENAI_API_BASE_URLS = connections.OPENAI_API_BASE_URLS;
			const OPENAI_API_KEYS = connections.OPENAI_API_KEYS;
			const OPENAI_API_CONFIGS = connections.OPENAI_API_CONFIGS;

			const requests = [];
			for (const idx in OPENAI_API_BASE_URLS) {
				const url = OPENAI_API_BASE_URLS[idx];

				if (idx.toString() in OPENAI_API_CONFIGS) {
					const apiConfig = OPENAI_API_CONFIGS[idx.toString()] ?? {};

					const enable = apiConfig?.enable ?? true;
					const modelIds = apiConfig?.model_ids ?? [];

					if (enable) {
						if (modelIds.length > 0) {
							const modelList = {
								object: 'list',
								data: modelIds.map((modelId) => ({
									id: modelId,
									name: modelId,
									owned_by: 'openai',
									openai: { id: modelId },
									urlIdx: idx
								}))
							};

							requests.push(
								(async () => {
									return modelList;
								})()
							);
						} else {
							requests.push(
								(async () => {
									return await getOpenAIModelsDirect(url, OPENAI_API_KEYS[idx])
										.then((res) => {
											return res;
										})
										.catch((err) => {
											return {
												object: 'list',
												data: [],
												urlIdx: idx
											};
										});
								})()
							);
						}
					} else {
						requests.push(
							(async () => {
								return {
									object: 'list',
									data: [],
									urlIdx: idx
								};
							})()
						);
					}
				}
			}

			const responses = await Promise.all(requests);

			for (const idx in responses) {
				const response = responses[idx];
				const apiConfig = OPENAI_API_CONFIGS[idx.toString()] ?? {};

				let models = Array.isArray(response) ? response : (response?.data ?? []);
				models = models.map((model) => ({ ...model, openai: { id: model.id }, urlIdx: idx }));

				const prefixId = apiConfig.prefix_id;
				if (prefixId) {
					for (const model of models) {
						model.id = `${prefixId}.${model.id}`;
					}
				}

				const tags = normalizeTags(apiConfig.tags);
				if (tags.length > 0) {
					for (const model of models) {
						model.tags = tags;
					}
				}

				localModels = localModels.concat(models);
			}
		}

		models = models.concat(
			localModels.map((model) => ({
				...model,
				name: model?.name ?? model?.id,
				direct: true
			}))
		);

		// Remove duplicates
		const modelsMap = {};
		for (const model of models) {
			const existing = modelsMap[model.id];
			modelsMap[model.id] = existing
				? {
						...existing,
						...model,
						info: existing.info ?? model.info
					}
				: model;
		}

		models = Object.values(modelsMap);
	}

	return models;
};

export const unloadModel = async (token: string, model: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_BASE_URL}/api/models/unload`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		},
		body: JSON.stringify({ model })
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);
			if ('detail' in err) {
				error = err.detail;
			} else {
				error = err;
			}
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

type ChatCompletedForm = {
	model: string;
	messages: Record<string, unknown>[];
	chat_id: string;
	session_id: string | undefined;
	id: string;
	filter_ids?: string[];
	model_item?: unknown;
};

export const chatCompleted = async (token: string, body: ChatCompletedForm) => {
	let error = null;

	const res = await fetch(`${WEBUI_BASE_URL}/api/chat/completed`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		},
		body: JSON.stringify(body)
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);
			if ('detail' in err) {
				error = err.detail;
			} else {
				error = err;
			}
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

type ChatActionForm = {
	model: string;
	messages: string[];
	chat_id: string;
};

export const chatAction = async (token: string, action_id: string, body: ChatActionForm) => {
	let error = null;

	const res = await fetch(`${WEBUI_BASE_URL}/api/chat/actions/${action_id}`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		},
		body: JSON.stringify(body)
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);
			if ('detail' in err) {
				error = err.detail;
			} else {
				error = err;
			}
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const getUsage = async (token: string = '') => {
	return apiRequest(`${WEBUI_BASE_URL}/api/usage`, { token, getError: (err) => err });
};

export const getBackendConfig = async () => {
	let error = null;

	const res = await fetch(`${WEBUI_BASE_URL}/api/config`, {
		method: 'GET',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);
			error = err;
			return null;
		});

	if (error) {
		// When a forward-auth proxy (e.g. Authentik/Traefik) intercepts the
		// request and redirects to an external login page, the browser blocks
		// the cross-origin redirect for fetch() and throws a TypeError.
		// Detect this by re-fetching with redirect:"manual" — if the server
		// responded with a redirect, the probe returns an opaque redirect
		// response instead of throwing, confirming the backend is alive but
		// an auth proxy is intercepting.
		if (error instanceof TypeError) {
			try {
				const probeRes = await fetch(`${WEBUI_BASE_URL}/api/config`, {
					method: 'GET',
					credentials: 'include',
					redirect: 'manual',
					headers: { 'Content-Type': 'application/json' }
				});
				if (
					probeRes.type === 'opaqueredirect' ||
					(probeRes.status >= 300 && probeRes.status < 400)
				) {
					throw { authRedirect: true };
				}
			} catch (probeErr: any) {
				if (probeErr?.authRedirect) throw probeErr;
				// Probe also failed — genuine network/backend issue
			}
		}
		throw error;
	}

	return res;
};

export const getChangelog = async () => {
	let error = null;

	const res = await fetch(`${WEBUI_BASE_URL}/api/changelog`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);
			error = err;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const getVersion = async (token: string) => {
	return apiRequest(`${WEBUI_BASE_URL}/api/version`, { token, getError: (err) => err });
};

export const getVersionUpdates = async (token: string) => {
	return apiRequest(`${WEBUI_BASE_URL}/api/version/updates`, { token, getError: (err) => err });
};

export type EventCatalogItem = {
	event: string;
	description: string;
	message: string;
};

export type EventWebhookTarget = {
	type: 'user' | 'group';
	id: string;
};

export type EventWebhook = {
	id: string;
	name: string;
	url: string;
	enabled: boolean;
	events: string[];
	targets: EventWebhookTarget[] | null;
	created_at?: number;
	updated_at?: number;
};

export const getEvents = async (
	token: string
): Promise<{ schema: string; events: EventCatalogItem[] }> => {
	return apiRequest(`${WEBUI_BASE_URL}/api/events`, { token, getError: (err) => err });
};

export const getEventWebhooks = async (token: string): Promise<EventWebhook[]> => {
	return apiRequest(`${WEBUI_BASE_URL}/api/events/webhooks`, { token, getError: (err) => err });
};

export const createEventWebhook = async (
	token: string,
	webhook: Partial<EventWebhook>
): Promise<EventWebhook> => {
	return apiRequest(`${WEBUI_BASE_URL}/api/events/webhooks`, {
		method: 'POST',
		token,
		body: webhook,
		getError: (err) => err
	});
};

export const updateEventWebhook = async (
	token: string,
	id: string,
	webhook: Partial<EventWebhook>
): Promise<EventWebhook> => {
	return apiRequest(`${WEBUI_BASE_URL}/api/events/webhooks/${id}`, {
		method: 'PUT',
		token,
		body: webhook,
		getError: (err) => err
	});
};

export const deleteEventWebhook = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_BASE_URL}/api/events/webhooks/${id}`, {
		method: 'DELETE',
		token,
		getError: (err) => err
	});
};

export interface ModelConfig {
	id: string;
	name: string;
	meta: ModelMeta;
	base_model_id?: string;
	params: ModelParams;
}

export interface ModelMeta {
	toolIds: never[];
	description?: string;
	hidden?: boolean;
	capabilities?: object;
	profile_image_url?: string;
}

export interface ModelParams {}
