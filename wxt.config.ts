import { resolve } from 'node:path';
import { defineConfig } from 'wxt';

// Version scheme: [year].[day-of-year].[hourminute], stamped at build time,
// e.g. 2026.236.1452. This overrides package.json's version in the manifest.
// Day-of-year uses UTC-based date arithmetic so DST can't shift it; hour*100 +
// minute keeps each segment a leading-zero-free integer within Chrome's
// 0–65535 limit, and left-to-right comparison stays monotonic across the day,
// day, and year boundaries (required for Chrome Web Store uploads).
function buildVersion(): string {
    const now = new Date();
    const year = now.getFullYear();
    const dayOfYear = Math.floor(
        (Date.UTC(year, now.getMonth(), now.getDate()) - Date.UTC(year, 0, 0)) / 86_400_000,
    );
    const hourMinute = now.getHours() * 100 + now.getMinutes();
    return `${year}.${dayOfYear}.${hourMinute}`;
}

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: 'src',
    manifest: {
        name: 'Fyx pro Nyx.cz',
        description: 'Přidejte si do Nyxu užitečné funkce. Bezpečně, otevřeně a jednoduše.',
        version: buildVersion(),
        permissions: ['storage'],
        // Toolbar button so the icon is pinnable in Chrome's toolbar. No popup —
        // the extension has no UI; this only makes the icon visible/pinnable
        // instead of being tucked away in the puzzle (extensions) menu.
        action: {},
    },
    hooks: {
        // Print the exact folder to load in chrome://extensions when dev starts.
        'server:started': (wxt) => {
            const dir = resolve(wxt.config.outDir);
            wxt.logger.info(
                `\n  Load this folder in chrome://extensions → "Load unpacked":\n  ${dir}\n`,
            );
        },
    },
});
