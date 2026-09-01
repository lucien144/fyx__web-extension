# Refined Nyx.cz

> Browser extension that simplifies the Nyx.cz interface and adds useful features.

## Features

- [x] Toggle menu (enable/disable each feature globally from the toolbar popup)
- [x] Markdown support
- [x] NSFW filter (discussions, mail)
- [x] Notifications in menubar
- [x] CMD + Enter submit
- [x] Context menu resize
- [x] Code highlight (JetBrains Mono)
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
pnpm build         # production build → .output/chrome-mv3/
pnpm zip           # packaged .zip for the Chrome Web Store → .output/
pnpm compile       # TypeScript typecheck (tsc --noEmit)
pnpm lint          # ESLint (flat config)
pnpm format:check  # Prettier check (pnpm format to write)
pnpm test          # Vitest (unit tests on pure logic)
```

## Build for the Chrome Web Store

The manifest **version is generated at build time** — `wxt.config.ts` stamps it
as `[year].[day-of-year].[hourminute]` (UTC), e.g. `2026.244.830`. It is
monotonic across the day/year, stays within Chrome's `0–65535` per-segment
limit, and always increases, which the Web Store requires. `package.json`'s
`version` is ignored for the extension; there is no version to bump by hand.

### Automated release (the normal path)

Every push to **`master`** runs the `Release` GitHub Action, which:

1. runs the full check suite (`lint`, `format:check`, `compile`, `test`);
2. runs `pnpm zip` — stamps the manifest with the current UTC timestamp and
   produces the store `.zip` in `.output/`;
3. publishes a **GitHub Release**: creates the `v<version>` tag at that commit,
   attaches the `.zip`, and auto-generates notes from the merged PRs/commits.

**Uploading the `.zip` to the Chrome Web Store is a manual step** — download it
from the GitHub Release (or build it locally) and upload it in the
[Developer Dashboard](https://chrome.google.com/webstore/devconsole). Nothing
pushes to the store automatically.

`develop` and pull requests run the `CI` workflow only (same checks plus
`pnpm build`, no release).

### Local packaging (offline / manual)

```sh
pnpm zip           # → .output/<name>-<version>-chrome.zip, ready to upload
pnpm pack:local    # pnpm zip, then tag HEAD with v<version> from the built
                   #   manifest (fails on a dirty tree; the tag is not pushed)
```

Use this only when you need a store `.zip` without going through the `master`
release — e.g. a one-off manual upload. Prefer the automated release above for
anything that ships.
