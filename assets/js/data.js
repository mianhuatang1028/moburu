/* ============================================================
   默不如小说官网 · 数据层（多语言 i18n + 付费端口预留）
   说明：
   - 全站文案走 I18N；作品/章节内容字段为多语言对象 {zh, en, ja, fr, ar}。
   - 新增作品：在 WORKS 追加对象即可（官网优先更新）。
   - 付费端口：作品 paywall、章节 locked 字段预留，当前默认免费，
     接入支付时只需在 reader / pricing 页对接真实收银台。

   【分批更新 / 反复修订约定】（作者会分多次给 Word 稿，且会反复改）
   - 每次只按「章号 num」合并对应章节的 excerpt 字段，绝不整表覆盖：
     已有正文的章节没出现在新稿里 → 原样保留；出现 → 覆盖为新版；
     新章号 → 追加。这样分批给稿不会丢内容。
   - num 是章节的永久身份：URL(?ch=num)、起点对应关系、神兽名都跟着它。
     调整叙事顺序请改作品的 chapterOrder（num 数组），**不要改 num**。
     chapterOrder 未配置时按 chapters 数组原顺序显示（兼容旧数据）。
   - 每次改动都走 git commit，改错了可随时回滚，不必怕「反复改」。
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
    firstPosted: "首发", firstPostedFull: "本站首发", lastUpdated: "最后修订", provenance: "首发存证", fullTextBadge: "全文", fullTextPosted: "全文首发", loadingText: "正文载入中…", textLoadFail: "正文加载失败，请刷新重试，或打开全文存档页。", archivePage: "全文存档页",
    translationBadge: "译本", translationFirst: "译本首发", translationMissing: "本章尚无此语言译本，以下为中文原文。", translationProgress: "译本正在逐章更新，尚无译本的章节暂显示中文原文。", otherLanguages: "其他语言版本", originalVersion: "中文原文", translationArchive: "译本存档页",
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
    brand: "Moburu",
    nav: { home: "Home", works: "Works", about: "About", pricing: "Members" },
    heroBadge: "Moburu · FICTION UNIVERSE",
    heroH1a: "Moburu", heroH1b: "FICTION UNIVERSE",
    tagline: "Founder of a biotech company, and a writer.",
    slogan: "Hardcore Tech · Classic-of-Mountains-and-Seas · Midlife Comeback",
    ctaWorks: "Browse Works",
    ctaAbout: "About the Author",
    worksTitle: "Works Catalog",
    worksSub: "All works by Moburu. Official site updates first, serializing continuously.",
    pillarsTitle: "The IP Core",
    pillarsSub: "Three keywords that define Moburu's storytelling.",
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
    firstPosted: "First posted", firstPostedFull: "First published here", lastUpdated: "Last updated", provenance: "Publication record", fullTextBadge: "Full text", fullTextPosted: "Full text published", loadingText: "Loading chapter…", textLoadFail: "Could not load the chapter. Please refresh, or open the archive page.", archivePage: "Full-text archive",
    translationBadge: "Translation", translationFirst: "Translation first published", translationMissing: "This chapter is not yet available in this language. The Chinese original is shown below.", translationProgress: "Translations are being added chapter by chapter. Chapters without a translation show the Chinese original.", otherLanguages: "Other languages", originalVersion: "Chinese original", translationArchive: "Translation archive",
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
    pricingSub: "Moburu official site payment port (reserved). No charge occurs before launch.",
    pricingNote: "Reserved plan slots below. Connect a payment gateway to enable subscription / per-chapter unlock.",
    planMonthly: "Monthly", planYearly: "Yearly", planPerChapter: "Per Chapter",
    planPriceM: "¥18 / mo", planPriceY: "¥168 / yr", planPriceC: "¥3 / ch",
    planMd: "Read all unlocked chapters", planYd: "All access + early new chapters + extras", planCd: "Unlock a single chapter",
    subscribe: "Subscribe (reserved)", unlock: "Unlock (reserved)",
    aboutTitle: "About Moburu",
    aboutBig: "Moburu is the founder of a biotech company and a writer. A former executive at Xiaomi, he founded the world's first live-commerce platform. Still an entrepreneur today, he enjoys writing realist fiction as well as science fiction.",
    aboutP1: "\"Lost in Changsha\" is Moburu's recent new work; each chapter is named after a mythical beast from the Classic of Mountains and Seas — the beast is fate.",
    aboutP2: "",
    aboutContact: "Contact / Collab: "
  },
  ja: {
    brand: "Moburu",
    nav: { home: "ホーム", works: "作品", about: "プロフィール", pricing: "会員" },
    heroBadge: "Moburu · フィクション・ユニバース",
    heroH1a: "Moburu", heroH1b: "フィクション・ユニバース",
    tagline: "バイオテクノロジー企業の創業者、作家。",
    slogan: "硬派な技術描写 · 山海経叙事 · 中年の逆襲",
    ctaWorks: "作品を見る",
    ctaAbout: "作者について",
    worksTitle: "作品目録",
    worksSub: "Moburuの全作品。公式サイト最速更新、連載中。",
    pillarsTitle: "IPの核心",
    pillarsSub: "Moburuの物語を定義する3つのキーワード。",
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
    firstPosted: "初公開", firstPostedFull: "本サイト初公開", lastUpdated: "最終更新", provenance: "公開記録", fullTextBadge: "全文", fullTextPosted: "全文初公開", loadingText: "本文を読み込み中…", textLoadFail: "本文を読み込めませんでした。再読み込みするか、アーカイブをご利用ください。", archivePage: "全文アーカイブ",
    translationBadge: "翻訳", translationFirst: "翻訳初公開", translationMissing: "この章はまだこの言語に翻訳されていません。以下は中国語の原文です。", translationProgress: "翻訳は章ごとに公開しています。訳本のない章は中国語の原文を表示します。", otherLanguages: "他の言語版", originalVersion: "中国語原文", translationArchive: "翻訳アーカイブ",
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
    pricingSub: "Moburu公式サイト決済口（予約）。正式公開前は一切課金されません。",
    pricingNote: "以下は予約プラン枠。決済を接続後、定期購読／単話解放を有効化。",
    planMonthly: "月額会員", planYearly: "年額会員", planPerChapter: "単話解放",
    planPriceM: "¥18 / 月", planPriceY: "¥168 / 年", planPriceC: "¥3 / 話",
    planMd: "解放済み全章読み放題", planYd: "全章読み放題＋新章最速＋番外編", planCd: "単話のみ解放",
    subscribe: "登録する（予約）", unlock: "解放する（予約）",
    aboutTitle: "Moburuについて",
    aboutBig: "Moburuはバイオテクノロジー企業の創業者にして作家でもある。小米（シャオミ）科技の元幹部で、世界初のライブコマース・プラットフォームを立ち上げた。現在も起業を続け、リアリズムとSFを書くことを好む。",
    aboutP1: "『長沙に迷う』はMoburuの最近の新作。全章が『山海経』の神獣で名付けられ、神獣は運命。",
    aboutP2: "",
    aboutContact: "連絡／協業： "
  },
  fr: {
    brand: "Moburu",
    nav: { home: "Accueil", works: "Œuvres", about: "À propos", pricing: "Membres" },
    heroBadge: "Moburu · UNIVERS DE FICTION",
    heroH1a: "Moburu", heroH1b: "UNIVERS DE FICTION",
    tagline: "Fondateur d'une entreprise de biotechnologie, et écrivain.",
    slogan: "Réalisme technique · Narration des Montagnes et Mers · Reconquête de la maturité",
    ctaWorks: "Voir les œuvres",
    ctaAbout: "À propos de l'auteur",
    worksTitle: "Catalogue des œuvres",
    worksSub: "Toutes les œuvres de Moburu. Le site officiel est mis à jour en premier, en cours de publication.",
    pillarsTitle: "Le cœur de l'IP",
    pillarsSub: "Trois mots-clés qui définissent le récit de Moburu.",
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
    firstPosted: "Publié le", firstPostedFull: "Première publication ici", lastUpdated: "Dernière mise à jour", provenance: "Registre de publication", fullTextBadge: "Texte intégral", fullTextPosted: "Texte intégral publié", loadingText: "Chargement du chapitre…", textLoadFail: "Impossible de charger le chapitre. Actualisez ou ouvrez la page d'archive.", archivePage: "Archive du texte intégral",
    translationBadge: "Traduction", translationFirst: "Première publication de la traduction", translationMissing: "Ce chapitre n'est pas encore traduit dans cette langue. L'original chinois figure ci-dessous.", translationProgress: "Les traductions sont publiées chapitre par chapitre. Les chapitres non encore traduits affichent l'original chinois.", otherLanguages: "Autres langues", originalVersion: "Original chinois", translationArchive: "Archive de la traduction",
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
    pricingSub: "Port de paiement du site officiel Moburu (réservé). Aucun prélèvement avant le lancement.",
    pricingNote: "Emplacements de forfait réservés ci-dessous. Connectez une passerelle de paiement pour activer l'abonnement / le déblocage par chapitre.",
    planMonthly: "Mensuel", planYearly: "Annuel", planPerChapter: "Par chapitre",
    planPriceM: "¥18 / mois", planPriceY: "¥168 / an", planPriceC: "¥3 / chapitre",
    planMd: "Lire tous les chapitres débloqués", planYd: "Accès total + chapitres en avant-première + bonus", planCd: "Débloquer un seul chapitre",
    subscribe: "S'abonner (réservé)", unlock: "Débloquer (réservé)",
    aboutTitle: "À propos de Moburu",
    aboutBig: "Moburu est le fondateur d'une entreprise de biotechnologie et un écrivain. Ancien cadre de Xiaomi, il a fondé la première plateforme mondiale de live-commerce. Toujours entrepreneur aujourd'hui, il aime écrire du réalisme comme de la science-fiction.",
    aboutP1: "« Perdu à Changsha » est la récente nouvelle œuvre de Moburu ; chaque chapitre porte le nom d'une bête mythique du Classique des Montagnes et Mers — la bête est le destin.",
    aboutP2: "",
    aboutContact: "Contact / Collaboration : "
  },
  ar: {
    brand: "Moburu",
    nav: { home: "الرئيسية", works: "الأعمال", about: "عن الكاتب", pricing: "الأعضاء" },
    heroBadge: "Moburu · عالم الخيال",
    heroH1a: "Moburu", heroH1b: "عالم الخيال",
    tagline: "مؤسس شركة تكنولوجيا حيوية، وكاتب.",
    slogan: "واقعية تقنية · سرد «الجبال والبحار» · صعود منتصف العمر",
    ctaWorks: "تصفح الأعمال",
    ctaAbout: "عن الكاتب",
    worksTitle: "فهرس الأعمال",
    worksSub: "جميع أعمال Moburu. يتم التحديث على الموقع الرسمي أولاً، بشكل متسلسل.",
    pillarsTitle: "جوهر العلامة",
    pillarsSub: "ثلاث كلمات مفتاحية تحدد سرد Moburu.",
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
    firstPosted: "نُشر أولاً", firstPostedFull: "أول نشر هنا", lastUpdated: "آخر تحديث", provenance: "سجل النشر", fullTextBadge: "النص الكامل", fullTextPosted: "نشر النص الكامل", loadingText: "جارٍ تحميل الفصل…", textLoadFail: "تعذّر تحميل الفصل. حدّث الصفحة أو افتح صفحة الأرشيف.", archivePage: "أرشيف النص الكامل",
    translationBadge: "ترجمة", translationFirst: "أول نشر للترجمة", translationMissing: "لم يُترجم هذا الفصل إلى هذه اللغة بعد. النص الصيني الأصلي أدناه.", translationProgress: "تُنشر الترجمات فصلًا بفصل. وتعرض الفصول التي لم تُترجم بعد النص الصيني الأصلي.", otherLanguages: "لغات أخرى", originalVersion: "النص الصيني الأصلي", translationArchive: "أرشيف الترجمة",
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
    pricingSub: "بوابة دفع الموقع الرسمي Moburu (محجوزة). لا تحدث أي رسوم قبل الإطلاق.",
    pricingNote: "خانات الباقات المحجوزة أدناه. اربط بوابة دفع لتفعيل الاشتراك / فتح الفصل.",
    planMonthly: "شهري", planYearly: "سنوي", planPerChapter: "للفصل",
    planPriceM: "¥18 / شهر", planPriceY: "¥168 / سنة", planPriceC: "¥3 / فصل",
    planMd: "اقرأ جميع الفصول المفتوحة", planYd: "وصول كامل + فصول مبكرة + إضافات", planCd: "افتح فصلًا واحدًا",
    subscribe: "اشترك (محجوز)", unlock: "افتح (محجوز)",
    aboutTitle: "عن Moburu",
    aboutBig: "Moburu مؤسس شركة تكنولوجيا حيوية وكاتب. مدير سابق في شركة شاومي (Xiaomi)، أسس أول منصة تجارة مباشرة عبر البث المباشر في العالم. لا يزال رائد أعمال اليوم، ويحب كتابة الواقعية والخيال العلمي.",
    aboutP1: "« ضائع في تشانغشا » هو العمل الجديد الأخير لـ Moburu؛ كل فصل يحمل اسم وحش أسطوري من « الجبال والبحار » — الوحش هو القدر.",
    aboutP2: "",
    aboutContact: "اتصال / تعاون: "
  }
};

/* 作者 / 站点信息（多语言） */
const SITE = {
  author: "默不如zZZ",
  /* 笔名释义（作者 2026-11-09 拍板）：「默不如」= 不如沉默，官方英文释义 "rather silence"。
     中文页保留中文名，非中文页用拼音 Moburu（与域名 moburu.vip 一致，勿拼成 MOBUYU）。
     两种写法在结构化数据里都保留，便于 AI / 搜索引擎关联同一作者。 */
  latinName: "Moburu",
  nameMeaningOfficial: "rather silence",
  nameMeaning: {
    zh: "「默不如」意为「不如沉默」，拼音写作 Moburu。",
    en: "Moburu means \u201crather silence\u201d — choosing silence over speech.",
    ja: "「默不如（Moburu）」は「むしろ沈黙」の意。",
    fr: "« Moburu » signifie « plutôt le silence ».",
    ar: "يعني اسم Moburu «الصمت أفضل»، أي اختيار الصمت على الكلام."
  },
  intro: {
    zh: "默不如，把伺服电机、流体力学和《山海经》写进小说的人。",
    en: "Moburu — writes servo motors, fluid dynamics and the Classic of Mountains and Seas into fiction."
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
    /* 官方书名：作者 2026-11-09 拍板，书名的「恨」是「遗憾 / 失落」，不是「憎恨」。
       国际名固定为 Lost in Changsha，勿再回译成 Hate / كراهية 等「憎恨」义。 */
    title: {
      zh: "恨长沙",
      en: "Lost in Changsha",
      ja: "長沙に迷う",
      fr: "Perdu à Changsha",
      ar: "ضائع في تشانغشا"
    },
    author: "默不如zZZ",
    category: { zh: "现实 · 人间百态 / 军工题材", en: "Realism / Military-Industry", ja: "リアル · 人間ドラマ / 軍事産業", fr: "Réalisme · Drame humain / Industrie militaire", ar: "واقعية · دراما إنسانية / صناعة عسكرية" },
    status: { zh: "连载中 · 免费", en: "Ongoing · Free", ja: "連載中 · 無料", fr: "En cours · Gratuit", ar: "مستمر · مجاني" },
    year: 2026,
    paywall: false,                 // 预留付费总开关
    officialFirst: true,
    beastIndex: true,               // 山海经神兽章节索引
    fullText: true,                 // 全本正文已公开；按章从 chapters/ 加载
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
      { num: 0, name: "鲲鹏", title: { zh: "引：鲲鹏", en: "Prologue: Kunpeng", ja: "序章：鯤鵬", fr: "Prologue : Kunpeng", ar: "مقدمة: كون بنغ" }, bio: { zh: "“鲲鹏”——《庄子·逍遥游》里，北冥有鱼，化而为鸟，水击三千里，抟扶摇而上者九万里。同是一跃，有人往上，有人往下。正所谓一跃之间，升者为鹏，坠者无名。" }, translations: ["en", "ja", "fr", "ar"] },
      { num: 1, name: "鸮", title: { zh: "第一章 鸮", en: "Ch.1 Xiao" , ja: "第一章　鸮（ミミズク）"}, bio: { zh: "“鸮”——《山海经》里多以其形名鸟，昼伏夜出，闻其声者以为不祥。正所谓夜鸟初啼，长夜方始。" } , translations: ["ja"] },
      { num: 2, name: "灌灌", title: { zh: "第二章 灌灌", en: "Ch.2 Guanguan" , ja: "第二章　灌灌"}, bio: { zh: "“灌灌”——《山海经·南山经》里，有鸟状如鸠，其音若呵，名曰灌灌，佩之不惑。正所谓佩之不惑，亦不受惑。" } , translations: ["ja"] },
      { num: 3, name: "混沌", title: { zh: "第三章 混沌", en: "Ch.3 Hundun" , ja: "第三章　混沌"}, bio: { zh: "“混沌”——《山海经·西次三经》里，天山有神，状如黄囊，六足四翼，浑敦无面目，是识歌舞。无面目看不清来路，正所谓浑敦无面，祸福不辨。" } , translations: ["ja"] },
      { num: 4, name: "梼", title: { zh: "第四章 梼", en: "Ch.4 Tao" , ja: "第四章　梼"}, bio: { zh: "“梼”——古之四凶，梼杌难训，傲狠明德，撞了南墙也不回头。" } , translations: ["ja"] },
      { num: 5, name: "雕", title: { zh: "第五章 雕", en: "Ch.5 Diao" , ja: "第五章　雕"}, bio: { zh: "“雕”——《山海经》里的猛禽，居高而视，盘旋不急，落爪只在一瞬。" } , translations: ["ja"] },
      { num: 6, name: "蛊", title: { zh: "第六章 蛊", en: "Ch.6 Gu" , ja: "第六章　蠱（こ）"}, bio: { zh: "“蛊”——《山海经》里言“食之无蛊”，蛊者，中人而不自知，日久乃发。正所谓中蛊不觉，觉时已深。" } , translations: ["ja"] },
      { num: 7, name: "九婴", title: { zh: "第七章 九婴", en: "Ch.7 Jiuying" }, bio: { zh: "“九婴”——九首之怪，水火并作，一头一个主意，此呼彼不应。正所谓九首异向，一夜无眠。" } },
      { num: 8, name: "穷奇", title: { zh: "第八章 穷奇", en: "Ch.8 Qiongqi" }, bio: { zh: "“穷奇”——《山海经·海内北经》里，状如虎而有翼，食人从首始。" } },
      { num: 9, name: "饕餮", title: { zh: "第九章 饕餮", en: "Ch.9 Taotie" }, bio: { zh: "“饕餮”——《山海经·北次二经》里，羊身人面，目在腋下，虎齿人爪，贪食无厌，食之未尽，连自身也吞。正所谓欲无餍足，先噬其主。" } },
      { num: 10, name: "比翼鸟", title: { zh: "第十章 比翼鸟", en: "Ch.10 Biyi Bird" }, bio: { zh: "“比翼鸟”——《山海经·西次三经》里，有鸟一翼一目，相得乃飞，名曰蛮蛮。正所谓比翼方飞，分则不举。" } },
      { num: 11, name: "天狗", title: { zh: "第十一章 天狗", en: "Ch.11 Tiangou" }, bio: { zh: "“天狗”——《山海经·西次三经》里，阴山有兽，状如狸而白首，名曰天狗，其音如榴榴，可以御凶。御凶之兽，偏往凶处赶。正所谓闻声即往，不问吉凶。" } },
      { num: 12, name: "凰", title: { zh: "第十二章 凰", en: "Ch.12 Huang" }, bio: { zh: "“凰”——《山海经》里凤鸾自歌自舞，非梧桐不栖，非醴泉不饮，自此后，梧桐便不是梧桐。" } },
      { num: 13, name: "蜚", title: { zh: "第十三章 蜚", en: "Ch.13 Fei" }, bio: { zh: "“蜚”——《山海经·东次四经》里，状如牛而白首，一目蛇尾，行水则竭，行草则死，见则天下大疫。正所谓行处皆枯，人未觉疫。" } },
      { num: 14, name: "狰", title: { zh: "第十四章 狰", en: "Ch.14 Zheng" }, bio: { zh: "“狰”——《山海经·西次三经》里，章峨之山有兽，状如赤豹，五尾一角，其音如击石。正所谓五尾一身，一角独抵。" } },
      { num: 15, name: "朱厌", title: { zh: "第十五章 朱厌", en: "Ch.15 Zhuyan" }, bio: { zh: "“朱厌”——《山海经·西次二经》里，小次之山有兽，状如猿而白首赤足，见则大兵。正所谓白首赤足，兵起于辞。" } },
      { num: 16, name: "祸斗", title: { zh: "第十六章 祸斗", en: "Ch.16 Huodou" }, bio: { zh: "“祸斗”——古之食火兽，所过之处火自内生，连栖身的屋也一并烧尽。正所谓食火者，终为火食。" } },
      { num: 17, name: "英招", title: { zh: "第十七章 英招", en: "Ch.17 Yingzhao" }, bio: { zh: "“英招”——《山海经·西次三经》里，槐江之山，神英招司之，马身人面，虎文鸟翼，徇于四海，司帝之平圃。正所谓守圃者，先守分寸。" } },
      { num: 18, name: "重明鸟", title: { zh: "第十八章 重明鸟", en: "Ch.18 Chongming" }, bio: { zh: "“重明鸟”——古之瑞鸟，目有双瞳，能搏逐猛兽，光照明烛。正所谓重瞳能视远，难视己心。" } },
      { num: 19, name: "当康", title: { zh: "第十九章 当康", en: "Ch.19 Dangkang" }, bio: { zh: "“当康”——《山海经·东次四经》里，钦山有兽，状如豚而有牙，其名曰当康，其鸣自叫，见则天下大穰。正所谓见则大穰，丰年亦需人耕。" } },
      { num: 20, name: "夫诸", title: { zh: "第二十章 夫诸", en: "Ch.20 Fuzhu" }, bio: { zh: "“夫诸”——《山海经·中次三经》里，敖岸之山有兽，状如白鹿而四角，名曰夫诸，见则其邑大水。正所谓白鹿四角，水在未见时。" } },
      { num: 21, name: "陵鱼", title: { zh: "第二十一章 陵鱼", en: "Ch.21 Lingyu" }, bio: { zh: "“陵鱼”——《山海经·海内北经》里，陵鱼人面、手足、鱼身，在海中。一半在岸上，一半在水里，两边都站得住。正所谓人面鱼身，两处皆可栖。" } },
      { num: 22, name: "肥遗", title: { zh: "第二十二章 肥遗", en: "Ch.22 Feiyi" }, bio: { zh: "“肥遗”——《山海经·北山经》里，浑夕之山有蛇，一首两身，名曰肥遗，见则其国大旱。正所谓一首两身，终归一途。" } },
      { num: 23, name: "鹿蜀", title: { zh: "第二十三章 鹿蜀", en: "Ch.23 Lushu" }, bio: { zh: "“鹿蜀”——《山海经·南山经》里，杻阳之山有兽，状如马而白首，赤尾虎文，其音如谣，佩之宜子孙。正所谓佩之宜子孙，见之宜生疑。" } },
      { num: 24, name: "赢鱼", title: { zh: "第二十四章 赢鱼", en: "Ch.24 Yingyu" }, bio: { zh: "“赢鱼”——《山海经·西次四经》里，邽山蒙水中多嬴鱼，鱼身而鸟翼，音如鸳鸯，见则其邑大水。两班人马，昔日旧部。正所谓同水而游，分翼而飞。" } },
      { num: 25, name: "患", title: { zh: "第二十五章 患", en: "Ch.25 Huan" }, bio: { zh: "“患”——古以名兽，亦以名忧，患生于心，不自外来。正所谓当事者不疑，旁观者已明。" } },
      { num: 26, name: "毕方", title: { zh: "第二十六章 毕方", en: "Ch.26 Bifang" }, bio: { zh: "“毕方”——《山海经·西次三经》里，章峨之山有鸟，状如鹤，一足，赤文青质而白喙，其鸣自叫，见则其邑有讹火。正所谓一足之鸟，落地无声。" } },
      { num: 27, name: "陆吾", title: { zh: "第二十七章 陆吾", en: "Ch.27 Luwu" }, bio: { zh: "“陆吾”——《山海经·西次三经》里，昆仑之丘，神陆吾司之，虎身九尾，人面虎爪，司天之九部及帝之囿时。正所谓守门者，先受其门。" } },
      { num: 28, name: "九尾", title: { zh: "第二十八章 九尾", en: "Ch.28 Nine-Tail" }, bio: { zh: "“九尾”——《山海经·南山经》里，青丘之山有兽，状如狐而九尾，其音如婴儿，食者不蛊。正所谓尾多则路多，路多则难辨。" } },
      { num: 29, name: "猰貐", title: { zh: "第二十九章 猰貐", en: "Ch.29 Yayu" }, bio: { zh: "“猰貐”——《山海经·海内西经》里，蛇身人面，为贰负之臣所杀。正所谓旧身已死，新面方生。" } },
      { num: 30, name: "诸怀", title: { zh: "第三十章 诸怀", en: "Ch.30 Zhuhuai" }, bio: { zh: "“诸怀”——《山海经·北山经》里，北岳之山有兽，状如牛而四角、人目、彘耳，其音如鸣雁，是食人。正所谓四角相对，各有其向。" } },
      { num: 31, name: "妺", title: { zh: "第三十一章 妺", en: "Ch.31 Mo" }, bio: { zh: "“妺”——字从女从未，末也，尽也。正所谓最静处，最悬。" } },
      { num: 32, name: "精卫", title: { zh: "第三十二章 精卫", en: "Ch.32 Jingwei" }, bio: { zh: "“精卫”——《山海经·北山经》里，炎帝少女溺于东海，化为鸟，文首白喙赤足，常衔西山之木石以堙于东海。正所谓一石一粒，深不见浅。" } },
      { num: 33, name: "茈鱼", title: { zh: "第三十三章 茈鱼", en: "Ch.33 Ziyu" }, bio: { zh: "“茈鱼”——《山海经·东山经》里，泚水中多茈鱼，状如鲋，一首而十身。正所谓一首十身，事必分头。" } },
      { num: 34, name: "狡", title: { zh: "第三十四章 狡", en: "Ch.34 Jiao" }, bio: { zh: "“狡”——《山海经·西次三经》里，玉山有兽，状如犬而豹文，其角如牛，名曰狡，其音如吠犬，见则其国大穰。正所谓犬而生角，看似温顺，实则难驯。" } },
      { num: 35, name: "蜮", title: { zh: "第三十五章 蜮", en: "Ch.35 Yu" }, bio: { zh: "“蜮”——古传水中之虫，含沙射影，中者不知从何处来，但觉痛。正所谓影中者，不见其形。" } },
      { num: 36, name: "赤鱬", title: { zh: "第三十六章 赤鱬", en: "Ch.36 Chiru" }, bio: { zh: "“赤鱬”——《山海经·南山经》里，青丘之山附近的英水出赤鱬，形状像鱼，却长着人的脸，叫声像鸳鸯。吃了它的肉可以不生疥疮。人面鱼身，音如鸳鸯，出于英水，游戏人间。" } },
      { num: 37, name: "并封", title: { zh: "第三十七章 并封", en: "Ch.37 Bingfeng" }, bio: { zh: "“并封”——《山海经·海外西经》里，并封在巫咸东，其状如彘，前后皆有首，黑。两个头，一前一后，长在同一个身子上，一个要往东，一个要往西，谁也压不过谁，谁也离不开谁。正所谓双头共身，反向而生，你问一句我接一句，谁也不让，谁也不服，棋逢对手，将遇良才。" } },
      { num: 38, name: "狙如", title: { zh: "第三十八章 狙如", en: "Ch.38 Juru" }, bio: { zh: "“狙如”——《山海经·中次十一经》里，倚帝之山有兽，状如鼣鼠，白耳白喙，名曰狙如，见则其国有大兵。正所谓白耳白喙，鼠身而藏，见则兵起，不鸣而先动。" } },
      { num: 39, name: "天马", title: { zh: "第三十九章 天马", en: "Ch.39 Tianma" }, bio: { zh: "“天马”——《山海经·北山经》，马成之山有兽，状如白犬而黑头，见人则飞，其名曰天马。" } },
      { num: 40, name: "媪", title: { zh: "第四十章 媪", en: "Ch.40 Ao" }, bio: { zh: "“媪”——《山海经·西山经》，玉山有兽名“媪”，状如犬而人面，见人则笑，其行如风。" } },
      { num: 41, name: "犀渠", title: { zh: "第四十一章 犀渠", en: "Ch.41 Xiqu" }, bio: { zh: "“犀渠”——《山海经·中山经》里，釐山有兽，状如牛，苍身，其音如婴儿，是食人，名曰犀渠。正所谓苍身牛形，其音如婴，不筑己巢，占他兽之洞。" } },
      { num: 42, name: "孟极", title: { zh: "第四十二章 孟极", en: "Ch.42 Mengji" }, bio: { zh: "“孟极”——《山海经·北山经》里，石者之山有兽，状如豹而文题白身，名曰孟极，是善伏，其鸣自呼。正所谓伏得再深，开口仍是自己的名字。" } },
      { num: 43, name: "合窳", title: { zh: "第四十三章 合窳", en: "Ch.43 Heyu" }, bio: { zh: "“合窳”——《山海经·东山经》里，剡山有兽，其状如彘而人面，黄身而赤尾，其名曰合窳，见则天下大水。正所谓彘身人面，黄身赤尾，暗伏于野，见则大水。" },
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
            "— excerpt from 'Lost in Changsha', Ch.43 Heyu (official-first sample)"
        }
      },
      { num: 44, name: "诸犍", title: { zh: "第四十四章 诸犍", en: "Ch.44 Zhujian" }, bio: { zh: "“诸犍”——《山海经·北山经》里，单张之山有兽，其状如豹，而长尾，人首而牛耳，一目，名曰诸犍。善吒，行则衔其尾。正所谓豹身长尾，人首牛耳，一目独视，行则衔尾。诸犍只有一只眼睛，看左边就顾不了右边，看前头就顾不了后头；它走路的时候，必须咬着自己的尾巴，生怕首尾不能相顾。" } }
    ]
  },
  {
    id: "halo",
    title: { zh: "光环", en: "Halo", ja: "光環", fr: "Halo", ar: "هالة" },
    author: "默不如zZZ",
    category: { zh: "默不如 · 新作", en: "Moburu · New", ja: "Moburu · 新作", fr: "Moburu · Nouveau", ar: "Moburu · جديد" },
    status: { zh: "即将上线 · 免费", en: "Coming soon · Free", ja: "近日公開 · 無料", fr: "Bientôt · Gratuit", ar: "قريباً · مجاني" },
    year: 2026,
    paywall: false,
    officialFirst: true,
    qidianUrl: "",
    cover: "光",
    summary: {
      zh: "默不如全新作品，官网优先更新，敬请期待。在「默不如小说宇宙」中开启新的故事线。",
      en: "A new work by Moburu — official-first updates, coming soon. A new storyline in the Moburu fiction universe.",
      ja: "Moburuの新作。公式サイト最速更新、乞うご期待。「Moburuフィクション・ユニバース」で新たな物語が始まる。",
      fr: "Une nouvelle œuvre de Moburu — mises à jour officielles en premier, à venir. Une nouvelle intrigue dans l'univers de fiction Moburu.",
      ar: "عمل جديد من Moburu — تحديثات رسمية أولاً، قريباً. خط قصة جديد في عالم Moburu الخيالي."
    },
    tags: { zh: ["默不如宇宙", "敬请期待"], en: ["Moburu Universe", "Coming Soon"], ja: ["Moburu宇宙", "乞うご期待"], fr: ["Univers Moburu", "À venir"], ar: ["عالم Moburu", "قريباً"] },
    chapters: [
      { num: 0, name: "序", title: { zh: "序", en: "Prologue" } }
    ]
  },
  {
    id: "shepherd",
    title: { zh: "牧者之歌", en: "Song of the Shepherd", ja: "羊飼いの歌", fr: "Chant du Berger", ar: "أغنية الراعي" },
    author: "默不如zZZ",
    category: { zh: "默不如 · 新作", en: "Moburu · New", ja: "Moburu · 新作", fr: "Moburu · Nouveau", ar: "Moburu · جديد" },
    status: { zh: "即将上线 · 免费", en: "Coming soon · Free", ja: "近日公開 · 無料", fr: "Bientôt · Gratuit", ar: "قريباً · مجاني" },
    year: 2026,
    paywall: false,
    officialFirst: true,
    qidianUrl: "",
    cover: "牧",
    summary: {
      zh: "默不如全新作品，官网优先更新，敬请期待。在「默不如小说宇宙」中开启新的故事线。",
      en: "A new work by Moburu — official-first updates, coming soon. A new storyline in the Moburu fiction universe.",
      ja: "Moburuの新作。公式サイト最速更新、乞うご期待。「Moburuフィクション・ユニバース」で新たな物語が始まる。",
      fr: "Une nouvelle œuvre de Moburu — mises à jour officielles en premier, à venir. Une nouvelle intrigue dans l'univers de fiction Moburu.",
      ar: "عمل جديد من Moburu — تحديثات رسمية أولاً، قريباً. خط قصة جديد في عالم Moburu الخيالي."
    },
    tags: { zh: ["默不如宇宙", "敬请期待"], en: ["Moburu Universe", "Coming Soon"], ja: ["Moburu宇宙", "乞うご期待"], fr: ["Univers Moburu", "À venir"], ar: ["عالم Moburu", "قريباً"] },
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
