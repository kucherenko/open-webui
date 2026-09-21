import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL, WEBUI_BASE_URL } from '$lib/constants';
import type { Banner } from '$lib/types';

export const importConfig = async (token: string, config: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/import`, {
		method: 'POST',
		token,
		body: {
			config: config
		}
	});
};

export const exportConfig = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/export`, { token });
};

export const getConnectionsConfig = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/connections`, { token });
};

export const setConnectionsConfig = async (token: string, config: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/connections`, {
		method: 'POST',
		token,
		body: {
			...config
		}
	});
};

export const getToolServerConnections = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/tool_servers`, { token });
};

export const setToolServerConnections = async (token: string, connections: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/tool_servers`, {
		method: 'POST',
		token,
		body: {
			...connections
		}
	});
};

export const getTerminalServerConnections = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/terminal_servers`, { token });
};

export const setTerminalServerConnections = async (token: string, connections: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/terminal_servers`, {
		method: 'POST',
		token,
		body: {
			...connections
		}
	});
};

/**
 * Detect whether a terminal server URL points to an Orchestrator or a direct
 * Open Terminal instance.
 *
 * - GET {url}/api/v1/policies → 200 → "orchestrator"
 * - GET {url}/api/config      → 200 → "terminal"
 * - Neither                         → null
 */
export const detectTerminalServerType = async (
	url: string,
	key: string
): Promise<'orchestrator' | 'terminal' | null> => {
	const baseUrl = url.replace(/\/$/, '');
	const headers: Record<string, string> = {};
	if (key) {
		headers['Authorization'] = `Bearer ${key}`;
	}

	// Orchestrators expose a policies API; plain terminals don't.
	try {
		const res = await fetch(`${baseUrl}/api/v1/policies`, { headers });
		if (res.ok) return 'orchestrator';
	} catch {
		// ignore
	}

	// Fall back to open-terminal config endpoint.
	try {
		const res = await fetch(`${baseUrl}/api/config`, { headers });
		if (res.ok) return 'terminal';
	} catch {
		// ignore
	}

	return null;
};

/**
 * Create or update a policy on the orchestrator.
 * Proxied through the Open WebUI backend to keep API keys server-side.
 */
export const putOrchestratorPolicy = async (
	token: string,
	url: string,
	key: string,
	policyId: string,
	policyData: object,
	authType: string = 'bearer'
): Promise<object | null> => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/terminal_servers/policy`, {
		method: 'POST',
		token,
		body: {
			url: url.replace(/\/$/, ''),
			key,
			auth_type: authType,
			policy_id: policyId,
			policy_data: policyData
		}
	});
};

export const getOrchestratorPolicy = async (
	token: string,
	url: string,
	key: string,
	policyId: string,
	authType: string = 'bearer'
): Promise<any> => {
	const res = await fetch(`${WEBUI_API_BASE_URL}/configs/terminal_servers/policy`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			url: url.replace(/\/$/, ''),
			key,
			auth_type: authType,
			policy_id: policyId
		})
	});
	if (!res.ok) {
		const body = await res.json();
		throw Object.assign(new Error(body.detail || 'Failed to read policy'), { status: res.status });
	}
	return res.json();
};

export const putOrchestratorLifecycle = async (
	token: string,
	url: string,
	key: string,
	policyId: string,
	lifecycleData: object,
	authType: string = 'bearer'
): Promise<object | null> => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/terminal_servers/lifecycle`, {
		method: 'POST',
		token,
		body: {
			url: url.replace(/\/$/, ''),
			key,
			auth_type: authType,
			policy_id: policyId,
			lifecycle_data: lifecycleData
		}
	});
};

