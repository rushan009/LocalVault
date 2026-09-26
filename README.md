# LocalVault

A local-first document vault built as a Chrome Extension (Manifest V3). Store files privately in your browser, browse them from a simple popup UI, and insert saved files directly into any website's file upload field — right from the right-click menu.

No cloud. No servers. No accounts. Everything lives in your browser's own storage.

> **Status: work in progress / learning project.** Core vault and page-integration features work. Encryption is not yet implemented — see [Roadmap](#roadmap) below.

---

## Features

- **Local storage** — files are saved in the browser's IndexedDB, not sent anywhere.
- **Simple vault UI** — add files, view your saved collection, see file name/type/size at a glance.
- **Right-click "Use from Vault"** — right-click any file input on any website, pick a file from your vault, and it's inserted as if you'd chosen it yourself from your computer.
- **Persistent** — files survive closing the popup, reloading the browser, and restarting your computer.
- **Manifest V3** — built on the current Chrome extension platform, using a background service worker, content scripts, and message passing between them.

## How it works

LocalVault is built from a few separate pieces that communicate with each other:

| Piece | Role |
|---|---|
| **Popup** (`App.jsx`) | The UI you see when clicking the extension icon. Add files, browse your vault, pick a file to insert. |
| **Background script** (`background.js`) | Registers the right-click context menu, relays messages between the popup and the active tab. |
| **Content script** (`content.js`) | Injected into every webpage. Detects file inputs, remembers what you right-clicked, and performs the actual insertion using the `DataTransfer` API. |
| **IndexedDB** (`db.js`) | Where files and their metadata are actually stored, via the [`idb`](https://github.com/jakearchibald/idb) library. |

When you right-click a file input and choose "Use from Local Vault," the extension opens the popup in a special "pick mode." Selecting a file there sends its data through the background script to the content script running on that page, which reconstructs a `File` object and assigns it to the target input — no clipboard, no drag-and-drop required.

## Tech stack

- **React** — popup UI
- **Vite** + **[@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)** — build tooling for bundling a multi-context extension (popup, background, content script) from one Vite project
- **idb** — a small promise-based wrapper around the native IndexedDB API
- Plain JavaScript (no TypeScript, by choice, for this project)

## Getting started

```bash
git clone <this-repo-url>
cd local-vault
npm install
npm run build
```

Then load it into Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder produced by `npm run build`

For active development with hot-reload:

```bash
npm run dev
```

Load the `dist/` folder the same way — CRXjs will auto-rebuild on file changes. Note: the popup needs to be closed and reopened to pick up changes; the background service worker sometimes needs a manual reload from `chrome://extensions`.

## Project structure

```
src/
  App.jsx        # Popup UI and vault logic
  App.css        # Popup styling
  db.js          # IndexedDB read/write helpers
  background.js  # Service worker: context menu + message relay
  content.js     # Injected into every page: detects targets, inserts files
manifest.config.js  # Extension manifest, defined in JS for CRXjs
vite.config.js
```

## Known limitations

- **No encryption yet.** Files are currently stored in IndexedDB as plaintext. Anyone with access to your browser profile on disk could technically read them. This is the top item on the roadmap.
- **"Use from Vault" only works reliably on real `<input type="file">` elements.** Many modern sites (chat apps, some upload widgets) build custom file pickers out of styled `<div>`s/buttons rather than a directly-clickable file input, which this extension can't currently detect. Traditional forms, email clients, and many upload dialogs work well.
- **Paste-target insertion (chat boxes, etc.) is unreliable by design.** Some sites accept synthetic paste events; many deliberately reject them (checking `event.isTrusted`) as a security measure. This isn't fixable from the extension side.
- **No drag-and-drop yet** for adding files into the vault (files are added via a file picker button only).



## Security note

This is a personal/educational project and has **not** been security-audited. Until the encryption layer is implemented, do not use it to store sensitive documents. See [Known limitations](#known-limitations) above.

## License

MIT (or your preferred license — update this section before publishing).
