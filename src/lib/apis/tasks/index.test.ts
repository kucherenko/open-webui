import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/constants', () => ({ WEBUI_BASE_URL: '' }));

import {
	generateAutoCompletion,
	generateEmoji,
	generateQueries,
	generateTags,
	generateTitle
} from '.';

const reply = (content: string) => {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ choices: [{ message: { content } }] })
		})
	);
};

describe('task completion parsing', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('extracts the title, tolerating single quotes', async () => {
		reply("Sure! {'title': 'Trip plan'}");
		await expect(generateTitle('t', 'm', [])).resolves.toBe('Trip plan');
	});

	it('returns null for a title reply without JSON', async () => {
		reply('no json here');
		await expect(generateTitle('t', 'm', [])).resolves.toBeNull();
	});

	it('returns tags only when they are an array', async () => {
		reply('{"tags": ["a", "b"]}');
		await expect(generateTags('t', 'm', '')).resolves.toEqual(['a', 'b']);
		reply('{"tags": "a"}');
		await expect(generateTags('t', 'm', '')).resolves.toEqual([]);
	});

	it('falls back to the raw reply for queries and autocompletion without JSON', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		reply('plain query');
		await expect(generateQueries('t', 'm', [], '')).resolves.toEqual(['plain query']);
		reply('{broken');
		await expect(generateAutoCompletion('t', 'm', '')).resolves.toBe('{broken');
	});

	it('uses empty defaults when the JSON lacks the expected key', async () => {
		reply('{"other": 1}');
		await expect(generateQueries('t', 'm', [], '')).resolves.toEqual([]);
		reply('{"other": 1}');
		await expect(generateAutoCompletion('t', 'm', '')).resolves.toBe('');
	});

	it('picks the first emoji from the reply', async () => {
		reply('"🎉 party 🎈"');
		await expect(generateEmoji('t', 'm', '')).resolves.toBe('🎉');
		reply('no emoji');
		await expect(generateEmoji('t', 'm', '')).resolves.toBeNull();
	});
});
