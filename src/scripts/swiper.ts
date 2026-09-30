type Swiper = {
  block: HTMLElement;
  rail: HTMLElement;
  prev: HTMLButtonElement;
  next: HTMLButtonElement;
  touched: boolean;
};

const narrow = matchMedia('(max-width: 900px)');
const swipers: Swiper[] = [];

for (const block of document.querySelectorAll<HTMLElement>('[data-swiper]')) {
  const rail = block.querySelector<HTMLElement>('[data-swiper-rail]');
  const prev = block.querySelector<HTMLButtonElement>('[data-swiper-prev]');
  const next = block.querySelector<HTMLButtonElement>('[data-swiper-next]');
  if (!rail || !prev || !next) continue;
  swipers.push({ block, rail, prev, next, touched: false });
}

const syncButtons = (s: Swiper, scrollLeft: number, max: number) => {
  s.prev.disabled = scrollLeft <= 2;
  s.next.disabled = scrollLeft >= max - 2;
};

// Спершу читаємо розміри всіх стрічок, потім пишемо — щоб браузер не
// перераховував розкладку між блоками (forced reflow).
let queued = false;
const refresh = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    const sizes = swipers.map(({ rail }) => ({
      width: rail.scrollWidth,
      visible: rail.clientWidth,
      left: rail.scrollLeft,
    }));
    swipers.forEach((s, i) => {
      const { width, visible, left } = sizes[i];
      const max = width - visible;
      const fits = width <= visible + 2;
      s.block.toggleAttribute('data-swiper-ready', !fits);
      const alignEnd = s.block.dataset.swiperAlign === 'end' && !narrow.matches;
      if (alignEnd && !s.touched && !fits) {
        s.rail.scrollLeft = max;
        syncButtons(s, max, max);
      } else {
        syncButtons(s, left, max);
      }
    });
  });
};

for (const s of swipers) {
  const { rail } = s;
  const step = () => {
    const item = rail.firstElementChild as HTMLElement | null;
    if (!item) return rail.clientWidth * 0.8;
    const gap = parseFloat(getComputedStyle(rail).columnGap || '0') || 0;
    return item.offsetWidth + gap;
  };
  const sync = () => syncButtons(s, rail.scrollLeft, rail.scrollWidth - rail.clientWidth);
  const go = (dir: 1 | -1) => {
    s.touched = true;
    rail.scrollBy({ left: dir * step(), behavior: 'smooth' });
    setTimeout(sync, 450);
  };

  s.prev.addEventListener('click', () => go(-1));
  s.next.addEventListener('click', () => go(1));
  for (const ev of ['pointerdown', 'wheel', 'keydown'] as const) {
    rail.addEventListener(ev, () => (s.touched = true), { passive: true });
  }
  rail.addEventListener('scroll', sync, { passive: true });

  for (const img of rail.querySelectorAll('img')) {
    if (!img.complete) img.addEventListener('load', refresh, { once: true });
  }
}

addEventListener('resize', refresh, { passive: true });
narrow.addEventListener('change', refresh);
refresh();
