import { browser } from 'wxt/browser';
import { FEATURES, type FeatureId } from './features';

// Each feature's flag lives under `fyx__feature__<id>`. Enabled by default —
// only an explicit stored `false` disables one.
const PREFIX = 'fyx__feature__';

export type EnabledMap = Record<FeatureId, boolean>;

export function featureStorageKey(id: FeatureId): string {
    return `${PREFIX}${id}`;
}

export async function loadEnabledMap(): Promise<EnabledMap> {
    const keys = FEATURES.map((feature) => featureStorageKey(feature.id));
    const stored = await browser.storage.local.get(keys);

    const map = {} as EnabledMap;
    for (const feature of FEATURES) {
        const value = stored[featureStorageKey(feature.id)];
        map[feature.id] = value === undefined ? true : Boolean(value);
    }
    return map;
}

export async function setFeatureEnabled(id: FeatureId, enabled: boolean): Promise<void> {
    await browser.storage.local.set({ [featureStorageKey(id)]: enabled });
}
