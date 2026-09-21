import { convertOpenApiToToolPayload } from '$lib/utils';

const TOOL_SERVER_FETCH_TIMEOUT = 10000;

// Valid HTTP methods per OpenAPI 3.x – used to skip extension keys (x-*)
// and non-operation path-item fields (summary, description, servers, parameters).
const OPENAPI_HTTP_METHODS = new Set([
	'get',
	'put',
	'post',
	'delete',
	'options',
	'head',
	'patch',
	'trace'
]);

export const getToolServerData = async (token: string, url: string) => {
	let error = null;

	const res = await fetch(`${url}`, {
		signal: AbortSignal.timeout(TOOL_SERVER_FETCH_TIMEOUT),
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		}
	})
		.then(async (res) => {
			// Check if URL ends with .yaml or .yml to determine format
			if (url.toLowerCase().endsWith('.yaml') || url.toLowerCase().endsWith('.yml')) {
				if (!res.ok) throw await res.text();
				const [text, { parse }] = await Promise.all([res.text(), import('yaml')]);
				return parse(text);
			} else {
				if (!res.ok) throw await res.json();
				return res.json();
			}
		})
		.catch((err) => {
			console.error(err);
			if (err?.name === 'TimeoutError') {
				error = `Connection to ${url} timed out`;
			} else if ('detail' in err) {
				error = err.detail;
			} else {
				error = err;
			}
			return null;
		});

	if (error) {
		throw error;
	}

	console.log(res);
	return res;
};

export const getToolServersData = async (servers: object[]) => {
	return (
		await Promise.all(
			servers
				.filter((server) => server?.config?.enable)
				.map(async (server) => {
					let error = null;

					let toolServerToken = null;

					const auth_type = server?.auth_type ?? 'bearer';
					if (auth_type === 'bearer') {
						toolServerToken = server?.key;
					} else if (auth_type === 'none') {
						// No authentication
					} else if (auth_type === 'session') {
						toolServerToken = localStorage.token;
					}

					let res = null;
					const specType = server?.spec_type ?? 'url';

					if (specType === 'url') {
						res = await getToolServerData(
							toolServerToken,
							(server?.path ?? '').includes('://')
								? server?.path
								: `${server?.url}${(server?.path ?? '').startsWith('/') ? '' : '/'}${server?.path}`
						).catch((err) => {
							error = err;
							return null;
						});
					} else if ((specType === 'json' && server?.spec) ?? null) {
						try {
							res = JSON.parse(server?.spec);
						} catch (e) {
							error = 'Failed to parse JSON spec';
						}
					}

					if (res) {
						if (!res.paths) {
							return {
								error: 'Invalid OpenAPI spec',
								url: server?.url
							};
						}

						const { openapi, info, specs } = {
							openapi: res,
							info: res.info,
							specs: convertOpenApiToToolPayload(res)
						};

						const result: Record<string, any> = {
							url: server?.url,
							openapi: openapi,
							info: info,
							specs: specs
						};

						// Fetch system prompt if the server supports it
						try {
							const baseUrl = (server?.url ?? '').replace(/\/$/, '');
							const configRes = await fetch(`${baseUrl}/api/config`, {
								signal: AbortSignal.timeout(TOOL_SERVER_FETCH_TIMEOUT)
							});
							if (configRes.ok) {
								const config = await configRes.json();
								if (config?.features?.system) {
									const headers: Record<string, string> = {};
									if (toolServerToken) {
										headers['Authorization'] = `Bearer ${toolServerToken}`;
									}
									const systemRes = await fetch(`${baseUrl}/system`, {
										signal: AbortSignal.timeout(TOOL_SERVER_FETCH_TIMEOUT),
										headers
									});
									if (systemRes.ok) {
										const systemData = await systemRes.json();
										if (systemData?.prompt) {
											result.system_prompt = systemData.prompt;
										}
									}
								}
							}
						} catch (e) {
							// Server doesn't support /system — that's fine
						}

						return result;
					} else if (error) {
						return {
							error,
							url: server?.url
						};
					} else {
						return null;
					}
				})
		)
	).filter((server) => server);
};

