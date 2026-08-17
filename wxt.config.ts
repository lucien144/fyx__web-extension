import { resolve } from 'node:path';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: 'src',
    manifest: {
        name: 'Fyx for Web',
        description: 'Simplifies the Nyx.cz interface and adds useful features.',
        permissions: ['storage'],
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
