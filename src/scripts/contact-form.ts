const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
const note = document.querySelector<HTMLElement>('[data-form-status]');

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
      const res = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        note.dataset.state = 'error';
        note.textContent = await reason(res);
        return;
      }

      form.reset();
      note.dataset.state = 'ok';
      note.textContent = strings.ok;
    } catch {
      note.dataset.state = 'error';
      note.textContent = strings.error;
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}
