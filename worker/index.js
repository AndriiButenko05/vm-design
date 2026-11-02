/**
 * Worker перед статичним сайтом. Викликається лише для /api/* (run_worker_first
 * у wrangler.jsonc), усе інше Cloudflare віддає з dist напряму.
 *
 * /api/reviews?lang=ru — живі відгуки з картки Google через Places API (New).
 * Ключ лежить у секреті GOOGLE_PLACES_KEY, тож у браузер він не потрапляє.
 * Відповідь не кешуємо: умови Google забороняють зберігати відгуки.
 */
const LANGS = ['en', 'fr', 'it', 'ru', 'uk'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/reviews' && request.method === 'GET') return reviews(request, url, env);
    return env.ASSETS.fetch(request);
  },
};

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
