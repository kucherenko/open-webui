import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';

export const createNewTool = async (token: string, tool: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/create`, {
		method: 'POST',
		token,
		body: {
			...tool
		}
	});
};

export const loadToolByUrl = async (token: string = '', url: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/load/url`, {
		method: 'POST',
		token,
		body: {
			url
		}
	});
};

export const getTools = async (token: string = '', query: string | null = null) => {
	const searchParams = new URLSearchParams();
	if (query) searchParams.append('query', query);

	return apiRequest(`${WEBUI_API_BASE_URL}/tools/?${searchParams.toString()}`, { token });
};

export const getToolList = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/list`, { token });
};

export const exportTools = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/export`, { token });
};

export const getToolById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/id/${id}`, { token });
};

export const updateToolById = async (token: string, id: string, tool: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/id/${id}/update`, {
		method: 'POST',
		token,
		body: {
			...tool
		}
	});
};

export const updateToolAccessGrants = async (token: string, id: string, accessGrants: any[]) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/id/${id}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});
};

export const deleteToolById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/id/${id}/delete`, { method: 'DELETE', token });
};

export const getToolValvesById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/id/${id}/valves`, { token });
};

export const getToolValvesSpecById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/id/${id}/valves/spec`, { token });
};

export const updateToolValvesById = async (token: string, id: string, valves: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/id/${id}/valves/update`, {
		method: 'POST',
		token,
		body: {
			...valves
		}
	});
};

export const getUserValvesById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/id/${id}/valves/user`, { token });
};

export const getUserValvesSpecById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/id/${id}/valves/user/spec`, { token });
};

export const updateUserValvesById = async (token: string, id: string, valves: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/tools/id/${id}/valves/user/update`, {
		method: 'POST',
		token,
		body: {
			...valves
		}
	});
};
