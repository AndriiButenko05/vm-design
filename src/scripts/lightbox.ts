/**
 * Модалка для перегляду візуалізацій.
 *
 * Побудована на нативному <dialog>: він сам дає пастку фокуса, закриття
 * по Esc, підложку й повернення фокуса на елемент, з якого відкрили.
 * Писати це руками означало б утричі більше коду й більше шансів помилитися.
 *
 * Великі кадри не вантажаться наперед: у кнопки лежить лише URL у
 * data-full, а зображення підставляється в момент відкриття.
 */

const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
const triggers = [...document.querySelectorAll<HTMLButtonElement>('[data-lightbox-open]')];

if (dialog && triggers.length) {
  const img = dialog.querySelector<HTMLImageElement>('[data-lightbox-img]')!;
  const avif = dialog.querySelector<HTMLSourceElement>('[data-lightbox-avif]');
  const counter = dialog.querySelector<HTMLElement>('[data-lightbox-counter]');
  const prev = dialog.querySelector<HTMLButtonElement>('[data-lightbox-prev]')!;
  const next = dialog.querySelector<HTMLButtonElement>('[data-lightbox-next]')!;

  /**
   * Кадри гортаються в межах своєї галереї, а не через усю сторінку.
   *
   * На сторінці проєкту таких галерей дві: кадри «до» вгорі й основна
   * галерея нижче. В одному списку стрілка з останнього кадру «до»
   * вела б у першу готову фотографію, а лічильник показував би суму
   * двох різних наборів. Група задається атрибутом data-lightbox-group;
   * без нього кадр потрапляє в групу за замовчуванням.
   */
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

    // Спершу джерело, потім сам кадр: інакше браузер встигає взяти
    // фолбек і вже не вертається до avif.
    if (avif) avif.srcset = trigger.dataset.fullAvif ?? '';
    img.src = trigger.dataset.full!;
    img.alt = trigger.dataset.alt ?? '';
    // Розміри відомі заздалегідь — без них кадр смикав би розкладку
    // щоразу, коли підвантажується наступний.
    img.width = Number(trigger.dataset.w);
    img.height = Number(trigger.dataset.h);

    if (counter) counter.textContent = `${current + 1} / ${list.length}`;

    // Один кадр у групі — гортати нікуди.
    prev.hidden = next.hidden = list.length < 2;
  }

  /**
   * Який формат узяв браузер — видно з currentSrc: там лежить саме та
   * адреса, яку він обрав із <picture>. Тому визначати підтримку avif
   * окремою перевіркою не треба, достатньо подивитися на результат.
   */
  let avifChosen = false;
  const fullUrl = (trigger: HTMLButtonElement) =>
    (avifChosen && trigger.dataset.fullAvif) || trigger.dataset.full!;

  // Сусідні кадри — в кеш, але аж після поточного: гортання вперед
  // не чекає на мережу, а перший кадр не ділить із ними канал.
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

  // Клік повз кадр закриває: у <dialog> сама підложка — частина елемента,
  // тож перевіряємо, чи натиск стався поза вмістом.
  dialog.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-lightbox-stage]')) return;
    if ((e.target as HTMLElement).closest('button')) return;
    dialog.close();
  });

  /* Гортання пальцем. */
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
      // Горизонтальний рух і достатньо довгий — інакше це просто клік
      // або вертикальний жест.
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      show(current + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );

  // Поки модалка відкрита, сторінка під нею не гортається.
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
  });
  triggers.forEach((t) =>
    t.addEventListener('click', () => {
      document.documentElement.style.overflow = 'hidden';
    }),
  );
}