export const executeToolServer = async (
	token: string,
	url: string,
	name: string,
	params: Record<string, any>,
	serverData: { openapi: any; info: any; specs: any },
	sessionId?: string
) => {
	let error = null;

	try {
		// Find the matching operationId in the OpenAPI spec (only valid HTTP methods)
		const matchingRoute = Object.entries(serverData.openapi.paths).find(([_, methods]) =>
			Object.entries(methods as any).some(
				([method, operation]: any) =>
					OPENAPI_HTTP_METHODS.has(method) &&
					operation &&
					typeof operation === 'object' &&
					operation.operationId === name
			)
		);

		if (!matchingRoute) {
			throw new Error(`No matching route found for operationId: ${name}`);
		}

		const [routePath, methods] = matchingRoute;

		const methodEntry = Object.entries(methods as any).find(
			([method, operation]: any) =>
				OPENAPI_HTTP_METHODS.has(method) &&
				operation &&
				typeof operation === 'object' &&
				operation.operationId === name
		);

		if (!methodEntry) {
			throw new Error(`No matching method found for operationId: ${name}`);
		}

		const [httpMethod, operation]: [string, any] = methodEntry;

		// Merge path-level and operation-level parameters.
		// Operation-level params override path-level params with the same (name, in).
		const pathLevelParams: any[] = Array.isArray((methods as any).parameters)
			? (methods as any).parameters
			: [];
		const opParams: any[] = Array.isArray(operation.parameters) ? operation.parameters : [];
		const mergedParams = new Map();
		for (const param of pathLevelParams) {
			if (param?.name) mergedParams.set(`${param.name}:${param.in ?? ''}`, param);
		}
		for (const param of opParams) {
			if (param?.name) mergedParams.set(`${param.name}:${param.in ?? ''}`, param);
		}

		// Split parameters by type
		const pathParams: Record<string, any> = {};
		const queryParams: Record<string, any> = {};
		let bodyParams: any = {};

		for (const param of mergedParams.values()) {
			const paramName = param?.name;
			if (!paramName) continue;
			const paramIn = param?.in;
			if (params.hasOwnProperty(paramName)) {
				if (paramIn === 'path') {
					pathParams[paramName] = params[paramName];
				} else if (paramIn === 'query') {
					queryParams[paramName] = params[paramName];
				}
			}
		}

		let finalUrl = `${url}${routePath}`;

		// Replace path parameters (`{param}`)
		Object.entries(pathParams).forEach(([key, value]) => {
			finalUrl = finalUrl.replace(new RegExp(`{${key}}`, 'g'), encodeURIComponent(value));
		});

		// Append query parameters to URL if any
		if (Object.keys(queryParams).length > 0) {
			const queryString = new URLSearchParams(
				Object.entries(queryParams).map(([k, v]) => [k, String(v)])
			).toString();
			finalUrl += `?${queryString}`;
		}

		// Handle requestBody composite
		if (operation.requestBody && operation.requestBody.content) {
			const contentType = Object.keys(operation.requestBody.content)[0];
			if (params !== undefined) {
				bodyParams = params;
			} else {
				// Optional: Fallback or explicit error if body is expected but not provided
				throw new Error(`Request body expected for operation '${name}' but none found.`);
			}
		}

		// Prepare headers and request options
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		};
		if (sessionId) headers['X-Session-Id'] = sessionId;

		const requestOptions: RequestInit = {
			method: httpMethod.toUpperCase(),
			headers
		};

		if (
			['post', 'put', 'patch', 'delete'].includes(httpMethod.toLowerCase()) &&
			operation.requestBody
		) {
			requestOptions.body = JSON.stringify(bodyParams);
		}

		const res = await fetch(finalUrl, requestOptions);
		if (!res.ok) {
			const resText = await res.text();
			throw new Error(`HTTP error! Status: ${res.status}. Message: ${resText}`);
		}

		// make a clone of res and extract headers
		const responseHeaders = {};
		res.headers.forEach((value, key) => {
			responseHeaders[key] = value;
		});

		let responseData;
		const contentType = res.headers.get('Content-Type')?.split(';')[0]?.trim() ?? '';

		try {
			responseData = await res.clone().json();
		} catch {
			if (contentType.startsWith('text/') || !contentType) {
				responseData = await res.text();
			} else {
				const buf = await res.arrayBuffer();
				const bytes = new Uint8Array(buf);
				let binary = '';
				for (let i = 0; i < bytes.length; i++) {
					binary += String.fromCharCode(bytes[i]);
				}
				const b64 = btoa(binary);
				responseData = `data:${contentType};base64,${b64}`;
			}
		}
		return [responseData, responseHeaders];
	} catch (err: any) {
		error = err.message;
		console.error('API Request Error:', error);
		return [{ error }, null];
	}
};
