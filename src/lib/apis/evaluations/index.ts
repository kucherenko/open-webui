import { apiRequest } from '$lib/apis/request';
import { WEBUI_API_BASE_URL } from '$lib/constants';

export const getConfig = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/evaluations/config`, { token });
};

export const updateConfig = async (token: string, config: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/evaluations/config`, {
		method: 'POST',
		token,
		body: {
			...config
		}
	});
};

export const getLeaderboard = async (token: string = '', query: string = '') => {
	let error = null;

	const searchParams = new URLSearchParams();
	if (query) searchParams.append('query', query);

	const res = await fetch(
		`${WEBUI_API_BASE_URL}/evaluations/leaderboard?${searchParams.toString()}`,
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
			console.error(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const getModelHistory = async (token: string = '', modelId: string, days: number = 30) => {
	let error = null;

	const searchParams = new URLSearchParams();
	searchParams.append('days', days.toString());

	const res = await fetch(
		`${WEBUI_API_BASE_URL}/evaluations/leaderboard/${encodeURIComponent(modelId)}/history?${searchParams.toString()}`,
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
			console.error(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const getFeedbackModelIds = async (token: string = '') => {
	return apiRequest(`${WEBUI_API_BASE_URL}/evaluations/feedbacks/models`, { token });
};

export const getFeedbackItems = async (
	token: string = '',
	orderBy,
	direction,
	page,
	modelId: string = ''
) => {
	let error = null;

	const searchParams = new URLSearchParams();
	if (orderBy) searchParams.append('order_by', orderBy);
	if (direction) searchParams.append('direction', direction);
	if (page) searchParams.append('page', page.toString());
	if (modelId) searchParams.append('model_id', modelId);

	const res = await fetch(
		`${WEBUI_API_BASE_URL}/evaluations/feedbacks/list?${searchParams.toString()}`,
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

export const exportAllFeedbacks = async (token: string = '', modelId: string = '') => {
	let error = null;

	const searchParams = new URLSearchParams();
	if (modelId) searchParams.append('model_id', modelId);

	const res = await fetch(
		`${WEBUI_API_BASE_URL}/evaluations/feedbacks/all/export?${searchParams.toString()}`,
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

export const createNewFeedback = async (token: string, feedback: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/evaluations/feedback`, {
		method: 'POST',
		token,
		body: {
			...feedback
		}
	});
};

export const getFeedbackById = async (token: string, feedbackId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/evaluations/feedback/${feedbackId}`, { token });
};

export const updateFeedbackById = async (token: string, feedbackId: string, feedback: object) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/evaluations/feedback/${feedbackId}`, {
		method: 'POST',
		token,
		body: {
			...feedback
		}
	});
};

export const deleteFeedbackById = async (token: string, feedbackId: string) => {
	return apiRequest(`${WEBUI_API_BASE_URL}/evaluations/feedback/${feedbackId}`, {
		method: 'DELETE',
		token
	});
};
