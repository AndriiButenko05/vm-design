const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
const note = document.querySelector<HTMLElement>('[data-form-status]');
const thanks = document.querySelector<HTMLDialogElement>('[data-thanks]');

// Подяка висить ~5 с після того, як допрацює анімація (≈1.5 с), і зникає сама.
const THANKS_MS = 6500;
let thanksTimer = 0;

function showThanks() {
  if (!thanks) return;
  thanks.classList.remove('is-closing');
  thanks.showModal();
  clearTimeout(thanksTimer);
  thanksTimer = window.setTimeout(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return thanks.close();
    thanks.classList.add('is-closing');
    thanks.addEventListener('animationend', () => thanks.close(), { once: true });
  }, THANKS_MS);
}

if (thanks) {
  thanks.addEventListener('close', () => {
    clearTimeout(thanksTimer);
    thanks.classList.remove('is-closing');
  });
}

if (form && note) {
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const strings = {
    sending: note.dataset.sending ?? 'Sending…',
    ok: note.dataset.ok ?? 'Thank you — your message has been sent.',
    error: note.dataset.error ?? 'Something went wrong. Please write by email.',
  };

  const endpoint = form.dataset.endpoint ?? '';

  async function reason(res: Response): Promise<string> {
    try {
      const data = await res.json();
      const first = data?.errors?.[0]?.message;
      if (typeof first === 'string' && first) return first;
    } catch {
    }
    return strings.error;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!endpoint) {
      note.dataset.state = 'error';
      note.textContent = strings.error;
      return;
    }

    note.removeAttribute('data-state');
    note.textContent = strings.sending;
    if (submit) submit.disabled = true;

    try {
      const body = new FormData(form);
      // Необов'язкове поле «Як дізналися» не шлемо порожнім, щоб не засмічувати лист.
      if (!body.get('source')) body.delete('source');

      const res = await fetch(endpoint, {
        method: 'POST',
        body,
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        note.dataset.state = 'error';
        note.textContent = await reason(res);
        return;
      }

      form.reset();
      // Кастомні списки показують вибране у власній кнопці — після reset повертаємо перший пункт.
      form.querySelectorAll('select').forEach((s) => s.dispatchEvent(new Event('reset')));
      note.dataset.state = 'ok';
      note.textContent = strings.ok;
      showThanks();
    } catch {
      note.dataset.state = 'error';
      note.textContent = strings.error;
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}
