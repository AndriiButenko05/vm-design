const index = document.querySelector<HTMLElement>('[data-index]');
const preview = index?.querySelector<HTMLElement>('[data-index-preview]');

if (index && preview && matchMedia('(hover: hover) and (min-width: 1101px)').matches) {
  const plates = new Map<string, HTMLElement>();
  preview.querySelectorAll<HTMLElement>('[data-preview-for]').forEach((el) => {
    plates.set(el.dataset.previewFor!, el);
  });

  let active: string | null = null;

  const show = (slug: string | null) => {
    if (active === slug) return;
    active = slug;
    plates.forEach((el, key) => el.classList.toggle('is-active', key === slug));
  };

  index.querySelectorAll<HTMLElement>('[data-index-row]').forEach((row) => {
    const slug = row.dataset.indexRow!;
    row.addEventListener('pointerenter', () => show(slug));
    row.addEventListener('focusin', () => show(slug));
  });

  index.addEventListener('pointerleave', () => show(null));
  index.addEventListener('focusout', (e) => {
    if (!index.contains(e.relatedTarget as Node)) show(null);
  });

  let frame = 0;
  let targetY = 0;

  index.addEventListener('pointermove', (e) => {
    const box = index.getBoundingClientRect();
    const h = preview.offsetHeight;
    targetY = Math.min(Math.max(e.clientY - box.top - h / 2, 0), Math.max(box.height - h, 0));
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      preview.style.transform = `translateY(${targetY}px)`;
    });
  });
}
