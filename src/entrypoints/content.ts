import { initQuickSend } from '@/features/quick-send';
import { initMarkdown } from '@/features/markdown';
import { initNsfw } from '@/features/nsfw';
import { initNotifications } from '@/features/notifications';
import { initDrafts } from '@/features/drafts';
// Hashtags is kept in the repo but disabled — its selectors no longer match nyx.cz.
// import { initHashtags } from '@/features/hashtags';

// Style-only features: CSS scoped under a root class toggled below.
import '@/features/context-menu.scss';
import '@/features/code-highlight.scss';
// Tidy-up is kept in the repo but disabled for now — nothing worthwhile in it yet.
// import '@/features/tidy-up.scss';

import { loadEnabledMap } from '@/lib/settings';
import type { FeatureId } from '@/lib/features';

const JS_FEATURES: Partial<Record<FeatureId, () => void>> = {
    'quick-send': initQuickSend,
    markdown: initMarkdown,
    nsfw: initNsfw,
    notifications: initNotifications,
    drafts: initDrafts,
};

const STYLE_FEATURE_CLASS: Partial<Record<FeatureId, string>> = {
    'context-menu': 'fyx__feat--context-menu',
    'code-highlight': 'fyx__feat--code-highlight',
    // 'tidy-up': 'fyx__feat--tidy-up',
};

export default defineContentScript({
    matches: ['https://www.nyx.cz/*', 'https://nyx.cz/*'],
    runAt: 'document_end',
    async main() {
        const enabled = await loadEnabledMap();

        for (const [id, init] of Object.entries(JS_FEATURES)) {
            if (enabled[id as FeatureId]) {
                init();
            }
        }

        const root = document.documentElement;
        for (const [id, className] of Object.entries(STYLE_FEATURE_CLASS)) {
            root.classList.toggle(className, enabled[id as FeatureId]);
        }
        // initHashtags();
    },
});
