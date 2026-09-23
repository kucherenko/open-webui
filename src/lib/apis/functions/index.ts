import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';

export const createNewFunction = async (token: string, func: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/create`, {
		method: 'POST',
		token,
		body: {
			...func
		}
	});
};

export const getFunctions = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/`, { token });
};

export const getFunctionList = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/list`, { token });
};

export const loadFunctionByUrl = async (token: string = '', url: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/load/url`, {
		method: 'POST',
		token,
		body: {
			url
		}
	});
};

export const exportFunctions = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/export`, { token });
};

export const getFunctionById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/id/${id}`, { token });
};

export const updateFunctionById = async (token: string, id: string, func: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/id/${id}/update`, {
		method: 'POST',
		token,
		body: {
			...func
		}
	});
};

export const deleteFunctionById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/id/${id}/delete`, { method: 'DELETE', token });
};

export const toggleFunctionById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/id/${id}/toggle`, { method: 'POST', token });
};

export const toggleGlobalById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/id/${id}/toggle/global`, {
		method: 'POST',
		token
	});
};

export const getFunctionValvesById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves`, { token });
};

export const getFunctionValvesSpecById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves/spec`, { token });
};

export const updateFunctionValvesById = async (token: string, id: string, valves: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves/update`, {
		method: 'POST',
		token,
		body: {
			...valves
		}
	});
};

export const getUserValvesById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves/user`, { token });
};

export const getUserValvesSpecById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves/user/spec`, { token });
};

export const updateUserValvesById = async (token: string, id: string, valves: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/functions/id/${id}/valves/user/update`, {
		method: 'POST',
		token,
		body: {
			...valves
		}
	});
};
