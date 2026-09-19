/**
 * Мобільне меню: overlay, пастка фокуса, Esc, блокування скролу.
 *
 * Свідомо не CSS-хак на <details>: без пастки фокуса й Esc
 * меню недоступне з клавіатури та для скрінрідерів.
 */

const toggle = document.querySelector<HTMLButtonElement>('[data-mobile-nav-toggle]');
const panel = document.querySelector<HTMLElement>('[data-mobile-nav]');

if (toggle && panel) {
  const focusable = () =>
    [...panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(
      (el) => el.offsetParent !== null,
    );

  // Індекси для каскадної появи пунктів.
  panel.querySelectorAll<HTMLElement>('nav li').forEach((li, i) => {
    li.style.setProperty('--i', String(i));
  });

  let open = false;

  const setOpen = (next: boolean) => {
    open = next;
    toggle.setAttribute('aria-expanded', String(next));
    panel.hidden = !next;
    panel.toggleAttribute('data-open', next);
    document.documentElement.style.overflow = next ? 'hidden' : '';
    if (next) focusable()[0]?.focus();
    else toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(!open));

  // Перехід за посиланням закриває меню (важливо для якірних та SPA-переходів).
  panel.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (!open) return;

    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (e.key !== 'Tab') return;

    const list = focusable();
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Повернення на desktop із відкритим меню не має лишати сторінку заблокованою.
  matchMedia('(min-width: 801px)').addEventListener('change', (e) => {
    if (e.matches && open) setOpen(false);
  });
}
