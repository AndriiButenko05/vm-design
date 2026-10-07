/**
 * Тексти сторінок «Mentions légales» і «Політика конфіденційності».
 * Юридичну силу має французька версія (сайт працює у Франції), решта — переклади.
 * Реквізити (статус, SIRET, адреса) — у src/lib/site.ts → SITE.legal.
 */
import type { Locale } from '../lib/i18n';
import { SITE } from '../lib/site';

export type LegalSection = { h: string; p: string[] };
export type LegalPage = { title: string; note?: string; sections: LegalSection[] };

const HOST = 'Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA — www.cloudflare.com';
const DOMAIN = 'vmdesignproject.com';

/** Рядки реквізитів, лише заповнені. */
function identity(labels: { status: string; siret: string; address: string; vat: string; email: string; phone: string }) {
  const L = SITE.legal;
  return [
    `${SITE.name} — ${SITE.designer}`,
    L.status && `${labels.status}: ${L.status}`,
    L.siret && `SIRET: ${L.siret}`,
    L.vat && `${labels.vat}: ${L.vat}`,
    L.address && `${labels.address}: ${L.address}`,
    `${labels.email}: ${SITE.email}`,
    `${labels.phone}: ${SITE.phone}`,
  ].filter(Boolean) as string[];
}

type Pack = { legal: LegalPage; privacy: LegalPage };

const fr = (): Pack => ({
  legal: {
    title: 'Mentions légales',
    sections: [
      {
        h: 'Éditeur du site',
        p: [
          `Le site ${DOMAIN} est édité par :`,
          ...identity({ status: 'Statut', siret: 'SIRET', address: 'Adresse', vat: 'N° de TVA intracommunautaire', email: 'E-mail', phone: 'Téléphone' }),
        ],
      },
      { h: 'Directrice de la publication', p: [SITE.designer] },
      { h: 'Hébergement', p: [HOST] },
      {
        h: 'Propriété intellectuelle',
        p: [
          'L’ensemble des contenus de ce site — textes, photographies, plans, visualisations 3D et éléments graphiques — est la propriété de VM Design ou est utilisé avec l’autorisation de ses titulaires.',
          'Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable est interdite.',
        ],
      },
      {
        h: 'Données personnelles',
        p: ['Le traitement des données transmises via le formulaire de contact est décrit dans la politique de confidentialité.'],
      },
    ],
  },
  privacy: {
    title: 'Politique de confidentialité',
    sections: [
      {
        h: 'Responsable du traitement',
        p: [`${SITE.designer} (${SITE.name}), joignable à l’adresse ${SITE.email}.`],
      },
      {
        h: 'Données collectées',
        p: [
          'Lorsque vous utilisez le formulaire de contact, nous recevons votre nom, votre adresse e-mail, le service choisi et votre message.',
          'Le site ne propose ni compte utilisateur ni paiement en ligne.',
        ],
      },
      {
        h: 'Finalité et base légale',
        p: [
          'Ces données servent uniquement à répondre à votre demande et, le cas échéant, à préparer une proposition. Le traitement repose sur les mesures précontractuelles prises à votre demande (article 6.1.b du RGPD).',
        ],
      },
      {
        h: 'Destinataires',
        p: [
          `Vos messages sont lus uniquement par ${SITE.designer}.`,
          'Le formulaire est transmis par l’intermédiaire du service Formspree (Formspree, Inc., États-Unis), qui agit en tant que sous-traitant pour l’acheminement des messages.',
          'Le site est hébergé par Cloudflare, qui traite des données techniques (comme l’adresse IP) pour afficher le site et le protéger contre les attaques.',
          'Ces prestataires étant établis aux États-Unis, les transferts de données hors de l’Union européenne s’effectuent dans le cadre des garanties prévues par le RGPD.',
        ],
      },
      {
        h: 'Durée de conservation',
        p: [
          'Les messages sont conservés au maximum trois ans après le dernier contact, sauf si une relation contractuelle s’ensuit ; les documents liés au contrat sont alors conservés pendant les durées légales.',
        ],
      },
      {
        h: 'Cookies et mesure d’audience',
        p: [
          'Ce site n’utilise pas de cookies de suivi ni de cookies publicitaires ; aucun bandeau de consentement n’est donc nécessaire.',
          'Pour mesurer la fréquentation, nous utilisons Cloudflare Web Analytics, qui ne dépose pas de cookies, ne suit pas les visiteurs d’un site à l’autre et ne fournit que des statistiques agrégées (pages vues, pays, type d’appareil).',
        ],
      },
      {
        h: 'Vos droits',
        p: [
          'Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité de vos données.',
          `Pour exercer ces droits, écrivez à ${SITE.email}. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).`,
        ],
      },
    ],
  },
});

