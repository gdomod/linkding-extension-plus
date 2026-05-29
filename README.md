# Linkding Extension Plus

A feature-enhanced browser extension for the [linkding](https://github.com/sissbruecker/linkding) bookmark manager — built on top of the original [linkding-extension](https://github.com/sissbruecker/linkding-extension) by Sascha Ißbrücker.

## What's new

This fork adds a number of UX improvements focused on fast bookmark browsing directly from the popup:

| Feature | Description |
|---|---|
| **Bookmark Tree as default view** | The popup opens directly with the bookmark tree instead of the add-bookmark form |
| **File-explorer design** | Folder icons, favicons per bookmark, `├`/`└` tree connectors, compact layout |
| **Context menu** | Right-click any bookmark: **New tab**, **Same tab**, **Edit** |
| **Persistent state** | Expanded folders and scroll position are remembered across popup opens |
| **Bundle Filter** | Filter the tree to show only bookmarks from specific linkding bundles |
| **Manifest V3** | Updated to MV3 for compatibility with current Chrome/Edge versions |

## Preview

```
┌─────────────────────────────────────────┐
│ Bookmarks              + Add  ⚙  ↗      │
├─────────────────────────────────────────┤
│ 🔍 Search bookmarks...                  │
│ Expand all · Collapse all               │
├─────────────────────────────────────────┤
│ ▼ 📂 automation                    12   │
│    ├ 🌐 Sonarr                          │
│    ├ 🌐 Huginn                          │
│    └ 🌐 n8n                             │
│ ▶ 📁 development                   34   │
│ ▶ 📁 self-hosted                   21   │
└─────────────────────────────────────────┘
```

Right-clicking a bookmark opens a context menu:

```
┌──────────────┐
│  New tab     │
│  Same tab    │
├──────────────┤
│  Edit        │
└──────────────┘
```

## Installation

### Load unpacked (development / testing)

1. Clone or download this repository
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Open `chrome://extensions/` (or `edge://extensions/`)
5. Enable **Developer mode**
6. Click **Load unpacked** → select the project folder

After code changes, run `npm run build` again and click **Reload** in the extensions page.  
Use `npm run dev` to auto-rebuild on every file change.

### Firefox

Load via `about:debugging` → **Load Temporary Add-on** → select `manifest.json`.

> **Note:** This extension uses Manifest V3, which requires Chrome 119+ or a compatible browser.

## Configuration

Open the extension options (gear icon in the popup header):

| Setting | Description |
|---|---|
| **Base URL** | URL of your linkding installation, without trailing slash |
| **API Token** | Found on your linkding Settings page |
| **Default Tags** | Tags pre-filled when adding a new bookmark |
| **Bundle Filter** | Comma-separated bundle names to filter the tree (see below) |
| **Pre-select unread** | Mark new bookmarks as unread by default |
| **Pre-select share** | Mark new bookmarks as shared by default |
| **Use browser metadata** | Use the browser tab's title/description instead of fetching from server |
| **Pre-load page info** | Pre-fetch bookmark status while browsing (shows starred icon on bookmarked pages) |
| **Close popup after save** | Automatically close the popup after saving a bookmark |

## Bundle Filter

linkding supports **bundles** — saved filter presets that group bookmarks by tags, search terms, or a combination. The Bundle Filter setting limits the bookmark tree to only show bookmarks belonging to the specified bundles.

**Example:** If you have bundles named `Work` and `Programming`, enter:

```
Work, Programming
```

The tree will then only show bookmarks from either bundle. The tag folders are derived directly from those bookmarks — no extra API call needed. Leaving the field empty shows all bookmarks (default behaviour).

Bundles are managed in your linkding web interface under **Settings → Bundles**.

> Requires linkding v1.24 or later.

## Development

```bash
# Install dependencies
npm install

# Build once
npm run build

# Watch mode — rebuilds on every file change
npm run dev
```

### Project structure

```
src/
  bookmarks-tree.js   Bookmark tree component (file-explorer style)
  popup-form.js       Main popup component (tree + form views)
  popup.js            Root popup component
  options.js          Settings page
  linkding.js         linkding REST API client
  configuration.js    Extension settings storage
  cache.js            Bookmark and metadata caching
  icons.js            SVG icon helpers
styles/
  index.css           Main stylesheet
  theme-light.css     Light theme CSS variables
  theme-dark.css      Dark theme CSS variables
popup/
  index.html          Popup HTML entry point
options/
  index.html          Options page HTML entry point
```

## Credits

Based on [linkding-extension](https://github.com/sissbruecker/linkding-extension) by [Sascha Ißbrücker](https://github.com/sissbruecker), licensed under MIT.
