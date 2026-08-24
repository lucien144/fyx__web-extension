import './notifications.scss';

// Relocate the notifications indicator into the toolbar, right after the
// spacer, so it sits in the menubar instead of its default position.
export function initNotifications() {
    const notifications = document.querySelector('#notifications');
    const spacer = document.querySelector('menu[type=toolbar] .spacer');

    // Bail if a target is missing or we've already relocated (guards against a
    // double content-script run, e.g. dev + store build on the same page).
    if (!notifications || !spacer || document.querySelector('#fyx__notifications')) {
        return;
    }

    // Wrap in an <li> so it aligns with the toolbar's list items, then move the
    // existing node into it — no clone, listeners kept.
    const wrapper = document.createElement('li');
    wrapper.id = 'fyx__notifications';
    wrapper.appendChild(notifications);
    spacer.insertAdjacentElement('afterend', wrapper);
}
