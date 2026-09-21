import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';

export const getModelItems = async (
	token: string = '',
	query,
	viewOption,
	selectedTag,
	orderBy,
	direction,
	page
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

	return apiRequest(`${WEBUI_API_BASE_URL}/models/list?${searchParams.toString()}`, {
		token,
		getError: (err) => err
	});
};

export const getModelTags = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/models/tags`, { token, getError: (err) => err });
};

export const getBaseModelTags = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/models/base/tags`, { token, getError: (err) => err });
};

export const importModels = async (token: string, models: object[]) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/models/import`, {
		method: 'POST',
		token,
		body: { models: models },
		getError: (err) => err
	});
};

export const getBaseModels = async (token: string = '', tag: string = '') => {
	const searchParams = new URLSearchParams();
	if (tag) {
		searchParams.append('tag', tag);
	}

	return apiRequest(`${WEBUI_API_BASE_URL}/models/base?${searchParams.toString()}`, {
		token,
		getError: (err) => err
	});
};

export const createNewModel = async (token: string, model: object) => {
	const { id, base_model_id, name, meta, params, access_grants, is_active } = model as any;
	const payload = { id, base_model_id, name, meta, params, access_grants, is_active };

	return apiRequest(`${WEBUI_API_BASE_URL}/models/create`, {
		method: 'POST',
		token,
		body: payload
	});
};

export const getModelById = async (token: string, id: string) => {
	const searchParams = new URLSearchParams();
	searchParams.append('id', id);

	return apiRequest(`${WEBUI_API_BASE_URL}/models/model?${searchParams.toString()}`, {
		token,
		getError: (err) => err
	});
};

export const toggleModelById = async (token: string, id: string) => {
	const searchParams = new URLSearchParams();
	searchParams.append('id', id);

	return apiRequest(`${WEBUI_API_BASE_URL}/models/model/toggle?${searchParams.toString()}`, {
		method: 'POST',
		token,
		getError: (err) => err
	});
};

export const updateModelById = async (token: string, id: string, model: object) => {
	const { base_model_id, name, meta, params, access_grants, is_active } = model as any;
	const payload = { id, base_model_id, name, meta, params, access_grants, is_active };

	return apiRequest(`${WEBUI_API_BASE_URL}/models/model/update`, {
		method: 'POST',
		token,
		body: payload,
		getError: (err) => err
	});
};

export const updateModelAccessGrants = async (
	token: string,
	id: string,
	name: string,
	accessGrants: any[]
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/models/model/access/update`, {
		method: 'POST',
		token,
		body: { id, name, access_grants: accessGrants },
		getError: (err) => err
	});
};

export const deleteModelById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/models/model/delete`, {
		method: 'POST',
		token,
		body: { id }
	});
};

export const deleteAllModels = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/models/delete/all`, {
		method: 'DELETE',
		token,
		getError: (err) => err
	});
};
