import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';

export const getModelAnalytics = async (
	token: string = '',
	startDate: number | null = null,
	endDate: number | null = null,
	groupId: string | null = null
) => {
	const searchParams = new URLSearchParams();
	if (startDate) searchParams.append('start_date', startDate.toString());
	if (endDate) searchParams.append('end_date', endDate.toString());
	if (groupId) searchParams.append('group_id', groupId);

	return apiRequest(`${WEBUI_API_BASE_URL}/analytics/models?${searchParams.toString()}`, { token });
};

export const getUserAnalytics = async (
	token: string = '',
	startDate: number | null = null,
	endDate: number | null = null,
	limit: number = 50,
	groupId: string | null = null
) => {
	const searchParams = new URLSearchParams();
	if (startDate) searchParams.append('start_date', startDate.toString());
	if (endDate) searchParams.append('end_date', endDate.toString());
	if (limit) searchParams.append('limit', limit.toString());
	if (groupId) searchParams.append('group_id', groupId);

	return apiRequest(`${WEBUI_API_BASE_URL}/analytics/users?${searchParams.toString()}`, { token });
};

export const getMessages = async (
	token: string = '',
	modelId: string | null = null,
	userId: string | null = null,
	chatId: string | null = null,
	startDate: number | null = null,
	endDate: number | null = null,
	skip: number = 0,
	limit: number = 50
) => {
	const searchParams = new URLSearchParams();
	if (modelId) searchParams.append('model_id', modelId);
	if (userId) searchParams.append('user_id', userId);
	if (chatId) searchParams.append('chat_id', chatId);
	if (startDate) searchParams.append('start_date', startDate.toString());
	if (endDate) searchParams.append('end_date', endDate.toString());
	if (skip) searchParams.append('skip', skip.toString());
	if (limit) searchParams.append('limit', limit.toString());

	return apiRequest(`${WEBUI_API_BASE_URL}/analytics/messages?${searchParams.toString()}`, {
		token
	});
};

export const getSummary = async (
	token: string = '',
	startDate: number | null = null,
	endDate: number | null = null,
	groupId: string | null = null
) => {
	const searchParams = new URLSearchParams();
	if (startDate) searchParams.append('start_date', startDate.toString());
	if (endDate) searchParams.append('end_date', endDate.toString());
	if (groupId) searchParams.append('group_id', groupId);

	return apiRequest(`${WEBUI_API_BASE_URL}/analytics/summary?${searchParams.toString()}`, {
		token
	});
};

export const getDailyStats = async (
	token: string = '',
	startDate: number | null = null,
	endDate: number | null = null,
	granularity: 'hourly' | 'daily' = 'daily',
	groupId: string | null = null
) => {
	const searchParams = new URLSearchParams();
	if (startDate) searchParams.append('start_date', startDate.toString());
	if (endDate) searchParams.append('end_date', endDate.toString());
	searchParams.append('granularity', granularity);
	if (groupId) searchParams.append('group_id', groupId);

	return apiRequest(`${WEBUI_API_BASE_URL}/analytics/daily?${searchParams.toString()}`, { token });
};

export const getTokenUsage = async (
	token: string = '',
	startDate: number | null = null,
	endDate: number | null = null,
	groupId: string | null = null
) => {
	const searchParams = new URLSearchParams();
	if (startDate) searchParams.append('start_date', startDate.toString());
	if (endDate) searchParams.append('end_date', endDate.toString());
	if (groupId) searchParams.append('group_id', groupId);

	return apiRequest(`${WEBUI_API_BASE_URL}/analytics/tokens?${searchParams.toString()}`, { token });
};

export const getModelChats = async (
	token: string = '',
	modelId: string,
	startDate: number | null = null,
	endDate: number | null = null,
	skip: number = 0,
	limit: number = 50,
	orderBy: string | null = null,
	direction: string | null = null
) => {
	const searchParams = new URLSearchParams();
	if (startDate) searchParams.append('start_date', startDate.toString());
	if (endDate) searchParams.append('end_date', endDate.toString());
	if (skip) searchParams.append('skip', skip.toString());
	if (limit) searchParams.append('limit', limit.toString());
	if (orderBy) searchParams.append('order_by', orderBy);
	if (direction) searchParams.append('direction', direction);

	return apiRequest(
		`${WEBUI_API_BASE_URL}/analytics/models/${encodeURIComponent(modelId)}/chats?${searchParams.toString()}`,
		{ token }
	);
};

export const getModelOverview = async (token: string = '', modelId: string, days: number = 30) => {
	const searchParams = new URLSearchParams();
	searchParams.append('days', days.toString());

	return apiRequest(
		`${WEBUI_API_BASE_URL}/analytics/models/${encodeURIComponent(modelId)}/overview?${searchParams.toString()}`,
		{ token }
	);
};
