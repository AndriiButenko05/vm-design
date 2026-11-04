/**
 * Worker перед статичним сайтом. Викликається лише для /api/* (run_worker_first
 * у wrangler.jsonc), усе інше Cloudflare віддає з dist напряму.
 *
 * /api/reviews?lang=ru — живі відгуки з картки Google через Places API (New).
 * Ключ лежить у секреті GOOGLE_PLACES_KEY, тож у браузер він не потрапляє.
 * Відповідь не кешуємо: умови Google забороняють зберігати відгуки.
 *
 * /go/ — адреса для реклами: «розумна» кампанія Google Ads веде всі оголошення на одну
 * сторінку, тож тут обираємо мову за браузером і перенаправляємо на /fr/, /it/… (решта — /).
 * Головна сама нікого не перенаправляє, щоб не заважати звичайному пошуку Google.
 */
const LANGS = ['en', 'fr', 'it', 'ru', 'uk'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/reviews' && request.method === 'GET') return reviews(request, url, env);
    if (url.pathname === '/go' || url.pathname === '/go/') return go(request, url);
    return env.ASSETS.fetch(request);
  },
};

function go(request, url) {
  const lang = preferredLang(request.headers.get('accept-language') ?? '');
  const target = new URL(lang === 'en' ? '/' : `/${lang}/`, url);
  target.search = url.search; // gclid та інші мітки реклами йдуть далі
  return new Response(null, {
    status: 302,
    headers: { location: target.href, vary: 'Accept-Language', 'cache-control': 'no-store' },
  });
}

/** Перша мова сайту зі списку браузера, з урахуванням ваг q. */
function preferredLang(header) {
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().toLowerCase().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { lang: tag.split('-')[0], q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .filter((x) => x.lang && x.q > 0)
    .sort((a, b) => b.q - a.q);
  return ranked.find((x) => LANGS.includes(x.lang))?.lang ?? 'en';
}

async function reviews(request, url, env) {
  // Лише запити зі сторінок самого сайту: боти й чужі сайти не витрачають ліміт Google.
  if (request.headers.get('sec-fetch-site') !== 'same-origin') return json({ error: 'forbidden' }, 403);
  if (!env.GOOGLE_PLACES_KEY || !env.GOOGLE_PLACE_ID) return json({ error: 'not configured' }, 503);

  const lang = LANGS.includes(url.searchParams.get('lang')) ? url.searchParams.get('lang') : 'en';
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(env.GOOGLE_PLACE_ID)}?languageCode=${lang}`,
    {
      headers: {
        'X-Goog-Api-Key': env.GOOGLE_PLACES_KEY,
        'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews',
      },
    },
  );
  if (!res.ok) return json({ error: `google ${res.status}` }, 502);

  const place = await res.json();
  return json({
    rating: place.rating ?? null,
    count: place.userRatingCount ?? 0,
    url: place.googleMapsUri ?? null,
    reviews: (place.reviews ?? [])
      .filter((r) => r.text?.text || r.originalText?.text)
      .map((r) => ({
        author: r.authorAttribution?.displayName ?? '',
        authorUrl: r.authorAttribution?.uri ?? null,
        rating: r.rating ?? null,
        when: r.relativePublishTimeDescription ?? '',
        text: (r.text ?? r.originalText).text,
        translated: Boolean(r.text && r.originalText && r.text.languageCode !== r.originalText.languageCode),
        url: r.googleMapsUri ?? null,
      })),
  });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
