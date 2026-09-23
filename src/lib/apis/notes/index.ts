import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';
import { getTimeRange } from '$lib/utils';

type NoteItem = {
	title: string;
	data: object;
	meta?: null | object;
	access_grants?: object[];
};

export const createNewNote = async (token: string, note: NoteItem) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/notes/create`, {
		method: 'POST',
		token,
		body: {
			...note
		}
	});
};

export const getNotes = async (token: string = '', raw: boolean = false) => {
	const res = await apiRequest(`${WEBUI_API_BASE_URL}/notes/`, { token });

	if (raw) {
		return res; // Return raw response if requested
	}

	if (!Array.isArray(res)) {
		return {}; // or throw new Error("Notes response is not an array")
	}

	// Build the grouped object
	const grouped: Record<string, any[]> = {};
	for (const note of res) {
		const timeRange = getTimeRange(note.updated_at / 1000000000);
		if (!grouped[timeRange]) {
			grouped[timeRange] = [];
		}
		grouped[timeRange].push({
			...note,
			timeRange
		});
	}

	return grouped;
};

export const searchNotes = async (
	token: string = '',
	query: string | null = null,
	viewOption: string | null = null,
	permission: string | null = null,
	sortKey: string | null = null,
	page: number | null = null,
	direction: string | null = null
) => {
	const searchParams = new URLSearchParams();

	if (query !== null) {
		searchParams.append('query', query);
	}

	if (viewOption !== null) {
		searchParams.append('view_option', viewOption);
	}

	if (permission !== null) {
		searchParams.append('permission', permission);
	}

	if (sortKey !== null) {
		searchParams.append('order_by', sortKey);
	}

	if (direction !== null) {
		searchParams.append('direction', direction);
	}

	if (page !== null) {
		searchParams.append('page', `${page}`);
	}

	return apiRequest(`${WEBUI_API_BASE_URL}/notes/search?${searchParams.toString()}`, { token });
};

export const getNoteList = async (token: string = '', page: number | null = null) => {
	const searchParams = new URLSearchParams();

	if (page !== null) {
		searchParams.append('page', `${page}`);
	}

	return apiRequest(`${WEBUI_API_BASE_URL}/notes/?${searchParams.toString()}`, { token });
};

export const getNoteById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/notes/${id}`, { token });
};

export const getNoteChatById = async (token: string, id: string) => {
	let error = null;
	const url = `${WEBUI_API_BASE_URL}/notes/${id}/chat`;

	console.info('[note-chat] fetching linked chat', { noteId: id, url });

	const res = await fetch(url, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: `Bearer ${token}`
		}
	})
		.then(async (res) => {
			console.info('[note-chat] linked chat response', {
				noteId: id,
				status: res.status,
				ok: res.ok
			});
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = err.detail;
			console.error('[note-chat] linked chat request failed', { noteId: id, error: err });
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const getNoteChatsById = async (token: string, id: string) => {
	const url = `${WEBUI_API_BASE_URL}/notes/${id}/chats`;

	return apiRequest(url, { token });
};

export const createNoteChatById = async (token: string, id: string) => {
	const url = `${WEBUI_API_BASE_URL}/notes/${id}/chat`;

	return apiRequest(url, { method: 'POST', token });
};

export const updateNoteById = async (token: string, id: string, note: NoteItem) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/notes/${id}/update`, {
		method: 'POST',
		token,
		body: {
			...note
		}
	});
};

export const updateNoteAccessGrants = async (token: string, id: string, accessGrants: any[]) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/notes/${id}/access/update`, {
		method: 'POST',
		token,
		body: { access_grants: accessGrants }
	});
};

export const deleteNoteById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/notes/${id}/delete`, { method: 'DELETE', token });
};

export const getPinnedNoteList = async (token: string = '') => {
	const res = await apiRequest(`${WEBUI_API_BASE_URL}/notes/pinned`, { token });

	return res ?? [];
};

export const toggleNotePinnedStatusById = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/notes/${id}/pin`, { method: 'POST', token });
};
