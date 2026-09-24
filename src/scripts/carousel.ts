/**
 * Карусель «один кадр за раз» — галерея проєкту й пари «до / після».
 *
 * Розмітка:
 *   [data-carousel]                 корінь; data-carousel-swipe — гортати свайпом
 *     [data-carousel-slide]         кадри; усі, крім поточного, мають hidden
 *       data-caption="…"            підпис кадру
 *     [data-carousel-caption]       куди писати підпис
 *     [data-nav-prev] [data-nav-next] [data-nav-count]   з ArrowNav.astro
 *
 * Без JS видно перший кадр — решта hidden уже в розмітці.
 *
 * Прихований кадр із loading="lazy" браузер не вантажить, тож сторінка
 * тягне лише поточний кадр. Сусідній переводимо в eager, щоб гортання
 * вперед не чекало на мережу.
 *
 * При зміні кадру корінь отримує подію carousel:change — по ній
 * повзунок «до / після» повертається на середину.
 */

for (const root of document.querySelectorAll<HTMLElement>('[data-carousel]')) {
  const slides = [...root.querySelectorAll<HTMLElement>('[data-carousel-slide]')];
  if (slides.length < 2) continue;

  const prev = root.querySelector<HTMLButtonElement>('[data-nav-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-nav-next]');
  const count = root.querySelector<HTMLElement>('[data-nav-count]');
  const caption = root.querySelector<HTMLElement>('[data-carousel-caption]');

  let current = 0;

  const warm = (i: number) => {
    const slide = slides[i];
    if (!slide) return;
    for (const img of slide.querySelectorAll('img')) img.loading = 'eager';
  };

  const show = (i: number) => {
    if (i < 0 || i >= slides.length || i === current) return;
    slides[current].hidden = true;
    current = i;
    slides[current].hidden = false;

    if (count) count.textContent = `${current + 1} / ${slides.length}`;
    if (caption) caption.textContent = slides[current].dataset.caption ?? '';
    // На краях стрілка вимкнена, як у макеті: кінець набору має бути видно.
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current === slides.length - 1;

    warm(current + 1);
    root.dispatchEvent(new CustomEvent('carousel:change', { detail: { index: current } }));
  };

  prev?.addEventListener('click', () => show(current - 1));
  next?.addEventListener('click', () => show(current + 1));

  /*
    Стрілки клавіатури — коли фокус усередині каруселі. Але не на повзунку
    «до / після»: там стрілки рухають саму лінію порівняння.
  */
  root.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).matches('input[type="range"]')) return;
    if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });

  /*
    Свайп — лише там, де його просили атрибутом. У парах «до / після»
    горизонтальний жест уже зайнятий повзунком, і свайп перехоплював би його.
  */
  if (root.hasAttribute('data-carousel-swipe')) {
    let startX = 0;
    let startY = 0;
    root.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      startX = e.clientX;
      startY = e.clientY;
    });
    root.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'mouse') return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        show(current + (dx < 0 ? 1 : -1));
      }
    });
  }

  warm(1);
  root.setAttribute('data-carousel-ready', '');
}
