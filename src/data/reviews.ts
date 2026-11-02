import type { Locale } from '../lib/i18n';

/**
 * Відгуки з картки Google Maps («VM Design Studio»), перенесені вручну дослівно.
 * author — як у Google (ім'я й перша літера прізвища); date — 'YYYY-MM', якщо відома;
 * lang — мова оригіналу; translations — наш переклад іншими мовами сайту. На сторінці
 * іншою мовою показується переклад із позначкою «Переклад з …» і кнопкою «Оригінал».
 * Поки список порожній і live вимкнено, блок на головній не показується.
 *
 * live: true — сторінка бере живі відгуки з Google через worker/index.js (потрібні секрет
 * GOOGLE_PLACES_KEY і GOOGLE_PLACE_ID у wrangler.jsonc); ручні лишаються, якщо Google не відповів.
 */
export type Review = {
  author: string;
  date?: string;
  rating: number;
  lang: Locale;
  text: string;
  translations: Partial<Record<Locale, string>>;
};

export const REVIEWS: { live: boolean; rating: number; count: number; items: Review[] } = {
  live: false,
  rating: 5,
  count: 21,
  items: [
    {
      author: 'Kostyantyn B.',
      rating: 5,
      lang: 'en',
      text: 'Highly recommend VM Studio to those of who is seeking for great result, efficiency throughout, confidence and knowledge of their work. Marina is highly professional, determined and detailed oriented person. I had a privilege to work with you and wishing you to reach all your professional goals',
      translations: {
        fr: 'Je recommande vivement VM Studio à tous ceux qui recherchent un excellent résultat, de l’efficacité à chaque étape, de l’assurance et une vraie maîtrise du métier. Marina est une personne très professionnelle, déterminée et attentive aux détails. Ce fut un privilège de travailler avec vous, et je vous souhaite d’atteindre tous vos objectifs professionnels',
        it: 'Consiglio vivamente VM Studio a chi cerca un ottimo risultato, efficienza in ogni fase, sicurezza e competenza nel proprio lavoro. Marina è una persona molto professionale, determinata e attenta ai dettagli. È stato un privilegio lavorare con voi e vi auguro di raggiungere tutti i vostri obiettivi professionali',
        ru: 'Очень рекомендую VM Studio всем, кто ищет отличный результат, эффективность на всех этапах, уверенность и знание своего дела. Марина — очень профессиональный, целеустремлённый и внимательный к деталям человек. Для меня было честью работать с вами, желаю вам достичь всех профессиональных целей',
        uk: 'Дуже рекомендую VM Studio всім, хто шукає чудовий результат, ефективність на всіх етапах, упевненість і знання своєї справи. Марина — дуже професійна, цілеспрямована й уважна до деталей людина. Для мене було честю працювати з вами, бажаю вам досягти всіх професійних цілей',
      },
    },
    {
      author: 'ART FLORA',
      rating: 5,
      lang: 'ru',
      text: 'Очень довольны новым дизайном нашего дома! Чудесная работа, а главное все в обещанные  сроки и бюджет 👌🏻',
      translations: {
        en: 'We are very happy with the new design of our home! Wonderful work, and most importantly, everything within the promised time and budget 👌🏻',
        fr: 'Nous sommes ravis du nouveau design de notre maison ! Un travail merveilleux et, surtout, tout dans les délais et le budget promis 👌🏻',
        it: 'Siamo molto soddisfatti del nuovo design della nostra casa! Un lavoro splendido e, soprattutto, tutto nei tempi e nel budget promessi 👌🏻',
        uk: 'Дуже задоволені новим дизайном нашого дому! Чудова робота, а головне — все в обіцяні терміни та бюджет 👌🏻',
      },
    },
    {
      author: 'Alla',
      rating: 5,
      lang: 'en',
      text: "A great agency—I highly recommend it! Top-quality work, good understanding of the client's needs, and reasonable prices.",
      translations: {
        fr: 'Une excellente agence, je la recommande vivement ! Un travail de grande qualité, une bonne compréhension des besoins du client et des prix raisonnables.',
        it: 'Un’ottima agenzia, la consiglio vivamente! Lavoro di altissima qualità, buona comprensione delle esigenze del cliente e prezzi ragionevoli.',
        ru: 'Отличное агентство — очень рекомендую! Работа высочайшего качества, хорошее понимание потребностей клиента и разумные цены.',
        uk: 'Чудова агенція — дуже рекомендую! Робота найвищої якості, добре розуміння потреб клієнта й помірні ціни.',
      },
    },
    {
      author: 'Ольга С.',
      rating: 5,
      lang: 'uk',
      text: 'Звернулася до VM Design Studio за консультацією щодо проєктування квартири й залишилася дуже задоволена. Отримала професійну, чітку та змістовну консультацію, а також багато корисних порад, як максимально ефективно використати площу та створити функціональний і стильний дизайн. Видно, що команда має великий досвід і уважно ставиться до потреб клієнта. Щиро рекомендую VM Design Studio всім, хто цінує професіоналізм, якісний підхід і сучасні рішення! ❤️',
      translations: {
        en: 'I contacted VM Design Studio for a consultation on designing my apartment and was very pleased. I received a professional, clear and meaningful consultation, along with plenty of useful advice on how to make the most of the space and create a functional and stylish design. You can see that the team has a lot of experience and pays close attention to the client’s needs. I sincerely recommend VM Design Studio to anyone who values professionalism, a quality approach and modern solutions! ❤️',
        fr: 'J’ai fait appel à VM Design Studio pour une consultation sur la conception de mon appartement et j’en suis très satisfaite. J’ai reçu une consultation professionnelle, claire et riche en contenu, ainsi que de nombreux conseils utiles pour exploiter au mieux la surface et créer un design fonctionnel et élégant. On voit que l’équipe a une grande expérience et qu’elle est attentive aux besoins du client. Je recommande sincèrement VM Design Studio à tous ceux qui apprécient le professionnalisme, une approche de qualité et les solutions modernes ! ❤️',
        it: 'Mi sono rivolta a VM Design Studio per una consulenza sulla progettazione del mio appartamento e sono rimasta molto soddisfatta. Ho ricevuto una consulenza professionale, chiara e ricca di contenuti, oltre a tanti consigli utili su come sfruttare al meglio la superficie e creare un design funzionale ed elegante. Si vede che il team ha una grande esperienza ed è attento alle esigenze del cliente. Consiglio sinceramente VM Design Studio a chiunque apprezzi la professionalità, un approccio di qualità e le soluzioni moderne! ❤️',
        ru: 'Обратилась в VM Design Studio за консультацией по проектированию квартиры и осталась очень довольна. Получила профессиональную, чёткую и содержательную консультацию, а также много полезных советов, как максимально эффективно использовать площадь и создать функциональный и стильный дизайн. Видно, что у команды большой опыт и она внимательно относится к потребностям клиента. Искренне рекомендую VM Design Studio всем, кто ценит профессионализм, качественный подход и современные решения! ❤️',
      },
    },
    {
      author: 'WOODsystems Deutschland',
      rating: 5,
      lang: 'en',
      text: 'One of the finest design studios! Everything they create reflects exceptional professionalism, impeccable taste, and true mastery of their craft. Their work is a constant source of admiration and inspiration.\n\nNothing but respect and appreciation. Thank you for your outstanding work!',
      translations: {
        fr: 'L’un des meilleurs studios de design ! Tout ce qu’ils créent témoigne d’un professionnalisme exceptionnel, d’un goût irréprochable et d’une véritable maîtrise de leur art. Leur travail est une source constante d’admiration et d’inspiration.\n\nRien que du respect et de la reconnaissance. Merci pour votre travail remarquable !',
        it: 'Uno dei migliori studi di design! Tutto ciò che creano riflette una professionalità eccezionale, un gusto impeccabile e una vera padronanza del mestiere. Il loro lavoro è una fonte costante di ammirazione e ispirazione.\n\nSolo rispetto e apprezzamento. Grazie per il vostro straordinario lavoro!',
        ru: 'Одна из лучших дизайн-студий! Всё, что они создают, говорит об исключительном профессионализме, безупречном вкусе и настоящем мастерстве. Их работы — неизменный источник восхищения и вдохновения.\n\nТолько уважение и признательность. Спасибо за вашу выдающуюся работу!',
        uk: 'Одна з найкращих дизайн-студій! Усе, що вони створюють, свідчить про винятковий професіоналізм, бездоганний смак і справжню майстерність. Їхні роботи — незмінне джерело захоплення й натхнення.\n\nЛише повага та вдячність. Дякую за вашу видатну роботу!',
      },
    },
  ],
};
