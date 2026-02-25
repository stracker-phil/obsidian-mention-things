import { App, TFile } from 'obsidian';
import { MentionSettings, MentionType, MentionLink } from '../types';

/**
 * Extract mention information from a file path
 * @param path File path to analyze
 * @param settings Plugin settings
 * @returns MentionLink object if the path matches a mention pattern, null otherwise
 */
export function getLinkFromPath(path: string, settings: MentionSettings): MentionLink | null {
	if (!path.endsWith('.md')) {
		return null;
	}

	const basename = path.split('/')?.pop()?.replace(/\.[^.]+$/, '');
	if (!basename) {
		return null;
	}

	for (let i = 0; i < settings.mentionTypes.length; i++) {
		const type = settings.mentionTypes[i];

		if (!type?.sign) {
			continue;
		}

		if (!basename.startsWith(type.sign)) {
			continue;
		}

		return {
			sign: type.sign,
			name: basename.slice(type.sign.length).trim(),
			path,
		};
	}

	return null;
}

/**
 * Find a mention type definition by its sign
 * @param types Array of mention types
 * @param sign Sign character to look for
 * @returns MentionType if found, null otherwise
 */
export function getTypeDef(types: MentionType[], sign: string): MentionType | null {
	for (let i = 0; i < types.length; i++) {
		if (sign === types[i]?.sign) {
			return types[i];
		}
	}

	return null;
}

/**
 * Create a link string for a mention
 * @param app
 * @param sourcePath The file with receives the link
 * @param linkTo Path to the linked file
 * @param sign The mention sign
 * @param name The name to link to
 * @param type Insertion type (link or text)
 * @returns Formatted link string
 */
export function createMentionString(app: App, sourcePath: string, linkTo: string, sign: string, name: string, type: string): string {
	const basename = `${sign}${name}`;

	if ('text' === type) {
		return basename;
	}

	const file = app.vault.getAbstractFileByPath(linkTo);

	if (!(file instanceof TFile)) {
		return basename;
	}

	return app.fileManager.generateMarkdownLink(file, sourcePath, '', basename);
}

export function generateLinkPreview(app: App, type: string, prefix: string, text: string): string {
	const useMarkdownLinks = (app.vault as any).getConfig('useMarkdownLinks');

	if ('text' === type) {
		return text;
	}
	const link = encodeURIComponent(text);
	const label = prefix + text;

	return useMarkdownLinks
		? `[${label}](${prefix}${link})`
		: `[[${label}]]`;
}
