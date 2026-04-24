# Mention Things

Obsidian plugin that adds support to mention other notes via customizable signs. Most commonly used to `@`-mention people:

![Preview of the auto-complete popup](./assets/example.png)

When you hit enter on a suggestion, it'll create a link that looks like this:

```
The author was [[@Rich Hickey]]
```

and leave the cursor at the end.

**Credits:**
This plugin is based on [saibotsivad/obsidian-at-people](https://github.com/saibotsivad/obsidian-at-people) by Tobias Davis

## Options

![Screenshot of the settings page](./assets/settings.png)

### Mention Types

**Character** - The symbol (like "@" or "&") that triggers the suggestion box while typing. Each character can be associated with a different type of mention.

**Label** - A descriptive name (like "Person" or "Project") that appears in the suggestion box when creating new entries. This helps identify what type of content you're creating.

**Folder** - Optional folder path to limit where files are indexed. When set, only files in this folder (and subfolders) will be suggested, and the mention character doesn't need to be in the filename. Leave empty to scan the entire vault for files starting with the mention character. Example: Set to `People` to mention files like `John Doe.md` without requiring them to be named `@John Doe.md`.

**Type** - Whether the note-name should be inserted as a real link, or if you just want to auto-complete the filename as plain-text (useful when using [Virtual Linker](https://github.com/vschroeter/obsidian-virtual-linker) or similar plugins)

### General Settings

**Match from start** - When enabled, only suggests items that begin with your search term. Recommended for faster, more precise matching.

**Max match length** - Limits how many characters you can type before suggestions stop appearing. Prevents suggestions from showing when typing longer text that happens to start with a mention character.

**Stop characters** - Any character in this list will immediately close the suggestion box when typed. Helpful for quickly dismissing suggestions when you type punctuation or special characters.

## Features

### Frontmatter Alias Support

The plugin automatically searches frontmatter aliases when suggesting files. This is especially useful when combined with plugins like [Google Lookup](https://github.com/phibr0/obsidian-google-lookup) that create files with structured metadata.

For example, if you have a file `Hickey, Rich.md` with frontmatter:

```yaml
---
aliases: ["@rich", "Rich Hickey", "Hickey Rich"]
---
```

You can type `@rich` and the file will appear in suggestions as `@rich → Hickey, Rich`. When selected, it creates a link like `[[Hickey, Rich|rich]]` using the matched alias as the display text.

### Folder-Based Indexing

For better performance and organization, you can limit each mention type to a specific folder. When a folder is specified:
- Only files in that folder (and subfolders) are indexed for that mention type
- The mention character doesn't need to be in the filename
- Significantly improves performance in large vaults

This is ideal for organizing different types of mentions (people, projects, locations) in separate folders.

## Changelog

**1.2.0**
- New: Frontmatter alias support - search by file aliases defined in YAML frontmatter
- New: Folder-based indexing - limit mentions to specific folders for better performance
- New: Folder picker with autocomplete in settings
- Enhancement: Display matched alias in suggestion dropdown (e.g., `@rich → Hickey, Rich`)
- Enhancement: Improved performance for large vaults when using folder filtering

**1.1.0**
- New: Mention type (link/text)
- New: Links use your Obsidian configuration (WikiLink or Markdown link)
- New: Preview of the generated mention item
- Change: Improved prefix list, removed invalid characters like `>`

**1.0.2**
- Change: Switched to new Settings API

**1.0.1**
- Public release

## License

Published and made available freely under the [Very Open License](http://veryopenlicense.com/).
