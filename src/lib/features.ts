// Single source of truth for the user-toggleable features. Kept free of any
// feature implementation (no DOM code, no SCSS imports) so both the content
// script and the popup can import it without dragging content-script code into
// the popup bundle.

export interface FeatureMeta {
    /** Stable id — also the storage-key suffix and (for JS features) the map key. */
    id: string;
    /** Label shown in the popup. */
    label: string;
    /** One-line explanation shown under the label. */
    description: string;
}

export const FEATURES = [
    {
        id: 'markdown',
        label: 'Markdown',
        description: 'Formátování příspěvků pomocí Markdownu.',
    },
    {
        id: 'nsfw',
        label: 'NSFW filtr',
        description: 'Rozmazání obrázků a videí v diskuzích a poště.',
    },
    {
        id: 'quick-send',
        label: 'Odeslání přes ⌘/Ctrl + Enter',
        description: 'Odeslání zprávy klávesovou zkratkou (náhled přes ⌘/Ctrl + Shift + Enter).',
    },
    {
        id: 'notifications',
        label: 'Upozornění v liště',
        description: 'Přesune indikátor upozornění do horní lišty.',
    },
    {
        id: 'context-menu',
        label: 'Zvětšení kontextového menu',
        description: 'Čitelnější velikost písma v kontextovém menu.',
    },
    {
        id: 'code-highlight',
        label: 'Zvýraznění kódu',
        description: 'Zobrazí bloky kódu písmem JetBrains Mono.',
    },
] as const satisfies readonly FeatureMeta[];

export type FeatureId = (typeof FEATURES)[number]['id'];
