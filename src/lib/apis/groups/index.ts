import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';

export const createNewGroup = async (token: string, group: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/groups/create`, {
		method: 'POST',
		token,
		body: {
			...group
		}
	});
};

export const getGroups = async (token: string = '', share?: boolean) => {
	const searchParams = new URLSearchParams();
	if (share !== undefined) {
		searchParams.append('share', String(share));
	}

	return apiRequest(`${WEBUI_API_BASE_URL}/groups/?${searchParams.toString()}`, { token });
};

export const getGroupById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/groups/id/${id}`, { token });
};

export const getGroupInfoById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/groups/id/${id}/info`, { token });
};

export const updateGroupById = async (token: string, id: string, group: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/groups/id/${id}/update`, {
		method: 'POST',
		token,
		body: {
			...group
		}
	});
};

export const deleteGroupById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/groups/id/${id}/delete`, { method: 'DELETE', token });
};

export const addUserToGroup = async (token: string, id: string, userIds: string[]) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/groups/id/${id}/users/add`, {
		method: 'POST',
		token,
		body: {
			user_ids: userIds
		}
	});
};

export const removeUserFromGroup = async (token: string, id: string, userIds: string[]) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/groups/id/${id}/users/remove`, {
		method: 'POST',
		token,
		body: {
			user_ids: userIds
		}
	});
};

export const getGroupPreview = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/groups/id/${id}/preview`, { token });
};
