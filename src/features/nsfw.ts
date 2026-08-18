import './nsfw.scss';
import { browser } from 'wxt/browser';

// NSFW filter is remembered per context — a discussion or a mail conversation.
// Each context stores its own on/off flag under `fyx__nsfw_enabled__<context>`.
// Off by default.
const STORAGE_PREFIX = 'fyx__nsfw_enabled__';
const ACTIVE_CLASS = 'fyx__nsfw-active';
const REVEALED_CLASS = 'fyx__nsfw--revealed';
const MEDIA_SELECTOR = '.wc .wci';

interface NsfwContext {
    /** Stable storage suffix, e.g. `discussion__16344` or `mail__ZANNA`. */
    key: string;
    /** Human noun for the toggle tooltip. */
    noun: string;
}

// Identify the current context from the URL:
//   /discussion/<id>  → per discussion (fallback: data-discussion-id in markup)
//   /mail/*           → per mail conversation
// Returns null everywhere else (the filter only makes sense on message pages).
function getContext(): NsfwContext | null {
    const path = window.location.pathname;

    const discussion = path.match(/\/discussion\/(\d+)/);
    if (discussion?.[1]) {
        return { key: 'discussion__' + discussion[1], noun: 'diskuzi' };
    }

    if (/^\/mail(\/|$)/.test(path)) {
        const rest = path.replace(/^\/mail\/?/, '').replace(/\/$/, '');
        return { key: 'mail__' + (rest || 'inbox'), noun: 'poštu' };
    }

    const stamped = document
        .querySelector('[data-discussion-id]')
        ?.getAttribute('data-discussion-id');
    if (stamped) {
        return { key: 'discussion__' + stamped, noun: 'diskuzi' };
    }

    return null;
}

export function initNsfw() {
    const context = getContext();
    if (!context) {
        return; // Only meaningful inside a discussion or mail conversation.
    }

    const storageKey = STORAGE_PREFIX + context.key;
    const root = document.documentElement;

    // Inject the toggle after the last compose-form switch, mirroring how the
    // markdown badge is placed. Present on both discussion and mail forms.
    const badge = `<span class="control-group fyx__nsfw-toggle"><span class="btn" title="NSFW filtr pro tuto ${context.noun}"><span class="icon-entypo icon-eye"></span></span></span>`;
    const switches = document.querySelectorAll(
        '.mform.discussion .control-group.switch, .mform.mail .control-group.switch',
    );
    switches[switches.length - 1]?.insertAdjacentHTML('afterend', badge);
    const toggleBtn = document.querySelector<HTMLElement>('.control-group.fyx__nsfw-toggle .btn');

    let enabled = false;

    const applyState = () => {
        root.classList.toggle(ACTIVE_CLASS, enabled);
        toggleBtn?.classList.toggle('active', enabled);
        // Re-hide everything whenever the filter is (re)enabled.
        if (enabled) {
            document
                .querySelectorAll('.' + REVEALED_CLASS)
                .forEach((el) => el.classList.remove(REVEALED_CLASS));
        }
    };
    applyState();

    browser.storage.local.get(storageKey).then((result) => {
        enabled = Boolean(result[storageKey]);
        applyState();
    });

    toggleBtn?.addEventListener('click', () => {
        enabled = !enabled;
        applyState();
        browser.storage.local.set({ [storageKey]: enabled });
    });

    // Keep other open tabs of the same discussion in sync.
    browser.storage.onChanged.addListener((changes, area) => {
        const change = changes[storageKey];
        if (area === 'local' && change) {
            enabled = Boolean(change.newValue);
            applyState();
        }
    });

    // One delegated listener lifts the blur on click. Because the blur is gated
    // purely by CSS (root class + media selector), ajax-loaded posts are covered
    // without re-tagging individual elements.
    document.addEventListener(
        'click',
        (event) => {
            if (!enabled) {
                return;
            }
            const target = event.target;
            if (!(target instanceof HTMLImageElement) && !(target instanceof HTMLVideoElement)) {
                return;
            }
            if (target.classList.contains(REVEALED_CLASS) || !target.closest(MEDIA_SELECTOR)) {
                return;
            }
            // Swallow the first click so it only lifts the blur, nothing else.
            event.preventDefault();
            event.stopPropagation();
            target.classList.add(REVEALED_CLASS);
        },
        true,
    );
}
