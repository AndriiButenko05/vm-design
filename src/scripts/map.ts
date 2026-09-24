/**
 * Пан і зум для SVG-карти.
 *
 * Свідомо без бібліотеки: Leaflet — 42 KB і тайли з чужого домену,
 * MapLibre — 230 KB. Тут потрібен зум до рівня міста, не до рівня вулиць,
 * тому вистачає трансформа на одній групі.
 *
 * Дає: перетягування (миша + палець), колесо, pinch, кнопки, клавіатуру,
 * межі кадру, контрмасштаб маркерів і згортання кластера.
 */

type View = { scale: number; x: number; y: number };

const MIN_SCALE = 1;
const MAX_SCALE = 14;

const root = document.querySelector<HTMLElement>('[data-map]');
const svg = root?.querySelector<SVGSVGElement>('svg[data-map-sheet="main"]');
const viewport = root?.querySelector<SVGGElement>('[data-map-viewport]');

if (root && svg && viewport) {
  const W = Number(root.dataset.mapWidth);
  const H = Number(root.dataset.mapHeight);

  const view: View = { scale: 1, x: 0, y: 0 };
  let frame = 0;

  // Лише основного аркуша: другий не масштабується, контрмасштаб йому не потрібен.
  const markerScales = svg.querySelectorAll<SVGElement>('[data-marker-scale]');

  /** Не даємо «загубити» карту: край кадру не заходить усередину в'юпорта. */
  function clamp() {
    const maxX = 0;
    const maxY = 0;
    const minX = W - W * view.scale;
    const minY = H - H * view.scale;
    view.x = Math.min(maxX, Math.max(minX, view.x));
    view.y = Math.min(maxY, Math.max(minY, view.y));
  }

  function apply() {
    clamp();
    viewport!.setAttribute('transform', `translate(${view.x} ${view.y}) scale(${view.scale})`);

    // Маркери мають лишатися одного розміру незалежно від масштабу.
    // Саме атрибутом: він рахується від початку координат самої групи,
    // тобто від точки міста. CSS-масштаб брав би центр рамки групи,
    // а її зміщує підпис міста — і маркер відʼїжджав би при наближенні.
    const inv = (1 / view.scale).toFixed(4);
    for (const el of markerScales) el.setAttribute('transform', `scale(${inv})`);

    // Кластер розкладається на окремі міста при наближенні.
    root!.dataset.split = String(view.scale >= Number(root!.dataset.splitAt || 2.4));
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      apply();
    });
  }

  /** Зум відносно точки в координатах SVG — щоб масштабувалось «під курсором». */
  function zoomAt(nextScale: number, px: number, py: number) {
    const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
    const k = s / view.scale;
    view.x = px - (px - view.x) * k;
    view.y = py - (py - view.y) * k;
    view.scale = s;
    schedule();
  }

  /** Перетворює координати вказівника на координати SVG. */
  function toSvg(clientX: number, clientY: number) {
    const r = svg!.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * W,
      y: ((clientY - r.top) / r.height) * H,
    };
  }

  // ─── Перетягування ───────────────────────────────────────────

  const pointers = new Map<number, { x: number; y: number }>();
  let pinchDist = 0;
  let moved = false;

  svg.addEventListener('pointerdown', (e) => {
    // Маркери мають лишатися клікабельними — не перехоплюємо натиск на них.
    if ((e.target as Element).closest('[data-marker]')) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = false;
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('is-grabbing');
  });

  svg.addEventListener('pointermove', (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;

    const r = svg.getBoundingClientRect();
    const kx = W / r.width;
    const ky = H / r.height;

    if (pointers.size === 2) {
      // Pinch: масштабуємо за зміною відстані між пальцями.
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist) {
        const mid = toSvg((a.x + b.x) / 2, (a.y + b.y) / 2);
        zoomAt(view.scale * (dist / pinchDist), mid.x, mid.y);
      }
      pinchDist = dist;
      return;
    }

    view.x += (e.clientX - prev.x) * kx;
    view.y += (e.clientY - prev.y) * ky;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = true;
    schedule();
  });

  const endPointer = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchDist = 0;
    if (!pointers.size) svg.classList.remove('is-grabbing');
  };

  svg.addEventListener('pointerup', endPointer);
  svg.addEventListener('pointercancel', endPointer);

  // Перетягування не має спрацьовувати як клік по маркеру.
  svg.addEventListener('click', (e) => {
    if (moved) e.preventDefault();
  });

  // ─── Колесо ──────────────────────────────────────────────────

  svg.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const p = toSvg(e.clientX, e.clientY);
      zoomAt(view.scale * (e.deltaY < 0 ? 1.16 : 1 / 1.16), p.x, p.y);
    },
    { passive: false },
  );

  // ─── Клавіатура ──────────────────────────────────────────────

  svg.addEventListener('keydown', (e) => {
    const step = 60 / view.scale;
    const keys: Record<string, () => void> = {
      ArrowLeft: () => (view.x += step),
      ArrowRight: () => (view.x -= step),
      ArrowUp: () => (view.y += step),
      ArrowDown: () => (view.y -= step),
      '+': () => zoomAt(view.scale * 1.3, W / 2, H / 2),
      '=': () => zoomAt(view.scale * 1.3, W / 2, H / 2),
      '-': () => zoomAt(view.scale / 1.3, W / 2, H / 2),
    };
    const fn = keys[e.key];
    if (!fn) return;
    e.preventDefault();
    fn();
    schedule();
  });

  // ─── Кнопки та швидкі переходи ───────────────────────────────

  function goTo(scale: number, cx: number, cy: number) {
    view.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
    view.x = W / 2 - cx * view.scale;
    view.y = H / 2 - cy * view.scale;
    schedule();
  }

  // ─── Аркуші: основний і «Польща й Україна» ──────────────────

  const sheets = root.querySelectorAll<SVGSVGElement>('[data-map-sheet]');
  const tabs = root.querySelectorAll<HTMLButtonElement>('[data-map-view], [data-map-sheet-btn]');

  function showSheet(name: string, active: HTMLButtonElement) {
    sheets.forEach((s) => s.toggleAttribute('hidden', s.dataset.mapSheet !== name));
    root!.dataset.sheet = name;
    tabs.forEach((b) => (b === active ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
  }

  root.querySelectorAll<HTMLButtonElement>('[data-map-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      showSheet('main', btn);
      goTo(Number(btn.dataset.scale), Number(btn.dataset.x), Number(btn.dataset.y));
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-map-sheet-btn]').forEach((btn) => {
    btn.addEventListener('click', () => showSheet(btn.dataset.mapSheetBtn!, btn));
  });

  root.querySelectorAll<HTMLButtonElement>('[data-map-zoom]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.mapZoom);
      zoomAt(view.scale * (dir > 0 ? 1.4 : 1 / 1.4), W / 2, H / 2);
    });
  });

  // ─── Панель міста ────────────────────────────────────────────

  const panels = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>('[data-city-panel]').forEach((p) => {
    panels.set(p.dataset.cityPanel!, p);
  });

  let activeCity: string | null = null;

  function showCity(id: string | null) {
    if (activeCity === id) return;
    activeCity = id;
    panels.forEach((p, key) => p.toggleAttribute('hidden', key !== id));
    root!.querySelectorAll<SVGElement>('[data-marker]').forEach((m) => {
      m.classList.toggle('is-active', m.dataset.marker === id);
    });
  }

  root.querySelectorAll<SVGElement>('[data-marker]').forEach((marker) => {
    const id = marker.dataset.marker!;
    marker.addEventListener('pointerenter', () => showCity(id));
    marker.addEventListener('focusin', () => showCity(id));
    marker.addEventListener('click', (e) => {
      // На дотику першим тапом показуємо панель, а не переходимо.
      if (matchMedia('(hover: none)').matches && activeCity !== id) {
        e.preventDefault();
        showCity(id);
      }
    });
  });

  root.addEventListener('pointerleave', () => showCity(null));

  apply();
  svg.dataset.ready = '';
}
