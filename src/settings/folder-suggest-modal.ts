import { App, AbstractInputSuggest, TFolder, TAbstractFile } from 'obsidian';

/**
 * Suggests folders from the vault as the user types
 */
export class FolderSuggest extends AbstractInputSuggest<TFolder> {
	private onSelectCallback: ((folder: TFolder) => void) | null = null;

	constructor(app: App, inputEl: HTMLInputElement, onSelect?: (folder: TFolder) => void) {
		super(app, inputEl);
		this.onSelectCallback = onSelect || null;
	}

	getSuggestions(query: string): TFolder[] {
		const folders: TFolder[] = [];
		const lowerQuery = query.toLowerCase();

		// Get all folders from vault
		this.app.vault.getAllLoadedFiles().forEach((file: TAbstractFile) => {
			if (file instanceof TFolder) {
				// Match folders by path
				if (file.path.toLowerCase().includes(lowerQuery)) {
					folders.push(file);
				}
			}
		});

		// Sort by path length (shorter first), then alphabetically
		return folders.sort((a, b) => {
			const lenDiff = a.path.length - b.path.length;
			return lenDiff !== 0 ? lenDiff : a.path.localeCompare(b.path);
		});
	}

	renderSuggestion(folder: TFolder, el: HTMLElement): void {
		el.setText(folder.path || '/');
	}

	selectSuggestion(folder: TFolder): void {
		this.setValue(folder.path);
		this.close();
		
		// Call the callback after selection
		if (this.onSelectCallback) {
			this.onSelectCallback(folder);
		}
	}
}
