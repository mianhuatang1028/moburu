/* ============================================================
   默不如小说官网 · 数据层（多语言 i18n + 付费端口预留）
   说明：
   - 全站文案走 I18N；作品/章节内容字段为多语言对象 {zh, en}。
   - 新增作品：在 WORKS 追加对象即可（官网优先更新）。
   - 付费端口：作品 paywall、章节 locked 字段预留，当前默认免费，
     接入支付时只需在 reader / pricing 页对接真实收银台。
   ============================================================ */

/* 支持的语言 */
const LANGS = [
  { code: "zh", label: "中文" },
  { code: "en", label: "EN" },
  { code: "ja", label: "日本語" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "العربية" }
];

/* 全站 UI 文案（按语言） */
const I18N = {
  zh: {
    brand: "默不如",
    nav: { home: "首页", works: "作品库", about: "关于", pricing: "会员" },
    heroBadge: "默不如 · 小说宇宙",
    heroH1a: "默不如", heroH1b: "小说宇宙",
    tagline: "生物技术公司创始人，作家。",
    slogan: "军工写实 · 山海经叙事 · 中年逆袭",
    ctaWorks: "进入作品库",
    ctaAbout: "关于作者",
    worksTitle: "作品目录",
    worksSub: "默不如全部作品。官网优先更新，持续连载。",
    pillarsTitle: "IP 内核",
    pillarsSub: "三个关键词，定义默不如的叙事。",
    p1n: "ONE", p1t: "军工写实", p1d: "伺服电机、流体力学、模具成本——技术细节经得起内行推敲。",
    p2n: "TWO", p2t: "山海经叙事", p2d: "每章一个《山海经》神兽命名，神兽即命运隐喻。",
    p3n: "THREE", p3t: "中年逆袭", p3d: "出轨、负债、归零之后，一个技术男如何重建自己。",
    poolTitle: "粉丝群",
    poolSub: "",
    poolChannels: ["读者微信群", "QQ 读者群", "邮件订阅", "官网首发"],
    poolCta: "加入粉丝群",
    footerNote: "本站为作者独立官网，内容官网优先更新。",
    footerRights: "保留所有权利。",
    langLabel: "语言",
    firstBadge: "官网首发",
    readLatest: "读最新章",
    qidian: "起点正版",
    backWorks: "‹ 作品库",
    chIndex: "章节 · 山海经神兽索引",
    chIndexSub: "全书每章以一个《山海经》神兽命名，神兽即命运隐喻。",
    chCatalog: "章节目录",
    chCatalogSub: "全书章节列表，点击进入阅读。",
    updateSoon: "官网首发更新中，敬请期待。",
    excerptNotice: "本章为官网首发示例节选。完整正文由作者在官网优先更新时同步发布。",
    locked: "订阅解锁",
    becomeMember: "成为会员",
    free: "免费",
    vip: "会员专享",
    pricingTitle: "会员与付费阅读",
    pricingSub: "默不如小说官网付费端口（预留）。正式上线前不会发生任何扣费。",
    pricingNote: "以下为预留套餐位。接入支付后在此开通订阅 / 单章解锁。",
    planMonthly: "月度会员", planYearly: "年度会员", planPerChapter: "单章解锁",
    planPriceM: "¥18 / 月", planPriceY: "¥168 / 年", planPriceC: "¥3 / 章",
    planMd: "全站已解锁章节畅读", planYd: "全站畅读 + 优先读新章 + 番外", planCd: "仅解锁单章",
    subscribe: "订阅（预留）", unlock: "解锁（预留）",
    aboutTitle: "关于默不如",
    aboutBig: "默不如，是生物技术公司创始人，也是作家。小米科技前高管，创立过全球第一家直播电商平台，目前仍在创业，喜欢写现实主义题材，也喜欢写科幻。",
    aboutP1: "《恨长沙》是默不如的近期新作，全书以《山海经》神兽逐章命名，神兽即命运。",
    aboutP2: "",
    aboutContact: "联系 / 合作："
  },
  en: {
    brand: "MOBUYU",
    nav: { home: "Home", works: "Works", about: "About", pricing: "Members" },
    heroBadge: "MOBUYU · FICTION UNIVERSE",
    heroH1a: "MOBUYU", heroH1b: "FICTION UNIVERSE",
    tagline: "Founder of a biotech company, and a writer.",
    slogan: "Hardcore Tech · Classic-of-Mountains-and-Seas · Midlife Comeback",
    ctaWorks: "Browse Works",
    ctaAbout: "About the Author",
    worksTitle: "Works Catalog",
    worksSub: "All works by MOBUYU. Official site updates first, serializing continuously.",
    pillarsTitle: "The IP Core",
    pillarsSub: "Three keywords that define MOBUYU's storytelling.",
    p1n: "ONE", p1t: "Hardcore Tech", p1d: "Servo motors, fluid dynamics, tooling cost — details that survive scrutiny by insiders.",
    p2n: "TWO", p2t: "Classic-of-Mountains-and-Seas", p2d: "Each chapter named after a mythical beast from the Classic of Mountains and Seas.",
    p3n: "THREE", p3t: "Midlife Comeback", p3d: "After affair, debt and rock bottom — how a tech man rebuilds himself.",
    poolTitle: "Fan Group",
    poolSub: "",
    poolChannels: ["WeChat group", "QQ group", "Email subs", "Official-first"],
    poolCta: "Join the Fan Group",
    footerNote: "Independent author site. Content updates on the official site first.",
    footerRights: "All rights reserved.",
    langLabel: "Language",
    firstBadge: "Official First",
    readLatest: "Read Latest",
    qidian: "Qidian (CN)",
    backWorks: "‹ Works",
    chIndex: "Chapters · Beast Index",
    chIndexSub: "Each chapter is named after a mythical beast — the beast is fate.",
    chCatalog: "Chapter Catalog",
    chCatalogSub: "Full chapter list — click to start reading.",
    updateSoon: "Official-first update coming soon.",
    excerptNotice: "Excerpt from the official-first sample. Full text is published by the author on official-first update.",
    locked: "Unlock with Membership",
    becomeMember: "Become a Member",
    free: "Free",
    vip: "Members Only",
    pricingTitle: "Membership & Paid Reading",
    pricingSub: "MOBUYU official site payment port (reserved). No charge occurs before launch.",
    pricingNote: "Reserved plan slots below. Connect a payment gateway to enable subscription / per-chapter unlock.",
    planMonthly: "Monthly", planYearly: "Yearly", planPerChapter: "Per Chapter",
    planPriceM: "¥18 / mo", planPriceY: "¥168 / yr", planPriceC: "¥3 / ch",
    planMd: "Read all unlocked chapters", planYd: "All access + early new chapters + extras", planCd: "Unlock a single chapter",
    subscribe: "Subscribe (reserved)", unlock: "Unlock (reserved)",
    aboutTitle: "About MOBUYU",
    aboutBig: "MOBUYU is the founder of a biotech company and a writer. A former executive at Xiaomi, he founded the world's first live-commerce platform. Still an entrepreneur today, he enjoys writing realist fiction as well as science fiction.",
    aboutP1: "\"Hate Changsha\" is MOBUYU's recent new work; each chapter is named after a mythical beast from the Classic of Mountains and Seas — the beast is fate.",
    aboutP2: "",
    aboutContact: "Contact / Collab: "
  },
  ja: {
    brand: "MOBUYU",
    nav: { home: "ホーム", works: "作品", about: "プロフィール", pricing: "会員" },
    heroBadge: "MOBUYU · フィクション・ユニバース",
    heroH1a: "MOBUYU", heroH1b: "フィクション・ユニバース",
    tagline: "バイオテクノロジー企業の創業者、作家。",
    slogan: "硬派な技術描写 · 山海経叙事 · 中年の逆襲",
    ctaWorks: "作品を見る",
    ctaAbout: "作者について",
    worksTitle: "作品目録",
    worksSub: "MOBUYUの全作品。公式サイト最速更新、連載中。",
    pillarsTitle: "IPの核心",
    pillarsSub: "MOBUYUの物語を定義する3つのキーワード。",
    p1n: "ONE", p1t: "硬派な技術描写", p1d: "サーボモーター、流体力学、金型コスト——専門家も納得のディテール。",
    p2n: "TWO", p2t: "山海経叙事", p2d: "各章が『山海経』の神獣の名で綴られ、神獣は運命の隠喩。",
    p3n: "THREE", p3t: "中年の逆襲", p3d: "不倫、借金、どん底のあと、技術者がどうやって自身を再建するか。",
    poolTitle: "ファングループ",
    poolSub: "",
    poolChannels: ["WeChatグループ", "QQグループ", "メール配信", "公式最速"],
    poolCta: "ファングループに参加",
    footerNote: "作者の独立公式サイト。コンテンツは公式サイト最速更新。",
    footerRights: "全著作権所有。",
    langLabel: "言語",
    firstBadge: "公式最速",
    readLatest: "最新話を読む",
    qidian: "起点（中国）",
    backWorks: "‹ 作品",
    chIndex: "章・山海経神獣索引",
    chIndexSub: "各章は『山海経』の神獣の名で綴られ、神獣は運命そのもの。",
    chCatalog: "章目録",
    chCatalogSub: "全章の一覧。クリックで読み始められます。",
    updateSoon: "公式最速更新、乞うご期待。",
    excerptNotice: "本稿は公式最速のサンプル抜粋。全文は作者による公式最速更新時に公開。",
    locked: "会員登録で解放",
    becomeMember: "会員になる",
    free: "無料",
    vip: "会員限定",
    pricingTitle: "会員・有料読み",
    pricingSub: "MOBUYU公式サイト決済口（予約）。正式公開前は一切課金されません。",
    pricingNote: "以下は予約プラン枠。決済を接続後、定期購読／単話解放を有効化。",
    planMonthly: "月額会員", planYearly: "年額会員", planPerChapter: "単話解放",
    planPriceM: "¥18 / 月", planPriceY: "¥168 / 年", planPriceC: "¥3 / 話",
    planMd: "解放済み全章読み放題", planYd: "全章読み放題＋新章最速＋番外編", planCd: "単話のみ解放",
    subscribe: "登録する（予約）", unlock: "解放する（予約）",
    aboutTitle: "MOBUYUについて",
    aboutBig: "MOBUYUはバイオテクノロジー企業の創業者にして作家でもある。小米（シャオミ）科技の元幹部で、世界初のライブコマース・プラットフォームを立ち上げた。現在も起業を続け、リアリズムとSFを書くことを好む。",
    aboutP1: "『恨長沙（ハイトチャンシャ）』はMOBUYUの最近の新作。全章が『山海経』の神獣で名付けられ、神獣は運命。",
    aboutP2: "",
    aboutContact: "連絡／協業： "
  },
  fr: {
    brand: "MOBUYU",
    nav: { home: "Accueil", works: "Œuvres", about: "À propos", pricing: "Membres" },
    heroBadge: "MOBUYU · UNIVERS DE FICTION",
    heroH1a: "MOBUYU", heroH1b: "UNIVERS DE FICTION",
    tagline: "Fondateur d'une entreprise de biotechnologie, et écrivain.",
    slogan: "Réalisme technique · Narration des Montagnes et Mers · Reconquête de la maturité",
    ctaWorks: "Voir les œuvres",
    ctaAbout: "À propos de l'auteur",
    worksTitle: "Catalogue des œuvres",
    worksSub: "Toutes les œuvres de MOBUYU. Le site officiel est mis à jour en premier, en cours de publication.",
    pillarsTitle: "Le cœur de l'IP",
    pillarsSub: "Trois mots-clés qui définissent le récit de MOBUYU.",
    p1n: "UN", p1t: "Réalisme technique", p1d: "Moteurs servo, dynamique des fluides, coûts d'outillage — des détails qui résistent à l'examen des initiés.",
    p2n: "DEUX", p2t: "Narration des Montagnes et Mers", p2d: "Chaque chapitre porte le nom d'une bête mythique du Classique des Montagnes et Mers.",
    p3n: "TROIS", p3t: "Reconquête de la maturité", p3d: "Après l'adultère, la dette et le point de rupture — comment un homme technique se reconstruit.",
    poolTitle: "Groupe de fans",
    poolSub: "",
    poolChannels: ["Groupe WeChat", "Groupe QQ", "Abonnement e-mail", "Officiel en premier"],
    poolCta: "Rejoindre le groupe de fans",
    footerNote: "Site officiel indépendant de l'auteur. Le contenu est publié en premier sur le site officiel.",
    footerRights: "Tous droits réservés.",
    langLabel: "Langue",
    firstBadge: "Officiel en premier",
    readLatest: "Lire le dernier",
    qidian: "Qidian (CN)",
    backWorks: "‹ Œuvres",
    chIndex: "Chapitres · Index des bêtes",
    chIndexSub: "Chaque chapitre est nommé d'après une bête mythique — la bête est le destin.",
    chCatalog: "Sommaire",
    chCatalogSub: "Liste complète des chapitres — cliquez pour lire.",
    updateSoon: "Mise à jour officielle à venir.",
    excerptNotice: "Extrait de l'échantillon officiel en premier. Le texte intégral est publié par l'auteur lors de la mise à jour officielle.",
    locked: "Débloquer avec l'abonnement",
    becomeMember: "Devenir membre",
    free: "Gratuit",
    vip: "Réservé aux membres",
    pricingTitle: "Abonnement et lecture payante",
    pricingSub: "Port de paiement du site officiel MOBUYU (réservé). Aucun prélèvement avant le lancement.",
    pricingNote: "Emplacements de forfait réservés ci-dessous. Connectez une passerelle de paiement pour activer l'abonnement / le déblocage par chapitre.",
    planMonthly: "Mensuel", planYearly: "Annuel", planPerChapter: "Par chapitre",
    planPriceM: "¥18 / mois", planPriceY: "¥168 / an", planPriceC: "¥3 / chapitre",
    planMd: "Lire tous les chapitres débloqués", planYd: "Accès total + chapitres en avant-première + bonus", planCd: "Débloquer un seul chapitre",
    subscribe: "S'abonner (réservé)", unlock: "Débloquer (réservé)",
    aboutTitle: "À propos de MOBUYU",
    aboutBig: "MOBUYU est le fondateur d'une entreprise de biotechnologie et un écrivain. Ancien cadre de Xiaomi, il a fondé la première plateforme mondiale de live-commerce. Toujours entrepreneur aujourd'hui, il aime écrire du réalisme comme de la science-fiction.",
    aboutP1: "« Hate Changsha » est la récente nouvelle œuvre de MOBUYU ; chaque chapitre porte le nom d'une bête mythique du Classique des Montagnes et Mers — la bête est le destin.",
    aboutP2: "",
    aboutContact: "Contact / Collaboration : "
  },
  ar: {
    brand: "MOBUYU",
    nav: { home: "الرئيسية", works: "الأعمال", about: "عن الكاتب", pricing: "الأعضاء" },
    heroBadge: "MOBUYU · عالم الخيال",
    heroH1a: "MOBUYU", heroH1b: "عالم الخيال",
    tagline: "مؤسس شركة تكنولوجيا حيوية، وكاتب.",
    slogan: "واقعية تقنية · سرد «الجبال والبحار» · صعود منتصف العمر",
    ctaWorks: "تصفح الأعمال",
    ctaAbout: "عن الكاتب",
    worksTitle: "فهرس الأعمال",
    worksSub: "جميع أعمال MOBUYU. يتم التحديث على الموقع الرسمي أولاً، بشكل متسلسل.",
    pillarsTitle: "جوهر العلامة",
    pillarsSub: "ثلاث كلمات مفتاحية تحدد سرد MOBUYU.",
    p1n: "واحد", p1t: "واقعية تقنية", p1d: "محركات سيرفو، ديناميكا الموائع، تكلفة القوالب — تفاصيل تصمد أمام فحص المختصين.",
    p2n: "اثنان", p2t: "سرد «الجبال والبحار»", p2d: "كل فصل يحمل اسم وحش أسطوري من كلاسيكية الجبال والبحار — الوحش هو القدر.",
    p3n: "ثلاثة", p3t: "صعود منتصف العمر", p3d: "بعد الخيانة، والديون، والقاع — كيف يعيد رجل تقني بناء نفسه.",
    poolTitle: "مجموعة المعجبين",
    poolSub: "",
    poolChannels: ["مجموعة WeChat", "مجموعة QQ", "اشتراك البريد", "الرسمي أولاً"],
    poolCta: "انضم لمجموعة المعجبين",
    footerNote: "موقع مستقل للكاتب. يُنشر المحتوى على الموقع الرسمي أولاً.",
    footerRights: "جميع الحقوق محفوظة.",
    langLabel: "اللغة",
    firstBadge: "الرسمي أولاً",
    readLatest: "اقرأ الأحدث",
    qidian: "Qidian (CN)",
    backWorks: "‹ الأعمال",
    chIndex: "الفصول · فهرس الوحوش",
    chIndexSub: "كل فصل يحمل اسم وحش أسطوري — الوحش هو القدر。",
    chCatalog: "فهرس الفصول",
    chCatalogSub: "قائمة الفصول الكاملة — انقر للقراءة.",
    updateSoon: "تحديث رسمي قادم قريبًا.",
    excerptNotice: "مقتطف من العينة الرسمية الأولى. ينشر النص الكامل من قبل الكاتب عند التحديث الرسمي.",
    locked: "افتح باشتراك",
    becomeMember: "كن عضوًا",
    free: "مجاني",
    vip: "حصري للأعضاء",
    pricingTitle: "العضوية والقراءة المدفوعة",
    pricingSub: "بوابة دفع الموقع الرسمي MOBUYU (محجوزة). لا تحدث أي رسوم قبل الإطلاق.",
    pricingNote: "خانات الباقات المحجوزة أدناه. اربط بوابة دفع لتفعيل الاشتراك / فتح الفصل.",
    planMonthly: "شهري", planYearly: "سنوي", planPerChapter: "للفصل",
    planPriceM: "¥18 / شهر", planPriceY: "¥168 / سنة", planPriceC: "¥3 / فصل",
    planMd: "اقرأ جميع الفصول المفتوحة", planYd: "وصول كامل + فصول مبكرة + إضافات", planCd: "افتح فصلًا واحدًا",
    subscribe: "اشترك (محجوز)", unlock: "افتح (محجوز)",
    aboutTitle: "عن MOBUYU",
    aboutBig: "MOBUYU مؤسس شركة تكنولوجيا حيوية وكاتب. مدير سابق في شركة شاومي (Xiaomi)، أسس أول منصة تجارة مباشرة عبر البث المباشر في العالم. لا يزال رائد أعمال اليوم، ويحب كتابة الواقعية والخيال العلمي.",
    aboutP1: "« كراهية تشانغشا » هي العمل الجديد الأخير لـ MOBUYU؛ كل فصل يحمل اسم وحش أسطوري من « الجبال والبحار » — الوحش هو القدر.",
    aboutP2: "",
    aboutContact: "اتصال / تعاون: "
  }
};

