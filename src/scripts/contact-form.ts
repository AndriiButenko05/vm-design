/**
 * Надсилання форми без перезавантаження.
 *
 * Formspree на безкоштовному плані не дає власного «дякую»-екрана і після
 * POST перекидає на свою сторінку. Тому надсилаємо через fetch із заголовком
 * Accept: application/json — редиректу тоді немає, і статус показуємо на місці.
 *
 * Без JS форма лишається робочою: це звичайний <form method="POST">,
 * просто користувач побачить сторінку Formspree.
 */

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
const note = document.querySelector<HTMLElement>('[data-form-status]');

if (form && note) {
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const strings = {
    sending: note.dataset.sending ?? 'Sending…',
    ok: note.dataset.ok ?? 'Thank you — your message has been sent.',
    error: note.dataset.error ?? 'Something went wrong. Please write by email.',
  };

  /*
    Беремо адресу з data-endpoint, а не з form.action: останній у DOM
    повертає адресу поточної сторінки, коли атрибута немає, тож
    ненастроєну форму від настроєної по ньому не відрізниш.
  */
  const endpoint = form.dataset.endpoint ?? '';

  /**
   * Formspree відповідає {"errors":[{"message":"…"}]} і на помилку
   * налаштування, і на відхилений лист. Показати цей текст корисніше,
   * ніж однакове «щось пішло не так»: саме там буде видно, що адресу
   * ще не підтверджено або що місячний ліміт вичерпано.
   */
  async function reason(res: Response): Promise<string> {
    try {
      const data = await res.json();
      const first = data?.errors?.[0]?.message;
      if (typeof first === 'string' && first) return first;
    } catch {
      /* тіло не JSON — лишаємо загальний текст */
    }
    return strings.error;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Адреси немає — запит не має сенсу, одразу пропонуємо пошту.
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
