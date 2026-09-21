import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';
import { getTimeRange } from '$lib/utils';

const getErrorDetail = (err: any) => {
	if (Array.isArray(err?.detail)) {
		return err.detail.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join(', ');
	}

	return err?.detail ?? err;
};

export const getChatConfig = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/config`, { token, getError: getErrorDetail });
};

export const updateChatConfig = async (token: string, config: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/config`, {
		method: 'POST',
		token,
		body: config,
		getError: getErrorDetail
	});
};

export const createNewChat = async (
	token: string,
	chat: object,
	folderId: string | null,
	variables: object | null = null
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/new`, {
		method: 'POST',
		token,
		body: {
			chat: chat,
			...(variables !== null ? { variables } : {}),
			folder_id: folderId ?? null
		},
		getError: getErrorDetail
	});
};

export const unarchiveAllChats = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/unarchive/all`, { method: 'POST', token });
};

export const unshareAllChats = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/share/all`, { method: 'DELETE', token });
};

export const importChats = async (token: string, chats: object[]) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/import`, {
		method: 'POST',
		token,
		body: {
			chats
		},
		getError: getErrorDetail
	});
};

export const getChatList = async (
	token: string = '',
	page: number | null = null,
	include_pinned: boolean = false,
	include_folders: boolean = false
) => {
	const searchParams = new URLSearchParams();

	if (page !== null) {
		searchParams.append('page', `${page}`);
	}

	if (include_folders) {
		searchParams.append('include_folders', 'true');
	}

	if (include_pinned) {
		searchParams.append('include_pinned', 'true');
	}

	const res = await apiRequest(`${WEBUI_API_BASE_URL}/chats/?${searchParams.toString()}`, {
		token,
		getError: getErrorDetail
	});

	if (!res) {
		return [];
	}

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getChatListByUserId = async (
	token: string = '',
	userId: string,
	page: number = 1,
	filter?: object
) => {
	const searchParams = new URLSearchParams();

	searchParams.append('page', `${page}`);

	if (filter) {
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				searchParams.append(key, value.toString());
			}
		});
	}

	const res = await apiRequest(
		`${WEBUI_API_BASE_URL}/chats/list/user/${userId}?${searchParams.toString()}`,
		{ token, getError: getErrorDetail }
	);

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getArchivedChatList = async (
	token: string = '',
	page: number = 1,
	filter?: object
) => {
	const searchParams = new URLSearchParams();
	searchParams.append('page', `${page}`);

	if (filter) {
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				searchParams.append(key, value.toString());
			}
		});
	}

	const res = await apiRequest(`${WEBUI_API_BASE_URL}/chats/archived?${searchParams.toString()}`, {
		token,
		getError: getErrorDetail
	});

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getArchivedChatCount = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/archived/count`, {
		token,
		getError: getErrorDetail
	});
};

export const getSharedChatList = async (token: string = '', page: number = 1, filter?: object) => {
	const searchParams = new URLSearchParams();
	searchParams.append('page', `${page}`);

	if (filter) {
		Object.entries(filter).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				searchParams.append(key, value.toString());
			}
		});
	}

	const res = await apiRequest(`${WEBUI_API_BASE_URL}/chats/shared?${searchParams.toString()}`, {
		token,
		getError: getErrorDetail
	});

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getAllChats = async (token: string) => {
	const res = await fetch(`${WEBUI_API_BASE_URL}/chats/all`, {
		method: 'GET',
		headers: {
			Accept: 'application/x-ndjson',
			...(token && { authorization: `Bearer ${token}` })
		}
	});

	if (!res.ok) {
		const err = await res.json();
		console.error(err);
		throw err;
	}

	const reader = res.body?.getReader();
	if (!reader) {
		throw new Error('Response body is not readable');
	}

	const decoder = new TextDecoder();
	const chats: object[] = [];
	let buffer = '';

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split('\n');
		// Keep the last potentially incomplete line in the buffer
		buffer = lines.pop() ?? '';

		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed) {
				chats.push(JSON.parse(trimmed));
			}
		}
	}

	// Process any remaining data in the buffer
	const remaining = buffer.trim();
	if (remaining) {
		chats.push(JSON.parse(remaining));
	}

	return chats;
};

export const getChatListBySearchText = async (token: string, text: string, page: number = 1) => {
	const searchParams = new URLSearchParams();
	searchParams.append('text', text);
	searchParams.append('page', `${page}`);

	const res = await apiRequest(`${WEBUI_API_BASE_URL}/chats/search?${searchParams.toString()}`, {
		token,
		getError: getErrorDetail
	});

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getChatsByFolderId = async (token: string, folderId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/folder/${folderId}`, {
		token,
		getError: getErrorDetail
	});
};