/* 作者 / 站点信息（多语言） */
const SITE = {
  author: "默不如zZZ",
  intro: {
    zh: "默不如，把伺服电机、流体力学和《山海经》写进小说的人。",
    en: "MOBUYU — writes servo motors, fluid dynamics and the Classic of Mountains and Seas into fiction."
  },
  contact: {
    wechat: "",
    qqGroup: "",
    email: "2127174@qq.com"
  }
};

/* 会员套餐（预留，不接真实支付） */
const PLANS = [
  { id: "monthly", key: "planMonthly", priceKey: "planPriceM", descKey: "planMd", ctaKey: "subscribe" },
  { id: "yearly",  key: "planYearly",  priceKey: "planPriceY", descKey: "planYd", ctaKey: "subscribe" },
  { id: "chapter", key: "planPerChapter", priceKey: "planPriceC", descKey: "planCd", ctaKey: "unlock" }
];

/* 作品列表：每部作品独立一个对象，内容字段为多语言 {zh, en} */
const WORKS = [
  {
    id: "henchangsha",
    title: { zh: "恨长沙", en: "Hate Changsha" },
    author: "默不如zZZ",
    category: { zh: "现实 · 人间百态 / 军工题材", en: "Realism / Military-Industry", ja: "リアル · 人間ドラマ / 軍事産業", fr: "Réalisme · Drame humain / Industrie militaire", ar: "واقعية · دراما إنسانية / صناعة عسكرية" },
    status: { zh: "连载中 · 免费", en: "Ongoing · Free", ja: "連載中 · 無料", fr: "En cours · Gratuit", ar: "مستمر · مجاني" },
    year: 2026,
    paywall: false,                 // 预留付费总开关
    officialFirst: true,
    beastIndex: true,               // 山海经神兽章节索引
    cover: "恨",
    qidianUrl: "https://www.qidian.com/book/1042069180/",
    summary: {
      zh: "一个叫郑智咏的中年技术男，出轨后失去一切，负债累累，在体制、资本、人情和欲望的夹缝里，一步一步，把自己重新拼起来，直到再次拥有了自己的事业和四个美女恋人。",
      en: "Zheng Zhiyong, a middle-aged engineer, loses everything after an affair and sinks into debt. Caught between the system, capital, people and desire, he rebuilds himself step by step — until he regains his career and the affection of four women.",
      ja: "鄭智詠という中年技術者が、不倫で全てを失い多額の負債を抱える。制度・資本・人間関係・欲望の狭間で、一歩ずつ自身を再構築し、再び事業と四人の女性の愛を手にするまで。",
      fr: "Zheng Zhiyong, un ingénieur d'âge mûr, perd tout après une liaison et sombre dans la dette. Pris entre le système, le capital, les relations et le désir, il se reconstruit pas à pas — jusqu'à retrouver sa carrière et l'affection de quatre femmes.",
      ar: "تشنغ تشييونغ، مهندس في منتصف العمر، يفقد كل شيء بعد علاقة غرامية ويفرغ في الديون. محاصراً بين النظام ورأس المال والناس والرغبة، يعيد بناء نفسه خطوة بخطوة — حتى يستعيد مسيرته وعاطفة أربع نساء."
    },
    tags: {
      zh: ["中年逆袭", "军工写实", "山海经叙事", "都市情感"],
      en: ["Midlife Comeback", "Hardcore Tech", "Mythic Beasts", "Urban Romance"],
      ja: ["中年の逆襲", "硬派な技術描写", "山海経叙事", "都市恋愛"],
      fr: ["Reconquête de la maturité", "Réalisme technique", "Bêtes mythiques", "Romance urbaine"],
      ar: ["صعود منتصف العمر", "واقعية تقنية", "وحوش أسطورية", "رومانسية حضرية"]
    },
    chapters: [
      { num: 0,  name: "鲲鹏",  title: { zh: "引：鲲鹏", en: "Prologue: Kunpeng" } },
      { num: 1,  name: "鸮",    title: { zh: "第一章 鸮", en: "Ch.1 Xiao" } },
      { num: 2,  name: "灌灌",  title: { zh: "第二章 灌灌", en: "Ch.2 Guanguan" } },
      { num: 3,  name: "混沌",  title: { zh: "第三章 混沌", en: "Ch.3 Hundun" } },
      { num: 4,  name: "梼",    title: { zh: "第四章 梼", en: "Ch.4 Tao" } },
      { num: 5,  name: "雕",    title: { zh: "第五章 雕", en: "Ch.5 Diao" } },
      { num: 6,  name: "蛊",    title: { zh: "第六章 蛊", en: "Ch.6 Gu" } },
      { num: 7,  name: "九婴",  title: { zh: "第七章 九婴", en: "Ch.7 Jiuying" } },
      { num: 9,  name: "饕餮",  title: { zh: "第九章 饕餮", en: "Ch.9 Taotie" } },
      { num: 10, name: "比翼鸟", title: { zh: "第十章 比翼鸟", en: "Ch.10 Biyi Bird" } },
      { num: 11, name: "天狗",  title: { zh: "第十一章 天狗", en: "Ch.11 Tiangou" } },
      { num: 12, name: "凰",    title: { zh: "第十二章 凰", en: "Ch.12 Huang" } },
      { num: 13, name: "蜚",    title: { zh: "第十三章 蜚", en: "Ch.13 Fei" } },
      { num: 14, name: "狰",    title: { zh: "第十四章 狰", en: "Ch.14 Zheng" } },
      { num: 15, name: "朱厌",  title: { zh: "第十五章 朱厌", en: "Ch.15 Zhuyan" } },
      { num: 16, name: "祸斗",  title: { zh: "第十六章 祸斗", en: "Ch.16 Huodou" } },
      { num: 17, name: "英招",  title: { zh: "第十七章 英招", en: "Ch.17 Yingzhao" } },
      { num: 18, name: "重明鸟", title: { zh: "第十八章 重明鸟", en: "Ch.18 Chongming" } },
      { num: 19, name: "当康",  title: { zh: "第十九章 当康", en: "Ch.19 Dangkang" } },
      { num: 20, name: "夫诸",  title: { zh: "第二十章 夫诸", en: "Ch.20 Fuzhu" } },
      { num: 21, name: "陵鱼",  title: { zh: "第二十一章 陵鱼", en: "Ch.21 Lingyu" } },
      { num: 22, name: "肥遗",  title: { zh: "第二十二章 肥遗", en: "Ch.22 Feiyi" } },
      { num: 23, name: "鹿蜀",  title: { zh: "第二十三章 鹿蜀", en: "Ch.23 Lushu" } },
      { num: 24, name: "赢鱼",  title: { zh: "第二十四章 赢鱼", en: "Ch.24 Yingyu" } },
      { num: 25, name: "患",    title: { zh: "第二十五章 患", en: "Ch.25 Huan" } },
      { num: 26, name: "毕方",  title: { zh: "第二十六章 毕方", en: "Ch.26 Bifang" } },
      { num: 27, name: "陆吾",  title: { zh: "第二十七章 陆吾", en: "Ch.27 Luwu" } },
      { num: 28, name: "九尾",  title: { zh: "第二十八章 九尾", en: "Ch.28 Nine-Tail" } },
      { num: 29, name: "猰貐",  title: { zh: "第二十九章 猰貐", en: "Ch.29 Yayu" } },
      { num: 32, name: "精卫",  title: { zh: "第三十二章 精卫", en: "Ch.32 Jingwei" } },
      { num: 33, name: "茈鱼",  title: { zh: "第三十三章 茈鱼", en: "Ch.33 Ziyu" } },
      { num: 34, name: "狡",    title: { zh: "第三十四章 狡", en: "Ch.34 Jiao" } },
      {
        num: 43,
        name: "合窳",
        title: { zh: "第四十三章 合窳", en: "Ch.43 Heyu" },
        locked: false,              // 预留付费锁；当前免费
        excerpt: {
          zh:
            "“戴森的专利也没什么，现在国内做的已经很多了，我们早就搞过类似的。”齐晋对老郑说，“环形窄缝出风那个，柯恩达表面，戴森把核心路径锁死了。但是现在的难度是要做更便宜的，不能走那条路。”\n\n" +
            "老郑说：“我想的是，出风结构不改环形，但改气流路径。基座里不用离心风扇，用混流。混流的静压比离心低，但流量大，成本低。关键是，混流出来的气流方向是轴向的，进环形腔之前需要一次转向，这个转向段可以做文章。”\n\n" +
            "“戴森是 1.3 毫米。我不打算用那么窄。窄缝是为了柯恩达效应稳定，但窄缝对背压要求高，混流扛不住。我想放到 1.8 到 2.0，牺牲一点风速，换流量。老百姓用，要的是风大，不是风快。”\n\n" +
            "——节选自《恨长沙》第四十三章《合窳》（官网首发示例）",
          en:
            "\"Dyson's patents are nothing — plenty of domestic makers have done similar work,\" Qi Jin told Lao Zheng. \"That annular narrow-slit airflow, the Coanda surface — Dyson locked the core path. But the real challenge now is doing it cheaper, not walking their road.\"\n\n" +
            "Lao Zheng said: \"I keep the annular outlet but reroute the airflow. Ditch the centrifugal fan in the base, use a mixed-flow. Mixed-flow has lower static pressure than centrifugal, but higher flow and lower cost. The catch: mixed-flow exits axially, so it needs a turn before the annular chamber — and that turn is where we work our magic.\"\n\n" +
            "\"Dyson uses 1.3 mm. I won't go that narrow. The narrow slit stabilizes the Coanda effect, but it demands high back-pressure that mixed-flow can't sustain. I'll open it to 1.8–2.0 mm — trade a little speed for volume. Ordinary readers want strong wind, not fast wind.\"\n\n" +
            "— excerpt from 'Hate Changsha', Ch.43 Heyu (official-first sample)"
        }
      }
    ]
  },
  {
    id: "halo",
    title: { zh: "光环", en: "Halo", ja: "光環", fr: "Halo", ar: "هالة" },
    author: "默不如zZZ",
    category: { zh: "默不如 · 新作", en: "MOBUYU · New", ja: "MOBUYU · 新作", fr: "MOBUYU · Nouveau", ar: "MOBUYU · جديد" },
    status: { zh: "即将上线 · 免费", en: "Coming soon · Free", ja: "近日公開 · 無料", fr: "Bientôt · Gratuit", ar: "قريباً · مجاني" },
    year: 2026,
    paywall: false,
    officialFirst: true,
    qidianUrl: "",
    cover: "光",
    summary: {
      zh: "默不如全新作品，官网优先更新，敬请期待。在「默不如小说宇宙」中开启新的故事线。",
      en: "A new work by MOBUYU — official-first updates, coming soon. A new storyline in the MOBUYU fiction universe.",
      ja: "MOBUYUの新作。公式サイト最速更新、乞うご期待。「MOBUYUフィクション・ユニバース」で新たな物語が始まる。",
      fr: "Une nouvelle œuvre de MOBUYU — mises à jour officielles en premier, à venir. Une nouvelle intrigue dans l'univers de fiction MOBUYU.",
      ar: "عمل جديد من MOBUYU — تحديثات رسمية أولاً، قريباً. خط قصة جديد في عالم MOBUYU الخيالي."
    },
    tags: { zh: ["默不如宇宙", "敬请期待"], en: ["MOBUYU Universe", "Coming Soon"], ja: ["MOBUYU宇宙", "乞うご期待"], fr: ["Univers MOBUYU", "À venir"], ar: ["عالم MOBUYU", "قريباً"] },
    chapters: [
      { num: 0, name: "序", title: { zh: "序", en: "Prologue" } }
    ]
  },
  {
    id: "shepherd",
    title: { zh: "牧者之歌", en: "Song of the Shepherd", ja: "羊飼いの歌", fr: "Chant du Berger", ar: "أغنية الراعي" },
    author: "默不如zZZ",
    category: { zh: "默不如 · 新作", en: "MOBUYU · New", ja: "MOBUYU · 新作", fr: "MOBUYU · Nouveau", ar: "MOBUYU · جديد" },
    status: { zh: "即将上线 · 免费", en: "Coming soon · Free", ja: "近日公開 · 無料", fr: "Bientôt · Gratuit", ar: "قريباً · مجاني" },
    year: 2026,
    paywall: false,
    officialFirst: true,
    qidianUrl: "",
    cover: "牧",
    summary: {
      zh: "默不如全新作品，官网优先更新，敬请期待。在「默不如小说宇宙」中开启新的故事线。",
      en: "A new work by MOBUYU — official-first updates, coming soon. A new storyline in the MOBUYU fiction universe.",
      ja: "MOBUYUの新作。公式サイト最速更新、乞うご期待。「MOBUYUフィクション・ユニバース」で新たな物語が始まる。",
      fr: "Une nouvelle œuvre de MOBUYU — mises à jour officielles en premier, à venir. Une nouvelle intrigue dans l'univers de fiction MOBUYU.",
      ar: "عمل جديد من MOBUYU — تحديثات رسمية أولاً، قريباً. خط قصة جديد في عالم MOBUYU الخيالي."
    },
    tags: { zh: ["默不如宇宙", "敬请期待"], en: ["MOBUYU Universe", "Coming Soon"], ja: ["MOBUYU宇宙", "乞うご期待"], fr: ["Univers MOBUYU", "À venir"], ar: ["عالم MOBUYU", "قريباً"] },
    chapters: [
      { num: 0, name: "序", title: { zh: "序", en: "Prologue" } }
    ]
  }
  // 未来每部新作在此追加对象即可（官网优先更新）。
];

/* 工具：按 id 取作品 */
function getWork(id) {
  return WORKS.find(function (w) { return w.id === id; });
}
