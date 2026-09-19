/**
 * Слайдер першого екрана.
 *
 * Автоперегортання з перехресним згасанням. Зупиняється, коли воно
 * заважає або марне: під курсором, при фокусі всередині, на прихованій
 * вкладці та при prefers-reduced-motion — автокарусель без паузи
 * це класична пастка доступності, а не прикраса.
 */

const root = document.querySelector<HTMLElement>('[data-hero-slider]');

if (root) {
  const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
  const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-dot]')];
  const caps = [...root.querySelectorAll<HTMLElement>('[data-cap]')];
  const interval = Number(root.dataset.interval) || 5200;
  const calm = matchMedia('(prefers-reduced-motion: reduce)');

  if (slides.length > 1) {
    let current = 0;
    let timer = 0;
    let held = false;

    const show = (next: number) => {
      const n = (next + slides.length) % slides.length;
      if (n === current) return;

      slides.forEach((slide, i) => {
        const on = i === n;
        slide.classList.toggle('is-current', on);

        // Прихований кадр не має бути ні читаним, ні досяжним по Tab.
        // Саме setAttribute, а не toggleAttribute: той ставить aria-hidden="",
        // а порожнє значення ARIA трактує як відсутній атрибут.
        if (on) {
          slide.removeAttribute('aria-hidden');
          slide.removeAttribute('tabindex');
        } else {
          slide.setAttribute('aria-hidden', 'true');
          slide.setAttribute('tabindex', '-1');
        }
      });

      dots.forEach((dot, i) => dot.setAttribute('aria-selected', String(i === n)));

      caps.forEach((cap, i) => {
        cap.classList.toggle('is-current', i === n);
        if (i === n) cap.removeAttribute('aria-hidden');
        else cap.setAttribute('aria-hidden', 'true');
      });

      current = n;
    };

    const stop = () => {
      clearInterval(timer);
      timer = 0;
    };

    const start = () => {
      stop();
      if (held || calm.matches || document.hidden) return;
      timer = window.setInterval(() => show(current + 1), interval);
    };

    const hold = (on: boolean) => {
      held = on;
      if (on) stop();
      else start();
    };

    dots.forEach((dot, i) =>
      dot.addEventListener('click', () => {
        show(i);
        // Після ручного вибору відлік починається заново, інакше
        // наступний кадр міг би змінитися вже за частку секунди.
        start();
      }),
    );

    root.addEventListener('pointerenter', () => hold(true));
    root.addEventListener('pointerleave', () => hold(false));
    root.addEventListener('focusin', () => hold(true));
    root.addEventListener('focusout', (e) => {
      if (!root.contains(e.relatedTarget as Node)) hold(false);
    });

    document.addEventListener('visibilitychange', start);
    calm.addEventListener('change', start);

    // data-ready знімає no-JS правило, яке тримало перший кадр видимим.
    slides[0].classList.add('is-current');
    caps[0]?.classList.add('is-current');
    root.dataset.ready = '';
    start();
  }
}
