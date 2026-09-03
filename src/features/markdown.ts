import './markdown.scss';
import { browser } from 'wxt/browser';
import { renderNyxMarkdown } from './markdown-render';

const PREVIEW_KEY = 'fyx__preview';
const ENABLED_KEY = 'fyx__markdown_enabled';

const MARKDOWN_BADGE =
    '<span class="control-group markdown"><span class="btn"><span class="icon-entypo icon-markdown"></span></span></span>';

export function initMarkdown() {
    document?.documentElement?.classList.add('fyx__markdown');

    // Mark the mail/discussion toolbar as markdown-enabled (after the last switch).
    const switches = document.querySelectorAll(
        '.fyx__markdown .mform.mail .control-group.switch, .fyx__markdown .mform.discussion .control-group.switch',
    );
    switches[switches.length - 1]?.insertAdjacentHTML('afterend', MARKDOWN_BADGE);

    // Remembered globally, toggled by the injected badge. Disabled by default.
    let enabled = false;
    const toggleBtn = document.querySelector<HTMLElement>('.control-group.markdown .btn');

    const applyState = () => toggleBtn?.classList.toggle('active', enabled);
    applyState();

    browser.storage.local.get(ENABLED_KEY).then((result) => {
        enabled = Boolean(result[ENABLED_KEY]);
        applyState();
    });

    toggleBtn?.addEventListener('click', () => {
        enabled = !enabled;
        applyState();
        browser.storage.local.set({ [ENABLED_KEY]: enabled });
    });

    // Keep every open tab in sync when the state changes elsewhere.
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && ENABLED_KEY in changes) {
            enabled = Boolean(changes[ENABLED_KEY].newValue);
            applyState();
        }
    });

    // Restore a preview hand-off stashed before a previous reload.
    browser.storage.local.get(PREVIEW_KEY).then((result) => {
        const preview = result[PREVIEW_KEY];
        if (typeof preview === 'string') {
            const textarea: HTMLTextAreaElement | null = document.querySelector(
                '.mform.mail textarea, .mform.discussion textarea',
            );
            if (textarea) {
                textarea.value = preview;
                browser.storage.local.remove(PREVIEW_KEY);
            }
        }
    });

    const form: HTMLFormElement | null = document.querySelector('.l1c form, .l2cc form');
    form?.addEventListener('submit', function (event) {
        // When markdown is disabled, submit the raw text as nyx.cz would natively.
        if (!enabled) {
            return;
        }
        const textarea: HTMLTextAreaElement | null = form?.querySelector('textarea');
        if (textarea) {
            const { id, name } = textarea;
            textarea.id = `_${id}`;
            textarea.name = `_${name}`;
            const message = document.createElement('input');
            message.setAttribute('type', 'hidden');
            message.setAttribute('id', id);
            message.setAttribute('name', name);

            message.setAttribute('value', renderNyxMarkdown(textarea.value));
            form.appendChild(message);

            const sender = (event as SubmitEvent).submitter?.getAttribute('name');
            // If preview, store the value to restore it after the reload.
            if (sender === 'preview') {
                browser.storage.local.set({ [PREVIEW_KEY]: textarea.value });
            }
        }
    });
}
