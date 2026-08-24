import { initNotices } from '@/features/notices';
import { initQuickSend } from '@/features/quick-send';
import { initMarkdown } from '@/features/markdown';
import { initNsfw } from '@/features/nsfw';
import { initNotifications } from '@/features/notifications';
// Hashtags is kept in the repo but disabled — its selectors no longer match nyx.cz.
// import { initHashtags } from '@/features/hashtags';

// Style-only features (no JS behaviour).
import '@/features/context-menu.scss';
import '@/features/code-highlight.scss';

export default defineContentScript({
    matches: ['https://www.nyx.cz/*', 'https://nyx.cz/*'],
    runAt: 'document_end',
    main() {
        initNotices();
        initQuickSend();
        initMarkdown();
        initNsfw();
        initNotifications();
        // initHashtags();
    },
});
