# Privacy Policy — Linkding Extension Plus

_Last updated: May 2026_

## Summary

Linkding Extension Plus does not collect, store, or transmit any personal data to third parties. All communication happens exclusively between your browser and your own self-hosted linkding server.

---

## Data collected and used

### Configuration data
The extension stores the following data **locally in your browser** using the browser's built-in storage API:

- Your linkding server URL
- Your linkding API token
- Extension settings and preferences (default tags, display options)

This data never leaves your device except to communicate with the linkding server you configured yourself.

### Bookmark data
When you use the extension, it fetches bookmark data from your linkding server and caches it temporarily in local browser storage to improve performance. This cache is stored only on your device and is cleared automatically.

### Current tab URL
When you open the popup to add a bookmark, the extension reads the URL and title of the current browser tab. This information is sent only to your own linkding server to create the bookmark. It is not sent to any other party.

---

## Data sharing

**No data is shared with third parties.** The extension communicates exclusively with:

1. **Your linkding server** — to read and write bookmarks, tags, and bundles
2. **Chrome's internal favicon service** (`chrome-extension://`) — to display website favicons locally

No analytics, no tracking, no advertising networks, no external APIs.

---

## Permissions explained

| Permission | Reason |
|---|---|
| `storage` | Save configuration and cache bookmarks locally in the browser |
| `tabs` | Read the current tab's URL and title when adding a bookmark; open bookmarks in tabs |
| `contextMenus` | Add a "Save to linkding" option to the right-click context menu for links |
| `http://*/*`, `https://*/*` | Connect to your self-hosted linkding server on any domain or local address |

---

## Contact

If you have questions about this privacy policy, please open an issue at:
[https://github.com/gdomod/linkding-extension-plus/issues](https://github.com/gdomod/linkding-extension-plus/issues)
