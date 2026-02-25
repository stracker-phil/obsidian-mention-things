import { MentionSettings } from './types';

/**
 * Default plugin settings
 */
export const DEFAULT_SETTINGS: MentionSettings = {
	mentionTypes: [],
	matchStart: true,
	maxMatchLength: 15,
	stopCharacters: '?!;:"\'`/#*%<>[]()',
};

/**
 * List of allowed signs for mentions
 *
 * Forbidden on Windows: " * : < > ? \ / |
 * Conflict with Obsidian: [ ] ( ) | # % `
 */
export const ALLOWED_SIGNS_STRING = "@!+$&~-_=,;'{}^§★→¶°€£¥¢±µ©™®«»";
export const ALLOWED_SIGNS = ALLOWED_SIGNS_STRING.split('');
