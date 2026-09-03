import { describe, it, expect } from 'vitest';
import { renderNyxMarkdown } from './markdown-render';

describe('renderNyxMarkdown', () => {
    it('renders inline bold and strips paragraph wrappers', () => {
        expect(renderNyxMarkdown('**bold**')).toBe('<strong>bold</strong>');
    });

    it('returns an empty string for empty input', () => {
        expect(renderNyxMarkdown('')).toBe('');
    });

    it('separates paragraphs with <br><br> so the blank line survives as HTML', () => {
        expect(renderNyxMarkdown('a\n\nb')).toBe('a<br><br>b');
    });

    it('turns single newlines into <br> (breaks: true)', () => {
        expect(renderNyxMarkdown('line1\nline2')).toBe('line1<br>\nline2');
    });

    it('keeps soft breaks and paragraph breaks distinct', () => {
        expect(renderNyxMarkdown('asdasd\nasd\nasd\nasd\n\nasd')).toBe(
            'asdasd<br>\nasd<br>\nasd<br>\nasd<br><br>asd',
        );
    });

    it('linkifies a bare URL with an explicit scheme', () => {
        expect(renderNyxMarkdown('see https://nyx.cz here')).toBe(
            'see <a href="https://nyx.cz">https://nyx.cz</a> here',
        );
    });

    it('does not linkify schemeless text (fuzzy off)', () => {
        expect(renderNyxMarkdown('go to nyx.cz now')).toBe('go to nyx.cz now');
    });

    it('preserves raw HTML (html: true)', () => {
        expect(renderNyxMarkdown('<kbd>Esc</kbd>')).toBe('<kbd>Esc</kbd>');
    });

    it('separates a heading, a paragraph and a list with blank lines', () => {
        expect(renderNyxMarkdown('# Title\n\nIntro\n\n- one\n- two')).toBe(
            '<h1>Title</h1><br><br>Intro<br><br><ul>\n<li>one</li>\n<li>two</li>\n</ul>',
        );
    });
});
