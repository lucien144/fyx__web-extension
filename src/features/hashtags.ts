import './hashtags.scss';

export function initHashtags() {
    const filterInput = document.querySelector('input[name=filter_text]') as HTMLInputElement;
    const filterBtn = document.querySelector('button#topic_search') as HTMLButtonElement;

    if (!filterInput || !filterBtn) {
        return;
    }

    document.querySelectorAll('.wci').forEach((element) => {
        // https://jex.im/regulex/#!flags=&re=(%3F!%5B%5E%3C%5D*%3E)(%23%5Ba-z%5D%5B%5Cw-%5D%2B)
        element.innerHTML = element.innerHTML.replace(
            /(?![^<]*>)(#[a-z][\w-]+)/gim,
            `<span class="fyx__tag like-link">$&</span>`,
        );
    });

    document.querySelectorAll('.fyx__tag').forEach((element) => {
        element.addEventListener('click', (event) => {
            const currentTarget = event.currentTarget as HTMLSpanElement;
            if (currentTarget.parentElement instanceof HTMLAnchorElement) {
                currentTarget.parentElement.click();
                return;
            }

            filterInput.value = element.innerHTML ?? '';
            filterBtn.click();
        });
    });
}