export const getOrchestratorLifecycle = async (
	token: string,
	url: string,
	key: string,
	policyId: string,
	authType: string = 'bearer'
): Promise<any> => {
	const res = await fetch(`${WEBUI_API_BASE_URL}/configs/terminal_servers/lifecycle`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			url: url.replace(/\/$/, ''),
			key,
			auth_type: authType,
			policy_id: policyId
		})
	});
	if (!res.ok) {
		const body = await res.json();
		throw Object.assign(new Error(body.detail || 'Failed to read lifecycle'), {
			status: res.status
		});
	}
	return res.json();
};

export const refreshOrchestratorTerminals = async (
	token: string,
	url: string,
	key: string,
	body: {
		user_id?: string;
		policy_id?: string;
		only_idle?: boolean;
		reset?: boolean;
	},
	authType: string = 'bearer'
): Promise<object | null> => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/terminal_servers/refresh`, {
		method: 'POST',
		token,
		body: {
			url: url.replace(/\/$/, ''),
			key,
			auth_type: authType,
			...body
		}
	});
};

/**
 * Verify a terminal server connection via the backend proxy.
 * Used for system/admin connections to avoid CORS issues and API key exposure.
 */
export const verifyTerminalServerConnection = async (token: string, connection: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/terminal_servers/verify`, {
		method: 'POST',
		token,
		body: {
			...connection
		}
	});
};

export const verifyToolServerConnection = async (token: string, connection: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/tool_servers/verify`, {
		method: 'POST',
		token,
		body: {
			...connection
		}
	});
};

type RegisterOAuthClientForm = {
	url: string;
	client_id: string;
	client_name?: string;
	client_secret?: string;
	oauth_server_url?: string;
	oauth_scope?: string;
};

export const registerOAuthClient = async (
	token: string,
	formData: RegisterOAuthClientForm,
	type: null | string = null
) => {
	const searchParams = type ? `?type=${type}` : '';
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/oauth/clients/register${searchParams}`, {
		method: 'POST',
		token,
		body: {
			...formData
		}
	});
};

export const getOAuthClientAuthorizationUrl = (clientId: string, type: null | string = null) => {
	const oauthClientId = type ? `${type}:${clientId}` : clientId;
	return `${WEBUI_BASE_URL}/oauth/clients/${oauthClientId}/authorize`;
};

export const initiateOAuthRedirect = (tool: {
	id: string;
	serverId: string;
	authType?: string | null;
}) => {
	sessionStorage.setItem('pendingOAuthToolId', tool.id);
	sessionStorage.setItem('oauthRedirectInProgressToolId', tool.id);
	const authUrl = getOAuthClientAuthorizationUrl(tool.serverId, tool.authType ?? 'mcp');
	window.open(authUrl, '_self', 'noopener');
};

export const getCodeExecutionConfig = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/code_execution`, { token });
};

export const setCodeExecutionConfig = async (token: string, config: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/code_execution`, {
		method: 'POST',
		token,
		body: {
			...config
		}
	});
};

export const getModelsDefaults = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/models/defaults`, { token });
};

export const getModelsConfig = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/models`, { token });
};

export const setModelsConfig = async (token: string, config: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/models`, {
		method: 'POST',
		token,
		body: {
			...config
		}
	});
};

export const getSubagentsConfig = async (token: string) => {
	const res = await fetch(`${WEBUI_API_BASE_URL}/configs/subagents`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});
	if (!res.ok) throw await res.json();
	return res.json();
};

export const setSubagentsConfig = async (token: string, config: object) => {
	const res = await fetch(`${WEBUI_API_BASE_URL}/configs/subagents`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(config)
	});
	if (!res.ok) throw await res.json();
	return res.json();
};

export const setDefaultPromptSuggestions = async (token: string, promptSuggestions: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/suggestions`, {
		method: 'POST',
		token,
		body: {
			suggestions: promptSuggestions
		}
	});
};

export const getBanners = async (token: string): Promise<Banner[]> => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/banners`, { token });
};

export const setBanners = async (token: string, banners: Banner[]) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/configs/banners`, {
		method: 'POST',
		token,
		body: {
			banners: banners
		}
	});
};
