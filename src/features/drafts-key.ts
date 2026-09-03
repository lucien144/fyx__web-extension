// Pure helpers for the drafts feature — no DOM/browser imports so they can be
// unit-tested in isolation (see drafts-key.test.ts).

export const DRAFT_PREFIX = 'fyx__draft__';

// Single global slot holding the draft handed off across a send navigation.
export const PENDING_KEY = 'fyx__draft_pending';

export interface PendingDraft {
    user: string;
    key: string;
    value: string;
}

/**
 * Reduce a location pathname to a stable per-conversation key by stripping the
 * trailing `/id/<postId>` anchor (which changes as new posts arrive):
 *   /discussion/<id>/id/58959882 -> /discussion/<id>
 */
export function conversationKey(pathname: string): string {
    const withoutAnchor = pathname.replace(/\/id\/\d+\/?$/, '');
    const trimmed = withoutAnchor.replace(/\/$/, '');
    return trimmed === '' ? '/' : trimmed;
}

// Prefix shared by all of a user's draft keys; also the boundary for listing
// them back out of storage.local.
export function draftKeyPrefix(user: string): string {
    return `${DRAFT_PREFIX}${user}__`;
}

// Full draft key, namespaced by nyx user (storage.local is per browser profile,
// not per account).
export function draftStorageKey(user: string, convKey: string): string {
    return `${draftKeyPrefix(user)}${convKey}`;
}
