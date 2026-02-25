import { EditorPosition, Editor } from 'obsidian';

/**
 * Plugin settings interface
 */
export interface MentionSettings {
	mentionTypes: MentionType[];
	matchStart?: boolean;
	maxMatchLength?: number;
	stopCharacters?: string;
}

/**
 * Represents a type of mention with its sign and label
 */
export interface MentionType {
	type?: string;
	sign?: string;
	label?: string;
}

/**
 * Represents a link to a mentioned item
 */
export interface MentionLink {
	sign: string;
	name: string;
	path: string;
}

/**
 * Structure for storing mentionable files
 */
export interface FileMaps {
	[sign: string]: {
		[key: string]: MentionLink;
	};
}

/**
 * Available signs for dropdown selection
 */
export interface AvailableSigns {
	[sign: string]: string;
}

export interface AvailableTypes {
	[type: string]: string;
}

/**
 * Suggestion item structure
 */
export interface MentionSuggestion {
	suggestionType: 'set' | 'create';
	displayText: string;
	linkName: string;
	path: string;
	context: any;
}

/**
 * Type definition for EditorSuggest trigger info
 */
export interface EditorSuggestTriggerInfo {
	start: EditorPosition;
	end: EditorPosition;
	query: string;
}

/**
 * Type definition for EditorSuggest context
 */
export interface EditorSuggestContext {
	start: EditorPosition;
	end: EditorPosition;
	query: string;
	editor: Editor;
}
