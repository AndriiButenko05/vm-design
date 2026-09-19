/**
 * Єдине місце для контактів і сталих бренду.
 *
 * Джерела: біографія від замовниці (вересень 2026) і титульні блоки
 * робочої документації.
 */

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

  email: 'vmdesignproject@gmail.com',

  instagram: '@vm_project_azur',
  instagramUrl: 'https://www.instagram.com/vm_project_azur/',

  /** Зони роботи — у hero та в контактах. */
  regions: ["Côte d'Azur", 'Monaco', 'Italy', 'Germany'],

  /** Факти з біографії. Використовуються в About і в секції цифр. */
  facts: {
    experienceYears: 15,
    based: 'Nice, France',
    languages: ['English', 'French', 'Italian', 'Ukrainian', 'Russian'],
    /** Країни поза основною географією — згадані в біографії. */
    alsoWorkedIn: ['Poland', 'Ukraine', 'United States', 'Hong Kong'],
  },

  /**
   * Форма контактів — Formspree.
   *
   * Ключ форми не є секретом: він за визначенням видимий у розмітці,
   * бо стоїть в action. Тримаємо його у змінній середовища не заради
   * таємності, а щоб той самий код працював і локально, і на Cloudflare
   * без правок у файлах.
   *
   * Поки змінної немає, formAction порожній: форма нікуди не надсилає,
   * а скрипт одразу пропонує написати листом. Це краще, ніж тихо
   * постити на неіснуючу адресу й показувати «щось пішло не так».
   */
  formspreeId: FORMSPREE_ID,
  get formAction() {
    return this.formspreeId ? `https://formspree.io/f/${this.formspreeId}` : '';
  },
} as const;
