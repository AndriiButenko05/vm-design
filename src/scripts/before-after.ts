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

  const stage = box.querySelector<HTMLElement>('.slider__stage') ?? box;
  let dragging: number | null = null;
  let pending: { id: number; x: number; y: number } | null = null;

  const moveTo = (clientX: number) => {
    const r = stage.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    range.value = pct.toFixed(1);
    schedule();
  };

  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.pointerType === 'mouse') {
      dragging = e.pointerId;
      stage.setPointerCapture(e.pointerId);
      moveTo(e.clientX);
    } else {
      pending = { id: e.pointerId, x: e.clientX, y: e.clientY };
    }
  });

  stage.addEventListener('pointermove', (e) => {
    if (e.pointerId === dragging) return moveTo(e.clientX);
    if (!pending || e.pointerId !== pending.id) return;
    const dx = Math.abs(e.clientX - pending.x);
    const dy = Math.abs(e.clientY - pending.y);
    if (dx < 6 && dy < 6) return;
    if (dx > dy) {
      dragging = e.pointerId;
      stage.setPointerCapture(e.pointerId);
      moveTo(e.clientX);
    }
    pending = null;
  });

  const stop = (e: PointerEvent) => {
    if (pending && e.pointerId === pending.id && e.type === 'pointerup') moveTo(e.clientX);
    pending = null;
    if (e.pointerId !== dragging) return;
    dragging = null;
    range.focus({ preventScroll: true });
  };
  stage.addEventListener('pointerup', stop);
  stage.addEventListener('pointercancel', stop);
  stage.addEventListener('dragstart', (e) => e.preventDefault());

  apply();
  box.setAttribute('data-ba-ready', '');
}

for (const root of document.querySelectorAll<HTMLElement>('[data-ba-carousel]')) {
  root.addEventListener('carousel:change', () => {
    for (const range of root.querySelectorAll<HTMLInputElement>('input[type="range"]')) {
      range.value = '50';
      range.dispatchEvent(new Event('input'));
    }
  });
}
