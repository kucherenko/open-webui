import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';

type ChannelForm = {
	type?: string;
	name: string;
	is_private?: boolean | null;
	data?: object;
	meta?: object;
	access_grants?: object[];
	group_ids?: string[];
	user_ids?: string[];
};

export const createNewChannel = async (token: string = '', channel: ChannelForm) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/create`, {
		method: 'POST',
		token,
		body: { ...channel }
	});
};

export const getChannels = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/`, { token });
};

export const getChannelById = async (token: string = '', channel_id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}`, { token });
};

export const getDMChannelByUserId = async (token: string = '', user_id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/users/${user_id}`, { token });
};

export const getChannelMembersById = async (
	token: string,
	channel_id: string,
	query?: string,
	orderBy?: string,
	direction?: string,
	page = 1,
	signal?: AbortSignal
) => {
	let error = null;
	let res = null;

	const searchParams = new URLSearchParams();

	searchParams.set('page', `${page}`);

	if (query) {
		searchParams.set('query', query);
	}

	if (orderBy) {
		searchParams.set('order_by', orderBy);
	}

	if (direction) {
		searchParams.set('direction', direction);
	}

	res = await fetch(
		`${WEBUI_API_BASE_URL}/channels/${channel_id}/members?${searchParams.toString()}`,
		{
			method: 'GET',
			signal,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		}
	)
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			if (signal?.aborted) return null;
			console.error(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const updateChannelMemberActiveStatusById = async (
	token: string = '',
	channel_id: string,
	is_active: boolean
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/members/active`, {
		method: 'POST',
		token,
		body: { is_active }
	});
};

type UpdateMembersForm = {
	user_ids?: string[];
	group_ids?: string[];
};

export const addMembersById = async (
	token: string = '',
	channel_id: string,
	formData: UpdateMembersForm
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/update/members/add`, {
		method: 'POST',
		token,
		body: { ...formData }
	});
};

type RemoveMembersForm = {
	user_ids?: string[];
	group_ids?: string[];
};

export const removeMembersById = async (
	token: string = '',
	channel_id: string,
	formData: RemoveMembersForm
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/update/members/remove`, {
		method: 'POST',
		token,
		body: { ...formData }
	});
};

export const updateChannelById = async (
	token: string = '',
	channel_id: string,
	channel: ChannelForm
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/update`, {
		method: 'POST',
		token,
		body: { ...channel }
	});
};

export const deleteChannelById = async (token: string = '', channel_id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/delete`, {
		method: 'DELETE',
		token
	});
};

export const getChannelMessages = async (
	token: string = '',
	channel_id: string,
	skip: number = 0,
	limit: number = 50
) => {
	return apiRequest(
		`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages?skip=${skip}&limit=${limit}`,
		{ token }
	);
};

export const getChannelPinnedMessages = async (
	token: string = '',
	channel_id: string,
	page: number = 1
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/pinned?page=${page}`, {
		token
	});
};

export const getChannelThreadMessages = async (
	token: string = '',
	channel_id: string,
	message_id: string,
	skip: number = 0,
	limit: number = 50
) => {
	return apiRequest(
		`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/thread?skip=${skip}&limit=${limit}`,
		{ token }
	);
};

export const getMessageData = async (
	token: string = '',
	channel_id: string,
	message_id: string
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/data`, {
		token
	});
};

type MessageForm = {
	temp_id?: string;
	reply_to_id?: string;
	parent_id?: string;
	content: string;
	data?: object;
	meta?: object;
};

export const sendMessage = async (token: string = '', channel_id: string, message: MessageForm) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/post`, {
		method: 'POST',
		token,
		body: { ...message }
	});
};

export const pinMessage = async (
	token: string = '',
	channel_id: string,
	message_id: string,
	is_pinned: boolean
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/pin`, {
		method: 'POST',
		token,
		body: { is_pinned }
	});
};

export const updateMessage = async (
	token: string = '',
	channel_id: string,
	message_id: string,
	message: MessageForm
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/update`, {
		method: 'POST',
		token,
		body: { ...message }
	});
};

export const addReaction = async (
	token: string = '',
	channel_id: string,
	message_id: string,
	name: string
) => {
	return apiRequest(
		`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/reactions/add`,
		{ method: 'POST', token, body: { name } }
	);
};

export const removeReaction = async (
	token: string = '',
	channel_id: string,
	message_id: string,
	name: string
) => {
	return apiRequest(
		`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/reactions/remove`,
		{ method: 'POST', token, body: { name } }
	);
};

export const deleteMessage = async (token: string = '', channel_id: string, message_id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/messages/${message_id}/delete`, {
		method: 'DELETE',
		token
	});
};

// Webhook API functions

type WebhookForm = {
	name: string;
	profile_image_url?: string;
};

export const getChannelWebhooks = async (token: string = '', channel_id: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/webhooks`, { token });
};

export const createChannelWebhook = async (
	token: string = '',
	channel_id: string,
	formData: WebhookForm
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/webhooks/create`, {
		method: 'POST',
		token,
		body: { ...formData }
	});
};

export const updateChannelWebhook = async (
	token: string = '',
	channel_id: string,
	webhook_id: string,
	formData: WebhookForm
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/webhooks/${webhook_id}/update`, {
		method: 'POST',
		token,
		body: { ...formData }
	});
};

export const deleteChannelWebhook = async (
	token: string = '',
	channel_id: string,
	webhook_id: string
) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/channels/${channel_id}/webhooks/${webhook_id}/delete`, {
		method: 'DELETE',
		token
	});
};
