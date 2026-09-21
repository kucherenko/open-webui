import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';

type FolderForm = {
	name?: string;
	data?: Record<string, any>;
	meta?: Record<string, any>;
	parent_id?: string | null;
};

export const createNewFolder = async (token: string, folderForm: FolderForm) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/folders/`, { method: 'POST', token, body: folderForm });
};

export const getFolders = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/folders/`, { token });
};

export const getFolderById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/folders/${id}`, { token });
};

export const updateFolderById = async (token: string, id: string, folderForm: FolderForm) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/folders/${id}/update`, {
		method: 'POST',
		token,
		body: folderForm
	});
};

export const updateFolderIsExpandedById = async (
	token: string,
	id: string,
	isExpanded: boolean
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/folders/${id}/update/expanded`, {
		method: 'POST',
		token,
		body: {
			is_expanded: isExpanded
		}
	});
};

export const updateFolderParentIdById = async (token: string, id: string, parentId?: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/folders/${id}/update/parent`, {
		method: 'POST',
		token,
		body: {
			parent_id: parentId
		}
	});
};

export const deleteFolderById = async (token: string, id: string, deleteContents: boolean) => {
	const searchParams = new URLSearchParams();
	searchParams.append('delete_contents', deleteContents ? 'true' : 'false');

	return apiRequest(`${WEBUI_API_BASE_URL}/folders/${id}?${searchParams.toString()}`, {
		method: 'DELETE',
		token
	});
};

export const markFolderChatsReadById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/folders/${id}/read`, { method: 'POST', token });
};

export const updateFolderAccessById = async (token: string, id: string, accessGrants: any[]) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/folders/${id}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});
};

export const getSharedFolders = async (token: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/folders/shared`, {
		method: 'GET',
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
			return [];
		});

	if (error) {
		throw error;
	}

	return res;
};

export const getSharedFolderChats = async (
	token: string,
	folderId: string,
	params: {
		page?: number | null;
		sortBy?: 'title' | 'updated_at';
		sortDir?: 'asc' | 'desc';
	} = {}
) => {
	let error = null;

	const searchParams = new URLSearchParams();
	if (params.page !== undefined && params.page !== null) {
		searchParams.append('page', `${params.page}`);
	}
	if (params.sortBy) {
		searchParams.append('sort_by', params.sortBy);
	}
	if (params.sortDir) {
		searchParams.append('sort_dir', params.sortDir);
	}
	const query = searchParams.toString();

	const res = await fetch(
		`${WEBUI_API_BASE_URL}/folders/${folderId}/shared/chats${query ? `?${query}` : ''}`,
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
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};
