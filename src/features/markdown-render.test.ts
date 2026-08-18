import { describe, it, expect } from 'vitest';
import { renderNyxMarkdown } from './markdown-render';

describe('renderNyxMarkdown', () => {
    it('renders inline bold and strips paragraph wrappers', () => {
        expect(renderNyxMarkdown('**bold**')).toBe('<strong>bold</strong>');
    });

    it('returns an empty string for empty input', () => {
        expect(renderNyxMarkdown('')).toBe('');
    });

    it('joins separate paragraphs with a blank line', () => {
        expect(renderNyxMarkdown('a\n\nb')).toBe('a\n\nb');
    });

    it('turns single newlines into <br> (breaks: true)', () => {
        expect(renderNyxMarkdown('line1\nline2')).toBe('line1<br>\nline2');
    });

    it('preserves raw HTML (html: true)', () => {
        expect(renderNyxMarkdown('<kbd>Esc</kbd>')).toBe('<kbd>Esc</kbd>');
    });
});
