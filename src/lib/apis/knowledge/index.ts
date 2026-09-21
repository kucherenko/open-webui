import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';

export const createNewKnowledge = async (
	token: string,
	name: string,
	description: string,
	accessGrants: object[]
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/create`, {
		method: 'POST',
		token,
		body: {
			name: name,
			description: description,
			access_grants: accessGrants
		}
	});
};

export const getExternalKnowledgeConnections = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/external/connections`, { token });
};

export const createExternalKnowledgeConnection = async (token: string, connection: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/external/connections`, {
		method: 'POST',
		token,
		body: connection
	});
};

export const updateExternalKnowledgeConnection = async (
	token: string,
	id: string,
	connection: object
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/external/connections/${id}`, {
		method: 'PATCH',
		token,
		body: connection
	});
};

export const deleteExternalKnowledgeConnection = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/external/connections/${id}`, {
		method: 'DELETE',
		token
	});
};

export const testExternalKnowledgeConnection = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/external/connections/${id}/test`, {
		method: 'POST',
		token
	});
};

export const testExternalKnowledgeRetrieval = async (
	token: string,
	id: string,
	payload: object
) => {
	let error = null;

	const res = await fetch(
		`${WEBUI_API_BASE_URL}/knowledge/external/connections/${id}/retrieve-test`,
		{
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				authorization: `Bearer ${token}`
			},
			body: JSON.stringify(payload)
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

export const testExternalKnowledgeSource = async (token: string, payload: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/external/source/test`, {
		method: 'POST',
		token,
		body: payload
	});
};

export const createExternalKnowledgeSource = async (token: string, payload: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/external/source/create`, {
		method: 'POST',
		token,
		body: payload
	});
};

export const updateExternalKnowledgeSource = async (token: string, id: string, payload: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/external/source/${id}`, {
		method: 'PATCH',
		token,
		body: payload
	});
};

export const createExternalKnowledge = async (token: string, payload: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/external/knowledge/create`, {
		method: 'POST',
		token,
		body: payload
	});
};

export const getKnowledgeBases = async (token: string = '', page: number | null = null) => {
	const searchParams = new URLSearchParams();
	if (page) searchParams.append('page', page.toString());

	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/?${searchParams.toString()}`, { token });
};

export const searchKnowledgeBases = async (
	token: string = '',
	query: string | null = null,
	viewOption: string | null = null,
	page: number | null = null,
	source: string | null = null,
	orderBy: string | null = null,
	direction: string | null = null
) => {
	const searchParams = new URLSearchParams();
	if (query) searchParams.append('query', query);
	if (viewOption) searchParams.append('view_option', viewOption);
	if (source) searchParams.append('source', source);
	if (page) searchParams.append('page', page.toString());
	if (orderBy) searchParams.append('order_by', orderBy);
	if (direction) searchParams.append('direction', direction);

	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/search?${searchParams.toString()}`, { token });
};

export const searchKnowledgeFiles = async (
	token: string,
	query?: string | null,
	viewOption?: string | null,
	orderBy?: string | null,
	direction?: string | null,
	page: number = 1,
	includeContent: boolean = false
) => {
	let error = null;

	const searchParams = new URLSearchParams();
	if (query) searchParams.append('query', query);
	if (viewOption) searchParams.append('view_option', viewOption);
	if (orderBy) searchParams.append('order_by', orderBy);
	if (direction) searchParams.append('direction', direction);
	searchParams.append('page', page.toString());
	if (includeContent) searchParams.append('include_content', 'true');

	const res = await fetch(
		`${WEBUI_API_BASE_URL}/knowledge/search/files?${searchParams.toString()}`,
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
		.then((json) => {
			return json;
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

export const getKnowledgeById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/${id}`, { token });
};

export const searchKnowledgeFilesById = async (
	token: string,
	id: string,
	query?: string | null,
	viewOption?: string | null,
	orderBy?: string | null,
	direction?: string | null,
	page: number = 1,
	directoryId?: string | null,
	includeContent: boolean = false
) => {
	let error = null;

	const searchParams = new URLSearchParams();
	if (query) searchParams.append('query', query);
	if (viewOption) searchParams.append('view_option', viewOption);
	if (orderBy) searchParams.append('order_by', orderBy);
	if (direction) searchParams.append('direction', direction);
	searchParams.append('page', page.toString());
	// directoryId: undefined = don't filter, null = root, string = specific dir
	if (directoryId !== undefined) {
		searchParams.append('directory_id', directoryId ?? '');
	}
	if (includeContent) searchParams.append('include_content', 'true');

	const res = await fetch(
		`${WEBUI_API_BASE_URL}/knowledge/${id}/files?${searchParams.toString()}`,
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
		.then((json) => {
			return json;
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

export const getPendingKnowledgeFiles = async (token: string, id: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/files/pending`, {
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
			console.error(err);
			return [];
		});

	if (error) {
		throw error;
	}

	return res;
};

export const streamPendingKnowledgeFiles = async (token: string, id: string) => {
	const res = await fetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/files/pending?stream=true`, {
		method: 'GET',
		headers: {
			Accept: 'text/event-stream',
			authorization: `Bearer ${token}`
		}
	});

	if (!res.ok) {
		throw new Error('Failed to stream pending files');
	}

	return res;
};

type KnowledgeUpdateForm = {
	name?: string;
	description?: string;
	data?: object;
	access_grants?: object[];
};

export const updateKnowledgeById = async (token: string, id: string, form: KnowledgeUpdateForm) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/${id}/update`, {
		method: 'POST',
		token,
		body: {
			name: form?.name ? form.name : undefined,
			description: form?.description ? form.description : undefined,
			data: form?.data ? form.data : undefined,
			access_grants: form.access_grants
		}
	});
};

export const updateKnowledgeAccessGrants = async (
	token: string,
	id: string,
	accessGrants: any[]
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/${id}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});
};

