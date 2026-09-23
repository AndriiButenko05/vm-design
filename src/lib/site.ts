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

  /**
   * Телефон у двох виглядах: людський для підпису і суцільний для tel:.
   * Розділяти обов'язково — у href пробіли ламають набір на частині
   * телефонів, а в підписі без них номер не читається.
   */
  phone: '+39 329 5559043',
  phoneHref: 'tel:+393295559043',

  /*
    Акаунт змінився з vm_project_azur на vm_design__studio.
    У посиланні два підкреслення поспіль — це не помилка набору.

    Адреса очищена від «?stkn=…&utm_source=qr»: це мітки переходу з
    QR-коду з конкретної сесії, і публікувати їх на сайті нема сенсу.
  */
  instagram: '@vm_design__studio',
  instagramUrl: 'https://www.instagram.com/vm_design__studio/',

  /**
   * Зони роботи — у hero та в контактах.
   *
   * «French Riviera», а не «Côte d'Azur»: сайт англомовний, і замовниця
   * просила скрізь у короткому форматі саме цю назву.
   *
   * Germany звідси прибрана свідомо. Вона стояла нарівні з Рив'єрою,
   * Монако та Італією, хоча це минулий досвід, а не поточна географія
   * студії, — через це сайт обіцяв присутність, якої немає. Тепер вона
   * у internationalExperience, серед решти країн минулих проєктів.
   */
  regions: ['French Riviera', 'Monaco', 'Italy'],

  /** Факти з біографії. Використовуються в About і в секції цифр. */
  facts: {
    experienceYears: 15,
    based: 'Nice, France',
    languages: ['English', 'French', 'Italian', 'Ukrainian', 'Russian'],
    /**
     * Уся міжнародна географія, включно з поточною.
     *
     * Раніше називалося alsoWorkedIn і містило лише країни ПОЗА основною
     * географією. Замовниця попросила інший зміст: повний перелік під
     * підписом «International experience», де Франція, Італія та Монако
     * стоять поряд із рештою.
     *
     * Germany тут за її ж вказівкою («перенести з Working across у
     * Previous international experience»). У пізнішому переліку тієї ж
     * записки Німеччини немає — схоже, просто загубилася при передруку:
     * Christina Kassel лежить на сайті з country: "Germany", і без неї
     * біографія суперечила б власному портфоліо.
     */
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