export const getChatListByFolderId = async (token: string, folderId: string, page: number = 1) => {
	const searchParams = new URLSearchParams();
	if (page !== null) {
		searchParams.append('page', `${page}`);
	}

	return apiRequest(
		`${WEBUI_API_BASE_URL}/chats/folder/${folderId}/list?${searchParams.toString()}`,
		{ token, getError: getErrorDetail }
	);
};

export const getAllArchivedChats = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/all/archived`, {
		token,
		getError: getErrorDetail
	});
};

export const getAllUserChats = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/all/db`, { token, getError: getErrorDetail });
};

export const getAllTags = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/all/tags`, { token, getError: getErrorDetail });
};

export const getPinnedChatList = async (token: string = '') => {
	const res = await apiRequest(`${WEBUI_API_BASE_URL}/chats/pinned`, {
		token,
		getError: getErrorDetail
	});

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getChatListByTagName = async (token: string = '', tagName: string) => {
	const res = await apiRequest(`${WEBUI_API_BASE_URL}/chats/tags`, {
		method: 'POST',
		token,
		body: {
			name: tagName
		},
		getError: getErrorDetail
	});

	return res.map((chat) => ({
		...chat,
		time_range: getTimeRange(chat.updated_at)
	}));
};

export const getChatById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}`, { token });
};

export const getChatByShareId = async (token: string, share_id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/share/${share_id}`, {
		token,
		getError: getErrorDetail
	});
};

export const getChatPinnedStatusById = async (token: string, id: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/pinned`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.then((json) => {
			return json;
		})
		.catch((err) => {
			error = err;

			if ('detail' in err) {
				error = err.detail;
			} else {
				error = err;
			}

			console.error(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const toggleChatPinnedStatusById = async (token: string, id: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/pin`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.then((json) => {
			return json;
		})
		.catch((err) => {
			error = err;

			if ('detail' in err) {
				error = err.detail;
			} else {
				error = err;
			}

			console.error(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const markChatUnreadById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}/unread`, {
		method: 'POST',
		token,
		getError: (err) => ('detail' in err ? err.detail : err)
	});
};

export const markChatsRead = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/read`, {
		method: 'POST',
		token,
		getError: (err) => ('detail' in err ? err.detail : err)
	});
};

export const cloneChatById = async (token: string, id: string, title?: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/clone`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		},
		body: JSON.stringify({
			...(title && { title: title })
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.then((json) => {
			return json;
		})
		.catch((err) => {
			error = err;

			if ('detail' in err) {
				error = err.detail;
			} else {
				error = err;
			}

			console.error(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const forkChatById = async (token: string, id: string, messageId?: string | null) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/fork`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		},
		body: JSON.stringify({
			message_id: messageId ?? null
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.then((json) => {
			return json;
		})
		.catch((err) => {
			error = err;

			if ('detail' in err) {
				error = err.detail;
			} else {
				error = err;
			}

			console.error(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const cloneSharedChatById = async (token: string, id: string) => {
	let error = null;

	const res = await fetch(`${WEBUI_API_BASE_URL}/chats/${id}/clone/shared`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.then((json) => {
			return json;
		})
		.catch((err) => {
			error = err;

			if ('detail' in err) {
				error = err.detail;
			} else {
				error = err;
			}

			console.error(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const shareChatById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}/share`, {
		method: 'POST',
		token,
		getError: getErrorDetail
	});
};

export const updateChatFolderIdById = async (token: string, id: string, folderId?: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}/folder`, {
		method: 'POST',
		token,
		body: {
			folder_id: folderId
		},
		getError: getErrorDetail
	});
};

export const archiveChatById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}/archive`, {
		method: 'POST',
		token,
		getError: getErrorDetail
	});
};

export const deleteSharedChatById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}/share`, {
		method: 'DELETE',
		token,
		getError: getErrorDetail
	});
};

export const updateChatAccessGrants = async (token: string, id: string, accessGrants: object[]) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/shared/${id}/access/update`, {
		method: 'POST',
		token,
		body: {
			access_grants: accessGrants
		},
		getError: getErrorDetail
	});
};

