import './nsfw.scss';
import { browser } from 'wxt/browser';

// NSFW filter is remembered per discussion. Each discussion stores its own
// on/off flag under `fyx__nsfw_enabled__<discussionId>`. Off by default.
const STORAGE_PREFIX = 'fyx__nsfw_enabled__';
const ACTIVE_CLASS = 'fyx__nsfw-active';
const REVEALED_CLASS = 'fyx__nsfw--revealed';
const MEDIA_SELECTOR = '.wc .wci';

const TOGGLE_BADGE =
    '<span class="control-group fyx__nsfw-toggle"><span class="btn" title="NSFW filtr pro tuto diskuzi"><span class="icon-entypo icon-eye"></span></span></span>';

// The discussion id comes from the URL (…/discussion/<id>) with a fallback to
// the `data-discussion-id` nyx.cz stamps on every post wrapper.
function getDiscussionId(): string | null {
    const fromUrl = window.location.pathname.match(/\/discussion\/(\d+)/);
    if (fromUrl) {
        return fromUrl[1] ?? null;
    }
    return document.querySelector('[data-discussion-id]')?.getAttribute('data-discussion-id') ?? null;
}

export function initNsfw() {
    const discussionId = getDiscussionId();
    if (!discussionId) {
        return; // Only meaningful inside a discussion.
    }

    const storageKey = STORAGE_PREFIX + discussionId;
    const root = document.documentElement;

    // Inject the per-discussion toggle after the last compose-form switch,
    // mirroring how the markdown badge is placed.
    const switches = document.querySelectorAll('.mform.discussion .control-group.switch');
    switches[switches.length - 1]?.insertAdjacentHTML('afterend', TOGGLE_BADGE);
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
