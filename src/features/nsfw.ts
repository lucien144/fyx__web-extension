import './nsfw.scss';
import { browser } from 'wxt/browser';

// NSFW filter is remembered per context (discussion or mail conversation) under
// `fyx__nsfw_enabled__<context>`. Off by default.
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

// Synchronous localStorage mirror of the async `storage.local` flag. Seeds the
// blur state on load without a tick's delay (which would flash unblurred media);
// `storage.local` reconciles afterwards.
function readMirror(key: string): boolean {
    try {
        return window.localStorage.getItem(key) === '1';
    } catch {
        return false;
    }
}

function writeMirror(key: string, value: boolean): void {
    try {
        if (value) {
            window.localStorage.setItem(key, '1');
        } else {
            window.localStorage.removeItem(key);
        }
    } catch {
        // localStorage may be blocked (privacy settings); storage.local stays
        // the source of truth, we just lose the flash-free load optimisation.
    }
}

// Context from the URL: /discussion/<id> (fallback: data-discussion-id) or
// /mail/*. null everywhere else — the filter only fits message pages.
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

    // Inject the toggle as the last of the footer's nav controls.
    const badge = `<span class="control-group fyx__nsfw-toggle"><span class="btn" title="NSFW filtr pro tuto ${context.noun}"><svg class="fyx__nsfw-icon" viewBox="0 0 458 183" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M419 0C440.539 6.4426e-06 458 17.4609 458 39V144C458 165.539 440.539 183 419 183H39C17.4609 183 0 165.539 0 144V39C0 17.4609 17.4609 0 39 0H419ZM167.137 44C159.773 44 153.243 45.2428 147.546 47.7275C141.879 50.2124 137.44 53.6822 134.228 58.1367C131.046 62.5609 129.47 67.7277 129.5 73.6367C129.47 80.9093 131.819 86.6512 136.546 90.8633C141.303 95.0451 147.804 98.0305 156.046 99.8184L165.318 101.818C168.773 102.576 171.516 103.394 173.546 104.272C175.576 105.121 177.03 106.091 177.909 107.182C178.818 108.242 179.288 109.485 179.318 110.909C179.288 112.424 178.803 113.772 177.863 114.954C176.924 116.136 175.546 117.061 173.728 117.728C171.909 118.394 169.651 118.728 166.954 118.728C163.742 118.727 160.97 118.227 158.637 117.228C156.334 116.228 154.545 114.758 153.272 112.818C152 110.879 151.288 108.485 151.137 105.637H127.137C127.167 113.424 128.834 119.818 132.137 124.818C135.47 129.788 140.137 133.469 146.137 135.863C152.167 138.257 159.228 139.454 167.318 139.454C175.197 139.454 181.94 138.349 187.546 136.137C193.182 133.925 197.516 130.696 200.546 126.454C203.576 122.212 205.106 117.03 205.137 110.909C205.106 107.364 204.53 104.091 203.409 101.091C202.318 98.0908 200.606 95.3939 198.272 93C195.939 90.5758 192.939 88.4695 189.272 86.6816C185.606 84.8939 181.197 83.4542 176.046 82.3633L168.409 80.7275C166.197 80.273 164.288 79.7574 162.682 79.1816C161.076 78.6059 159.758 77.9694 158.728 77.2725C157.697 76.5452 156.939 75.7421 156.454 74.8633C156 73.9544 155.803 72.9393 155.863 71.8184C155.894 70.4547 156.303 69.2422 157.091 68.1816C157.879 67.1211 159.091 66.2877 160.728 65.6816C162.394 65.0454 164.531 64.7275 167.137 64.7275C171.227 64.7276 174.273 65.5757 176.272 67.2725C178.303 68.9694 179.439 71.3332 179.682 74.3633H203.863C203.833 68.2726 202.318 62.9545 199.318 58.4092C196.349 53.8335 192.121 50.2876 186.637 47.7725C181.152 45.2573 174.652 44 167.137 44ZM37 45.2725V138.363H62.2725V89.4541H62.8184L96.4541 138.363H117.546V45.2725H92.2725V94H91.5459L58.4541 45.2725H37ZM214.75 45.2725V138.363H240.022V102H276.204V81.6367H240.022V65.6367H280.204V45.2725H214.75ZM285.682 45.2725L313.137 138.363H337.318L353.137 86.3633H353.863L369.682 138.363H393.863L421.318 45.2725H393.137L380.409 102.728H379.682L364.591 45.2725H342.409L327.318 102.546H326.591L313.863 45.2725H285.682Z" fill="currentColor"/></svg></span></span>`;
    const navControls = document.querySelector(
        '#discussion-wrapper footer > div.nav-controls.control-group, section.mform.mail > footer > div.nav-controls.control-group',
    );
    navControls?.insertAdjacentHTML('beforeend', badge);
    const toggleBtn = document.querySelector<HTMLElement>('.control-group.fyx__nsfw-toggle .btn');

    let enabled = readMirror(storageKey);

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
        writeMirror(storageKey, enabled);
        applyState();
    });

    toggleBtn?.addEventListener('click', () => {
        enabled = !enabled;
        writeMirror(storageKey, enabled);
        applyState();
        browser.storage.local.set({ [storageKey]: enabled });
    });

    // Keep other open tabs of the same context in sync.
    browser.storage.onChanged.addListener((changes, area) => {
        const change = changes[storageKey];
        if (area === 'local' && change) {
            enabled = Boolean(change.newValue);
            writeMirror(storageKey, enabled);
            applyState();
        }
    });

    // One delegated listener lifts the blur on click. The blur itself is pure
    // CSS (root class + media selector), so ajax-loaded posts are covered too.
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
