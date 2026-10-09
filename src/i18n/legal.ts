/**
 * Тексти сторінок «Note legali / Mentions légales» і «Політика конфіденційності».
 * Діяльність Марини зареєстрована в Італії, тож юридичну силу має італійська версія,
 * решта — переклади. Реквізити (форма, Partita IVA, sede, REA) — у src/lib/site.ts → SITE.legal.
 */
import type { Locale } from '../lib/i18n';
import { SITE } from '../lib/site';

export type LegalSection = { h: string; p: string[] };
export type LegalPage = { title: string; note?: string; sections: LegalSection[] };

const HOST = 'Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA — www.cloudflare.com';
const DOMAIN = 'vmdesignproject.com';

/** Рядки реквізитів, лише заповнені. */
function identity(labels: { status: string; address: string; vat: string; email: string; phone: string }) {
  const L = SITE.legal;
  return [
    `${SITE.name} — ${SITE.designer}`,
    L.status && `${labels.status}: ${L.status}`,
    L.vat && `${labels.vat}: ${L.vat}`,
    L.address && `${labels.address}: ${L.address}`,
    L.rea && `REA: ${L.rea}`,
    L.pec && `PEC: ${L.pec}`,
    `${labels.email}: ${SITE.email}`,
    `${labels.phone}: ${SITE.phone}`,
  ].filter(Boolean) as string[];
}

type Pack = { legal: LegalPage; privacy: LegalPage };

const fr = (): Pack => ({
  legal: {
    title: 'Mentions légales',
    note: 'Cette page est une traduction ; la version italienne (Note legali) fait foi.',
    sections: [
      {
        h: 'Éditeur du site',
        p: [
          `Le site ${DOMAIN} est édité par :`,
          ...identity({ status: 'Forme juridique', address: 'Siège', vat: 'Partita IVA (numéro de TVA italien)', email: 'E-mail', phone: 'Téléphone' }),
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
    note: 'Cette page est une traduction ; la version italienne (Informativa sulla privacy) fait foi.',
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
          'Ces données servent uniquement à répondre à votre demande et, le cas échéant, à préparer une proposition. Le traitement repose sur les mesures précontractuelles prises à votre demande (article 6, paragraphe 1, point b, du RGPD).',
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
          `Pour exercer ces droits, écrivez à ${SITE.email}. Vous pouvez également introduire une réclamation auprès du Garante per la protezione dei dati personali (www.garanteprivacy.it) ou de l’autorité de votre pays de résidence, comme la CNIL en France (www.cnil.fr).`,
        ],
      },
    ],
  },
});

const en = (): Pack => ({
  legal: {
    title: 'Legal notice',
    note: 'This page is a translation; the Italian version (Note legali) is legally binding.',
    sections: [
      {
        h: 'Site publisher',
        p: [
          `${DOMAIN} is published by:`,
          ...identity({ status: 'Legal form', address: 'Registered office', vat: 'Partita IVA (Italian VAT number)', email: 'Email', phone: 'Phone' }),
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
    note: 'This page is a translation; the Italian version (Informativa sulla privacy) is legally binding.',
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
          `To exercise these rights, write to ${SITE.email}. You may also lodge a complaint with the Italian data protection authority, the Garante per la protezione dei dati personali (www.garanteprivacy.it), or with the authority in your country of residence.`,
        ],
      },
    ],
  },
});

const uk = (): Pack => ({
  legal: {
    title: 'Юридична інформація',
    note: 'Ця сторінка — переклад; юридичну силу має італійська версія (Note legali).',
    sections: [
      {
        h: 'Власник сайту',
        p: [
          `Сайт ${DOMAIN} видає:`,
          ...identity({ status: 'Організаційна форма', address: 'Юридична адреса', vat: 'Partita IVA (італійський номер ПДВ)', email: 'Email', phone: 'Телефон' }),
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
    note: 'Ця сторінка — переклад; юридичну силу має італійська версія (Informativa sulla privacy).',
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
          `Щоб скористатися цими правами, напишіть на ${SITE.email}. Ви також можете подати скаргу до італійського органу із захисту даних — Garante per la protezione dei dati personali (www.garanteprivacy.it) — або до органу у вашій країні проживання.`,
        ],
      },
    ],
  },
});

const ru = (): Pack => ({
  legal: {
    title: 'Юридическая информация',
    note: 'Эта страница — перевод; юридическую силу имеет итальянская версия (Note legali).',
    sections: [
      {
        h: 'Владелец сайта',
        p: [
          `Сайт ${DOMAIN} издаёт:`,
          ...identity({ status: 'Организационная форма', address: 'Юридический адрес', vat: 'Partita IVA (итальянский номер НДС)', email: 'Email', phone: 'Телефон' }),
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
    note: 'Эта страница — перевод; юридическую силу имеет итальянская версия (Informativa sulla privacy).',
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
          `Чтобы воспользоваться этими правами, напишите на ${SITE.email}. Вы также можете подать жалобу в итальянский орган по защите данных — Garante per la protezione dei dati personali (www.garanteprivacy.it) — или в орган вашей страны проживания.`,
        ],
      },
    ],
  },
});

const it = (): Pack => ({
  legal: {
    title: 'Note legali',
    sections: [
      {
        h: 'Editore del sito',
        p: [
          `Il sito ${DOMAIN} è pubblicato da (informazioni ai sensi dell’art. 7 del D.Lgs. 70/2003):`,
          ...identity({ status: 'Forma giuridica', address: 'Sede', vat: 'Partita IVA', email: 'E-mail', phone: 'Telefono' }),
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
          `Per esercitare questi diritti, scrivi a ${SITE.email}. Puoi anche presentare reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it) o all’autorità del tuo Paese di residenza.`,
        ],
      },
    ],
  },
});

const PACKS: Record<Locale, () => Pack> = { en, fr, it, ru, uk };

export function legalPage(locale: Locale, page: 'legal' | 'privacy'): LegalPage {
  return PACKS[locale]()[page];
}
