import './markdown.scss';
import { browser } from 'wxt/browser';
import MarkdownIt from 'markdown-it';

const PREVIEW_KEY = 'fyx__preview';

const md = new MarkdownIt({
    html: true,
    linkify: false,
    breaks: true,
});

export function initMarkdown() {
    document?.documentElement?.classList.add('fyx__markdown');

    // If there's a stored preview hand-off from a previous reload, load it.
    browser.storage.local.get(PREVIEW_KEY).then((result) => {
        const preview = result[PREVIEW_KEY];
        if (typeof preview === 'string') {
            const textarea: HTMLTextAreaElement | null = document.querySelector('.mform.mail textarea, .mform.discussion textarea');
            if (textarea) {
                textarea.value = preview;
                browser.storage.local.remove(PREVIEW_KEY);
            }
        }
    });

    const form: HTMLFormElement | null = document.querySelector('.l1c form, .l2cc form');
    form?.addEventListener('submit', function (event) {
        const textarea: HTMLTextAreaElement | null = form?.querySelector('textarea');
        if (textarea) {
            const { id, name } = textarea;
            textarea.id = `_${id}`;
            textarea.name = `_${name}`;
            const message = document.createElement('input');
            message.setAttribute('type', 'hidden');
            message.setAttribute('id', id);
            message.setAttribute('name', name);

            const markdown = md
                .render(textarea.value)
                .replaceAll('<p>', '')
                .replaceAll('</p>', '\n')
                .trim();
            message.setAttribute('value', markdown);
            form.appendChild(message);

            const sender = (event as SubmitEvent).submitter?.getAttribute('name');
            // If preview, store the value to restore it after the reload.
            if (sender === 'preview') {
                browser.storage.local.set({ [PREVIEW_KEY]: textarea.value });
            }
        }
    });
}