const en = (): Pack => ({
  legal: {
    title: 'Legal notice',
    note: 'This page is a translation; the French version (Mentions légales) is legally binding.',
    sections: [
      {
        h: 'Site publisher',
        p: [
          `${DOMAIN} is published by:`,
          ...identity({ status: 'Legal status', siret: 'SIRET', address: 'Address', vat: 'EU VAT number', email: 'Email', phone: 'Phone' }),
        ],
      },
      { h: 'Publication director', p: [SITE.designer] },
      { h: 'Hosting', p: [HOST] },
      {
        h: 'Intellectual property',
        p: [
          'All content on this site — texts, photographs, drawings, 3D visualisations and graphics — belongs to VM Design or is used with the permission of its owners.',
          'Any reproduction, display or distribution, in whole or in part, without prior written permission is prohibited.',
        ],
      },
      { h: 'Personal data', p: ['How data sent through the contact form is handled is described in the privacy policy.'] },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    note: 'This page is a translation; the French version (Politique de confidentialité) is legally binding.',
    sections: [
      { h: 'Data controller', p: [`${SITE.designer} (${SITE.name}), reachable at ${SITE.email}.`] },
      {
        h: 'Data collected',
        p: [
          'When you use the contact form, we receive your name, email address, the service you selected and your message.',
          'The site has no user accounts and no online payments.',
        ],
      },
      {
        h: 'Purpose and legal basis',
        p: [
          'This data is used only to reply to your enquiry and, where relevant, to prepare a proposal. Processing is based on steps taken at your request before entering into a contract (Article 6(1)(b) GDPR).',
        ],
      },
      {
        h: 'Recipients',
        p: [
          `Your messages are read only by ${SITE.designer}.`,
          'The form is delivered through Formspree (Formspree, Inc., USA), which acts as a processor solely to forward messages.',
          'The site is hosted by Cloudflare, which processes technical data (such as IP addresses) to serve the site and protect it from attacks.',
          'As these providers are based in the United States, transfers of data outside the European Union take place under the safeguards provided by the GDPR.',
        ],
      },
      {
        h: 'Retention',
        p: [
          'Messages are kept for no longer than three years after the last contact, unless a contract follows; documents relating to the contract are then kept for the periods required by law.',
        ],
      },
      {
        h: 'Cookies and analytics',
        p: [
          'This site does not use tracking or advertising cookies, so no consent banner is needed.',
          'To measure visits, we use Cloudflare Web Analytics, which sets no cookies, does not track visitors across sites and provides only aggregated statistics (page views, country, device type).',
        ],
      },
      {
        h: 'Your rights',
        p: [
          'You have the right to access, rectify, erase, restrict, object to and port your data.',
          `To exercise these rights, write to ${SITE.email}. You may also lodge a complaint with the French data protection authority, the CNIL (www.cnil.fr).`,
        ],
      },
    ],
  },
});

const uk = (): Pack => ({
  legal: {
    title: 'Юридична інформація',
    note: 'Ця сторінка — переклад; юридичну силу має французька версія (Mentions légales).',
    sections: [
      {
        h: 'Власник сайту',
        p: [
          `Сайт ${DOMAIN} видає:`,
          ...identity({ status: 'Правовий статус', siret: 'SIRET', address: 'Адреса', vat: 'Номер ПДВ ЄС', email: 'Email', phone: 'Телефон' }),
        ],
      },
      { h: 'Відповідальна за публікацію', p: [SITE.designer] },
      { h: 'Хостинг', p: [HOST] },
      {
        h: 'Інтелектуальна власність',
        p: [
          'Увесь вміст сайту — тексти, фотографії, креслення, 3D-візуалізації та графіка — належить VM Design або використовується з дозволу правовласників.',
          'Будь-яке відтворення, показ чи поширення, повністю або частково, без попереднього письмового дозволу заборонене.',
        ],
      },
      { h: 'Персональні дані', p: ['Як обробляються дані з форми зворотного звʼязку, описано в політиці конфіденційності.'] },
    ],
  },
  privacy: {
    title: 'Політика конфіденційності',
    note: 'Ця сторінка — переклад; юридичну силу має французька версія (Politique de confidentialité).',
    sections: [
      { h: 'Відповідальна за обробку даних', p: [`${SITE.designer} (${SITE.name}), email: ${SITE.email}.`] },
      {
        h: 'Які дані збираються',
        p: [
          'Коли ви заповнюєте форму зворотного звʼязку, ми отримуємо ваше імʼя, email, обрану послугу та повідомлення.',
          'На сайті немає облікових записів і онлайн-оплати.',
        ],
      },
      {
        h: 'Мета й правова підстава',
        p: [
          'Ці дані використовуються лише для відповіді на ваш запит і, за потреби, підготовки пропозиції. Підстава — дії на ваш запит перед укладенням договору (стаття 6(1)(b) GDPR).',
        ],
      },
      {
        h: 'Хто отримує дані',
        p: [
          `Ваші повідомлення читає лише ${SITE.designer}.`,
          'Форма передається через сервіс Formspree (Formspree, Inc., США), який лише пересилає повідомлення як обробник даних.',
          'Сайт розміщено на Cloudflare, що обробляє технічні дані (наприклад, IP-адресу), аби показувати сайт і захищати його від атак.',
          'Оскільки ці постачальники розташовані в США, передавання даних за межі ЄС відбувається з гарантіями, передбаченими GDPR.',
        ],
      },
      {
        h: 'Строк зберігання',
        p: [
          'Повідомлення зберігаються не довше трьох років після останнього контакту, якщо не укладено договір; документи, повʼязані з договором, зберігаються протягом строків, визначених законом.',
        ],
      },
      {
        h: 'Cookies та статистика',
        p: [
          'Сайт не використовує стежувальних чи рекламних cookies, тому банер згоди не потрібен.',
          'Для підрахунку відвідувань ми використовуємо Cloudflare Web Analytics: він не встановлює cookies, не відстежує відвідувачів на інших сайтах і показує лише загальну статистику (перегляди сторінок, країна, тип пристрою).',
        ],
      },
      {
        h: 'Ваші права',
        p: [
          'Ви маєте право на доступ до своїх даних, їх виправлення, видалення, обмеження обробки, заперечення проти обробки та перенесення.',
          `Щоб скористатися цими правами, напишіть на ${SITE.email}. Ви також можете подати скаргу до французького органу із захисту даних CNIL (www.cnil.fr).`,
        ],
      },
    ],
  },
});

const ru = (): Pack => ({
  legal: {
    title: 'Юридическая информация',
    note: 'Эта страница — перевод; юридическую силу имеет французская версия (Mentions légales).',
    sections: [
      {
        h: 'Владелец сайта',
        p: [
          `Сайт ${DOMAIN} издаёт:`,
          ...identity({ status: 'Правовой статус', siret: 'SIRET', address: 'Адрес', vat: 'Номер НДС ЕС', email: 'Email', phone: 'Телефон' }),
        ],
      },
      { h: 'Ответственная за публикацию', p: [SITE.designer] },
      { h: 'Хостинг', p: [HOST] },
      {
        h: 'Интеллектуальная собственность',
        p: [
          'Всё содержимое сайта — тексты, фотографии, чертежи, 3D-визуализации и графика — принадлежит VM Design или используется с разрешения правообладателей.',
          'Любое воспроизведение, показ или распространение, полностью или частично, без предварительного письменного разрешения запрещено.',
        ],
      },
      { h: 'Персональные данные', p: ['Как обрабатываются данные из формы обратной связи, описано в политике конфиденциальности.'] },
    ],
  },
  privacy: {
    title: 'Политика конфиденциальности',
    note: 'Эта страница — перевод; юридическую силу имеет французская версия (Politique de confidentialité).',
    sections: [
      { h: 'Ответственная за обработку данных', p: [`${SITE.designer} (${SITE.name}), email: ${SITE.email}.`] },
      {
        h: 'Какие данные собираются',
        p: [
          'Когда вы заполняете форму обратной связи, мы получаем ваше имя, email, выбранную услугу и сообщение.',
          'На сайте нет учётных записей и онлайн-оплаты.',
        ],
      },
      {
        h: 'Цель и правовое основание',
        p: [
          'Эти данные используются только для ответа на ваш запрос и, при необходимости, подготовки предложения. Основание — действия по вашему запросу до заключения договора (статья 6(1)(b) GDPR).',
        ],
      },
      {
        h: 'Кто получает данные',
        p: [
          `Ваши сообщения читает только ${SITE.designer}.`,
          'Форма передаётся через сервис Formspree (Formspree, Inc., США), который лишь пересылает сообщения как обработчик данных.',
          'Сайт размещён на Cloudflare, который обрабатывает технические данные (например, IP-адрес), чтобы показывать сайт и защищать его от атак.',
          'Поскольку эти поставщики находятся в США, передача данных за пределы ЕС осуществляется с гарантиями, предусмотренными GDPR.',
        ],
      },
      {
        h: 'Срок хранения',
        p: [
          'Сообщения хранятся не дольше трёх лет после последнего контакта, если не заключён договор; документы, связанные с договором, хранятся в течение сроков, установленных законом.',
        ],
      },
      {
        h: 'Cookies и статистика',
        p: [
          'Сайт не использует отслеживающих или рекламных cookies, поэтому баннер согласия не нужен.',
          'Для подсчёта посещений мы используем Cloudflare Web Analytics: он не устанавливает cookies, не отслеживает посетителей на других сайтах и показывает только общую статистику (просмотры страниц, страна, тип устройства).',
        ],
      },
      {
        h: 'Ваши права',
        p: [
          'Вы имеете право на доступ к своим данным, их исправление, удаление, ограничение обработки, возражение против обработки и перенос.',
          `Чтобы воспользоваться этими правами, напишите на ${SITE.email}. Вы также можете подать жалобу во французский орган по защите данных CNIL (www.cnil.fr).`,
        ],
      },
    ],
  },
});

const it = (): Pack => ({
  legal: {
    title: 'Note legali',
    note: 'Questa pagina è una traduzione; fa fede la versione francese (Mentions légales).',
    sections: [
      {
        h: 'Editore del sito',
        p: [
          `Il sito ${DOMAIN} è pubblicato da:`,
          ...identity({ status: 'Forma giuridica', siret: 'SIRET', address: 'Indirizzo', vat: 'Partita IVA UE', email: 'E-mail', phone: 'Telefono' }),
        ],
      },
      { h: 'Responsabile della pubblicazione', p: [SITE.designer] },
      { h: 'Hosting', p: [HOST] },
      {
        h: 'Proprietà intellettuale',
        p: [
          'Tutti i contenuti del sito — testi, fotografie, disegni, visualizzazioni 3D ed elementi grafici — sono di proprietà di VM Design o utilizzati con l’autorizzazione dei titolari.',
          'È vietata qualsiasi riproduzione, rappresentazione o diffusione, totale o parziale, senza previa autorizzazione scritta.',
        ],
      },
      { h: 'Dati personali', p: ['Il trattamento dei dati inviati tramite il modulo di contatto è descritto nell’informativa sulla privacy.'] },
    ],
  },
  privacy: {
    title: 'Informativa sulla privacy',
    note: 'Questa pagina è una traduzione; fa fede la versione francese (Politique de confidentialité).',
    sections: [
      { h: 'Titolare del trattamento', p: [`${SITE.designer} (${SITE.name}), contattabile all’indirizzo ${SITE.email}.`] },
      {
        h: 'Dati raccolti',
        p: [
          'Quando usi il modulo di contatto, riceviamo il tuo nome, il tuo indirizzo e-mail, il servizio scelto e il tuo messaggio.',
          'Il sito non prevede account utente né pagamenti online.',
        ],
      },
      {
        h: 'Finalità e base giuridica',
        p: [
          'Questi dati servono solo a rispondere alla tua richiesta e, se necessario, a preparare una proposta. Il trattamento si basa su misure precontrattuali adottate su tua richiesta (articolo 6, paragrafo 1, lettera b) del GDPR).',
        ],
      },
      {
        h: 'Destinatari',
        p: [
          `I tuoi messaggi sono letti solo da ${SITE.designer}.`,
          'Il modulo viene inoltrato tramite Formspree (Formspree, Inc., Stati Uniti), che agisce come responsabile del trattamento solo per la consegna dei messaggi.',
          'Il sito è ospitato da Cloudflare, che tratta dati tecnici (come l’indirizzo IP) per mostrare il sito e proteggerlo dagli attacchi.',
          'Poiché questi fornitori hanno sede negli Stati Uniti, i trasferimenti di dati al di fuori dell’Unione europea avvengono nel rispetto delle garanzie previste dal GDPR.',
        ],
      },
      {
        h: 'Conservazione',
        p: [
          'I messaggi sono conservati per non più di tre anni dall’ultimo contatto, salvo che ne derivi un contratto; i documenti relativi al contratto sono allora conservati per i periodi previsti dalla legge.',
        ],
      },
      {
        h: 'Cookie e statistiche',
        p: [
          'Questo sito non utilizza cookie di tracciamento né pubblicitari, quindi non è necessario alcun banner di consenso.',
          'Per misurare le visite usiamo Cloudflare Web Analytics, che non imposta cookie, non traccia i visitatori su altri siti e fornisce solo statistiche aggregate (pagine viste, paese, tipo di dispositivo).',
        ],
      },
      {
        h: 'I tuoi diritti',
        p: [
          'Hai diritto di accesso, rettifica, cancellazione, limitazione, opposizione e portabilità dei tuoi dati.',
          `Per esercitare questi diritti, scrivi a ${SITE.email}. Puoi anche presentare reclamo all’autorità francese per la protezione dei dati, la CNIL (www.cnil.fr).`,
        ],
      },
    ],
  },
});

const PACKS: Record<Locale, () => Pack> = { en, fr, it, ru, uk };

export function legalPage(locale: Locale, page: 'legal' | 'privacy'): LegalPage {
  return PACKS[locale]()[page];
}
