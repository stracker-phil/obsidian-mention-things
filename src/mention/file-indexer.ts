import { App, TFile } from 'obsidian';
import { MentionSettings, FileMaps, MentionLink } from '../types';

/**
 * Handles indexing and tracking mentionable files
 */
export class FileIndexer {
	private app: App;
	private readonly settings: MentionSettings;
	private fileMaps: FileMaps = {};

	constructor(app: App, settings: MentionSettings) {
		this.app = app;
		this.settings = settings;
	}

	/**
	 * Extract aliases from a file's frontmatter
	 */
	private getFileAliases(file: TFile): string[] {
		const cache = this.app.metadataCache.getFileCache(file);
		const aliases = cache?.frontmatter?.aliases;

		if (!aliases) {
			return [];
		}

		// Handle both array and comma-separated string formats
		if (Array.isArray(aliases)) {
			return aliases.map(a => String(a).toLowerCase()).filter(Boolean);
		}

		if (typeof aliases === 'string') {
			return aliases
				.split(',')
				.map(a => a.trim().toLowerCase())
				.filter(Boolean);
		}

		return [];
	}

	/**
	 * Check if a file is in the specified folder (or any subfolder)
	 */
	private isFileInFolder(filePath: string, folderPath: string): boolean {
		const normalizedFolder = folderPath.replace(/\\/g, '/').replace(/\/$/, '') + '/';
		const normalizedFile = filePath.replace(/\\/g, '/');
		return normalizedFile.startsWith(normalizedFolder);
	}

	/**
	 * Index a single file for a single mention type, adding filename and alias entries
	 */
	private indexFileForType(file: TFile, sign: string, displayName: string): void {
		this.addFileToMap({ sign, name: displayName, path: file.path });

		const aliases = this.getFileAliases(file);
		for (const alias of aliases) {
			if (alias.startsWith(sign)) {
				const aliasWithoutSign = alias.slice(sign.length).trim();
				this.addFileToMap({ sign, name: displayName, path: file.path, sourceAlias: alias }, aliasWithoutSign);
			}
		}
	}

	/**
	 * Initialize the file index by scanning all files in the vault
	 */
	initialize(): FileMaps {
		this.fileMaps = {};

		// Get all files in the vault using the proper Obsidian API
		const files = this.app.vault.getAllLoadedFiles();

		// Process each file
		files.forEach(file => {
			if (!(file instanceof TFile) || file.extension !== 'md') {
				return;
			}

			for (const type of this.settings.mentionTypes) {
				if (!type.sign) {
					continue;
				}

				const basename = file.basename;
				const inFolder = type.folder && this.isFileInFolder(file.path, type.folder);
				const signMatch = !type.folder && basename.startsWith(type.sign);

				if (!inFolder && !signMatch) {
					continue;
				}

				const displayName = type.folder ? basename : basename.slice(type.sign.length).trim();
				this.indexFileForType(file, type.sign, displayName);
			}
		});

		return this.fileMaps;
	}

	/**
	 * Get the current file maps
	 */
	getFileMaps(): FileMaps {
		return this.fileMaps;
	}

	/**
	 * Update the file index when a file is created, deleted, or renamed
	 */
	updateIndex(path: string, originalPath?: string): boolean {
		let needsUpdate = false;

		// Handle new or updated file
		const file = this.app.vault.getAbstractFileByPath(path);
		if (file instanceof TFile) {
			for (const type of this.settings.mentionTypes) {
				if (!type.sign) {
					continue;
				}

				const basename = file.basename;
				const inFolder = type.folder && this.isFileInFolder(file.path, type.folder);
				const signMatch = !type.folder && basename.startsWith(type.sign);

				if (!inFolder && !signMatch) {
					continue;
				}

				const displayName = type.folder ? basename : basename.slice(type.sign.length).trim();
				this.indexFileForType(file, type.sign, displayName);
				needsUpdate = true;
			}
		}

		// Handle renamed or deleted file - remove all entries for this path
		if (originalPath) {
			for (const type of this.settings.mentionTypes) {
				if (!type.sign || !this.fileMaps[type.sign]) {
					continue;
				}

				for (const key in this.fileMaps[type.sign]) {
					if (this.fileMaps[type.sign][key].path === originalPath) {
						delete this.fileMaps[type.sign][key];
						needsUpdate = true;
					}
				}
			}
		}

		return needsUpdate;
	}

	/**
	 * Add a file to the appropriate map
	 * @param item The mention link to add
	 * @param searchKey Optional custom search key (for aliases). Defaults to item.name
	 */
	private addFileToMap(item: MentionLink, searchKey?: string): void {
		const sign = item.sign;

		if (!sign) {
			return;
		}

		const key = (searchKey || item.name).toLowerCase();
		this.fileMaps[sign] = this.fileMaps[sign] || {};
		this.fileMaps[sign][key] = item;
	}
}
