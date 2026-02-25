import { App, TFile } from 'obsidian';
import { MentionSettings, FileMaps, MentionLink } from '../types';
import { getLinkFromPath } from './link-utils';

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
	 * Initialize the file index by scanning all files in the vault
	 */
	initialize(): FileMaps {
		this.fileMaps = {};

		// Get all files in the vault using the proper Obsidian API
		const files = this.app.vault.getAllLoadedFiles();

		// Process each file
		files.forEach(file => {
			if (! (file instanceof TFile) || file.extension !== 'md') {
				return;
			}

			const mentionLink = getLinkFromPath(file.path, this.settings);

			if (mentionLink) {
				this.addFileToMap(mentionLink);
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
		const addItem = getLinkFromPath(path, this.settings);
		if (addItem) {
			this.addFileToMap(addItem);
			needsUpdate = true;
		}

		// Handle renamed or deleted file
		if (originalPath) {
			const removeItem = getLinkFromPath(originalPath, this.settings);
			if (removeItem) {
				this.removeFileFromMap(removeItem);
				needsUpdate = true;
			}
		}

		return needsUpdate;
	}

	/**
	 * Add a file to the appropriate map
	 */
	private addFileToMap(item: MentionLink): void {
		const sign = item.sign;

		if (!sign) {
			return;
		}

		const key = item.name.toLowerCase();
		this.fileMaps[sign] = this.fileMaps[sign] || {};
		this.fileMaps[sign][key] = item;
	}

	/**
	 * Remove a file from the map
	 */
	private removeFileFromMap(item: MentionLink): void {
		const sign = item.sign;

		if (!sign || !this.fileMaps[sign]) {
			return;
		}

		const key = item.name.toLowerCase();
		delete this.fileMaps[sign][key];
	}
}