export const getChatAccessGrants = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/shared/${id}/access`, {
		token,
		getError: getErrorDetail
	});
};

export const updateChatById = async (
	token: string,
	id: string,
	chat: object,
	variables: object | null = null
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}`, {
		method: 'POST',
		token,
		body: {
			chat: chat,
			...(variables !== null ? { variables } : {})
		},
		getError: getErrorDetail
	});
};

export const compactChatById = async (token: string, id: string, model?: string | null) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}/compact`, {
		method: 'POST',
		token,
		body: { model },
		getError: getErrorDetail
	});
};

export const deleteChatMessageById = async (token: string, id: string, messageId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}/messages/${messageId}`, {
		method: 'DELETE',
		token,
		getError: getErrorDetail
	});
};

export const resolveChatMessageToolCall = async (
	token: string,
	id: string,
	messageId: string,
	callId: string,
	action: 'approve' | 'reject' | 'answer',
	options: { answers?: unknown; timed_out?: boolean } = {}
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}/messages/${messageId}/resolve`, {
		method: 'POST',
		token,
		body: {
			call_id: callId,
			action,
			...options
		},
		getError: getErrorDetail
	});
};

export const deleteChatById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}`, { method: 'DELETE', token });
};

export const getTagsById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}/tags`, { token, getError: getErrorDetail });
};

export const addTagById = async (token: string, id: string, tagName: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}/tags`, {
		method: 'POST',
		token,
		body: {
			name: tagName
		}
	});
};

export const deleteTagById = async (token: string, id: string, tagName: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/${id}/tags`, {
		method: 'DELETE',
		token,
		body: {
			name: tagName
		},
		getError: getErrorDetail
	});
};

export const deleteAllChats = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/`, { method: 'DELETE', token });
};

export const archiveAllChats = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/archive/all`, { method: 'POST', token });
};
export const exportChatStats = async (token: string, page: number = 1, params: object = {}) => {
	const searchParams = new URLSearchParams();
	searchParams.append('page', `${page}`);

	if (params) {
		for (const [key, value] of Object.entries(params)) {
			searchParams.append(key, `${value}`);
		}
	}

	return apiRequest(`${WEBUI_API_BASE_URL}/chats/stats/export?${searchParams.toString()}`, {
		token,
		getError: getErrorDetail
	});
};

export const exportSingleChatStats = async (token: string, chatId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/chats/stats/export/${chatId}`, {
		token,
		getError: getErrorDetail
	});
};

export const downloadChatStats = async (
	token: string = '',
	updated_at: number | null = null
): Promise<[Response | null, AbortController]> => {
	const controller = new AbortController();
	let error = null;

	let url = `${WEBUI_API_BASE_URL}/chats/stats/export?stream=true`;
	if (updated_at) url += `&updated_at=${updated_at}`;

	const res = await fetch(url, {
		signal: controller.signal,
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	}).catch((err) => {
		console.error(err);
		error = getErrorDetail(err);
		return null;
	});

	if (error) {
		throw error;
	}

	return [res, controller];
};
