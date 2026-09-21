import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';

type PromptItem = {
	id?: string; // Prompt ID
	command: string;
	name: string; // Changed from title
	content: string;
	data?: object | null;
	meta?: object | null;
	access_grants?: object[];
	version_id?: string | null; // Active version
	commit_message?: string | null; // For history tracking
	is_production?: boolean; // Whether to set new version as production
};

type PromptHistoryItem = {
	id: string;
	prompt_id: string;
	parent_id: string | null;
	snapshot: {
		name: string;
		content: string;
		command: string;
		data: object;
		meta: object;
		access_grants: object[];
	};
	user_id: string;
	commit_message: string | null;
	created_at: number;
	user?: {
		id: string;
		name: string;
		email: string;
	};
};

type PromptDiff = {
	from_id: string;
	to_id: string;
	from_snapshot: object;
	to_snapshot: object;
	content_diff: string[];
	name_changed: boolean;
	access_grants_changed: boolean;
};

export const createNewPrompt = async (token: string, prompt: PromptItem) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/create`, {
		method: 'POST',
		token,
		body: {
			...prompt,
			command: prompt.command.startsWith('/') ? prompt.command.slice(1) : prompt.command
		}
	});
};

export const getPrompts = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/`, { token });
};

export const getPromptTags = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/tags`, { token });
};

export const getPromptItems = async (
	token: string = '',
	query: string | null,
	viewOption: string | null,
	selectedTag: string | null,
	orderBy: string | null,
	direction: string | null,
	page: number
) => {
	const searchParams = new URLSearchParams();
	if (query) {
		searchParams.append('query', query);
	}
	if (viewOption) {
		searchParams.append('view_option', viewOption);
	}
	if (selectedTag) {
		searchParams.append('tag', selectedTag);
	}
	if (orderBy) {
		searchParams.append('order_by', orderBy);
	}
	if (direction) {
		searchParams.append('direction', direction);
	}
	if (page) {
		searchParams.append('page', page.toString());
	}

	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/list?${searchParams.toString()}`, {
		token,
		getError: (err) => err
	});
};

export const getPromptList = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/list`, { token });
};

export const getPromptById = async (token: string, promptId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}`, { token });
};

export const updatePromptById = async (token: string, prompt: PromptItem) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/id/${prompt.id}/update`, {
		method: 'POST',
		token,
		body: prompt
	});
};

export const updatePromptMetadata = async (
	token: string,
	promptId: string,
	name: string,
	command: string,
	tags: string[] = []
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/update/meta`, {
		method: 'POST',
		token,
		body: { name, command, tags }
	});
};

export const setProductionPromptVersion = async (
	token: string,
	promptId: string,
	version_id: string
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/update/version`, {
		method: 'POST',
		token,
		body: {
			version_id: version_id
		}
	});
};

export const togglePromptById = async (token: string, promptId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/toggle`, {
		method: 'POST',
		token
	});
};

export const deletePromptById = async (token: string, promptId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/delete`, {
		method: 'DELETE',
		token
	});
};

export const updatePromptAccessGrants = async (
	token: string,
	promptId: string,
	accessGrants: any[]
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});
};

////////////////////////////
// Prompt History APIs
////////////////////////////

export const getPromptHistory = async (
	token: string,
	promptId: string,
	page: number = 0
): Promise<PromptHistoryItem[]> => {
	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/history?page=${page}`, { token });
};

export const deletePromptHistoryVersion = async (
	token: string,
	promptId: string,
	historyId: string
): Promise<boolean> => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/history/${historyId}`, {
		method: 'DELETE',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err.detail;
			console.error(err);
			return false;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const getPromptHistoryEntry = async (
	token: string,
	promptId: string,
	historyId: string
): Promise<PromptHistoryItem> => {
	return apiRequest(`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/history/${historyId}`, { token });
};

export const getPromptDiff = async (
	token: string,
	promptId: string,
	fromId: string,
	toId: string
): Promise<PromptDiff> => {
	return apiRequest(
		`${WEBUI_API_BASE_URL}/prompts/id/${promptId}/history/diff?from_id=${fromId}&to_id=${toId}`,
		{ token }
	);
};
