import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: true,
});

// nyx.cz only auto-links bare URLs in raw text, not in submitted HTML, so
// linkify has to. Explicit schemes only — fuzzy matching would also link
// `word.cz`-style text.
md.linkify.set({ fuzzyLink: false, fuzzyEmail: false, fuzzyIP: false });

// Top-level blocks whose trailing newline collapses in nyx.cz's HTML rendering.
// `<li>` is excluded — a break between list items would split the list.
const BLOCK_END = /(<\/(?:p|h[1-6]|ul|ol|blockquote|pre)>)\n/g;

/**
 * Render a message to the HTML submitted to nyx.cz.
 *
 * nyx.cz renders the value as HTML, collapsing newlines between blocks. We add
 * `<br><br>` after each top-level block to keep them separated, then strip
 * markdown-it's spacing-less `<p>` wrappers. Soft breaks already come through as
 * `<br>` via `breaks: true`.
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
