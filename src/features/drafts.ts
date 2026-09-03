import './drafts.scss';
import { browser } from 'wxt/browser';
import {
    conversationKey,
    draftKeyPrefix,
    draftStorageKey,
    PENDING_KEY,
    type PendingDraft,
} from './drafts-key';

// Persists an in-progress reply per conversation so it survives a reload/logout.
// Send is a full navigation, so deletion is deferred: the draft is stashed in
// PENDING_KEY and resolved on the next load — form present → sent, clear it;
// form gone → send failed, restore it. Namespaced per nyx user (storage.local
// is per browser profile, not per account).

const DEBOUNCE_MS = 500;

const REPLY_TEXTAREA = '.mform textarea[name=content], .mform textarea[name=message]';

function currentUser(): string | undefined {
    const nick = document.querySelector<HTMLElement>('.header .info .nick')?.innerText?.trim();
    return nick || undefined;
}

const BOOKMARK_ITEM = '.bookmark-list li';
const DISCUSSION_LINK = 'a[href*="/discussion/"]';

export function initDrafts() {
    const user = currentUser();
    if (user) {
        void markBookmarkDrafts(user);
    }

    const textarea = document.querySelector<HTMLTextAreaElement>(REPLY_TEXTAREA);

    // No reply form (logged out / non-conversation page): a pending send never
    // reached a postable page, so restore it. The stashed draft carries its own
    // user namespace, so no logged-in user is needed here.
    if (!textarea) {
        void recoverPendingWithoutForm();
        return;
    }

    // Bail rather than risk writing an un-namespaced draft.
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
        // Only a real send hands the draft off; preview keeps it untouched.
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

// Form present: a pending send went through → clear it; otherwise restore any
// saved draft into an empty textarea.
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
        return;
    }

    const draft = await browser.storage.local.get(storageKey);
    const value = draft[storageKey];
    // Don't clobber a nyx pre-fill (quote/reply) or an already-typed message.
    if (typeof value === 'string' && textarea.value.trim() === '') {
        textarea.value = value;
    }
}

// No form on this load: a pending send failed → move the draft back into normal
// storage so it survives until the user returns to the conversation.
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
