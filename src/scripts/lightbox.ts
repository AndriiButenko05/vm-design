const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
const triggers = [...document.querySelectorAll<HTMLButtonElement>('[data-lightbox-open]')];

if (dialog && triggers.length) {
  const img = dialog.querySelector<HTMLImageElement>('[data-lightbox-img]')!;
  const avif = dialog.querySelector<HTMLSourceElement>('[data-lightbox-avif]');
  const counter = dialog.querySelector<HTMLElement>('[data-lightbox-counter]');
  const prev = dialog.querySelector<HTMLButtonElement>('[data-lightbox-prev]')!;
  const next = dialog.querySelector<HTMLButtonElement>('[data-lightbox-next]')!;

  const groups = new Map<string, HTMLButtonElement[]>();
  for (const trigger of triggers) {
    const key = trigger.dataset.lightboxGroup ?? '';
    const group = groups.get(key);
    if (group) group.push(trigger);
    else groups.set(key, [trigger]);
  }

  let list: HTMLButtonElement[] = [];
  let current = 0;

  function show(i: number) {
    current = (i + list.length) % list.length;
    const trigger = list[current];

    if (avif) avif.srcset = trigger.dataset.fullAvif ?? '';
    img.src = trigger.dataset.full!;
    img.alt = trigger.dataset.alt ?? '';
    img.width = Number(trigger.dataset.w);
    img.height = Number(trigger.dataset.h);

    if (counter) counter.textContent = `${current + 1} / ${list.length}`;

    prev.hidden = next.hidden = list.length < 2;
  }

  let avifChosen = false;
  const fullUrl = (trigger: HTMLButtonElement) =>
    (avifChosen && trigger.dataset.fullAvif) || trigger.dataset.full!;

  img.addEventListener('load', () => {
    avifChosen = img.currentSrc.endsWith('.avif');
    for (const step of [1, -1]) {
      const n = (current + step + list.length) % list.length;
      const pre = new Image();
      pre.src = fullUrl(list[n]);
    }
  });

  triggers.forEach((trigger) =>
    trigger.addEventListener('click', () => {
      list = groups.get(trigger.dataset.lightboxGroup ?? '')!;
      show(list.indexOf(trigger));
      dialog.showModal();
    }),
  );

  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(current - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(current + 1);
    }
  });

  dialog.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-lightbox-stage]')) return;
    if ((e.target as HTMLElement).closest('button')) return;
    dialog.close();
  });

  let startX = 0;
  let startY = 0;

  dialog.addEventListener(
    'pointerdown',
    (e) => {
      startX = e.clientX;
      startY = e.clientY;
    },
    { passive: true },
  );

  dialog.addEventListener(
    'pointerup',
    (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      show(current + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );

  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
  });
  triggers.forEach((t) =>
    t.addEventListener('click', () => {
      document.documentElement.style.overflow = 'hidden';
    }),
  );
}
