import { App, EditorSuggest, Editor, EditorPosition, TFile } from 'obsidian';
import { MentionManager } from '../mention/mention-manager';
import { getTypeDef, createMentionString } from '../mention/link-utils';
import {
	MentionSettings,
	MentionSuggestion,
	EditorSuggestTriggerInfo,
	EditorSuggestContext,
} from '../types';
import { DEFAULT_SETTINGS } from '../constants';

/**
 * Provides suggestion functionality for mentions in the editor
 */
export class SuggestionProvider extends EditorSuggest<MentionSuggestion> {
	private settings: MentionSettings;
	private mentionManager: MentionManager;
	private currSign: string = '';
	private prevMention: string = '';
	private fileMaps: any;

	constructor(app: App, settings: MentionSettings, mentionManager: MentionManager) {
		super(app);
		this.settings = settings;
		this.mentionManager = mentionManager;
		this.fileMaps = mentionManager.getFileMaps();
	}

	get currType() {
		return getTypeDef(this.settings.mentionTypes, this.currSign);
	}

	/**
	 * Update the suggestions map
	 */
	setSuggestionsMap(maps: any): void {
		this.fileMaps = maps;
	}

	/**
	 * Determine if suggestions should be triggered
	 */
	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		const charsLeftOfCursor = editor.getLine(cursor.line).substring(0, cursor.ch);

		if (!charsLeftOfCursor) {
			return null;
		}

		// Find the most recent mention sign
		const { signIndex, sign } = this.findMostRecentSign(charsLeftOfCursor);

		if (signIndex < 0) {
			return null;
		}

		this.currSign = sign;
		const query = charsLeftOfCursor.substring(signIndex + 1);

		// Check various conditions that would prevent showing suggestions
		if (!this.shouldShowSuggestions(query, signIndex, charsLeftOfCursor)) {
			return null;
		}

		return {
			start: { line: cursor.line, ch: signIndex },
			end: { line: cursor.line, ch: cursor.ch },
			query,
		};
	}

	/**
	 * Find the most recent mention sign in the text
	 */
	private findMostRecentSign(text: string): { signIndex: number, sign: string } {
		const usedSigns = this.mentionManager.getUsedSigns();
		let signIndex = -1;
		let foundSign = '';

		for (let sign of usedSigns) {
			let index = text.lastIndexOf(sign);

			if (index !== -1 && index > signIndex) {
				signIndex = index;
				foundSign = sign;
			}
		}

		return { signIndex, sign: foundSign };
	}

	/**
	 * Determine if suggestions should be shown based on various conditions
	 */
	private shouldShowSuggestions(query: string, signIndex: number, charsLeftOfCursor: string): boolean {
		if (!query) {
			return false;
		}

		// Verify if the current query is different from the previous completion
		if (this.prevMention) {
			if (query.startsWith(this.prevMention)) {
				return false;
			}

			// Reset the prev completion cache
			this.prevMention = '';
		}

		// Is WikiLink?
		if (/\[\[.*]]/.test(query) || /\[.*]\(.*\)/.test(query)) {
			return false;
		}

		// Check if the query exceeds max length
		const maxMatchLength = this.settings.maxMatchLength ?? DEFAULT_SETTINGS.maxMatchLength;
		if (maxMatchLength && query.length > maxMatchLength) {
			return false;
		}

		// Check if the query contains any stop characters
		const stopCharacters = this.settings.stopCharacters ?? DEFAULT_SETTINGS.stopCharacters;
		if (stopCharacters) {
			for (const char of stopCharacters) {
				if (query.includes(char)) {
					return false;
				}
			}
		}

		// Check if the sign is at the start of the line or has a space before it.
		return (
			signIndex === 0 ||
			charsLeftOfCursor[signIndex - 1] === ' '
		);
	}

	/**
	 * Get suggestions based on the query
	 */
	getSuggestions(context: EditorSuggestContext): MentionSuggestion[] {
		let suggestions: MentionSuggestion[];
		let map = this.fileMaps[this.currSign] || {};
		const term = context.query.toLowerCase();

		// Add matching existing items
		suggestions = this.getMatchingSuggestions(map, term, context);

		// Always add the option to create a new item
		suggestions.push(this.createNewItemSuggestion(context));

		return suggestions;
	}

	/**
	 * Get suggestions that match the search term
	 */
	private getMatchingSuggestions(map: any, term: string, context: EditorSuggestContext): MentionSuggestion[] {
		const suggestions: MentionSuggestion[] = [];

		for (let key in map) {
			if (!key) {
				continue;
			}

			if (!this.isMatch(key, term)) {
				continue;
			}

			suggestions.push({
				suggestionType: 'set',
				displayText: map[key].name.trim(),
				linkName: map[key].name,
				path: map[key].path,
				context,
			});
		}

		return suggestions;
	}

	/**
	 * Check if an item matches the search term based on settings
	 */
	private isMatch(key: string, term: string): boolean {
		if (this.settings.matchStart) {
			return key.startsWith(term);
		}

		return key.includes(term);
	}

	/**
	 * Create a suggestion for creating a new item
	 */
	private createNewItemSuggestion(context: EditorSuggestContext): MentionSuggestion {
		return {
			suggestionType: 'create',
			displayText: context.query,
			linkName: context.query,
			path: '',
			context,
		};
	}

	/**
	 * Render a suggestion in the dropdown
	 */
	renderSuggestion(value: MentionSuggestion, el: HTMLElement): void {
		if (value.suggestionType === 'create') {
			const type = this.currType;
			const label = type?.label || 'Item';

			el.setText(`Create ${label}: ${value.displayText}`);
		} else {
			el.setText(value.displayText);
		}
	}

	selectSuggestion(value: MentionSuggestion, evt: MouseEvent | KeyboardEvent): void {
		const config = this.currType;
		if (!config?.sign) {
			return;
		}

		const context = value.context;
		console.log('Insert:', config, value)
		const insertion = createMentionString(this.app, context.file.path, value.path, config.sign, value.linkName, config.type ?? 'link');
		this.prevMention = value.linkName;

		value.context.editor.replaceRange(
			insertion,
			value.context.start,
			value.context.end,
		);
	}
}
