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
  count: 24,
  items: [
    {
      author: 'Jelena',
      rating: 5,
      lang: 'en',
      text: 'I would like to recommend Marina as a true professional!\n\nWe really liked the thoughtful layout and precise calculations. The designer offered different concepts until we found that exact shared solution. She was always in touch, consulted on any questions, and also helped with the selection of trusted suppliers and a construction crew.\n\nThe work was performed competently, clearly, and to the highest standard. Thank you very much, we recommend her!',
      translations: {
        fr: 'Je tiens à recommander Marina, une vraie professionnelle !\n\nNous avons beaucoup apprécié l’agencement réfléchi et les calculs précis. La designer nous a proposé différents concepts jusqu’à ce que nous trouvions ensemble la solution qui nous convenait. Elle était toujours disponible, nous conseillait sur toutes les questions et nous a aussi aidés à choisir des fournisseurs de confiance et une équipe de travaux.\n\nLe travail a été réalisé avec compétence, clarté et au plus haut niveau. Merci beaucoup, nous la recommandons !',
        it: 'Vorrei consigliare Marina, una vera professionista!\n\nCi sono piaciuti molto la distribuzione degli spazi ben pensata e i calcoli precisi. La designer ci ha proposto diversi concept finché non abbiamo trovato insieme la soluzione giusta. Era sempre disponibile, ci ha consigliato su ogni questione e ci ha aiutato anche a scegliere fornitori affidabili e una squadra di operai.\n\nIl lavoro è stato svolto con competenza, chiarezza e al massimo livello. Grazie mille, la consigliamo!',
        ru: 'Хочу порекомендовать Марину как настоящего профессионала!\n\nНам очень понравились продуманная планировка и точные расчёты. Дизайнер предлагала разные концепции, пока мы не нашли то самое общее решение. Она всегда была на связи, консультировала по любым вопросам, а также помогла с выбором надёжных поставщиков и строительной бригады.\n\nРабота выполнена грамотно, чётко и на самом высоком уровне. Большое спасибо, рекомендуем!',
        uk: 'Хочу порекомендувати Марину як справжню професіоналку!\n\nНам дуже сподобалися продумане планування й точні розрахунки. Дизайнерка пропонувала різні концепції, доки ми не знайшли те саме спільне рішення. Вона завжди була на зв’язку, консультувала з будь-яких питань, а також допомогла з вибором надійних постачальників і будівельної бригади.\n\nРоботу виконано грамотно, чітко й на найвищому рівні. Щиро дякуємо, рекомендуємо!',
      },
    },
    {
      author: 'Lena E.',
      rating: 5,
      lang: 'fr',
      text: 'Une architecte remarquable avec qui j’ai le plaisir de collaborer régulièrement.\nSon professionnalisme, sa rigueur et sa créativité sont des qualités que j’apprécie particulièrement. Elle est toujours à l’écoute, réactive et possède une excellente vision des projets. C’est un vrai plaisir de travailler avec une personne aussi sérieuse, passionnée et impliquée dans son métier.\nJe recommande vivement son travail et son professionnalisme.',
      translations: {
        en: 'A remarkable architect with whom I have the pleasure of working regularly.\nHer professionalism, rigour and creativity are qualities I particularly appreciate. She always listens, responds quickly and has an excellent vision of each project. It is a real pleasure to work with someone so serious, passionate and committed to her profession.\nI highly recommend her work and her professionalism.',
        it: 'Un’architetta straordinaria con cui ho il piacere di collaborare regolarmente.\nLa sua professionalità, il suo rigore e la sua creatività sono qualità che apprezzo particolarmente. È sempre disponibile all’ascolto, reattiva e ha un’ottima visione dei progetti. È un vero piacere lavorare con una persona così seria, appassionata e coinvolta nel proprio mestiere.\nConsiglio vivamente il suo lavoro e la sua professionalità.',
        ru: 'Замечательный архитектор, с которой мне посчастливилось регулярно сотрудничать.\nЕё профессионализм, точность и креативность — качества, которые я особенно ценю. Она всегда внимательно слушает, быстро реагирует и прекрасно видит проект целиком. Работать с таким серьёзным, увлечённым и преданным своему делу человеком — настоящее удовольствие.\nОчень рекомендую её работу и её профессионализм.',
        uk: 'Чудова архітекторка, з якою я маю задоволення регулярно співпрацювати.\nЇї професіоналізм, ретельність і креативність — якості, які я особливо ціную. Вона завжди уважно слухає, швидко реагує й чудово бачить проєкт загалом. Працювати з такою серйозною, захопленою й відданою своїй справі людиною — справжнє задоволення.\nЩиро рекомендую її роботу та її професіоналізм.',
      },
    },
    {
      author: 'Allure Luxury Group',
      rating: 5,
      lang: 'en',
      text: 'A well-deserved five stars. Marina combines exceptional creativity , remarkable attention to expectations, bringing harmony, elegance and personality to the interiors she creates.\n\nBeyond her professional talent, Marina is wonderful person to collaborate with.\n\nI highly recommend VM Design Studio to anyone looking for sophisticated interior design.',
      translations: {
        fr: 'Cinq étoiles bien méritées. Marina allie une créativité exceptionnelle et une attention remarquable aux attentes, apportant harmonie, élégance et personnalité aux intérieurs qu’elle crée.\n\nAu-delà de son talent professionnel, Marina est une personne merveilleuse avec qui collaborer.\n\nJe recommande vivement VM Design Studio à tous ceux qui recherchent un design d’intérieur raffiné.',
        it: 'Cinque stelle meritatissime. Marina unisce una creatività eccezionale e una notevole attenzione alle aspettative, portando armonia, eleganza e personalità negli interni che crea.\n\nOltre al suo talento professionale, Marina è una persona meravigliosa con cui collaborare.\n\nConsiglio vivamente VM Design Studio a chiunque cerchi un interior design raffinato.',
        ru: 'Заслуженные пять звёзд. Марина сочетает исключительную креативность и редкое внимание к ожиданиям клиента, привнося гармонию, элегантность и индивидуальность в создаваемые ею интерьеры.\n\nПомимо профессионального таланта, Марина — прекрасный человек, с которым приятно сотрудничать.\n\nОчень рекомендую VM Design Studio всем, кто ищет изысканный дизайн интерьера.',
        uk: 'Заслужені п’ять зірок. Марина поєднує виняткову креативність і рідкісну увагу до очікувань клієнта, привносячи гармонію, елегантність та індивідуальність у створені нею інтер’єри.\n\nОкрім професійного таланту, Марина — чудова людина, з якою приємно співпрацювати.\n\nЩиро рекомендую VM Design Studio всім, хто шукає вишуканий дизайн інтер’єру.',
      },
    },
    {
      author: 'Ксения М.',
      rating: 5,
      lang: 'uk',
      text: 'Найщиріша рекомендація VM Design Studio!!! Ведення проєкту з нуля і до втілення будинку мрії, Марина дуже професійно веде всі процеси, відповідальна та чуйна людина. Рекомендую, рекомендую і ще раз рекомендую!!! Дякую за такий результат, насолоджуємось кожним рішенням!',
      translations: {
        en: 'My most sincere recommendation for VM Design Studio!!! From running the project from scratch to bringing our dream house to life, Marina manages every process very professionally; she is a responsible and caring person. I recommend, recommend and recommend again!!! Thank you for such a result, we enjoy every single decision!',
        fr: 'Ma recommandation la plus sincère pour VM Design Studio !!! De la conduite du projet à partir de zéro jusqu’à la réalisation de la maison de nos rêves, Marina gère chaque étape avec un grand professionnalisme ; c’est une personne responsable et attentionnée. Je recommande, je recommande et je recommande encore !!! Merci pour un tel résultat, nous profitons de chaque choix !',
        it: 'La mia più sincera raccomandazione per VM Design Studio!!! Dalla gestione del progetto da zero fino alla realizzazione della casa dei nostri sogni, Marina segue ogni fase con grande professionalità: è una persona responsabile e premurosa. La consiglio, la consiglio e la consiglio ancora!!! Grazie per questo risultato, ci godiamo ogni singola scelta!',
        ru: 'Самая искренняя рекомендация VM Design Studio!!! От ведения проекта с нуля до воплощения дома мечты — Марина очень профессионально ведёт все процессы, ответственный и чуткий человек. Рекомендую, рекомендую и ещё раз рекомендую!!! Спасибо за такой результат, наслаждаемся каждым решением!',
      },
    },
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
      author: 'Alina L.',
      rating: 5,
      lang: 'fr',
      text: 'J’ai fait appel à Marina pour la rénovation de mon appartement et je suis absolument ravie du résultat. Marina est très professionnelle, sérieuse, réactive et particulièrement entreprenante. Tout a été réalisé avec soin et efficacité, sans aucun problème ni remarque à faire. C’est un vrai plaisir de travailler avec une personne aussi fiable et impliquée. Je la recommande vivement !',
      translations: {
        en: 'I hired Marina to renovate my apartment and I am absolutely delighted with the result. Marina is very professional, reliable, responsive and particularly proactive. Everything was done with care and efficiency, without a single problem or remark. It is a real pleasure to work with such a dependable and committed person. I highly recommend her!',
        it: 'Mi sono affidata a Marina per la ristrutturazione del mio appartamento e sono assolutamente entusiasta del risultato. Marina è molto professionale, seria, reattiva e particolarmente intraprendente. Tutto è stato realizzato con cura ed efficienza, senza alcun problema né osservazione da fare. È un vero piacere lavorare con una persona così affidabile e coinvolta. La consiglio vivamente!',
        ru: 'Я обратилась к Марине для ремонта своей квартиры и в полном восторге от результата. Марина очень профессиональная, серьёзная, оперативная и особенно инициативная. Всё было сделано аккуратно и эффективно, без каких-либо проблем и замечаний. Работать с таким надёжным и вовлечённым человеком — настоящее удовольствие. Очень её рекомендую!',
        uk: 'Я звернулася до Марини щодо ремонту своєї квартири й у повному захваті від результату. Марина дуже професійна, серйозна, оперативна й особливо ініціативна. Усе було зроблено ретельно та ефективно, без жодних проблем і зауважень. Працювати з такою надійною та залученою людиною — справжнє задоволення. Щиро її рекомендую!',
      },
    },
    {
      author: 'Inna S.',
      rating: 5,
      lang: 'uk',
      text: 'Щиро рекомендую VM Design Studio і окремо Марину як супер професіонала!\nДуже професійний підхід, бездоганний смак і велика увага до деталей.\nНаш проєкт був виконаний якісно, вчасно і перевершив наші очікування 😍\nДякую за чудову роботу і бажаю подальшого розвитку студії!',
      translations: {
        en: 'I sincerely recommend VM Design Studio, and Marina in particular, as a true professional!\nA very professional approach, impeccable taste and great attention to detail.\nOur project was completed with quality, on time and exceeded our expectations 😍\nThank you for the wonderful work, and I wish the studio continued growth!',
        fr: 'Je recommande sincèrement VM Design Studio, et tout particulièrement Marina, une vraie professionnelle !\nUne approche très professionnelle, un goût irréprochable et une grande attention aux détails.\nNotre projet a été réalisé avec qualité, dans les délais, et a dépassé nos attentes 😍\nMerci pour ce travail magnifique, et je souhaite au studio de continuer à se développer !',
        it: 'Consiglio sinceramente VM Design Studio e in particolare Marina, una vera professionista!\nUn approccio molto professionale, un gusto impeccabile e grande attenzione ai dettagli.\nIl nostro progetto è stato realizzato con qualità, nei tempi previsti, e ha superato le nostre aspettative 😍\nGrazie per lo splendido lavoro, e auguro allo studio di continuare a crescere!',
        ru: 'Искренне рекомендую VM Design Studio и отдельно Марину как супер профессионала!\nОчень профессиональный подход, безупречный вкус и большое внимание к деталям.\nНаш проект был выполнен качественно, вовремя и превзошёл наши ожидания 😍\nСпасибо за прекрасную работу, желаю студии дальнейшего развития!',
      },
    },
    {
      author: 'Dmitrii C.',
      rating: 5,
      lang: 'en',
      text: 'It was a pleasure to work with such a professional. The deadlines were met, the design was fantastic, and the prices were a pleasant surprise. I highly recommend them.',
      translations: {
        fr: 'Ce fut un plaisir de travailler avec une telle professionnelle. Les délais ont été respectés, le design était fantastique et les prix ont été une agréable surprise. Je les recommande vivement.',
        it: 'È stato un piacere lavorare con una professionista simile. Le scadenze sono state rispettate, il design era fantastico e i prezzi sono stati una piacevole sorpresa. Li consiglio vivamente.',
        ru: 'Было приятно работать с таким профессионалом. Сроки были соблюдены, дизайн получился фантастическим, а цены приятно удивили. Очень рекомендую.',
        uk: 'Було приємно працювати з таким професіоналом. Терміни дотримано, дизайн вийшов фантастичним, а ціни приємно здивували. Щиро рекомендую.',
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
      author: 'Oleksandr B.',
      rating: 5,
      lang: 'it',
      text: "Vorrei fare i complimenti alla \"VM Desing studio\"Marina per il lavoro che ha fatto nel mio appartamento.\nAll'inizio del progetto avevo poca fiducia, però a fine dei lavori sono rimasto molto contento sia del progetto finito che dalla professionalità e precisione.\nBravissima!!! Consiglio a tutti .",
      translations: {
        en: 'I would like to compliment Marina of “VM Design Studio” on the work she did in my apartment.\nAt the start of the project I had little confidence, but by the end of the works I was very happy with both the finished project and the professionalism and precision.\nBravissima!!! I recommend her to everyone.',
        fr: 'Je voudrais féliciter Marina de « VM Design Studio » pour le travail qu’elle a réalisé dans mon appartement.\nAu début du projet, j’avais peu confiance, mais à la fin des travaux, j’étais très satisfait aussi bien du projet fini que du professionnalisme et de la précision.\nBravissima !!! Je la recommande à tous.',
        ru: 'Хочу выразить благодарность Марине из «VM Design Studio» за работу, которую она сделала в моей квартире.\nВ начале проекта я сомневался, но по окончании работ остался очень доволен и готовым проектом, и профессионализмом, и точностью.\nБраво!!! Рекомендую всем.',
        uk: 'Хочу подякувати Марині з «VM Design Studio» за роботу, яку вона виконала в моїй квартирі.\nНа початку проєкту я мав сумніви, але після завершення робіт залишився дуже задоволений і готовим проєктом, і професіоналізмом, і точністю.\nБраво!!! Рекомендую всім.',
      },
    },
    {
      author: 'Anastasiia Z.',
      rating: 5,
      lang: 'it',
      text: "Ho fatto una consulenza d'interni e sono rimasta davvero soddisfatta. Un approccio professionale, un ottimo gusto estetico e grande attenzione ai dettagli. Consiglio VM Design Studio a chi cerca un interior designer sia per un progetto completo sia per una semplice consulenza!",
      translations: {
        en: 'I had an interior design consultation and was truly satisfied. A professional approach, excellent aesthetic taste and great attention to detail. I recommend VM Design Studio to anyone looking for an interior designer, whether for a complete project or a simple consultation!',
        fr: 'J’ai fait une consultation en architecture d’intérieur et j’en suis vraiment satisfaite. Une approche professionnelle, un excellent goût esthétique et une grande attention aux détails. Je recommande VM Design Studio à tous ceux qui cherchent un designer d’intérieur, que ce soit pour un projet complet ou pour une simple consultation !',
        ru: 'Я получила консультацию по дизайну интерьера и осталась очень довольна. Профессиональный подход, отличный эстетический вкус и большое внимание к деталям. Рекомендую VM Design Studio всем, кто ищет дизайнера интерьера — как для полного проекта, так и для простой консультации!',
        uk: 'Я отримала консультацію з дизайну інтер’єру й залишилася дуже задоволена. Професійний підхід, чудовий естетичний смак і велика увага до деталей. Рекомендую VM Design Studio всім, хто шукає дизайнера інтер’єру — як для повного проєкту, так і для простої консультації!',
      },
    },
    {
      author: 'Alina B.',
      rating: 5,
      lang: 'fr',
      text: 'Une architecte professionnelle et réactive, qui comprends et répond parfaitement aux attentes. Elle accompagne et reste à l’écoute fil du projet. Je recommande vivement!',
      translations: {
        en: 'A professional and responsive architect who understands and meets expectations perfectly. She guides you and keeps listening throughout the project. I highly recommend her!',
        it: 'Un’architetta professionale e reattiva, che comprende e risponde perfettamente alle aspettative. Accompagna e resta in ascolto per tutto il progetto. La consiglio vivamente!',
        ru: 'Профессиональный и отзывчивый архитектор, который прекрасно понимает ожидания и полностью им соответствует. Она сопровождает проект и всегда готова выслушать на всех его этапах. Очень рекомендую!',
        uk: 'Професійна та чуйна архітекторка, яка чудово розуміє очікування й повністю їм відповідає. Вона супроводжує проєкт і завжди готова вислухати на всіх його етапах. Щиро рекомендую!',
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
      author: 'Татьяна Н.',
      rating: 5,
      lang: 'ru',
      text: 'Спасибо за нереальный дизайн моего дома!!! ❤️ Я и моя семья в восторге!!! 🤩 🤩 🤩 Моя искренняя рекомендация ❤️',
      translations: {
        en: 'Thank you for the incredible design of my home!!! ❤️ My family and I are delighted!!! 🤩 🤩 🤩 My sincere recommendation ❤️',
        fr: 'Merci pour le design incroyable de ma maison !!! ❤️ Ma famille et moi sommes ravis !!! 🤩 🤩 🤩 Ma recommandation la plus sincère ❤️',
        it: 'Grazie per il design incredibile della mia casa!!! ❤️ Io e la mia famiglia siamo entusiasti!!! 🤩 🤩 🤩 La mia sincera raccomandazione ❤️',
        uk: 'Дякую за неймовірний дизайн мого дому!!! ❤️ Я і моя родина в захваті!!! 🤩 🤩 🤩 Моя щира рекомендація ❤️',
      },
    },
    {
      author: 'Klra P.',
      rating: 5,
      lang: 'ru',
      text: 'Потрясающие работы, точные, выверенные и очень притягательные.',
      translations: {
        en: 'Stunning work: precise, finely balanced and very captivating.',
        fr: 'Des réalisations époustouflantes : précises, parfaitement maîtrisées et très séduisantes.',
        it: 'Lavori straordinari: precisi, calibrati e molto affascinanti.',
        uk: 'Приголомшливі роботи — точні, вивірені й дуже привабливі.',
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
      author: 'Ксения К.',
      rating: 5,
      lang: 'uk',
      text: 'Мій улюблений дизайнер інтер’єру , раджу всім клієнтам і завжди отримую подяку ! Індивідуальний і максимально комфортний підхід до кожного клієнта .',
      translations: {
        en: 'My favourite interior designer — I recommend her to all my clients and always get thanked for it! An individual and extremely comfortable approach to every client.',
        fr: 'Ma designer d’intérieur préférée : je la recommande à tous mes clients et on me remercie toujours ! Une approche individuelle et la plus confortable possible pour chaque client.',
        it: 'La mia interior designer preferita: la consiglio a tutti i miei clienti e ricevo sempre ringraziamenti! Un approccio personalizzato e il più confortevole possibile per ogni cliente.',
        ru: 'Мой любимый дизайнер интерьера, советую всем клиентам и всегда получаю благодарность! Индивидуальный и максимально комфортный подход к каждому клиенту.',
      },
    },
    {
      author: 'Alexandr V.',
      rating: 5,
      lang: 'fr',
      text: 'Merci beaucoup pour votre confiance!\nNous sommes ravis du résultat et ce fun un vrai plaisir de travailler avec Marina et son équipe. Je recommande vivement!',
      translations: {
        en: 'Thank you very much for your trust!\nWe are delighted with the result, and it was a real pleasure to work with Marina and her team. I highly recommend!',
        it: 'Grazie mille per la vostra fiducia!\nSiamo entusiasti del risultato ed è stato un vero piacere lavorare con Marina e il suo team. Lo consiglio vivamente!',
        ru: 'Большое спасибо за доверие!\nМы в восторге от результата, работать с Мариной и её командой было настоящим удовольствием. Очень рекомендую!',
        uk: 'Щиро дякуємо за довіру!\nМи в захваті від результату, працювати з Мариною та її командою було справжнім задоволенням. Дуже рекомендую!',
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
