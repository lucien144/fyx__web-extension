# Privacy Policy

**Extension:** Fyx for Web
**Last updated:** 2026-08-24

## Summary

Fyx for Web does not collect, transmit, sell, or share any personal or user
data. It has no server, no analytics, and no network requests of its own.

## What the extension does

Fyx for Web is a content-script-only browser extension that enhances the user
interface of the [nyx.cz](https://www.nyx.cz) discussion website. It runs
exclusively on `nyx.cz` / `www.nyx.cz` pages and modifies their DOM to add
usability features (Markdown editor, NSFW media blur, keyboard submit, a
resizable context menu, and relocation of the notifications indicator).

## Data storage

The extension stores a small amount of state **locally on your device only**,
using the browser's `storage.local` API and the page's own `localStorage`:

- whether the Markdown editor is enabled,
- the per-conversation NSFW blur on/off flag,
- a temporary draft of a post while it is being previewed (so it is not lost
  across the preview reload).

This data never leaves your device. It is not sent to us or to any third party,
because the extension has no backend and makes no network calls. Removing the
extension removes this locally stored state.

## Data collection

None. The extension does not collect any of the following: personally
identifiable information, health information, financial or payment information,
authentication information, personal communications, location, web history,
user activity, or website content.

## Third parties

The extension does not use or transfer any user data to third parties. It does
not use data for purposes unrelated to its single purpose, and does not use data
to determine creditworthiness or for lending purposes.

## Permissions

- **storage** — used only to persist the local preferences listed above.
- **Host access** (`https://nyx.cz/*`, `https://www.nyx.cz/*`) — required so the
  content script can modify nyx.cz pages. No other sites are accessed.

## Contact

Questions about this policy can be raised via the project's GitHub repository:
https://github.com/lucien144/fyx__web-extension/issues

## Changes

This policy may be updated as the extension evolves. Material changes will be
reflected by updating the "Last updated" date above.
