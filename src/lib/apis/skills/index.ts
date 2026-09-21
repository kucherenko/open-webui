import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';

export const createNewSkill = async (token: string, skill: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/skills/create`, {
		method: 'POST',
		token,
		body: {
			...skill
		}
	});
};

export const getSkills = async (token: string = '', query: string | null = null) => {
	const searchParams = new URLSearchParams();
	if (query) searchParams.append('query', query);

	return apiRequest(`${WEBUI_API_BASE_URL}/skills/?${searchParams.toString()}`, { token });
};

export const getSkillList = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/skills/list`, { token });
};

export const getSkillItems = async (
	token: string = '',
	query: string | null = null,
	viewOption: string | null = null,
	page: number | null = null,
	orderBy: string | null = null,
	direction: string | null = null
) => {
	const searchParams = new URLSearchParams();
	if (query) searchParams.append('query', query);
	if (viewOption) searchParams.append('view_option', viewOption);
	if (page) searchParams.append('page', page.toString());
	if (orderBy) searchParams.append('order_by', orderBy);
	if (direction) searchParams.append('direction', direction);

	return apiRequest(`${WEBUI_API_BASE_URL}/skills/list?${searchParams.toString()}`, {
		token,
		getError: (err) => err
	});
};

export const exportSkills = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/skills/export`, { token });
};

export const getSkillById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/skills/id/${id}`, { token });
};

export const updateSkillById = async (token: string, id: string, skill: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/skills/id/${id}/update`, {
		method: 'POST',
		token,
		body: {
			...skill
		}
	});
};

export const updateSkillAccessGrants = async (token: string, id: string, accessGrants: any[]) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/skills/id/${id}/access/update`, {
		method: 'POST',
		token,
		body: {
			access_grants: accessGrants
		}
	});
};

export const toggleSkillById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/skills/id/${id}/toggle`, { method: 'POST', token });
};

export const deleteSkillById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/skills/id/${id}/delete`, { method: 'DELETE', token });
};
