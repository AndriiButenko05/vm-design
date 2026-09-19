/**
 * Стрілки для стрічок робіт.
 *
 * Сам свайп робить CSS scroll-snap — пальцем, трекпадом і скролбаром він
 * працює без скриптів. Тут лише стрілки для миші та клавіатури, і вони
 * показуються тільки після того, як цей код відпрацював: без JS їх не видно,
 * замість мертвих кнопок лишається робочий нативний скрол.
 */

for (const block of document.querySelectorAll<HTMLElement>('[data-swiper]')) {
  const rail = block.querySelector<HTMLElement>('[data-swiper-rail]');
  const prev = block.querySelector<HTMLButtonElement>('[data-swiper-prev]');
  const next = block.querySelector<HTMLButtonElement>('[data-swiper-next]');
  if (!rail || !prev || !next) continue;

  /** Ширина кроку — рівно одна картка з проміжком. */
  const step = () => {
    const item = rail.firstElementChild as HTMLElement | null;
    if (!item) return rail.clientWidth * 0.8;
    const gap = parseFloat(getComputedStyle(rail).columnGap || '0') || 0;
    return item.offsetWidth + gap;
  };

  const sync = () => {
    const max = rail.scrollWidth - rail.clientWidth;
    // Допуск у 2 px: субпіксельні значення після snap інакше лишають
    // кнопку активною на самому краю.
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= max - 2;
  };

  const go = (dir: 1 | -1) => {
    rail.scrollBy({ left: dir * step(), behavior: 'smooth' });
    // Подія scroll приходить із затримкою, а іноді (фонова вкладка) не приходить
    // зовсім — тож стан кнопок оновлюємо ще й самі, після ймовірного кінця руху.
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

  /** Гортати нічого — стрілки тільки заважають. */
  const fits = () => rail.scrollWidth <= rail.clientWidth + 2;

  /**
   * Перевернуті блоки тримають стрічку правим краєм колонки, а виїжджає
   * вона за ліве поле вікна. Щоб це читалось як дзеркало прямого блока,
   * стрічка при монтуванні стоїть у своєму кінці, а не на початку.
   *
   * На телефоні цього не робимо взагалі: там блоки складаються в колонку,
   * обидві половини на всю ширину, дзеркалити вже нічого — і всі стрічки
   * починаються зліва, як і належить порядку читання.
   *
   * Функція, а не константа: вікно можна повернути, і refresh() на resize
   * має брати актуальне значення.
   */
  const narrow = matchMedia('(max-width: 900px)');
  const alignEnd = () => block.dataset.swiperAlign === 'end' && !narrow.matches;

  /**
   * Поки людина не чіпала стрічку, її можна вирівнювати самим скриптом.
   * Після першої взаємодії — ні, інакше дозавантаження лінивої картинки
   * смикало б стрічку з-під пальця.
   */
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

  // Картки ліниві: доки вони не завантажились, scrollWidth ще не фінальний,
  // тому вирівнювання і стан кнопок перераховуємо після їхнього приходу.
  for (const img of rail.querySelectorAll('img')) {
    if (img.complete) continue;
    img.addEventListener('load', refresh, { once: true });
  }
}
