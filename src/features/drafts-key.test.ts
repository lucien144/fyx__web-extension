import { describe, it, expect } from 'vitest';
import { conversationKey, draftKeyPrefix, draftStorageKey, DRAFT_PREFIX } from './drafts-key';

describe('conversationKey', () => {
    it('strips the /id/<postId> post anchor from a discussion path', () => {
        expect(conversationKey('/discussion/12345/id/58959882')).toBe('/discussion/12345');
    });

    it('strips the anchor from a mail thread path', () => {
        expect(conversationKey('/mail/someuser/id/999')).toBe('/mail/someuser');
    });

    it('leaves a path without an anchor unchanged', () => {
        expect(conversationKey('/discussion/12345')).toBe('/discussion/12345');
        expect(conversationKey('/mail/someuser')).toBe('/mail/someuser');
    });

    it('tolerates a trailing slash on the anchor', () => {
        expect(conversationKey('/discussion/12345/id/58959882/')).toBe('/discussion/12345');
    });

    it('drops a plain trailing slash', () => {
        expect(conversationKey('/discussion/12345/')).toBe('/discussion/12345');
    });

    it('does not strip a numeric segment that is not the post anchor', () => {
        expect(conversationKey('/discussion/12345')).toBe('/discussion/12345');
        expect(conversationKey('/discussion/12345/id/1/extra')).toBe(
            '/discussion/12345/id/1/extra',
        );
    });

    it('falls back to root for an empty path', () => {
        expect(conversationKey('/')).toBe('/');
    });
});

describe('draftStorageKey', () => {
    it('namespaces the conversation key by user', () => {
        expect(draftStorageKey('Honza', '/discussion/12345')).toBe(
            `${DRAFT_PREFIX}Honza__/discussion/12345`,
        );
    });

    it('separates users so drafts do not collide across accounts', () => {
        expect(draftStorageKey('Honza', '/discussion/1')).not.toBe(
            draftStorageKey('Manzelka', '/discussion/1'),
        );
    });

    it('is the prefix followed by the conversation key', () => {
        const key = draftStorageKey('Honza', '/discussion/12345');
        const prefix = draftKeyPrefix('Honza');
        expect(key.startsWith(prefix)).toBe(true);
        expect(key.slice(prefix.length)).toBe('/discussion/12345');
    });
});
