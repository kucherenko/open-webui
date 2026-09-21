import { apiRequest } from '$lib/apis/request';
import { WEBUI_BASE_URL } from '$lib/constants';

export const stopTask = async (token: string, id: string) => {
	return apiRequest(`${WEBUI_BASE_URL}/api/tasks/stop/${id}`, {
		method: 'POST',
		token,
		getError: (err) => ('detail' in err ? err.detail : err)
	});
};

export const stopTasksByChatId = async (token: string, chat_id: string) => {
	return apiRequest(`${WEBUI_BASE_URL}/api/tasks/chat/${encodeURIComponent(chat_id)}/stop`, {
		method: 'POST',
		token,
		getError: (err) => ('detail' in err ? err.detail : err)
	});
};

export const getTaskIdsByChatId = async (token: string, chat_id: string) => {
	return apiRequest(`${WEBUI_BASE_URL}/api/tasks/chat/${encodeURIComponent(chat_id)}`, {
		token,
		getError: (err) => ('detail' in err ? err.detail : err)
	});
};

export const getTaskConfig = async (token: string = '') => {
	return apiRequest(`${WEBUI_BASE_URL}/api/v1/tasks/config`, { token, getError: (err) => err });
};

export const updateTaskConfig = async (token: string, config: object) => {
	return apiRequest(`${WEBUI_BASE_URL}/api/v1/tasks/config/update`, {
		method: 'POST',
		token,
		body: config,
		getError: (err) => ('detail' in err ? err.detail : err)
	});
};

// Task endpoints report failures as `{ detail }`; anything else resolves to null.
const postTask = (token: string, task: string, body: object) =>
	apiRequest(`${WEBUI_BASE_URL}/api/v1/tasks/${task}/completions`, {
		method: 'POST',
		token,
		body,
		getError: (err) => ('detail' in err ? err.detail : null)
	});

/**
 * Parses the outermost `{...}` block of a task model's reply. Returns null when there is no
 * such block or it isn't valid JSON. `sanitizeQuotes` rewrites quote-like characters to `"` first.
 */
const parseCompletionJson = (content: string, sanitizeQuotes = false) => {
	const text = sanitizeQuotes ? content.replace(/['‘’`]/g, '"') : content;

	const jsonStartIndex = text.indexOf('{');
	const jsonEndIndex = text.lastIndexOf('}');
	if (jsonStartIndex === -1 || jsonEndIndex === -1) {
		return null;
	}

	try {
		return JSON.parse(text.substring(jsonStartIndex, jsonEndIndex + 1));
	} catch (e) {
		console.error('Failed to parse response: ', e);
		return null;
	}
};

export const generateTitle = async (
	token: string = '',
	model: string,
	messages: object[],
	chat_id?: string
) => {
	const res = await postTask(token, 'title', {
		model: model,
		messages: messages,
		...(chat_id && { chat_id: chat_id })
	});

	const parsed = parseCompletionJson(res?.choices?.[0]?.message?.content ?? '', true);
	return parsed?.title || null;
};

export const generateTags = async (
	token: string = '',
	model: string,
	messages: string,
	chat_id?: string
) => {
	const res = await postTask(token, 'tags', {
		model: model,
		messages: messages,
		...(chat_id && { chat_id: chat_id })
	});

	const parsed = parseCompletionJson(res?.choices?.[0]?.message?.content ?? '', true);
	return Array.isArray(parsed?.tags) ? parsed.tags : [];
};

export const generateEmoji = async (
	token: string = '',
	model: string,
	prompt: string,
	chat_id?: string
) => {
	const res = await postTask(token, 'emoji', {
		model: model,
		prompt: prompt,
		...(chat_id && { chat_id: chat_id })
	});

	const response = res?.choices[0]?.message?.content?.replace(/["']/g, '') ?? null;
	return response?.match(/\p{Extended_Pictographic}/gu)?.[0] ?? null;
};

export const generateQueries = async (
	token: string = '',
	model: string,
	messages: object[],
	prompt: string,
	type: string = 'web_search',
	chat_id?: string
) => {
	const res = await postTask(token, 'queries', {
		model: model,
		messages: messages,
		prompt: prompt,
		type: type,
		...(chat_id && { chat_id: chat_id })
	});

	const response = res?.choices[0]?.message?.content ?? '';
	const parsed = parseCompletionJson(response);
	if (!parsed) {
		return [response];
	}
	return Array.isArray(parsed.queries) ? parsed.queries : [];
};

export const generateAutoCompletion = async (
	token: string = '',
	model: string,
	prompt: string,
	messages?: object[],
	type: string = 'search query',
	chat_id?: string
) => {
	const res = await postTask(token, 'auto', {
		model: model,
		prompt: prompt,
		...(messages && { messages: messages }),
		type: type,
		stream: false,
		...(chat_id && { chat_id: chat_id })
	});

	const response = res?.choices[0]?.message?.content ?? '';
	const parsed = parseCompletionJson(response);
	if (!parsed) {
		return response;
	}
	return parsed.text || '';
};

export const generateMoACompletion = async (
	token: string = '',
	model: string,
	prompt: string,
	responses: string[]
) => {
	const controller = new AbortController();
	let error = null;

	const res = await fetch(`${WEBUI_BASE_URL}/api/v1/tasks/moa/completions`, {
		signal: controller.signal,
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			model: model,
			prompt: prompt,
			responses: responses,
			stream: true
		})
	}).catch((err) => {
		console.error(err);
		error = err;
		return null;
	});

	if (error) {
		throw error;
	}

	return [res, controller];
};
