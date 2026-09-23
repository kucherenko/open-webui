import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';
import { getUserPosition } from '$lib/utils';

export const getUserGroups = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/groups`, { token });
};

export const getUserDefaultPermissions = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/default/permissions`, { token });
};

export const updateUserDefaultPermissions = async (token: string, permissions: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/default/permissions`, {
		method: 'POST',
		token,
		body: {
			...permissions
		}
	});
};

export const getUserDefaultPermissionsDefaults = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/default/permissions/defaults`, { token });
};

export const updateUserRole = async (token: string, id: string, role: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/update/role`, {
		method: 'POST',
		token,
		body: {
			id: id,
			role: role
		}
	});
};

export const getUsers = async (
	token: string,
	query?: string,
	orderBy?: string,
	direction?: string,
	page = 1
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

	res = await fetch(`${WEBUI_API_BASE_URL}/users/?${searchParams.toString()}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const searchUsers = async (
	token: string,
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

	res = await fetch(`${WEBUI_API_BASE_URL}/users/search?${searchParams.toString()}`, {
		method: 'GET',
		signal,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	})
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

export const getAllUsers = async (token: string) => {
	let error = null;
	let res = null;

	res = await fetch(`${WEBUI_API_BASE_URL}/users/all`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);
			error = err.detail;
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const getUserSettings = async (token: string, raw = false) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/user/settings${raw ? '?raw=true' : ''}`, {
		token,
		getError: (err) => err?.detail ?? err
	});
};

export const updateUserSettings = async (token: string, settings: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/user/settings/update`, {
		method: 'POST',
		token,
		body: {
			...settings
		}
	});
};

export const getUserInfoById = async (token: string, userId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/${userId}/info`, { token });
};

export const updateUserStatus = async (token: string, formData: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/user/status/update`, {
		method: 'POST',
		token,
		body: {
			...formData
		}
	});
};

export const getUserInfo = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/user/info`, { token });
};

export const updateUserInfo = async (token: string, info: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/user/info/update`, {
		method: 'POST',
		token,
		body: {
			...info
		}
	});
};

export const getUserVariables = async (token: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/user/variables`, { token });
};

export const updateUserVariables = async (token: string, variables: Record<string, string>) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/user/variables/update`, {
		method: 'POST',
		token,
		body: {
			variables
		}
	});
};

export const getAndUpdateUserLocation = async (token: string) => {
	const location = await getUserPosition().catch((err) => {
		console.error(err);
		return null;
	});

	if (location) {
		await updateUserInfo(token, { location: location });
		return location;
	} else {
		console.info('Failed to get user location');
		return null;
	}
};

export const getUserActiveStatusById = async (token: string, userId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/${userId}/active`, { token });
};

export const deleteUserById = async (token: string, userId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/${userId}`, { method: 'DELETE', token });
};

type UserUpdateForm = {
	role: string;
	profile_image_url: string;
	email: string;
	name: string;
	password: string;
};

export const updateUserById = async (token: string, userId: string, user: UserUpdateForm) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/${userId}/update`, {
		method: 'POST',
		token,
		body: {
			profile_image_url: user.profile_image_url,
			role: user.role,
			email: user.email,
			name: user.name,
			password: user.password !== '' ? user.password : undefined
		}
	});
};

export const getUserGroupsById = async (token: string, userId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/${userId}/groups`, { token });
};

export const getUserPreview = async (token: string, userId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/users/${userId}/preview`, { token });
};

export type UserUsageHeatmapEntry = {
	date: string;
	messages: number;
	chats: number;
	tokens: number;
	models: Record<string, number>;
};

export type UserUsageResponse = {
	totals: {
		lifetime_tokens: number;
		input_tokens: number;
		output_tokens: number;
		peak_daily_tokens: number;
		longest_chat_seconds: number;
		current_streak: number;
		longest_streak: number;
		total_chats: number;
		active_days: number;
		models_used: number;
		messages: number;
		user_messages: number;
		assistant_messages: number;
	};
	heatmap: UserUsageHeatmapEntry[];
	weekly_heatmap: UserUsageHeatmapEntry[];
	cumulative_heatmap: UserUsageHeatmapEntry[];
	insights: {
		most_used_model: string | null;
		average_tokens_per_chat: number;
		average_messages_per_active_day: number;
		user_message_share: number;
		assistant_message_share: number;
	};
	top_models: Array<{
		model_id: string;
		messages: number;
		input_tokens: number;
		output_tokens: number;
		total_tokens: number;
	}>;
	top_tools: Array<{ name: string; count: number }>;
	period: {
		start_date: number;
		end_date: number;
		days: number;
	};
};

export const getUserUsage = async (
	token: string,
	options: { days?: number; startDate?: number | null; endDate?: number | null } = {}
): Promise<UserUsageResponse | null> => {
	const searchParams = new URLSearchParams();

	if (options.days) searchParams.append('days', options.days.toString());
	if (options.startDate) searchParams.append('start_date', options.startDate.toString());
	if (options.endDate) searchParams.append('end_date', options.endDate.toString());

	return apiRequest(`${WEBUI_API_BASE_URL}/users/usage?${searchParams.toString()}`, { token });
};
