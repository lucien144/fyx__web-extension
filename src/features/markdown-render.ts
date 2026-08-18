import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: true,
    linkify: false,
    breaks: true,
});

// Top-level block elements whose newline separator collapses in nyx.cz's HTML
// rendering, so we turn it into an explicit blank line. `<li>` is excluded on
// purpose — a break between list items would split the list.
const BLOCK_END = /(<\/(?:p|h[1-6]|ul|ol|blockquote|pre)>)\n/g;

/**
 * Render a message to the HTML that gets submitted to nyx.cz.
 *
 * nyx.cz displays the submitted value as HTML, so bare newlines between blocks
 * collapse to a single space. We insert `<br><br>` after each top-level block
 * so every paragraph, heading and list stays visually separated, then strip
 * markdown-it's `<p>` wrappers (nyx.cz gives them no spacing of their own).
 * Soft line breaks inside a paragraph already come through as `<br>` thanks to
 * `breaks: true`.
 */
export function renderNyxMarkdown(input: string): string {
    return md
        .render(input)
        .replace(BLOCK_END, '$1<br><br>')
        .replaceAll('<p>', '')
        .replaceAll('</p>', '')
        .replace(/(?:<br>){3,}/g, '<br><br>')
        .replace(/(?:<br>\s*)+$/, '')
        .trim();
}
