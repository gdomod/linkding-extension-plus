import { LitElement, html } from "lit";
import { icons } from "./icons.js";
import { getCachedBookmarks, cacheBookmarks } from "./cache.js";

export class BookmarksTree extends LitElement {
  static properties = {
    bookmarks: { type: Array },
    tags: { type: Array },
    searchQuery: { type: String, state: true },
    expandedTags: { type: Object, state: true },
    loading: { type: Boolean },
    contextMenu: { type: Object, state: true },
  };

  constructor() {
    super();
    this.bookmarks = [];
    this.tags = [];
    this.searchQuery = "";
    this.expandedTags = {};
    this.loading = false;
    this.contextMenu = null;
    this._savedScrollTop = 0;
    this._scrollRestored = false;
    this._scrollTimer = null;
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this._onDocClick = () => { this.contextMenu = null; };
    document.addEventListener("click", this._onDocClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._onDocClick);
  }

  async firstUpdated() {
    try {
      const result = await chrome.storage.local.get("treeState");
      if (result.treeState) {
        this.expandedTags = result.treeState.expandedTags || {};
        this._savedScrollTop = result.treeState.scrollTop || 0;
      }
    } catch (e) {}

    if (this._savedScrollTop > 0) {
      this._tryRestoreScroll(0);
    }
  }

  _tryRestoreScroll(attempt) {
    if (this._scrollRestored || attempt > 40) return;
    const list = this.querySelector(".tag-list");
    if (list && list.scrollHeight > list.clientHeight) {
      list.scrollTop = this._savedScrollTop;
      this._scrollRestored = true;
      return;
    }
    setTimeout(() => this._tryRestoreScroll(attempt + 1), 50);
  }

  updated(changedProperties) {}

  saveState() {
    const list = this.querySelector(".tag-list");
    const scrollTop = list ? list.scrollTop : 0;
    this._savedScrollTop = scrollTop;
    chrome.storage.local.set({
      treeState: { expandedTags: this.expandedTags, scrollTop },
    });
  }

  handleScroll() {
    clearTimeout(this._scrollTimer);
    this._scrollTimer = setTimeout(() => this.saveState(), 300);
  }

  toggleTag(tagName) {
    this.expandedTags = {
      ...this.expandedTags,
      [tagName]: !this.expandedTags[tagName],
    };
    this.saveState();
  }

  expandAll() {
    const expanded = {};
    this.tags.forEach((tag) => { expanded[tag.name] = true; });
    this.expandedTags = expanded;
    this.saveState();
  }

  collapseAll() {
    this.expandedTags = {};
    this.saveState();
  }

  getFilteredBookmarks() {
    if (!this.searchQuery.trim()) return this.bookmarks;
    const query = this.searchQuery.toLowerCase();
    return this.bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query) ||
        (b.tag_names && b.tag_names.some((t) => t.toLowerCase().includes(query)))
    );
  }

  getBookmarksByTag(tagName) {
    return this.getFilteredBookmarks().filter((b) => b.tag_names?.includes(tagName));
  }

  openInNewTab(url) {
    chrome.tabs.create({ url });
  }

  openInSameTab(url) {
    this.dispatchEvent(new CustomEvent("open-same-tab", { detail: { url }, bubbles: true }));
  }

  showContextMenu(e, bookmark) {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 168);
    const y = Math.min(e.clientY, window.innerHeight - 112);
    this.contextMenu = { x, y, bookmark };
  }

  getFaviconUrl(url) {
    if (!url) return "";
    try {
      return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=16`;
    } catch (e) {
      return "";
    }
  }

  render() {
    if (this.loading) {
      return html`<div class="loading-state">
        <div class="loading-spinner"></div>
        <span>Loading bookmarks…</span>
      </div>`;
    }

    const filteredBookmarks = this.getFilteredBookmarks();

    if (filteredBookmarks.length === 0 && !this.searchQuery) {
      return html`<div class="empty-state"><span>No bookmarks found</span></div>`;
    }

    return html`
      <div class="bookmarks-tree">
        ${this.renderSearch()}
        ${this.renderTagControls()}
        <div class="tag-list" @scroll="${() => this.handleScroll()}">
          ${this.tags.map((tag) => this.renderTagGroup(tag))}
          ${filteredBookmarks.length === 0
            ? html`<div class="no-results">No results for "${this.searchQuery}"</div>`
            : ""}
        </div>
      </div>
      ${this.contextMenu ? this.renderContextMenu() : ""}
    `;
  }

  renderSearch() {
    return html`<div class="search-bar">
      <input
        type="text"
        class="form-input"
        placeholder="Search bookmarks..."
        .value="${this.searchQuery}"
        @input="${(e) => { this.searchQuery = e.target.value; }}"
      />
    </div>`;
  }

  renderTagControls() {
    return html`<div class="tag-controls">
      <button class="btn btn-link btn-sm" @click="${() => this.expandAll()}">Expand all</button>
      <span class="tag-controls-divider">·</span>
      <button class="btn btn-link btn-sm" @click="${() => this.collapseAll()}">Collapse all</button>
    </div>`;
  }

  renderTagGroup(tag) {
    const tagBookmarks = this.getBookmarksByTag(tag.name);
    const isExpanded = this.expandedTags[tag.name];

    if (tagBookmarks.length === 0) return html``;

    return html`
      <div class="tag-group">
        <div class="tag-header" @click="${() => this.toggleTag(tag.name)}">
          <span class="tree-arrow">${isExpanded ? "▼" : "▶"}</span>
          ${isExpanded ? icons.folderOpen() : icons.folder()}
          <span class="tag-name">${tag.name}</span>
          <span class="tag-count">${tagBookmarks.length}</span>
        </div>
        ${isExpanded
          ? html`<div class="tag-bookmarks">
              ${tagBookmarks.map((bookmark, index) => html`
                <div
                  class="bookmark-item"
                  @click="${() => this.openInNewTab(bookmark.url)}"
                  @contextmenu="${(e) => this.showContextMenu(e, bookmark)}"
                >
                  <span class="tree-connector">${index === tagBookmarks.length - 1 ? "└" : "├"}</span>
                  <img
                    class="bookmark-favicon"
                    src="${bookmark.favicon_url || this.getFaviconUrl(bookmark.url)}"
                    width="16"
                    height="16"
                    @error="${(e) => { e.target.style.visibility = "hidden"; }}"
                  />
                  <span class="bookmark-title" title="${bookmark.url}">
                    ${bookmark.title || bookmark.website_title || bookmark.url}
                  </span>
                </div>
              `)}
            </div>`
          : ""}
      </div>
    `;
  }

  renderContextMenu() {
    const { x, y, bookmark } = this.contextMenu;
    return html`
      <div class="context-menu" style="top:${y}px;left:${x}px" @click="${(e) => e.stopPropagation()}">
        <button class="context-menu-item" @click="${() => { this.openInNewTab(bookmark.url); this.contextMenu = null; }}">
          New tab
        </button>
        <button class="context-menu-item" @click="${() => { this.openInSameTab(bookmark.url); this.contextMenu = null; }}">
          Same tab
        </button>
        <div class="context-menu-divider"></div>
        <button class="context-menu-item" @click="${() => { this.dispatchEvent(new CustomEvent("edit-bookmark", { detail: { bookmark }, bubbles: true })); this.contextMenu = null; }}">
          Edit
        </button>
      </div>
    `;
  }
}

customElements.define("ld-bookmarks-tree", BookmarksTree);
