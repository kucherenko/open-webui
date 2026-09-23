import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/apis/auths', () => ({
	getSessionUser: vi.fn(async () => ({ name: 'Ada', email: '', bio: 'Engineer' }))
}));

import { replaceTextVariables } from './textVariables';

const handlers = {
	onClipboardImage: vi.fn(),
	onClipboardError: vi.fn(),
	onLocationError: vi.fn()
};

describe('replaceTextVariables', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', {
			token: 't',
			getItem: (key: string) => (key === 'locale' ? 'de-DE' : null)
		});
	});

	it('substitutes user variables that have a value and leaves empty ones in place', async () => {
		const text = await replaceTextVariables(
			'{{USER_NAME}} / {{USER_BIO}} / {{USER_EMAIL}} / {{USER_LANGUAGE}}',
			handlers
		);

		expect(text).toBe('Ada / Engineer / {{USER_EMAIL}} / de-DE');
	});

	it('returns text without variables unchanged', async () => {
		await expect(replaceTextVariables('plain text', handlers)).resolves.toBe('plain text');
	});
});
