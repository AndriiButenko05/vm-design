for (const block of document.querySelectorAll<HTMLElement>('[data-swiper]')) {
  const rail = block.querySelector<HTMLElement>('[data-swiper-rail]');
  const prev = block.querySelector<HTMLButtonElement>('[data-swiper-prev]');
  const next = block.querySelector<HTMLButtonElement>('[data-swiper-next]');
  if (!rail || !prev || !next) continue;

  const step = () => {
    const item = rail.firstElementChild as HTMLElement | null;
    if (!item) return rail.clientWidth * 0.8;
    const gap = parseFloat(getComputedStyle(rail).columnGap || '0') || 0;
    return item.offsetWidth + gap;
  };

  const sync = () => {
    const max = rail.scrollWidth - rail.clientWidth;
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= max - 2;
  };

  const go = (dir: 1 | -1) => {
    rail.scrollBy({ left: dir * step(), behavior: 'smooth' });
    setTimeout(sync, 450);
  };

  prev.addEventListener('click', () => {
    touch();
    go(-1);
  });
  next.addEventListener('click', () => {
    touch();
    go(1);
  });

  const fits = () => rail.scrollWidth <= rail.clientWidth + 2;

  const narrow = matchMedia('(max-width: 900px)');
  const alignEnd = () => block.dataset.swiperAlign === 'end' && !narrow.matches;

  let touched = false;
  const touch = () => {
    touched = true;
  };
  for (const ev of ['pointerdown', 'wheel', 'keydown'] as const) {
    rail.addEventListener(ev, touch, { passive: true });
  }

  const settle = () => {
    if (!alignEnd() || touched || fits()) return;
    rail.scrollLeft = rail.scrollWidth - rail.clientWidth;
  };

  const refresh = () => {
    block.toggleAttribute('data-swiper-ready', !fits());
    settle();
    sync();
  };

  rail.addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', refresh, { passive: true });
  narrow.addEventListener('change', refresh);

  refresh();

  for (const img of rail.querySelectorAll('img')) {
    if (img.complete) continue;
    img.addEventListener('load', refresh, { once: true });
  }
}
