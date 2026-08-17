import './quick-send.scss';

export function initQuickSend() {
    const textarea: HTMLTextAreaElement | null = document.querySelector('.mform textarea[name=content]');
    const sendBtn = textarea?.form?.querySelector('.mform button[name=send]') as HTMLButtonElement;
    const previewBtn = textarea?.form?.querySelector('.mform button[name=preview]') as HTMLButtonElement;

    if (!textarea || !sendBtn || !previewBtn) {
        return;
    }

    textarea.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.metaKey) {
            sendBtn.classList.add('active');
        }
        if (event.metaKey && event.shiftKey) {
            previewBtn.classList.add('active');
            sendBtn.classList.remove('active');
        }
    });

    textarea.addEventListener('keyup', (event: KeyboardEvent) => {
        if (event.metaKey) {
            sendBtn.classList.add('active');
        } else {
            sendBtn.classList.remove('active');
        }
        previewBtn.classList.remove('active');
    });

    textarea.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.code === 'Enter') {
            // Preview on CMD + SHIFT + ENTER
            if (event.metaKey && event.shiftKey) {
                previewBtn.click();
                return;
            }

            // Send on CMD + ENTER
            if (event.metaKey) {
                sendBtn.click();
            }
        }
    });
}