export const addFileToKnowledgeById = async (
	token: string,
	id: string,
	fileId: string,
	directoryId?: string | null
) => {
	const body: Record<string, string> = { file_id: fileId };
	if (directoryId) body.directory_id = directoryId;

	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/${id}/file/add`, {
		method: 'POST',
		token,
		body: body
	});
};

export const updateFileFromKnowledgeById = async (token: string, id: string, fileId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/${id}/file/update`, {
		method: 'POST',
		token,
		body: {
			file_id: fileId
		}
	});
};

export const removeFileFromKnowledgeById = async (token: string, id: string, fileId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/${id}/file/remove`, {
		method: 'POST',
		token,
		body: {
			file_id: fileId
		}
	});
};

export const resetKnowledgeById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/${id}/reset`, { method: 'POST', token });
};

export const syncKnowledgeDiff = async (
	token: string,
	id: string,
	manifest: Array<{ filename: string; path: string; checksum: string; size: number }>
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/${id}/sync/diff`, {
		method: 'POST',
		token,
		body: { manifest }
	});
};

export const syncKnowledgeCleanup = async (
	token: string,
	id: string,
	fileIds: string[],
	dirIds: string[] = []
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/${id}/sync/cleanup`, {
		method: 'POST',
		token,
		body: { file_ids: fileIds, dir_ids: dirIds }
	});
};

export const deleteKnowledgeById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/${id}/delete`, { method: 'DELETE', token });
};

export const reindexKnowledgeFiles = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/reindex`, { method: 'POST', token });
};

export const reindexKnowledgeMetadata = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/metadata/reindex`, { method: 'POST', token });
};

export const exportKnowledgeById = async (token: string, id: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/knowledge/${id}/export`, {
		method: 'GET',
		headers: {
			authorization: `Bearer ${token}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.blob();
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

// ── Directory API ───────────────────────────────────────────────────

export const createKnowledgeDirectory = async (
	token: string,
	id: string,
	name: string,
	parentId?: string | null
) => {
	const body: Record<string, string | null> = { name };
	if (parentId) body.parent_id = parentId;

	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/${id}/dirs/create`, {
		method: 'POST',
		token,
		body: body
	});
};

export const updateKnowledgeDirectory = async (
	token: string,
	id: string,
	dirId: string,
	form: { name?: string; parent_id?: string | null }
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/${id}/dirs/${dirId}/update`, {
		method: 'POST',
		token,
		body: form
	});
};

export const deleteKnowledgeDirectory = async (
	token: string,
	id: string,
	dirId: string,
	moveFiles: boolean = true
) => {
	let error = null;

	const searchParams = new URLSearchParams();
	searchParams.append('move_files', moveFiles.toString());

	const res = await fetch(
		`${WEBUI_API_BASE_URL}/knowledge/${id}/dirs/${dirId}/delete?${searchParams.toString()}`,
		{
			method: 'DELETE',
			headers: {
				Accept: 'application/json',
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

export const moveFileInKnowledge = async (
	token: string,
	id: string,
	fileId: string,
	directoryId?: string | null
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/knowledge/${id}/file/move`, {
		method: 'POST',
		token,
		body: {
			file_id: fileId,
			directory_id: directoryId ?? null
		}
	});
};
