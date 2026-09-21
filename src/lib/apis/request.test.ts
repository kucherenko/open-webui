import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './request';

const mockFetch = (ok: boolean, payload: unknown) => {
	const fetchMock = vi.fn().mockResolvedValue({ ok, json: async () => payload });
	vi.stubGlobal('fetch', fetchMock);
	return fetchMock;
};

describe('apiRequest', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('sends a GET with JSON headers and bearer token, returning the parsed body', async () => {
		const fetchMock = mockFetch(true, { id: 1 });

		await expect(apiRequest('/api/x', { token: 't' })).resolves.toEqual({ id: 1 });
		expect(fetchMock).toHaveBeenCalledWith('/api/x', {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				authorization: 'Bearer t'
			}
		});
	});

	it('serializes the body and passes credentials through', async () => {
		const fetchMock = mockFetch(true, {});

		await apiRequest('/api/x', { method: 'POST', body: { a: 1 }, credentials: 'include' });
		const init = fetchMock.mock.calls[0][1];
		expect(init.body).toBe('{"a":1}');
		expect(init.credentials).toBe('include');
		expect(init.headers).not.toHaveProperty('authorization');
	});

	it('throws the error detail on a non-2xx response', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		mockFetch(false, { detail: 'nope' });

		await expect(apiRequest('/api/x', { token: 't' })).rejects.toBe('nope');
	});

	it('uses getError to resolve the thrown value', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		mockFetch(false, { message: 'bad' });

		await expect(apiRequest('/api/x', { getError: (err) => err.message })).rejects.toBe('bad');
	});

	it('resolves to null when the failure has no error value', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')));

		await expect(apiRequest('/api/x')).resolves.toBeNull();
	});
});
