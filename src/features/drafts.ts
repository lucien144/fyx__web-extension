import './drafts.scss';
import { browser } from 'wxt/browser';
import {
    conversationKey,
    draftKeyPrefix,
    draftStorageKey,
    PENDING_KEY,
    type PendingDraft,
} from './drafts-key';

// Persists an in-progress reply per conversation (discussion or mail) so a
// half-written message survives a reload, an accidental logout, or coming back
// later. The draft is cleared once the message is actually sent.
//
// Send does a full page navigation, so "was it sent?" can't be checked inline.
// Instead of deleting on submit, the draft is stashed in PENDING_KEY and the
// deletion is confirmed on the next load: the reply form is present again
// (send went through) → clear; the form is gone (redirected to login / send
// failed) → restore the draft. See CLAUDE.md notes on cross-reload state.
//
// Drafts are namespaced by the logged-in nyx user because storage.local is per
// browser profile, not per account — otherwise a draft would surface for the
// next person who logs in on the same machine.

const DEBOUNCE_MS = 500;

const REPLY_TEXTAREA = '.mform textarea[name=content], .mform textarea[name=message]';

/** Read the logged-in nyx nick from the header, or undefined if not present. */
function currentUser(): string | undefined {
    const nick = document.querySelector<HTMLElement>('.header .info .nick')?.innerText?.trim();
    return nick || undefined;
}

// Bookmark pages (/bookmarks, /bookmarks/history) list saved conversations but
// have no reply form. Flag the ones with a stored draft so the user can see at a
// glance which threads they left half-written, without opening each.
const BOOKMARK_ITEM = '.bookmark-list li';
const DISCUSSION_LINK = 'a[href*="/discussion/"]';

export function initDrafts() {
    // Bookmark listing is user-namespaced like the drafts themselves; only run
    // it when logged in (nick present). It no-ops off the bookmark pages.
    const user = currentUser();
    if (user) {
        void markBookmarkDrafts(user);
    }

    const textarea = document.querySelector<HTMLTextAreaElement>(REPLY_TEXTAREA);

    // No reply form on this page (logged out, non-conversation page, …). If a
    // send was in flight, it did not land on a postable page → treat as failed
    // and restore the draft so it is not lost. The user namespace is carried in
    // the stashed draft, so no logged-in user is needed here.
    if (!textarea) {
        void recoverPendingWithoutForm();
        return;
    }

    // The reply form only renders when logged in, so the nick should be present.
    // If it isn't, bail rather than risk writing an un-namespaced draft.
    if (!user) {
        return;
    }

    const convKey = conversationKey(location.pathname);
    const storageKey = draftStorageKey(user, convKey);

    void resolvePendingAndRestore(textarea, storageKey);

    let timer: ReturnType<typeof setTimeout> | undefined;
    textarea.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const value = textarea.value;
            if (value.trim() === '') {
                void browser.storage.local.remove(storageKey);
            } else {
                void browser.storage.local.set({ [storageKey]: value });
            }
        }, DEBOUNCE_MS);
    });

    const form = textarea.form;
    form?.addEventListener('submit', (event) => {
        const sender = (event as SubmitEvent).submitter?.getAttribute('name');
        // Preview keeps the draft (the message wasn't sent). Only a real send
        // hands the draft off for confirm-on-next-load; it is never deleted
        // synchronously here, so a lost pending write cannot lose the draft.
        if (sender !== 'send') {
            return;
        }
        const value = textarea.value;
        if (value.trim() === '') {
            void browser.storage.local.remove(storageKey);
            return;
        }
        const pending: PendingDraft = { user, key: convKey, value };
        void browser.storage.local.set({ [PENDING_KEY]: pending });
    });
}

// Reply form is present: if we just came back from a send, the draft went
// through — clear it. Otherwise restore any saved draft into an empty textarea.
async function resolvePendingAndRestore(
    textarea: HTMLTextAreaElement,
    storageKey: string,
): Promise<void> {
    const stored = await browser.storage.local.get(PENDING_KEY);
    const pending = stored[PENDING_KEY] as PendingDraft | undefined;

    if (pending) {
        await browser.storage.local.remove([
            PENDING_KEY,
            draftStorageKey(pending.user, pending.key),
        ]);
        // Leave the textarea as nyx left it after a successful send (empty).
        return;
    }

    const draft = await browser.storage.local.get(storageKey);
    const value = draft[storageKey];
    // Don't clobber a nyx pre-fill (quote/reply) or an already-typed message.
    if (typeof value === 'string' && textarea.value.trim() === '') {
        textarea.value = value;
    }
}

// No reply form on this load. A pending send means it did not reach a postable
// page (logout / redirect) → move the draft back into normal storage so it
// survives until the user returns to the conversation.
async function recoverPendingWithoutForm(): Promise<void> {
    const stored = await browser.storage.local.get(PENDING_KEY);
    const pending = stored[PENDING_KEY] as PendingDraft | undefined;
    if (!pending) {
        return;
    }
    await browser.storage.local.set({
        [draftStorageKey(pending.user, pending.key)]: pending.value,
    });
    await browser.storage.local.remove(PENDING_KEY);
}

// Append a pencil marker to every bookmark whose linked discussion still has a
// draft saved for the logged-in user. No-ops off the bookmark pages (no items).
async function markBookmarkDrafts(user: string): Promise<void> {
    const items = document.querySelectorAll<HTMLLIElement>(BOOKMARK_ITEM);
    if (items.length === 0) {
        return;
    }

    // One read of the whole store, then keep only this user's non-empty drafts.
    // The conversation key is whatever follows the user prefix.
    const prefix = draftKeyPrefix(user);
    const all = await browser.storage.local.get(null);
    const convKeysWithDraft = new Set<string>();
    for (const [key, value] of Object.entries(all)) {
        if (key.startsWith(prefix) && typeof value === 'string' && value.trim() !== '') {
            convKeysWithDraft.add(key.slice(prefix.length));
        }
    }
    if (convKeysWithDraft.size === 0) {
        return;
    }

    for (const item of items) {
        // Idempotent: don't stack markers if init runs more than once.
        if (item.dataset.fyxDraftMarked) {
            continue;
        }
        const link = item.querySelector<HTMLAnchorElement>(DISCUSSION_LINK);
        if (!link) {
            continue;
        }
        const convKey = conversationKey(new URL(link.href, location.origin).pathname);
        if (!convKeysWithDraft.has(convKey)) {
            continue;
        }
        item.dataset.fyxDraftMarked = 'true';
        const wrapper = document.createElement('span');
        wrapper.className = 'fyx__draft-icon';
        const icon = document.createElement('span');
        icon.className = 'icon-entypo icon-pencil';
        wrapper.appendChild(icon);
        item.appendChild(wrapper);
    }
}
