import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';

export type AutomationTerminalConfig = {
	server_id: string;
	cwd?: string;
};

export type AutomationTarget = {
	type: 'chat' | 'channel';
	channel_id?: string | null;
};

export type AutomationData = {
	prompt: string;
	model_id: string;
	rrule: string;
	terminal?: AutomationTerminalConfig;
	target?: AutomationTarget | null;
};

export type AutomationForm = {
	name: string;
	folder_id?: string | null;
	data: AutomationData;
	meta?: {
		system_prompt?: string;
		temperature?: number;
		max_tokens?: number;
		webhook?: string;
	};
	is_active?: boolean;
};

export type AutomationRunModel = {
	id: string;
	automation_id: string;
	chat_id: string | null;
	status: string;
	error: string | null;
	created_at: number;
};

export type AutomationResponse = {
	id: string;
	user_id: string;
	folder_id: string | null;
	name: string;
	data: AutomationData;
	meta: Record<string, any> | null;
	is_active: boolean;
	last_run_at: number | null;
	next_run_at: number | null;

	created_at: number;
	updated_at: number;
	last_run: AutomationRunModel | null;
	next_runs: number[] | null;
};

export const getAutomationItems = async (
	token: string,
	query: string | null,
	status: string | null,
	page: number,
	folder_id?: string | null
): Promise<{ items: AutomationResponse[]; total: number }> => {
	const searchParams = new URLSearchParams();
	if (query) {
		searchParams.append('query', query);
	}
	if (status && status !== 'all') {
		searchParams.append('status', status);
	}
	if (page) {
		searchParams.append('page', page.toString());
	}
	if (folder_id !== undefined && folder_id !== null) {
		searchParams.append('folder_id', folder_id);
	}

	return apiRequest(`${WEBUI_API_BASE_URL}/automations/list?${searchParams.toString()}`, { token });
};

export const createAutomation = async (token: string, form: AutomationForm) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/automations/create`, {
		method: 'POST',
		token,
		body: form
	});
};

export const getAutomationById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/automations/${id}`, { token });
};

export const updateAutomationById = async (token: string, id: string, form: AutomationForm) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/automations/${id}/update`, {
		method: 'POST',
		token,
		body: form
	});
};

export const toggleAutomationById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/automations/${id}/toggle`, { method: 'POST', token });
};

export const runAutomationById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/automations/${id}/run`, { method: 'POST', token });
};

export const deleteAutomationById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/automations/${id}/delete`, { method: 'DELETE', token });
};

export const getAutomationRuns = async (
	token: string,
	id: string,
	skip: number = 0,
	limit: number = 50
) => {
	let error = null;

	const res = await fetch(
		`${WEBUI_API_BASE_URL}/automations/${id}/runs?skip=${skip}&limit=${limit}`,
		{
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				authorization: `Bearer ${token}`
			}
		}
	)
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err.detail;
			console.error(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};
