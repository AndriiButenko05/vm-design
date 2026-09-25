const toggle = document.querySelector<HTMLButtonElement>('[data-mobile-nav-toggle]');
const panel = document.querySelector<HTMLElement>('[data-mobile-nav]');

if (toggle && panel) {
  const focusable = () =>
    [...panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(
      (el) => el.offsetParent !== null,
    );

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

  matchMedia('(min-width: 801px)').addEventListener('change', (e) => {
    if (e.matches && open) setOpen(false);
  });
}
