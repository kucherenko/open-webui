type ApiRequestOptions = {
	method?: string;
	token?: string;
	body?: unknown;
	credentials?: RequestCredentials;
	getError?: (err: any) => unknown;
};

/**
 * Shared JSON request wrapper for the API clients: sends a JSON request with the
 * bearer token, parses the JSON response, and rethrows the server's error detail
 * (resolved via `getError`, `err.detail` by default) on a non-2xx response.
 * Resolves to `null` if the request fails without a usable error value.
 */
export const apiRequest = async (
	url: string,
	{
		method = 'GET',
		token,
		body,
		credentials,
		getError = (err) => err.detail
	}: ApiRequestOptions = {}
): Promise<any> => {
	let error = null;

	const res = await fetch(url, {
		method,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		},
		...(body !== undefined && { body: JSON.stringify(body) }),
		...(credentials && { credentials })
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = getError(err);
			console.error(err);
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
};
