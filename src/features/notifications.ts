import './notifications.scss';

// Relocate the notifications indicator into the toolbar, after the spacer.
export function initNotifications() {
    const notifications = document.querySelector('#notifications');
    const spacer = document.querySelector('menu[type=toolbar] .spacer');

    // Bail if a target is missing or we've already relocated (double run guard).
    if (!notifications || !spacer || document.querySelector('#fyx__notifications')) {
        return;
    }

    // Wrap in an <li> and move the existing node in — no clone, listeners kept.
    const wrapper = document.createElement('li');
    wrapper.id = 'fyx__notifications';
    wrapper.appendChild(notifications);
    spacer.insertAdjacentElement('afterend', wrapper);
}
