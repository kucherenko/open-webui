import { getSessionUser } from '$lib/apis/auths';
import {
	getAge,
	getCurrentDateTime,
	getFormattedDate,
	getFormattedTime,
	getUserPosition,
	getUserTimezone,
	getWeekday
} from '$lib/utils';

type TextVariableHandlers = {
	onClipboardImage: (file: File) => void;
	onClipboardError: () => void;
	onLocationError: () => void;
};

const replaceClipboardVariable = async (text: string, handlers: TextVariableHandlers) => {
	const clipboardText = await navigator.clipboard.readText().catch(() => {
		handlers.onClipboardError();
		return '{{CLIPBOARD}}';
	});

	const clipboardItems = await navigator.clipboard.read().catch((err) => {
		console.error('Failed to read clipboard items:', err);
		return [];
	});

	for (const item of clipboardItems) {
		for (const type of item.types) {
			if (type.startsWith('image/')) {
				const blob = await item.getType(type);
				handlers.onClipboardImage(
					new File([blob], `clipboard-image.${type.split('/')[1]}`, { type: type })
				);
			}
		}
	}

	return text.replaceAll('{{CLIPBOARD}}', clipboardText.replaceAll('\r\n', '\n'));
};

// Variables resolved from the session user; each is only substituted when it has a value.
const USER_VARIABLES: Record<string, (user: any) => string> = {
	'{{USER_EMAIL}}': (user) => user?.email || '',
	'{{USER_BIO}}': (user) => user?.bio || '',
	'{{USER_GENDER}}': (user) => user?.gender || '',
	'{{USER_BIRTH_DATE}}': (user) => user?.date_of_birth || '',
	'{{USER_AGE}}': (user) => (user?.date_of_birth ? getAge(user.date_of_birth) : '')
};

const DATE_VARIABLES: Record<string, () => string> = {
	'{{USER_LANGUAGE}}': () => localStorage.getItem('locale') || 'en-US',
	'{{CURRENT_DATE}}': getFormattedDate,
	'{{CURRENT_TIME}}': getFormattedTime,
	'{{CURRENT_DATETIME}}': getCurrentDateTime,
	'{{CURRENT_TIMEZONE}}': getUserTimezone,
	'{{CURRENT_WEEKDAY}}': getWeekday
};

/**
 * Expands the `{{...}}` prompt variables (clipboard, location, user profile, date/time)
 * a message input supports.
 */
export const replaceTextVariables = async (text: string, handlers: TextVariableHandlers) => {
	if (text.includes('{{CLIPBOARD}}')) {
		text = await replaceClipboardVariable(text, handlers);
	}

	if (text.includes('{{USER_LOCATION}}')) {
		let location;
		try {
			location = await getUserPosition();
		} catch (error) {
			handlers.onLocationError();
			location = 'LOCATION_UNKNOWN';
		}
		text = text.replaceAll('{{USER_LOCATION}}', String(location));
	}

	const sessionUser = await getSessionUser(localStorage.token);

	if (text.includes('{{USER_NAME}}')) {
		text = text.replaceAll('{{USER_NAME}}', sessionUser?.name || 'User');
	}

	for (const [variable, resolve] of Object.entries(USER_VARIABLES)) {
		if (text.includes(variable)) {
			const value = resolve(sessionUser);
			if (value) {
				text = text.replaceAll(variable, value);
			}
		}
	}

	for (const [variable, resolve] of Object.entries(DATE_VARIABLES)) {
		if (text.includes(variable)) {
			text = text.replaceAll(variable, resolve());
		}
	}

	return text;
};
