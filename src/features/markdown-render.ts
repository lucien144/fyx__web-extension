import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: true,
    linkify: false,
    breaks: true,
});

/**
 * Render a message to the HTML that gets submitted to nyx.cz.
 *
 * nyx.cz wraps its own paragraphs, so we strip markdown-it's `<p>` tags and
 * turn paragraph breaks back into newlines.
 */
export function renderNyxMarkdown(input: string): string {
    return md.render(input).replaceAll('<p>', '').replaceAll('</p>', '\n').trim();
}
