/**
 * Повзунок «до / після».
 *
 * Положення задає нативний <input type="range">: звідти безкоштовно
 * беруться клавіатура, дотик і роль slider для скрінрідера. Скрипт лише
 * переносить значення в CSS-змінну, а саме витирання робить clip-path.
 */

for (const box of document.querySelectorAll<HTMLElement>('[data-ba]')) {
  const range = box.querySelector<HTMLInputElement>('input[type="range"]');
  if (!range) continue;

  let frame = 0;
  const apply = () => {
    frame = 0;
    box.style.setProperty('--pos', `${range.value}%`);
  };

  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(apply);
  };

  range.addEventListener('input', schedule);
  apply();
  box.setAttribute('data-ba-ready', '');
}

/*
  Пари гортаються каруселлю (scripts/carousel.ts). Кожна нова пара
  починається з лінії посередині, а не там, де її лишили в попередній.
*/
for (const root of document.querySelectorAll<HTMLElement>('[data-ba-carousel]')) {
  root.addEventListener('carousel:change', () => {
    for (const range of root.querySelectorAll<HTMLInputElement>('input[type="range"]')) {
      range.value = '50';
      range.dispatchEvent(new Event('input'));
    }
  });
}
