# Refined Nyx.cz

> Browser extension that simplifies the Nyx.cz interface and adds useful features.

## Features

- [x] Toggle menu (enable/disable each feature globally from the toolbar popup)
- [x] Markdown support
- [x] NSFW filter (discussions, mail)
- [x] Notifications in menubar
- [x] CMD + Enter submit
- [x] Context menu resize
- [ ] Context menu - add user ID
- [ ] Fyx theme
- [ ] Dracula theme
- [ ] Theme switcher
- [ ] Drafts
- [x] ~~Tags~~

## Dev

Built with [WXT](https://wxt.dev) (Manifest V3, Chrome). Requires **pnpm** and Node ≥ 24.

### Setup

```sh
pnpm install
```

### Run

```sh
pnpm dev
```

This starts the dev server and builds the extension into `.output/chrome-mv3-dev/`.
It does **not** auto-open Chrome — load it into your own browser once:

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked** and select the folder printed by `pnpm dev`:
   `.output/chrome-mv3-dev` (the CLI prints the absolute path on start)
4. Open [nyx.cz](https://www.nyx.cz)

On every source change WXT rebuilds and auto-reloads the extension — no need to
re-load it or refresh manually. Loading unpacked into your normal Chrome keeps
you logged in to nyx.cz.

> The `http://localhost:3000` (or `:3001`) dev server returning 404 is expected —
> it's the internal HMR server, not a page to visit.

### Other scripts

```sh
pnpm build     # production build → .output/chrome-mv3/
pnpm zip       # packaged .zip for the Chrome Web Store
pnpm compile   # TypeScript typecheck (tsc --noEmit)
```
