// Pure helpers for the drafts feature — no DOM/browser imports so they can be
// unit-tested in isolation (see drafts-key.test.ts).

/** Storage-key prefix for a per-conversation draft. */
export const DRAFT_PREFIX = 'fyx__draft__';

/** Single global slot holding the draft handed off across a send navigation. */
export const PENDING_KEY = 'fyx__draft_pending';

/** The draft handed off from a send submit to the next page load. */
export interface PendingDraft {
    /** Logged-in nyx user the draft belongs to. */
    user: string;
    /** Conversation key the draft belongs to. */
    key: string;
    /** The draft text. */
    value: string;
}

/**
 * Reduce a location pathname to a stable per-conversation key.
 *
 * nyx.cz URLs anchor to a specific post via a trailing `/id/<postId>` segment
 * that changes as new posts arrive, so it is stripped:
 *   /discussion/<id>/id/58959882 -> /discussion/<id>
 *   /mail/<thread>/id/999        -> /mail/<thread>
 * Discussion and mail threads without an anchor are returned as-is.
 */
export function conversationKey(pathname: string): string {
    const withoutAnchor = pathname.replace(/\/id\/\d+\/?$/, '');
    const trimmed = withoutAnchor.replace(/\/$/, '');
    return trimmed === '' ? '/' : trimmed;
}

/**
 * Prefix shared by all of a user's draft storage keys. Everything after it is
 * the conversation key, so it doubles as the boundary for listing a user's
 * drafts back out of `storage.local`.
 */
export function draftKeyPrefix(user: string): string {
    return `${DRAFT_PREFIX}${user}__`;
}

/**
 * Full storage key for a conversation's draft, namespaced by the logged-in nyx
 * user. `storage.local` is per browser profile, not per nyx account, so without
 * the user namespace a draft would surface for anyone who logs in afterwards.
 */
export function draftStorageKey(user: string, convKey: string): string {
    return `${draftKeyPrefix(user)}${convKey}`;
}
