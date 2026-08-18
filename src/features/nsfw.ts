import './nsfw.scss';

// Blur every image and video inside a post's content and reveal it on click.
// The on/off toggle (a button in the UI) is intentionally not wired up yet —
// for now the filter is always applied. `initNsfw()` no-ops on pages with no
// posts (e.g. the login screen), since it only ever touches `.wc .wci` media.
export function initNsfw() {
    const media = document.querySelectorAll<HTMLElement>('.wc .wci img, .wc .wci video');

    media.forEach((element) => {
        if (element.classList.contains('fyx__nsfw')) {
            return;
        }
        element.classList.add('fyx__nsfw');
    });

    // One delegated listener handles current and future (ajax-loaded) media.
    document.addEventListener(
        'click',
        (event) => {
            const target = event.target;
            if (!(target instanceof HTMLImageElement) && !(target instanceof HTMLVideoElement)) {
                return;
            }
            if (
                !target.classList.contains('fyx__nsfw') ||
                target.classList.contains('fyx__nsfw--revealed')
            ) {
                return;
            }
            // Swallow the first click so it only lifts the blur, nothing else.
            event.preventDefault();
            event.stopPropagation();
            target.classList.add('fyx__nsfw--revealed');
        },
        true,
    );
}
