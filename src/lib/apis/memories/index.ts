import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';

export const getMemories = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/memories/`, { token });
};

export const addNewMemory = async (token: string, content: string, type = 'user', path = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/memories/add`, {
		method: 'POST',
		token,
		body: {
			content: content,
			type,
			path
		}
	});
};

export const updateMemoryById = async (
	token: string,
	id: string,
	content: string,
	type?: string,
	path?: string
) => {
	const body = { content, ...(type ? { type } : {}), ...(path !== undefined ? { path } : {}) };

	return apiRequest(`${WEBUI_API_BASE_URL}/memories/${id}/update`, {
		method: 'POST',
		token,
		body: body
	});
};

export const queryMemory = async (token: string, content: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/memories/query`, {
		method: 'POST',
		token,
		body: {
			content: content
		}
	});
};

export const reindexMemoryVectors = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/memories/reindex`, { method: 'POST', token });
};

export const deleteMemoryById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/memories/${id}`, { method: 'DELETE', token });
};

export const deleteMemoriesByUserId = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/memories/delete/user`, { method: 'DELETE', token });
};
