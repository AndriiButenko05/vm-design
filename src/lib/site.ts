const FORMSPREE_ID = String(import.meta.env.PUBLIC_FORMSPREE_ID ?? '').trim();

if (import.meta.env.PROD && !FORMSPREE_ID) {
  console.warn(
    '[contact] PUBLIC_FORMSPREE_ID не задано — форма зібрана, але листів не надсилатиме.',
  );
}

export const SITE = {
  name: 'VM Design',
  designer: 'Maryna Vashchenko',
  role: 'Architect & interior designer',

  // Пересилається на vmdesignproject@gmail.com (Cloudflare Email Routing).
  email: 'contact@vmdesignproject.com',

  phone: '+39 329 5559043',
  phoneHref: 'tel:+393295559043',

  instagram: '@vm_design__studio',
  instagramUrl: 'https://www.instagram.com/vm_design__studio/',

  // Картка в Google Maps (Google Business Profile).
  mapsUrl: 'https://maps.google.com/?cid=16466406334144581190',

  regions: ['French Riviera', 'Monaco', 'Italy'],

  facts: {
    experienceYears: 15,
    based: 'Nice, France',
    languages: ['English', 'French', 'Italian', 'Ukrainian', 'Russian'],
    internationalExperience: [
      'France',
      'Italy',
      'Monaco',
      'Germany',
      'Poland',
      'Ukraine',
      'United States',
      'Hong Kong',
    ],
  },

  /**
   * Реквізити італійської реєстрації для «Note legali». Порожні поля на сайті не показуються.
   * status — форма (напр. «Ditta individuale» або назва SRL), vat — Partita IVA (11 цифр),
   * address — sede legale, rea — номер REA (лише для компанії), pec — PEC, якщо Марина хоче її показувати.
   * Partita IVA також виводиться у футері та в JSON-LD (vatID).
   */
  legal: {
    status: '',
    vat: '01834040089',
    address: 'Via Goethe 551, 18038 Sanremo (IM), Italia',
    rea: '',
    pec: '',
  },
  legalUpdated: '2026-10-08',

  formspreeId: FORMSPREE_ID,
  get formAction() {
    return this.formspreeId ? `https://formspree.io/f/${this.formspreeId}` : '';
  },
} as const;
