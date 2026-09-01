import './style.css';
import { FEATURES } from '@/lib/features';
import { loadEnabledMap, setFeatureEnabled } from '@/lib/settings';

async function render(): Promise<void> {
    const list = document.querySelector<HTMLUListElement>('#features');
    if (!list) {
        return;
    }

    const enabled = await loadEnabledMap();

    const items = FEATURES.map((feature) => {
        const li = document.createElement('li');
        li.className = 'feature';

        const label = document.createElement('label');
        label.className = 'feature__label';
        label.htmlFor = `feature-${feature.id}`;

        const text = document.createElement('div');
        text.className = 'feature__text';

        const name = document.createElement('span');
        name.className = 'feature__name';
        name.textContent = feature.label;

        const description = document.createElement('span');
        description.className = 'feature__description';
        description.textContent = feature.description;

        text.append(name, description);

        const toggle = document.createElement('span');
        toggle.className = 'switch';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `feature-${feature.id}`;
        checkbox.className = 'switch__input';
        checkbox.checked = enabled[feature.id];
        checkbox.addEventListener('change', () => {
            void setFeatureEnabled(feature.id, checkbox.checked);
        });

        const slider = document.createElement('span');
        slider.className = 'switch__slider';

        toggle.append(checkbox, slider);
        label.append(text, toggle);
        li.append(label);
        return li;
    });

    list.replaceChildren(...items);
}

document.addEventListener('DOMContentLoaded', () => {
    void render();
});
