import { browser } from 'wxt/browser';
import { FEATURES, type FeatureId } from './features';

// Each feature's on/off flag lives in `browser.storage.local` under
// `fyx__feature__<id>`. Features are enabled by default: only an explicit
// stored `false` disables one, so a fresh install behaves exactly as before
// the toggle menu existed.
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
