/**
 * Карта-аркуші: вкладки перемикають аркуш, натиск на місто показує його
 * проєкти в панелі праворуч.
 *
 * Зуму й перетягування більше немає: кожен регіон — окрема карта у своєму
 * масштабі (див. src/lib/map.ts), наближати нема чого.
 */

const root = document.querySelector<HTMLElement>('[data-map]');

if (root) {
  const tabs = root.querySelectorAll<HTMLButtonElement>('[data-map-tab]');
  const sheets = root.querySelectorAll<SVGSVGElement>('[data-map-sheet]');
  const sheetPanels = root.querySelectorAll<HTMLElement>('[data-sheet-panel]');
  const cityPanels = root.querySelectorAll<HTMLElement>('[data-city-panel]');
  const markers = root.querySelectorAll<SVGGElement>('[data-marker]');

  let sheet = sheets[0]?.dataset.mapSheet ?? '';
  let city: string | null = null;

  function render() {
    sheets.forEach((s) => s.toggleAttribute('hidden', s.dataset.mapSheet !== sheet));
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.mapTab === sheet)));
    sheetPanels.forEach((p) => (p.hidden = city !== null || p.dataset.sheetPanel !== sheet));
    cityPanels.forEach((p) => (p.hidden = p.dataset.cityPanel !== city));
    markers.forEach((m) => m.classList.toggle('is-active', m.dataset.marker === city));
  }

  function openSheet(id: string) {
    sheet = id;
    city = null;
    render();
  }

  function pickCity(id: string) {
    // Повторний натиск на ту саму точку повертає до переліку міст.
    city = city === id ? null : id;
    render();
  }

  tabs.forEach((t) => t.addEventListener('click', () => openSheet(t.dataset.mapTab!)));

  markers.forEach((m) => {
    const activate = () => (m.dataset.goto ? openSheet(m.dataset.goto) : pickCity(m.dataset.marker!));
    m.addEventListener('click', activate);
    m.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      activate();
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-city]').forEach((b) =>
    b.addEventListener('click', () => pickCity(b.dataset.city!)),
  );

  root.querySelectorAll<HTMLButtonElement>('[data-city-back]').forEach((b) =>
    b.addEventListener('click', () => {
      city = null;
      render();
    }),
  );

  render();
}
