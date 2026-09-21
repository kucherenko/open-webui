import { apiRequest } from '$lib/apis/request';
import { IMAGES_API_BASE_URL } from '$lib/constants';

export const getConfig = async (token: string = '') => {
	return apiRequest(`${IMAGES_API_BASE_URL}/config`, {
		token,
		getError: (err) => ('detail' in err ? err.detail : 'Server connection failed')
	});
};

export const updateConfig = async (token: string = '', config: object) => {
	return apiRequest(`${IMAGES_API_BASE_URL}/config/update`, {
		method: 'POST',
		token,
		body: {
			...config
		},
		getError: (err) => ('detail' in err ? err.detail : 'Server connection failed')
	});
};

export const verifyConfigUrl = async (token: string = '') => {
	return apiRequest(`${IMAGES_API_BASE_URL}/config/url/verify`, {
		token,
		getError: (err) => ('detail' in err ? err.detail : 'Server connection failed')
	});
};

export const getImageGenerationConfig = async (token: string = '') => {
	return apiRequest(`${IMAGES_API_BASE_URL}/image/config`, {
		token,
		getError: (err) => ('detail' in err ? err.detail : 'Server connection failed')
	});
};

export const updateImageGenerationConfig = async (token: string = '', config: object) => {
	return apiRequest(`${IMAGES_API_BASE_URL}/image/config/update`, {
		method: 'POST',
		token,
		body: { ...config },
		getError: (err) => ('detail' in err ? err.detail : 'Server connection failed')
	});
};

export const getImageGenerationModels = async (token: string = '') => {
	return apiRequest(`${IMAGES_API_BASE_URL}/models`, {
		token,
		getError: (err) => ('detail' in err ? err.detail : 'Server connection failed')
	});
};

export const imageGenerations = async (token: string = '', prompt: string) => {
	let error = null;

	const res = await fetch(`${IMAGES_API_BASE_URL}/generations`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		},
		body: JSON.stringify({
			prompt: prompt
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);
			if ('detail' in err) {
				if (Array.isArray(err.detail)) {
					error = err.detail.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join(', ');
				} else {
					error = err.detail;
				}
			} else {
				error = 'Server connection failed';
			}
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};

export const imageEdits = async (
	token: string = '',
	images: string | string[],
	prompt: string,
	model?: string,
	size?: string,
	n?: number,
	background?: string
) => {
	let error = null;

	const res = await fetch(`${IMAGES_API_BASE_URL}/edit`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		},
		body: JSON.stringify({
			form_data: {
				image: images,
				prompt,
				...(model && { model }),
				...(size && { size }),
				...(n && { n }),
				...(background && { background })
			}
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.error(err);
			if ('detail' in err) {
				if (Array.isArray(err.detail)) {
					error = err.detail.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join(', ');
				} else {
					error = err.detail;
				}
			} else {
				error = 'Server connection failed';
			}
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};
