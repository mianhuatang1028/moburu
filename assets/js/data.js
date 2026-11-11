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

/* 支持的语言
   label = 按钮上显示的短标签（五枚胶囊等宽，长度不影响排版）
   full  = 完整语言名，用于 title / aria-label（缩写 EN、FR 也能被读屏和悬停说清）
   html  = <html lang> 取值 */
const LANGS = [
  { code: "zh", label: "中文",    full: "简体中文",  html: "zh-CN" },
  { code: "en", label: "EN",      full: "English",  html: "en" },
  { code: "ja", label: "日本語",   full: "日本語",    html: "ja" },
  { code: "fr", label: "FR",      full: "Français", html: "fr" },
  { code: "ar", label: "العربية", full: "العربية",   html: "ar" }
];

/* 山海经神兽图：哪些章号有配图（文件 assets/img/beasts/<两位章号>.webp）
   图与语言无关，所有语言页面共用同一张；新增章节配图后在此追加章号即可。
   尺寸 800×1148（原图 1024×1470 已裁掉工具角标），暗金线描，与站点墨黑+金色同一套。 */
const BEAST_IMAGES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
  48, 49
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
    translationBadge: "译本", translationFirst: "译本首发", translationMissing: "本章尚无此语言译本，以下为中文原文。", translationProgress: "译本正在逐章更新，尚无译本的章节暂显示中文原文。", otherLanguages: "其他语言版本", originalVersion: "中文原文", translationArchive: "译本存档页", prevChapter: "上一章", nextChapter: "下一章", chapterList: "作品目录", firstChapter: "已是第一章", lastChapter: "已是最后一章", chapterNav: "章节翻页",
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
    translationBadge: "Translation", translationFirst: "Translation first published", translationMissing: "This chapter is not yet available in this language. The Chinese original is shown below.", translationProgress: "Translations are being added chapter by chapter. Chapters without a translation show the Chinese original.", otherLanguages: "Other languages", originalVersion: "Chinese original", translationArchive: "Translation archive", prevChapter: "Previous chapter", nextChapter: "Next chapter", chapterList: "Contents", firstChapter: "This is the first chapter", lastChapter: "This is the last chapter", chapterNav: "Chapter navigation",
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
    aboutBig: "Moburu is the founder of a biotech company and a writer. A former executive at Xiaomi, she founded the world's first live-commerce platform. Still an entrepreneur today, she enjoys writing realist fiction as well as science fiction.",
    aboutP1: "\"Lost in Changsha\" is Moburu's recent new work; each chapter is named after a mythical beast from the Classic of Mountains and Seas — the beast is fate.",
    aboutP2: "",
    aboutContact: "Contact / Collab: "
  },
  ja: {
    brand: "Moburu",
    nav: { home: "ホーム", works: "作品", about: "プロフィール", pricing: "会員" },
    heroBadge: "Moburu · フィクション・ユニバース",
    heroH1a: "Moburu", heroH1b: "フィクション・ユニバース",
    tagline: "バイオテクノロジー企業の女性創業者、作家。",
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
    translationBadge: "翻訳", translationFirst: "翻訳初公開", translationMissing: "この章はまだこの言語に翻訳されていません。以下は中国語の原文です。", translationProgress: "翻訳は章ごとに公開しています。訳本のない章は中国語の原文を表示します。", otherLanguages: "他の言語版", originalVersion: "中国語原文", translationArchive: "翻訳アーカイブ", prevChapter: "前の章", nextChapter: "次の章", chapterList: "目次", firstChapter: "最初の章です", lastChapter: "最後の章です", chapterNav: "章の移動",
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
    aboutBig: "Moburuはバイオテクノロジー企業の女性創業者にして作家でもある。小米（シャオミ）科技の元幹部で、世界初のライブコマース・プラットフォームを立ち上げた。現在も起業を続け、リアリズムとSFを書くことを好む。",
    aboutP1: "『長沙に迷う』はMoburuの最近の新作。全章が『山海経』の神獣で名付けられ、神獣は運命。",
    aboutP2: "",
    aboutContact: "連絡／協業： "
  },
  fr: {
    brand: "Moburu",
    nav: { home: "Accueil", works: "Œuvres", about: "À propos", pricing: "Membres" },
    heroBadge: "Moburu · UNIVERS DE FICTION",
    heroH1a: "Moburu", heroH1b: "UNIVERS DE FICTION",
    tagline: "Fondatrice d'une entreprise de biotechnologie, et écrivaine.",
    slogan: "Réalisme technique · Narration des Montagnes et Mers · Reconquête de la maturité",
    ctaWorks: "Voir les œuvres",
    ctaAbout: "À propos de l'autrice",
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
    footerNote: "Site officiel indépendant de l'autrice. Le contenu est publié en premier sur le site officiel.",
    footerRights: "Tous droits réservés.",
    langLabel: "Langue",
    firstBadge: "Officiel en premier",
    firstPosted: "Publié le", firstPostedFull: "Première publication ici", lastUpdated: "Dernière mise à jour", provenance: "Registre de publication", fullTextBadge: "Texte intégral", fullTextPosted: "Texte intégral publié", loadingText: "Chargement du chapitre…", textLoadFail: "Impossible de charger le chapitre. Actualisez ou ouvrez la page d'archive.", archivePage: "Archive du texte intégral",
    translationBadge: "Traduction", translationFirst: "Première publication de la traduction", translationMissing: "Ce chapitre n'est pas encore traduit dans cette langue. L'original chinois figure ci-dessous.", translationProgress: "Les traductions sont publiées chapitre par chapitre. Les chapitres non encore traduits affichent l'original chinois.", otherLanguages: "Autres langues", originalVersion: "Original chinois", translationArchive: "Archive de la traduction", prevChapter: "Chapitre précédent", nextChapter: "Chapitre suivant", chapterList: "Sommaire", firstChapter: "Premier chapitre", lastChapter: "Dernier chapitre", chapterNav: "Navigation des chapitres",
    readLatest: "Lire le dernier",
    qidian: "Qidian (CN)",
    backWorks: "‹ Œuvres",
    chIndex: "Chapitres · Index des bêtes",
    chIndexSub: "Chaque chapitre est nommé d'après une bête mythique — la bête est le destin.",
    chCatalog: "Sommaire",
    chCatalogSub: "Liste complète des chapitres — cliquez pour lire.",
    updateSoon: "Mise à jour officielle à venir.",
    excerptNotice: "Extrait de l'échantillon officiel en premier. Le texte intégral est publié par l'autrice lors de la mise à jour officielle.",
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
    aboutBig: "Moburu est la fondatrice d'une entreprise de biotechnologie et écrivaine. Ancienne cadre de Xiaomi, elle a fondé la première plateforme mondiale de live-commerce. Toujours entrepreneure aujourd'hui, elle aime écrire du réalisme comme de la science-fiction.",
    aboutP1: "« Perdu à Changsha » est la récente nouvelle œuvre de Moburu ; chaque chapitre porte le nom d'une bête mythique du Classique des Montagnes et Mers — la bête est le destin.",
    aboutP2: "",
    aboutContact: "Contact / Collaboration : "
  },
  ar: {
    brand: "Moburu",
    nav: { home: "الرئيسية", works: "الأعمال", about: "عن الكاتبة", pricing: "الأعضاء" },
    heroBadge: "Moburu · عالم الخيال",
    heroH1a: "Moburu", heroH1b: "عالم الخيال",
    tagline: "مؤسِّسة شركة تكنولوجيا حيوية، وكاتبة.",
    slogan: "واقعية تقنية · سرد «الجبال والبحار» · صعود منتصف العمر",
    ctaWorks: "تصفح الأعمال",
    ctaAbout: "عن الكاتبة",
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
    footerNote: "موقع مستقل للكاتبة. يُنشر المحتوى على الموقع الرسمي أولاً.",
    footerRights: "جميع الحقوق محفوظة.",
    langLabel: "اللغة",
    firstBadge: "الرسمي أولاً",
    firstPosted: "نُشر أولاً", firstPostedFull: "أول نشر هنا", lastUpdated: "آخر تحديث", provenance: "سجل النشر", fullTextBadge: "النص الكامل", fullTextPosted: "نشر النص الكامل", loadingText: "جارٍ تحميل الفصل…", textLoadFail: "تعذّر تحميل الفصل. حدّث الصفحة أو افتح صفحة الأرشيف.", archivePage: "أرشيف النص الكامل",
    translationBadge: "ترجمة", translationFirst: "أول نشر للترجمة", translationMissing: "لم يُترجم هذا الفصل إلى هذه اللغة بعد. النص الصيني الأصلي أدناه.", translationProgress: "تُنشر الترجمات فصلًا بفصل. وتعرض الفصول التي لم تُترجم بعد النص الصيني الأصلي.", otherLanguages: "لغات أخرى", originalVersion: "النص الصيني الأصلي", translationArchive: "أرشيف الترجمة", prevChapter: "الفصل السابق", nextChapter: "الفصل التالي", chapterList: "الفهرس", firstChapter: "هذا هو الفصل الأول", lastChapter: "هذا هو الفصل الأخير", chapterNav: "التنقل بين الفصول",
    readLatest: "اقرأ الأحدث",
    qidian: "Qidian (CN)",
    backWorks: "‹ الأعمال",
    chIndex: "الفصول · فهرس الوحوش",
    chIndexSub: "كل فصل يحمل اسم وحش أسطوري — الوحش هو القدر。",
    chCatalog: "فهرس الفصول",
    chCatalogSub: "قائمة الفصول الكاملة — انقر للقراءة.",
    updateSoon: "تحديث رسمي قادم قريبًا.",
    excerptNotice: "مقتطف من العينة الرسمية الأولى. ينشر النص الكامل من قبل الكاتبة عند التحديث الرسمي.",
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
    aboutBig: "Moburu مؤسِّسة شركة تكنولوجيا حيوية وكاتبة. مديرة سابقة في شركة شاومي (Xiaomi)، أسّست أول منصة تجارة مباشرة عبر البث المباشر في العالم. لا تزال رائدة أعمال اليوم، وتحب كتابة الواقعية والخيال العلمي.",
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
  /* 作者为女性（2026-11-10 确认）：5 语言作者介绍一律用阴性措辞，
     并在 Person 结构化数据里显式标 gender，避免 AI / 搜索引擎误判为男性。 */
  gender: "female",
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
      { num: 0, name: "鲲鹏", title: { zh: "引：鲲鹏", en: "Prologue: Kunpeng", ja: "序章：鯤鵬", fr: "Prologue : Kunpeng", ar: "مقدمة: كون بنغ" }, bio: { en: "“Kunpeng” — In the Zhuangzi (“Free and Easy Wandering”), there is a fish in the Northern Darkness that turns into a bird; it strikes the water for three thousand li and rides the whirlwind ninety thousand li into the sky. The same leap — some go up, some go down. As the saying goes: in a single leap, the one who rises becomes the Peng; the one who falls is never named.", zh: "“鲲鹏”——《庄子·逍遥游》里，北冥有鱼，化而为鸟，水击三千里，抟扶摇而上者九万里。同是一跃，有人往上，有人往下。正所谓一跃之间，升者为鹏，坠者无名。", ja: "「鯤鵬」――『荘子・逍遥遊篇』にいう。北冥に魚あり、化して鳥となり、水を撃つこと三千里、扶揺に搏って上ること九万里。同じひと跳ねでも、昇る者もいれば、墜ちる者もいる。まさに一跳ねのうちに、昇れば鵬となり、墜ちれば名も残らぬ。", fr: "« Kunpeng » — dans le « Vagabondage absolu » de Zhuangzi, il est, dans les mers du Nord, un poisson qui se métamorphose en oiseau ; il frappe l’eau sur trois mille lis, puis s’élève sur le tourbillon jusqu’à quatre-vingt-dix mille lis. Un seul et même élan : certains montent, d’autres tombent. Comme on dit : en un seul bond, qui s’élève devient le Peng, qui chute demeure sans nom.", ar: "«كون بنغ» — في «السياحة المطلقة» لتشوانغ تزو: في البحر الشمالي سمكة تتحول إلى طائر، تضرب الماء ثلاثة آلاف لي، ثم ترتفع على الدوامة تسعين ألف لي. قفزة واحدة: فمنهم من يصعد، ومنهم من يهبط. وكما يقال: في قفزة واحدة، من صعد صار «بينغ»، ومن هوى بقي بلا اسم." }, translations: ["en", "ja", "fr", "ar"] },
      { num: 1, name: "鸮", title: { zh: "第一章 鸮", en: "Chapter One: Xiao", ja: "第一章　鸮（ミミズク）", fr: "Chapitre un : Le Hibou", ar: "الفصل الأول: البومة" }, bio: { en: "“Xiao” — In the Classic of Mountains and Seas, birds are mostly named for their shapes. This one hides by day and comes out at night, and whoever hears its cry takes it as an ill omen. As the saying goes: the night bird gives its first cry, and the long night has only begun.", zh: "“鸮”——《山海经》里多以其形名鸟，昼伏夜出，闻其声者以为不祥。正所谓夜鸟初啼，长夜方始。", ja: "「鸮（ミミズク）」――『山海経』には、姿から名づけられる鳥が多い。昼は伏せ、夜に出で、その声を聞く者は不吉の兆しと受け取る。まさに夜鳥が初めて啼くとき、長い夜が始まる。", fr: "« Le Hibou » — dans le Classique des montagnes et des mers, les oiseaux sont souvent nommés d’après leur forme ; celui-ci se cache le jour et sort la nuit, et qui entend son cri y voit un présage funeste. Comme on dit : quand l’oiseau de nuit pousse son premier cri, la longue nuit commence.", ar: "«البومة» — في «كتاب الجبال والبحار» تُسمّى الطيور غالبًا بأشكالها؛ وهذه تختبئ في النهار وتخرج في الليل، ومن يسمع صوتها يعدّه نذير شؤم. وكما يقال: حين يصيح طائر الليل أول صيحة، تبدأ الليلة الطويلة." } , translations: ["en", "ja", "fr", "ar"] },
      { num: 2, name: "灌灌", title: { zh: "第二章 灌灌", en: "Chapter Two: Guanguan", ja: "第二章　灌灌", fr: "Chapitre deux : Guanguan", ar: "الفصل الثاني: غوانغوان" }, bio: { en: "“Guanguan” — In the Classic of Mountains and Seas (“Southern Mountains”), there is a bird shaped like a turtledove whose call sounds like scolding; it is called the guanguan, and whoever wears it will not be confused. As the saying goes: wear it and you will not be confused — nor led astray.", zh: "“灌灌”——《山海经·南山经》里，有鸟状如鸠，其音若呵，名曰灌灌，佩之不惑。正所谓佩之不惑，亦不受惑。", ja: "「灌灌」――『山海経・南山経』にいう。鳩に似た鳥で、その声は叱るがごとく、名を灌灌という。羽を身に佩けば惑わない。まさに、佩けば惑わず、また惑わされることもない。", fr: "« Guanguan » — dans le Classique des montagnes et des mers, section « Monts du Sud », un oiseau ressemble à la tourterelle ; son cri résonne comme un appel, on l’appelle Guanguan, et qui le porte sur soi ne se laisse plus égarer. Une petite bête sans éclat, dont seule la voix avertit. Comme on dit : qui le porte ne s’égare pas — et ne se laisse pas séduire non plus.", ar: "«غوانغوان» — في «كتاب الجبال والبحار»، فصل «جبال الجنوب»: طائر على هيئة الحمامة، صوته كنَفَسٍ مسموع، اسمه غوانغوان، ومن حمله لم يضلّ. ومن حمله لم يضلّ، فلم يقع في الغواية." } , translations: ["en", "ja", "fr", "ar"] },
      { num: 3, name: "混沌", title: { zh: "第三章 混沌", en: "Chapter Three: Hundun", ja: "第三章　混沌", fr: "Chapitre trois : Hundun", ar: "الفصل الثالث: هوندون" }, bio: { en: "“Hundun” — In the Classic of Mountains and Seas (“Western Mountains, Book Three”), on Mount Tian there is a god shaped like a yellow sack, with six feet and four wings, a formless blur without a face, and it knows song and dance. Without a face, you cannot see where it comes from. As the saying goes: a blur without a face — fortune and misfortune cannot be told apart.", zh: "“混沌”——《山海经·西次三经》里，天山有神，状如黄囊，六足四翼，浑敦无面目，是识歌舞。无面目看不清来路，正所谓浑敦无面，祸福不辨。", ja: "「混沌」――『山海経・西次三経』にいう。天山に神あり、黄色き袋のごとき形、六足四翼、面目なくして歌舞を識る。顔がなければ、来た道も見分けがつかぬ。まさに面なくば、禍福も弁じがたい。", fr: "« Hundun » — dans le Classique des montagnes et des mers, troisième section des monts de l’Ouest, il est sur le mont Tianshan un dieu en forme de sac jaune, à six pieds et quatre ailes, une masse sans visage ni traits, qui pourtant connaît le chant et la danse. Rien à voir, rien à nommer : on ne sait pas d’où il vient. Comme on dit : sans visage, on ne distingue ni le malheur ni la chance.", ar: "«هوندون» — في «كتاب الجبال والبحار»، فصل «الجبال الغربية الثلاثة»: في جبل تيان شان إله على هيئة كيس أصفر، له ست أرجل وأربعة أجنحة، بلا وجه ولا ملامح، وهو يعرف الغناء والرقص. ومن لا وجه له لا يتبيّن من أين جاء؛ وكما يقال: بلا وجه، لا يُفرّق بين الخير والشر." } , translations: ["en", "ja", "fr", "ar"] },
      { num: 4, name: "梼", title: { zh: "第四章 梼", en: "Chapter Four: Tao", ja: "第四章　梼", fr: "Chapitre quatre : Tao", ar: "الفصل الرابع: تاو" }, bio: { en: "“Tao” — Of the Four Fiends of antiquity, Taowu was the untamable one: proud, vicious, scornful of virtue; even after running headlong into the south wall, it would not turn back.", zh: "“梼”——古之四凶，梼杌难训，傲狠明德，撞了南墙也不回头。", ja: "「梼」――古の四凶の一つ。梼杌は馴らしがたく、傲り狠しく徳を顧みず、南の壁に打ち当たっても、なお振り返らぬ。", fr: "« Tao » — l’un des quatre fléaux de l’Antiquité chinoise, la bête nommée Taowu : on ne la dressait pas, on ne lui apprenait rien. Fière jusqu’à l’aveuglement, elle allait toujours droit devant elle. Un homme de cette trempe ne s’arrête pas devant le mur : il s’y brise.", ar: "«تاو» — أحد «الأشرار الأربعة» في الأساطير الصينية القديمة، ويُسمّى «تاو وو»: مخلوق عاتٍ عنيد، لا يعرف الرجوع. جسمه جسم نمر، ووجهه وجه إنسان، وأنيابه كأنياب الخنزير البري، وذيله ثمانية أقدام. ومن كان مثله مضى في طريقه إلى آخره، ولو كان آخره جدارًا." } , translations: ["en", "ja", "fr", "ar"] },
      { num: 5, name: "雕", title: { zh: "第五章 雕", en: "Chapter Five: Diao", ja: "第五章　雕", fr: "Chapitre cinq : L’Aigle", ar: "الفصل الخامس: النسر" }, bio: { en: "“Diao” — the eagle, the great raptor of the Classic of Mountains and Seas. It watches from on high, circling without haste; when its talons drop, it is over in an instant.", zh: "“雕”——《山海经》里的猛禽，居高而视，盘旋不急，落爪只在一瞬。", ja: "「雕」――『山海経』に見える猛禽。高きに居て見下ろし、急がず盤旋し、爪を落とすのはただ一瞬である。", fr: "« L’Aigle » — dans le Classique des montagnes et des mers, c’est un rapace qui observe de haut. Il tourne sans se presser, et ses serres ne tombent qu’en un instant. Certains regards se posent ainsi sur vous : patients, et déjà sûrs de leur proie.", ar: "«النسر» — من الجوارح في «كتاب الجبال والبحار»: يقعد عاليًا فينظر، ويدور على مهل، ولا ينزل بمخالبه إلا في لحظة. وكم من صيد رآه من فوق، فظنّ أنه لن يُرى." } , translations: ["en", "ja", "fr", "ar"] },
      { num: 6, name: "蛊", title: { zh: "第六章 蛊", en: "Chapter Six: Gu", ja: "第六章　蠱（こ）", fr: "Chapitre six : Le Gu", ar: "الفصل السادس: الغو" }, bio: { en: "“Gu” — The Classic of Mountains and Seas speaks of things that, eaten, ward off gu. Gu is what strikes a person without their knowing, and breaks out only after many days. As the saying goes: struck by gu, you feel nothing; by the time you feel it, it is deep.", zh: "“蛊”——《山海经》里言“食之无蛊”，蛊者，中人而不自知，日久乃发。正所谓中蛊不觉，觉时已深。", ja: "「蠱（こ）」――『山海経』に「これを食えば蠱なし」とある。蠱とは、人に中りながら当人は気づかず、日を経てはじめて発するもの。まさに中っても覚らず、覚ったときにはすでに深い。", fr: "« Le Gu » — dans le Classique des montagnes et des mers, on dit d’un mets qu’on en mange « sans y trouver de gu ». Le gu est ce qui pénètre un homme à son insu et ne se déclare qu’avec les années. Comme on dit : on porte le gu sans le sentir, et quand on le sent, il est déjà profond.", ar: "«الغو» — في «كتاب الجبال والبحار» تُذكر عبارة تعني أن من يأكل من شيء لا يصيبه الغوّ، والغوّ سمٌّ خفيّ يدخل في الإنسان من غير أن يعلم، ثم يستحكم بعد طول زمن. لا جسم له ولا لون، إنما يختمر في الداخل حين يطول السكوت. وكما يقال: من سُمّ ولم يشعر، لم ينفعه أن يشعر وقد استحكم السمّ." } , translations: ["en", "ja", "fr", "ar"] },
      { num: 7, name: "九婴", title: { zh: "第七章 九婴", ja: "第七章　九嬰（きゅうえい）", en: "Chapter Seven: Jiuying", fr: "Chapitre sept : Neuf Nourrissons", ar: "الفصل السابع: الرضّع التسعة" }, bio: { en: "“Jiuying” — a nine-headed monster that spits water and fire at once; each head has its own mind, and when one calls, another will not answer. As the saying goes: nine heads facing nine ways — a sleepless night.", zh: "“九婴”——九首之怪，水火并作，一头一个主意，此呼彼不应。正所谓九首异向，一夜无眠。", ja: "「九嬰（きゅうえい）」――九つの首を持つ怪、水と火をともに起こす。首ごとに一つの考えがあり、呼んでも応えぬ。まさに九首は向かうを異にし、一夜眠ることなし。", fr: "« Neuf Nourrissons » — un monstre à neuf têtes, qui manie à la fois l’eau et le feu ; chaque tête a son idée, l’une appelle et l’autre ne répond pas. Comme on dit : neuf têtes tirant chacune de son côté, et une nuit sans sommeil.", ar: "«الرضّع التسعة» — في «كتاب الجبال والبحار» مخلوق بتسعة رؤوس، ينفث الماء والنار معًا، ولكل رأس رأي، فإذا نادى أحدها لم يجبه الآخر. لا جسد واحد لها بل إرادات متفرّقة، تُشعل وتُطفئ في اللحظة نفسها. وكما يقال: تسعة رؤوس في تسعة اتجاهات، وليلة بلا نوم." } , translations: ["en", "ja", "fr", "ar"] },
      { num: 8, name: "穷奇", title: { zh: "第八章 穷奇", ja: "第八章　窮奇（きゅうき）", en: "Chapter Eight: Qiongqi", fr: "Chapitre huit : Qiongqi", ar: "الفصل الثامن: تشيونغتشي" }, bio: { en: "“Qiongqi” — In the Classic of Mountains and Seas (“Northern Lands Within the Seas”), it is shaped like a tiger with wings, and it devours people starting from the head.", zh: "“穷奇”——《山海经·海内北经》里，状如虎而有翼，食人从首始。", ja: "「窮奇（きゅうき）」――『山海経・海内北経』にいう。虎に似て翼あり、人を食らうには首より始む。", fr: "« Qiongqi » — dans le Classique des montagnes et des mers, à la section « Au nord des mers intérieures », il a l’aspect d’un tigre et porte des ailes ; il dévore les hommes en commençant par la tête. Ainsi, ce qui fond sur vous sans prévenir commence toujours par vous prendre la tête.", ar: "«تشيونغتشي» — في «كتاب الجبال والبحار»، فصل «الجبال الشمالية الداخلية»: وحش على هيئة نمر وله جناحان، يأكل الإنسان فيبدأ من رأسه. وكما يقال: من أراد أن يلتهم إنسانًا بدأ برأسه، أي بحكمه قبل جسده." } , translations: ["en", "ja", "fr", "ar"] },
      { num: 9, name: "饕餮", title: { zh: "第九章 饕餮", ja: "第九章　饕餮", en: "Chapter Nine: Taotie", fr: "Chapitre neuf : Taotie", ar: "الفصل التاسع: تاوتيه" }, bio: { en: "“Taotie” — In the Classic of Mountains and Seas (“Northern Mountains, Book Two”): the body of a sheep and the face of a man, eyes under its armpits, a tiger’s teeth and human hands. Greedy without end, when there is nothing left to eat it devours itself too. As the saying goes: desire that knows no fill devours its master first.", zh: "“饕餮”——《山海经·北次二经》里，羊身人面，目在腋下，虎齿人爪，贪食无厌，食之未尽，连自身也吞。正所谓欲无餍足，先噬其主。", ja: "「饕餮（とうてつ）」――『山海経・北次二経』にいう。羊身人面、目は腋の下にあり、虎の歯に人の爪、貪り食らうて飽くことなし。食らい尽くさぬまま、ついには己をも呑む。まさに欲に飽くことなく、まずその主を噛む。", fr: "« Taotie » — dans le Classique des montagnes et des mers, à la deuxième section du Nord, il a un corps de mouton et un visage d’homme, les yeux sous les aisselles, des dents de tigre et des griffes d’homme ; sa gloutonnerie ne connaît pas de fin, et quand il a tout mangé, il se dévore lui-même. À qui ne se rassasie jamais, il arrive de dévorer d’abord son maître.", ar: "«تاوتيه» — في «كتاب الجبال والبحار»، فصل «الجبال الشمالية الثانية»: له جسم خروف ووجه إنسان، وعيناه تحت إبطيه، وأسنان نمر وأظافر بشر، لا يشبع من الأكل، فإذا لم يبقَ ما يأكله أكل نفسه. وكما يقال: من لا يشبع من الشهوة، أكل صاحبه أولًا." } , translations: ["en", "ja", "fr", "ar"] },
      { num: 10, name: "比翼鸟", title: { zh: "第十章 比翼鸟", ja: "第十章　比翼鳥", en: "Chapter Ten: Biyi Bird", fr: "Chapitre dix : L’Oiseau aux ailes jumelles", ar: "الفصل العاشر: طائر الجناحين المتلاصقين" }, bio: { en: "“Biyi Bird” — In the Classic of Mountains and Seas (“Western Mountains, Book Three”), there is a bird with one wing and one eye; only in pairs can they fly, and it is called the manman. As the saying goes: wing to wing they fly; apart, they cannot rise.", zh: "“比翼鸟”——《山海经·西次三经》里，有鸟一翼一目，相得乃飞，名曰蛮蛮。正所谓比翼方飞，分则不举。", ja: "「比翼鳥（ひよくちょう）」――『山海経・西次三経』にいう。一翼一目、相得てはじめて飛ぶ鳥あり、名を蛮蛮という。まさに翼を並べてこそ飛び、分かれれば挙がらず。", fr: "« L’Oiseau aux ailes jumelles » — dans le Classique des montagnes et des mers, au livre des montagnes de l’Ouest, vit un oiseau qui n’a qu’une aile et qu’un œil, du nom de Manman ; il ne prend son essor que s’il rencontre son pair. Seul, il ne soulève rien ; apparié, il traverse le ciel. Comme on dit : l’aile unique ne vole qu’à deux, et qui se sépare retombe.", ar: "«طائر الجناحين المتلاصقين» — في «كتاب الجبال والبحار»، فصل «الجبال الغربية الثالث»: طائر له جناح واحد وعين واحدة، لا يطير إلا إذا اقترن بغيره، واسمه «مان مان». وكما يقال: بجناحين متلاصقين يطير، وبانفراقهما لا ينهض." } , translations: ["en", "ja", "fr", "ar"] },
      { num: 11, name: "天狗", title: { zh: "第十一章 天狗", ja: "第十一章　天狗", en: "Chapter Eleven: Tiangou", fr: "Chapitre onze : Le Chien céleste", ar: "الفصل الحادي عشر: الكلب السماوي" }, bio: { en: "“Tiangou” — In the Classic of Mountains and Seas (“Western Mountains, Book Three”), on Mount Yin there is a beast shaped like a wildcat with a white head, called the tiangou, the Heavenly Dog; its cry sounds like “liu-liu,” and it can ward off evil. A beast that wards off evil, yet always rushes toward evil. As the saying goes: it hears the call and goes, never asking whether the omen is good or ill.", zh: "“天狗”——《山海经·西次三经》里，阴山有兽，状如狸而白首，名曰天狗，其音如榴榴，可以御凶。御凶之兽，偏往凶处赶。正所谓闻声即往，不问吉凶。", ja: "「天狗（てんこう）」――『山海経・西次三経』にいう。陰山に獣あり、状は狸に似て首白く、名を天狗という。その音は榴榴のごとく、凶を禦ぐべし。凶を禦ぐ獣にして、かえって凶のほうへ赴く。まさに声を聞けば即ち往き、吉凶を問わず。", fr: "« Le Chien céleste » — dans le Classique des montagnes et des mers, au livre des montagnes de l’Ouest, le mont Yin abrite une bête à tête blanche, pareille à un chat sauvage, nommée Chien céleste ; son cri fait « liou-liou » et elle sait repousser le malheur. Or la bête qui chasse le malheur court droit vers lui. Comme on dit : au premier cri, elle accourt, sans demander si le présage est heureux ou funeste.", ar: "«الكلب السماوي» — في «كتاب الجبال والبحار»، فصل «الجبال الغربية الثالث»: في جبل ينشان وحش على شكل قطّ بريّ برأس أبيض، اسمه «الكلب السماوي»، وصوته كصوت «ليو ليو»، وبه يُتَّقى الشر. ووحش يدفع الشر كثيرًا ما يقصد مواضع الشر. وكما يقال: يذهب حيث يسمع الصوت، ولا يسأل أهو خير أم شر." } , translations: ["en", "ja", "fr", "ar"] },
      { num: 12, name: "凰", title: { zh: "第十二章 凰", ja: "第十二章　凰", en: "Chapter Twelve: Huang", fr: "Chapitre douze : Le Phénix", ar: "الفصل الثاني عشر: العنقاء" }, bio: { en: "“Huang” — the female phoenix. In the Classic of Mountains and Seas, the phoenixes sing and dance of their own accord; they roost on nothing but the wutong tree and drink from nothing but sweet springs. From then on, the wutong tree was no longer just a wutong tree.", zh: "“凰”——《山海经》里凤鸾自歌自舞，非梧桐不栖，非醴泉不饮，自此后，梧桐便不是梧桐。", ja: "「凰（おう）」――『山海経』に、鳳鸞は自ら歌い自ら舞い、梧桐にあらざれば棲まず、醴泉にあらざれば飲まず。それ以来、梧桐は梧桐ではなくなった。", fr: "« Le Phénix » — dans le Classique des montagnes et des mers, l’oiseau fenghuang chante et danse de lui-même ; il ne se pose que sur le parasol de Chine et ne boit qu’à la source de vin doux. Aussi, depuis qu’il s’est posé une fois, plus un arbre ne porte le même nom. Ce qui a connu l’oiseau ne se contente plus de ce qu’il possède.", ar: "«العنقاء» — في «كتاب الجبال والبحار» تغنّي طائر الفينيق وترقص وحده، ولا يحطّ إلا على شجرة الووتونغ، ولا يشرب إلا من نبع عذب. ومنذ ذلك الحين لم تعد شجرة الووتونغ شجرة كسائر الشجر. والعصفور الذي صدّق أنه وجد غصنًا يأويه، نسِيَ أن الغصن لا يسأل من يحطّ عليه." } , translations: ["en", "ja", "fr", "ar"] },
      { num: 13, name: "蜚", title: { zh: "第十三章 蜚", en: "Chapter Thirteen: Fei", fr: "Chapitre treize : Fei", ar: "الفصل الثالث عشر: فِي" }, bio: { en: "“Fei” — In the Classic of Mountains and Seas (“Eastern Mountains, Book Four”): shaped like an ox with a white head, one eye and a snake’s tail; when it walks through water the water dries up, when it walks through grass the grass dies, and when it appears, a great plague sweeps the land. As the saying goes: wherever it treads, all withers — and no one yet knows it is the plague.", zh: "“蜚”——《山海经·东次四经》里，状如牛而白首，一目蛇尾，行水则竭，行草则死，见则天下大疫。正所谓行处皆枯，人未觉疫。", fr: "« Fei » — dans le Classique des montagnes et des mers, quatrième section des montagnes de l’Est, cette bête a un corps de buffle, une tête blanche, un seul œil et une queue de serpent ; là où elle passe, l’eau se tarit et l’herbe meurt, et qui la voit annonce une grande épidémie. Comme on dit : tout sèche sur son passage, et personne ne sent le mal.", ar: "«فِي» — في «كتاب الجبال والبحار» حيوان على هيئة ثور، أبيض الرأس، له عين واحدة وذيل كذيل الأفعى؛ إذا مرّ على الماء جفّ، وإذا مرّ على العشب مات، ومن رآه عمّ الوباء البلاد. حيث يمشي يجفّ كل شيء، والناس لا يشعرون بالوباء." } , translations: ["en", "fr", "ar"] },
      { num: 14, name: "狰", title: { zh: "第十四章 狰", en: "Chapter Fourteen: Zheng", fr: "Chapitre quatorze : Zheng", ar: "الفصل الرابع عشر: تشنغ" }, bio: { en: "“Zheng” — In the Classic of Mountains and Seas (“Western Mountains, Book Three”), on Mount Zhang’e there is a beast shaped like a red leopard, with five tails and a single horn, whose cry sounds like stone striking stone. As the saying goes: five tails on one body — one horn charging alone.", zh: "“狰”——《山海经·西次三经》里，章峨之山有兽，状如赤豹，五尾一角，其音如击石。正所谓五尾一身，一角独抵。", fr: "« Zheng » — dans le Classique des montagnes et des mers, troisième section des montagnes de l’Ouest, il est sur le mont Zhang’e une bête qui a l’apparence d’un léopard rouge, cinq queues et une seule corne ; son cri sonne comme des pierres que l’on frappe. Comme on dit : cinq queues sur un seul corps, une corne pour tenir tête à tout.", ar: "«تشنغ» — في «كتاب الجبال والبحار»، قسم الجبال الغربية، في جبل تشانغأه وحش على هيئة نمر أحمر، له خمسة أذناب وقرن واحد، وصوته كصوت ضرب الحجر. وكما يقال: خمسة أذناب لجسد واحد، وقرن واحد يقف به وحده. فليس كل من فقد أذنابه فقد قرنه." } , translations: ["en", "fr", "ar"] },
      { num: 15, name: "朱厌", title: { zh: "第十五章 朱厌", en: "Chapter Fifteen: Zhuyan", fr: "Chapitre quinze : Zhu Yan", ar: "الفصل الخامس عشر: تشو يان" }, bio: { en: "“Zhuyan” — In the Classic of Mountains and Seas (“Western Mountains, Book Two”), on Mount Xiaoci there is a beast shaped like an ape, with a white head and red feet; when it appears, war will follow. As the saying goes: white head, red feet — war begins with words.", zh: "“朱厌”——《山海经·西次二经》里，小次之山有兽，状如猿而白首赤足，见则大兵。正所谓白首赤足，兵起于辞。", fr: "« Zhu Yan » — dans le Classique des montagnes et des mers, deuxième section des montagnes de l’Ouest, il est sur le mont Xiaoce une bête qui a l’apparence d’un singe, la tête blanche et les pieds rouges ; paraît-elle, et c’est la grande guerre. Comme on dit : tête blanche, pieds rouges — la guerre naît des mots.", ar: "«تشو يان» — في «كتاب الجبال والبحار»، قسم الجبال الغربية الثاني: في جبل شياوتسه وحش على هيئة قرد، أبيض الرأس أحمر القدمين، ومن رآه قامت حرب كبيرة. وكما يقال: أبيض الرأس أحمر القدمين، والحرب تُشعلها كلمة." } , translations: ["en", "fr", "ar"] },
      { num: 16, name: "祸斗", title: { zh: "第十六章 祸斗", en: "Chapter Sixteen: Huodou", fr: "Chapitre seize : Huo Dou", ar: "الفصل السادس عشر: هوو دوو" }, bio: { en: "“Huodou” — the fire-eating beast of old. Wherever it passes, fire springs up from within, and it burns down even the house that shelters it. As the saying goes: whoever feeds on fire is in the end fed to the fire.", zh: "“祸斗”——古之食火兽，所过之处火自内生，连栖身的屋也一并烧尽。正所谓食火者，终为火食。", fr: "« Huo Dou » — une bête ancienne qui se nourrit de feu ; partout où elle passe, le feu naît de l’intérieur, et la maison même qui l’abrite brûle avec elle. Comme on dit : qui se nourrit de feu finit par être mangé par le feu.", ar: "«هوو دوو» — وحش قديم يأكل النار؛ حيث حلّ اشتعلت النار من داخله، حتى البيت الذي يسكنه احترق معه. وكما يقال: من أكل النار، أكلته النار في النهاية." } , translations: ["en", "fr", "ar"] },
      { num: 17, name: "英招", title: { zh: "第十七章 英招", en: "Chapter Seventeen: Yingzhao", fr: "Chapitre dix-sept : Ying Zhao", ar: "الفصل السابع عشر: ينغ تشاو" }, bio: { en: "“Yingzhao” — In the Classic of Mountains and Seas (“Western Mountains, Book Three”), the god Yingzhao presides over Mount Huaijiang: a horse’s body and a human face, tiger stripes and bird’s wings. He patrols the four seas and tends the Celestial Emperor’s level garden. As the saying goes: he who keeps the garden must first keep to his bounds.", zh: "“英招”——《山海经·西次三经》里，槐江之山，神英招司之，马身人面，虎文鸟翼，徇于四海，司帝之平圃。正所谓守圃者，先守分寸。", fr: "« Ying Zhao » — dans le Classique des montagnes et des mers, à la troisième section du livre de l’Ouest, sur la montagne de Huaijiang, le dieu Ying Zhao monte la garde : corps de cheval, visage humain, rayures de tigre, ailes d’oiseau ; il parcourt les quatre mers et veille sur le jardin du souverain. Comme on dit : qui garde le jardin commence par garder la mesure.", ar: "«ينغ تشاو» — في «كتاب الجبال والبحار»، جبل هواي جيانغ يحرسه الإله ينغ تشاو: جسم فرس ووجه إنسان، وخطوط نمر وأجنحة طائر، يجوب البحار الأربعة، ويتولّى حديقة الإمبراطور. وكما يقال: من يحرس الحديقة، يحرس حدوده قبل كل شيء." } , translations: ["en", "fr", "ar"] },
      { num: 18, name: "重明鸟", title: { zh: "第十八章 重明鸟", en: "Chapter Eighteen: Chongming Bird", fr: "Chapitre dix-huit : L’Oiseau Chongming", ar: "الفصل الثامن عشر: طائر تشونغ مينغ" }, bio: { en: "“Chongming Bird” — an auspicious bird of old with two pupils in each eye; it can drive off fierce beasts, and its light shines like a candle. As the saying goes: double pupils can see far, yet find it hard to see into one’s own heart.", zh: "“重明鸟”——古之瑞鸟，目有双瞳，能搏逐猛兽，光照明烛。正所谓重瞳能视远，难视己心。", fr: "« L’Oiseau Chongming » — un oiseau de bon augure des temps anciens ; chaque œil porte deux pupilles, il combat les bêtes sauvages et sa lumière éclaire comme une torche. Comme on dit : deux pupilles voient loin, mais un homme ne voit pas son propre cœur.", ar: "«طائر تشونغ مينغ» — طائر مبارك في الأساطير الصينية القديمة، في كل عين من عينيه حدقتان. يهاجم الوحوش المفترسة ويطردها، وضوء عينيه يضيء ما حوله كالمشعل. وكما يقال: ذو الحدقتين يرى البعيد، ولا يرى ما في قلبه." } , translations: ["en", "fr", "ar"] },
      { num: 19, name: "当康", title: { zh: "第十九章 当康", en: "Chapter Nineteen: Dangkang", fr: "Chapitre dix-neuf : Dang Kang", ar: "الفصل التاسع عشر: دانغ كانغ" }, bio: { en: "“Dangkang” — In the Classic of Mountains and Seas (“Eastern Mountains, Book Four”), on Mount Qin there is a beast shaped like a pig with tusks, called the dangkang; it cries out its own name, and when it appears, the whole land has a bumper harvest. As the saying goes: when it appears, the harvest is great — but even in a good year, someone has to till the fields.", zh: "“当康”——《山海经·东次四经》里，钦山有兽，状如豚而有牙，其名曰当康，其鸣自叫，见则天下大穰。正所谓见则大穰，丰年亦需人耕。", fr: "« Dang Kang » — dans le Classique des montagnes et des mers, au quatrième livre de la section de l’Est, une bête vit sur le mont Qin : elle a la forme d’un porcelet et porte des défenses ; on l’appelle Dang Kang, et son cri est son propre nom. Là où elle paraît, la terre entière fait une grande récolte. Comme on dit : l’abondance vient, mais il faut encore un homme pour labourer.", ar: "«دانغ كانغ» — في «كتاب الجبال والبحار»، قسم الجبال الشرقية الرابع: في جبل تشين حيوان على هيئة خنزير صغير له أنياب، اسمه دانغ كانغ، يصيح باسمه، ومن رآه عمّ الخير البلاد. وكما يقال: من رآه أتت سنة الخير، لكن سنة الخير تحتاج من يحرثها." } , translations: ["en", "fr", "ar"] },
      { num: 20, name: "夫诸", title: { zh: "第二十章 夫诸", en: "Chapter Twenty: Fuzhu", fr: "Chapitre vingt : Fuzhu", ar: "الفصل العشرون: فوتشو" }, bio: { en: "“Fuzhu” — In the Classic of Mountains and Seas (“Central Mountains, Book Three”), on Mount Ao’an there is a beast shaped like a white deer with four antlers, called the fuzhu; when it appears, its town is flooded. As the saying goes: a white deer with four antlers — the flood is already on its way before anyone sees it.", zh: "“夫诸”——《山海经·中次三经》里，敖岸之山有兽，状如白鹿而四角，名曰夫诸，见则其邑大水。正所谓白鹿四角，水在未见时。", fr: "« Fuzhu » — dans le Classique des montagnes et des mers, au mont Ao’an, vit une bête qui ressemble à un cerf blanc, mais porte quatre cornes ; on l’appelle Fuzhu, et dès qu’elle paraît, la ville est sous les eaux. Comme on dit : un cerf blanc à quatre cornes, et l’eau qui monte avant même qu’on la voie.", ar: "«فوتشو» — في «كتاب الجبال والبحار»، في القسم الثالث من «جبال الوسطى»: في جبل آوآن حيوان على هيئة أيل أبيض ذي أربعة قرون، اسمه فوتشو، ومن ظهر غرقت بلدته بالماء. أيل أبيض بأربعة قرون، والماء يأتي وهو لا يُرى. وكما يقال: الماء الذي لا يُرى قبل وقوعه هو الذي يغرق." } , translations: ["en", "fr", "ar"] },
      { num: 21, name: "陵鱼", title: { zh: "第二十一章 陵鱼", en: "Chapter Twenty-One: Lingyu", fr: "Chapitre vingt et un : Le Poisson Ling", ar: "الفصل الحادي والعشرون: سمكة لينغ" }, bio: { en: "“Lingyu” — In the Classic of Mountains and Seas (“Northern Lands Within the Seas”), the lingyu has a human face, hands and feet, and a fish’s body, and lives in the sea. Half on the shore, half in the water, it can stand on either side. As the saying goes: a human face on a fish’s body — at home in both places.", zh: "“陵鱼”——《山海经·海内北经》里，陵鱼人面、手足、鱼身，在海中。一半在岸上，一半在水里，两边都站得住。正所谓人面鱼身，两处皆可栖。", fr: "« Le Poisson Ling » — dans le Classique des montagnes et des mers, à la section des mers intérieures du Nord, le poisson Ling a un visage humain, des mains, des pieds et un corps de poisson ; il vit dans la mer. La moitié de lui reste sur la rive, l’autre dans l’eau, et il tient bon des deux côtés. Comme on dit : visage d’homme et corps de poisson, on peut habiter aux deux endroits.", ar: "«سمكة لينغ» — في «كتاب الجبال والبحار»، في فصل البحار الداخلية الشمالية: سمكة لينغ بوجه إنسان ويدين ورجلين وجسد سمكة، في البحر. نصفها على الشاطئ ونصفها في الماء، وتثبت في الحالين. وكما يقال: وجه إنسان وجسد سمكة، ولها في الموضعين مقام." } , translations: ["en", "fr", "ar"] },
      { num: 22, name: "肥遗", title: { zh: "第二十二章 肥遗", en: "Chapter Twenty-Two: Feiyi", fr: "Chapitre vingt-deux : Fei Yi", ar: "الفصل الثاني والعشرون: فِي يي" }, bio: { en: "“Feiyi” — In the Classic of Mountains and Seas (“Northern Mountains”), on Mount Hunxi there is a snake with one head and two bodies, called the feiyi; when it appears, its land suffers great drought. As the saying goes: one head, two bodies — in the end they go one way.", zh: "“肥遗”——《山海经·北山经》里，浑夕之山有蛇，一首两身，名曰肥遗，见则其国大旱。正所谓一首两身，终归一途。", fr: "« Fei Yi » — dans le « Classique des montagnes et des mers », au livre des montagnes du Nord, la montagne de Hunxi abrite un serpent à une tête et deux corps, appelé Fei Yi ; dès qu’il paraît, le pays souffre d’une grande sécheresse. Une seule tête, deux corps, et pourtant un seul chemin.", ar: "«فِي يي» — في «كتاب الجبال والبحار»، في فصل جبال الشمال، جبل هونتشي: فيه أفعى برأس واحد وجسدين، تُسمّى فِي يي، ومن رآها أصاب القحط بلاده. رأس واحد وجسدان، ولا يبلغان في النهاية إلا طريقًا واحدًا. وكما يقال: جسدان لرأس واحد، ومصيرهما واحد." } , translations: ["en", "fr", "ar"] },
      { num: 23, name: "鹿蜀", title: { zh: "第二十三章 鹿蜀", en: "Chapter Twenty-Three: Lushu", fr: "Chapitre vingt-trois : Lu Shu", ar: "الفصل الثالث والعشرون: لو شو" }, bio: { en: "“Lushu” — In the Classic of Mountains and Seas (“Southern Mountains”), on Mount Niuyang there is a beast shaped like a horse with a white head, a red tail and tiger stripes; its call is like singing, and whoever wears its pelt will be blessed with descendants. As the saying goes: wear it and be blessed with children — see it and start to wonder.", zh: "“鹿蜀”——《山海经·南山经》里，杻阳之山有兽，状如马而白首，赤尾虎文，其音如谣，佩之宜子孙。正所谓佩之宜子孙，见之宜生疑。", fr: "« Lu Shu » — dans le « Classique des montagnes et des mers », au livre des montagnes du Sud, la montagne de Niuyang abrite une bête qui ressemble à un cheval, à tête blanche, à queue rouge et au pelage rayé comme celui du tigre ; son cri ressemble à une chanson. La porter sur soi favorise la descendance. Bonne pour les descendants, propre à faire naître le doute.", ar: "«لو شو» — في «كتاب الجبال والبحار»، في فصل جبال الجنوب، جبل نيويانغ: فيه دابة على هيئة الفرس، بيضاء الرأس، حمراء الذنب، عليها خطوط النمر، وصوتها كالغناء، ومن حملها نُسِئ له في ذريّته. وكما يقال: من حمله نُسِئ له في عقبه، ومن رآه وُلد له الشكّ." } , translations: ["en", "fr", "ar"] },
      { num: 24, name: "赢鱼", title: { zh: "第二十四章 赢鱼", en: "Chapter Twenty-Four: Yingyu", fr: "Chapitre vingt-quatre : Le Poisson Ying", ar: "الفصل الرابع والعشرون: سمكة ينغ" }, bio: { en: "“Yingyu” — In the Classic of Mountains and Seas (“Western Mountains, Book Four”), the Meng River on Mount Gui is full of yingyu, fish with the bodies of fish and the wings of birds, whose cry is like a mandarin duck’s; when they appear, their town is flooded. Two teams, both from the same old crew. As the saying goes: swimming in the same water, flying on separate wings.", zh: "“赢鱼”——《山海经·西次四经》里，邽山蒙水中多嬴鱼，鱼身而鸟翼，音如鸳鸯，见则其邑大水。两班人马，昔日旧部。正所谓同水而游，分翼而飞。", fr: "« Le Poisson Ying » — dans le Classique des montagnes et des mers, sur le mont Gui, les eaux de la rivière Meng étaient pleines de poissons ying : un corps de poisson, des ailes d’oiseau, un cri de canard mandarin. Dès qu’il paraît, la ville est sous les eaux. Deux équipes, les mêmes anciens compagnons : ils nageaient dans la même eau, puis ils ont déployé leurs ailes chacun de son côté.", ar: "«سمكة ينغ» — في «كتاب الجبال والبحار»: في جبل غُوي ونهر مِنغ تكثر سمكة تُسمى ينغ، جسمها جسم سمكة وجناحاها كجناحي طائر، وصوتها كصوت بطة الماء، وإن ظهرت فذلك نذير ماء يغمر البلدة. وكما يقال: سبحوا في ماء واحد، فلما ارتفع المدّ افترقوا على جناحين، وطار كلٌّ إلى شاطئ." } , translations: ["en", "fr", "ar"] },
      { num: 25, name: "患", title: { zh: "第二十五章 患", en: "Chapter Twenty-Five: Huan", fr: "Chapitre vingt-cinq : Huan", ar: "الفصل الخامس والعشرون: هوان" }, bio: { en: "“Huan” — In ancient times the word named a beast, and it also names worry and trouble. Trouble is born in the heart; it does not come from outside. As the saying goes: the one in the thick of it suspects nothing; the onlooker already sees it all.", zh: "“患”——古以名兽，亦以名忧，患生于心，不自外来。正所谓当事者不疑，旁观者已明。", fr: "« Huan » — les anciens donnaient ce nom à une bête, et aussi au tourment : le malheur naît du cœur, il ne vient pas du dehors. Comme on dit : celui qui est dans l’affaire ne doute de rien, le spectateur a déjà tout vu.", ar: "«هوان» — اسمٌ لحيوان في القديم، واسمٌ للهمّ أيضًا؛ فالهمّ ينبت في القلب ولا يأتي من الخارج. وكما يقال: صاحب الأمر لا يرتاب، والواقف إلى جانبه يرى بوضوح." } , translations: ["en", "fr", "ar"] },
      { num: 26, name: "毕方", title: { zh: "第二十六章 毕方", en: "Chapter Twenty-Six: Bifang", fr: "Chapitre vingt-six : Bifang", ar: "الفصل السادس والعشرون: بيفانغ" }, bio: { en: "“Bifang” — In the Classic of Mountains and Seas (“Western Mountains, Book Three”), on Mount Zhang’e there is a bird shaped like a crane, with one foot, red markings on a blue-green body and a white beak; it cries out its own name, and when it appears, strange fires break out in its town. As the saying goes: the one-footed bird lands without a sound.", zh: "“毕方”——《山海经·西次三经》里，章峨之山有鸟，状如鹤，一足，赤文青质而白喙，其鸣自叫，见则其邑有讹火。正所谓一足之鸟，落地无声。", fr: "« Bifang » — dans le Classique des montagnes et des mers, à la troisième section des monts de l’Ouest, il est sur le mont Zhang’e un oiseau pareil à une grue, qui n’a qu’une patte ; le plumage est rouge sur un corps bleu-vert, le bec blanc ; il lance son propre nom comme un cri, et quand il paraît, la contrée est frappée par un feu suspect. Comme on dit : oiseau à une patte, nul bruit quand il se pose.", ar: "«بيفانغ» — في «كتاب الجبال والبحار»، في القسم الثالث من «جبال الغرب»: في جبل تشانغآه طائر على هيئة كركي، بقدم واحدة، أحمر النقوش، أخضر الجسم، أبيض المنقار، يصدح باسمه، ومن ظهر ظهرت في بلدته نيران غريبة. وكما يقال: طائر بقدم واحدة، لا يُسمع له وقع حين يهبط." } , translations: ["en", "fr", "ar"] },
      { num: 27, name: "陆吾", title: { zh: "第二十七章 陆吾", en: "Chapter Twenty-Seven: Luwu", fr: "Chapitre vingt-sept : Lu Wu", ar: "الفصل السابع والعشرون: لو وو" }, bio: { en: "“Luwu” — In the Classic of Mountains and Seas (“Western Mountains, Book Three”), the Mound of Kunlun is presided over by the god Luwu, who has a tiger’s body and nine tails, a human face and a tiger’s claws, and governs the nine regions of heaven and the seasons of the Lord’s gardens. As the saying goes: the one who keeps the gate is the first to answer to it.", zh: "“陆吾”——《山海经·西次三经》里，昆仑之丘，神陆吾司之，虎身九尾，人面虎爪，司天之九部及帝之囿时。正所谓守门者，先受其门。", fr: "« Lu Wu » — dans le Classique des montagnes et des mers, au troisième classique des montagnes de l’Ouest, le dieu Lu Wu veille sur la colline de Kunlun. Corps de tigre, neuf queues, visage humain, griffes de tigre : il gouverne les neuf régions du ciel et les parcs de l’Empereur. Comme on dit : celui qui garde la porte est le premier frappé.", ar: "«لو وو» — في «كتاب الجبال والبحار»، في القسم الثالث من «جبال الغرب»: على تلّ كونلون يقيم الإله لو وو، بجسم نمر وتسعة أذناب، ووجه إنسان ومخالب نمر، يتولّى أقسام السماء التسعة وأوقات حديقة الإمبراطور. حارسٌ على الباب لا يغيب عنه شيء. وكما يقال: من يحرس الباب هو أول من يُفتَّش عنده." } , translations: ["en", "fr", "ar"] },
      { num: 28, name: "九尾", title: { zh: "第二十八章 九尾", en: "Chapter Twenty-Eight: Jiuwei", fr: "Chapitre vingt-huit : Le Renard à neuf queues", ar: "الفصل الثامن والعشرون: الثعلب ذو الأذناب التسعة" }, bio: { en: "“Jiuwei” — In the Classic of Mountains and Seas (“Southern Mountains”), on Mount Qingqiu there is a beast shaped like a fox with nine tails; its cry is like a baby’s, and whoever eats it cannot be bewitched. As the saying goes: the more tails, the more paths; the more paths, the harder to tell which is which.", zh: "“九尾”——《山海经·南山经》里，青丘之山有兽，状如狐而九尾，其音如婴儿，食者不蛊。正所谓尾多则路多，路多则难辨。", fr: "« Le Renard à neuf queues » — dans le « Classique des montagnes et des mers », au chapitre des montagnes du Sud, la montagne de Qingqiu abrite une bête qui ressemble au renard et porte neuf queues ; son cri est celui d’un enfant, et qui la mange échappe aux poisons. Plus les queues sont nombreuses, plus les chemins le sont aussi ; et plus il y a de chemins, plus il est difficile de choisir.", ar: "«الثعلب ذو الأذناب التسعة» — في «كتاب الجبال والبحار»، في «جبال الجنوب»: في جبل تشينغتشيو حيوان على هيئة ثعلب له تسعة أذناب، وصوته كصوت طفل، ومن أكل منه لم تصبه السموم. وكما يقال: من كثرت أذنابه كثرت طرقه، ومن كثرت طرقه عزّ عليه أن يميّز بينها." } , translations: ["en", "fr", "ar"] },
      { num: 29, name: "猰貐", title: { zh: "第二十九章 猰貐", en: "Chapter Twenty-Nine: Yayu", fr: "Chapitre vingt-neuf : Yayu", ar: "الفصل التاسع والعشرون: ياويو" }, bio: { en: "“Yayu” — In the Classic of Mountains and Seas (“Western Lands Within the Seas”), the yayu has a snake’s body and a human face; it was killed by the minister of Erfu. As the saying goes: the old body is dead, and a new face is only now being born.", zh: "“猰貐”——《山海经·海内西经》里，蛇身人面，为贰负之臣所杀。正所谓旧身已死，新面方生。", fr: "« Yayu » — dans le « Classique des montagnes et des mers », au chapitre des mers de l’Ouest intérieures, il a un corps de serpent et un visage d’homme ; il est tué par le serviteur d’Erfu. Le vieux corps est mort, le nouveau visage vient de naître.", ar: "«ياويو» — في «كتاب الجبال والبحار»، في «القسم الغربي من البحار الداخلية»: جسد أفعى ووجه إنسان، قتله أحد أتباع إر فو. وكما يقال: الجسد القديم قد مات، والوجه الجديد قد وُلد." } , translations: ["en", "fr", "ar"] },
      { num: 30, name: "诸怀", title: { zh: "第三十章 诸怀", en: "Chapter Thirty: Zhuhuai", fr: "Chapitre trente : Zhu Huai", ar: "الفصل الثلاثون: تشو هواي" }, bio: { en: "“Zhuhuai” — In the Classic of Mountains and Seas (“Northern Mountains”), on Mount Beiyue there is a beast shaped like an ox with four horns, human eyes and a pig’s ears; its cry is like a wild goose’s, and it eats people. As the saying goes: four horns facing one another, each pointing its own way.", zh: "“诸怀”——《山海经·北山经》里，北岳之山有兽，状如牛而四角、人目、彘耳，其音如鸣雁，是食人。正所谓四角相对，各有其向。", fr: "« Zhu Huai » — dans le « Classique des montagnes et des mers », au chapitre des Montagnes du Nord, le mont Beiyue abrite une bête qui ressemble à un bœuf, avec quatre cornes, des yeux d’homme et des oreilles de porc ; son cri est celui de l’oie sauvage, et elle dévore les hommes. Quatre cornes face à face, chacune pointée de son côté.", ar: "«تشو هواي» — في «كتاب الجبال والبحار»، في قسم «جبال الشمال»: في جبل بايويَه حيوان على هيئة ثور له أربعة قرون، وعينان كعيني إنسان، وأذنان كأذني خنزير، وصوته كصياح الإوز، وهو يأكل الناس. ثور بأربعة قرون، لكل قرن وجهة. وكما يقال: القرون الأربعة تتقابل، ولكل منها وجهتها." } , translations: ["en", "fr", "ar"] },
      { num: 31, name: "妺", title: { zh: "第三十一章 妺", en: "Chapter Thirty-One: Mo", fr: "Chapitre trente et un : Mo", ar: "الفصل الحادي والثلاثون: مو" }, bio: { en: "“Mo” — The character joins the radical for “woman” to the graph for “end”; it means the tip, the very end. As the saying goes: where it is stillest, things hang most in the balance.", zh: "“妺”——字从女从未，末也，尽也。正所谓最静处，最悬。", fr: "« Mo » — un caractère bâti sur la femme et sur la fin : ce qui est au terme, ce qui s’épuise. Une eau si lisse qu’on n’y voit plus le fond. Comme on dit : c’est au point le plus immobile que tout reste en suspens.", ar: "«مو» — في الرسم الصيني القديم تُكتب بجزأين: «المرأة» و«النهاية»؛ فهي المرأة التي جاءت في الآخر، آخر كل شيء. امرأة شابة ذات وجه هادئ لا يفضح ما تحته شيئًا. وكما يقال: أهدأ المواضع أشدّها تعليقًا على حافة الهاوية." } , translations: ["en", "fr", "ar"] },
      { num: 32, name: "精卫", title: { zh: "第三十二章 精卫", en: "Chapter Thirty-Two: Jingwei", fr: "Chapitre trente-deux : Jingwei", ar: "الفصل الثاني والثلاثون: جينغوي" }, bio: { en: "“Jingwei” — In the Classic of Mountains and Seas (“Northern Mountains”), the youngest daughter of the Flame Emperor drowned in the Eastern Sea and became a bird with a patterned head, a white beak and red feet, which forever carries wood and stones from the Western Mountains to fill up the Eastern Sea. As the saying goes: one stone, one grain at a time — the sea so deep you never see the shallows.", zh: "“精卫”——《山海经·北山经》里，炎帝少女溺于东海，化为鸟，文首白喙赤足，常衔西山之木石以堙于东海。正所谓一石一粒，深不见浅。", fr: "« Jingwei » — dans le « Classique des montagnes et des mers », la fille de l’Empereur Yan se noie dans la mer de l’Est et devient un oiseau à tête rayée, bec blanc et pattes rouges ; sans relâche, elle rapporte des branches et des pierres des montagnes de l’Ouest pour combler la mer. Comme on dit : une pierre, un grain, et l’on ne voit jamais le fond.", ar: "«جينغوي» — في «كتاب الجبال والبحار»، قسم «جبال الشمال»: ابنة الإمبراطور يان تغرق في البحر الشرقي، فتتحوّل طائرًا برأس مخطّط ومنقار أبيض وقدمين حمراوين، يظلّ يحمل حجرًا وخشبًا من الجبال الغربية ليردم به البحر الشرقي. حجر بعد حجر، وحبّة بعد حبّة، والبحر لا يُرى قاعه." } , translations: ["en", "fr", "ar"] },
      { num: 33, name: "茈鱼", title: { zh: "第三十三章 茈鱼", en: "Chapter Thirty-Three: Ziyu", fr: "Chapitre trente-trois : Le Poisson pourpre", ar: "الفصل الثالث والثلاثون: السمكة الأرجوانية" }, bio: { en: "“Ziyu” — In the Classic of Mountains and Seas (“Eastern Mountains”), the Ci River is full of ziyu, shaped like crucian carp, each with one head and ten bodies. As the saying goes: one head and ten bodies — every matter has to be handled on its own.", zh: "“茈鱼”——《山海经·东山经》里，泚水中多茈鱼，状如鲋，一首而十身。正所谓一首十身，事必分头。", fr: "« Le Poisson pourpre » — dans le « Classique des montagnes et des mers », section des Montagnes de l’Est, la rivière Ci est pleine de poissons pourpres : ils ont la forme du carassin, une seule tête et dix corps. Comme on dit : une tête, dix corps, et le travail se divise en autant de fronts.", ar: "«السمكة الأرجوانية» — في «كتاب الجبال والبحار»، قسم «جبال الشرق»: في نهر تسي تكثر السمكة الأرجوانية، على هيئة سمكة الكارب، لها رأس واحد وعشرة أجساد. رأس واحد وعشرة أجساد، فما من شأن إلا ويتفرّع على رؤوس كثيرة." } , translations: ["en", "fr", "ar"] },
      { num: 34, name: "狡", title: { zh: "第三十四章 狡", en: "Chapter Thirty-Four: Jiao", fr: "Chapitre trente-quatre : Jiao", ar: "الفصل الرابع والثلاثون: جياو" }, bio: { en: "“Jiao” — In the Classic of Mountains and Seas (“Western Mountains, Book Three”), on Jade Mountain there is a beast shaped like a dog, with a leopard’s spots and horns like an ox’s, called the jiao; its cry is like a barking dog, and when it appears, the land has a great harvest. As the saying goes: a dog that grows horns looks docile, but in truth it’s hard to tame.", zh: "“狡”——《山海经·西次三经》里，玉山有兽，状如犬而豹文，其角如牛，名曰狡，其音如吠犬，见则其国大穰。正所谓犬而生角，看似温顺，实则难驯。", fr: "« Jiao » — dans le « Classique des montagnes et des mers », section des Trois monts de l’Ouest, le mont Yu abrite une bête qui ressemble à un chien, porte des rayures de léopard et des cornes de bœuf ; on l’appelle Jiao, son cri est celui d’un chien qui aboie, et son apparition annonce une grande année de récoltes. Un chien à cornes : l’air docile, et rien de plus difficile à apprivoiser.", ar: "«جياو» — في «كتاب الجبال والبحار»، القسم الثالث من «جبال الغرب»: في جبل اليشم حيوان على هيئة كلب ذي نمرة، وقرنه كقرن ثور، اسمه جياو، وصوته كنبح الكلب، ومن ظهر في بلده عمّ الخير الوفير. كلب أنبت قرنًا، يبدو أليفًا، وهو في الحقيقة عصيّ على الترويض. وكما يقال: الوداعة الظاهرة قد تكون أقسى ما يُروَّض." } , translations: ["en", "fr", "ar"] },
      { num: 35, name: "蜮", title: { zh: "第三十五章 蜮", en: "Chapter Thirty-Five: Yu", fr: "Chapitre trente-cinq : Yu", ar: "الفصل الخامس والثلاثون: يو" }, bio: { en: "“Yu” — An ancient legend tells of a creature in the water that holds sand in its mouth and spits it at people’s shadows; those it strikes never know where the blow came from, they only feel the pain. As the saying goes: the one struck through his shadow never sees the shape of what struck him.", zh: "“蜮”——古传水中之虫，含沙射影，中者不知从何处来，但觉痛。正所谓影中者，不见其形。", fr: "« Yu » — créature des eaux dans les récits anciens, elle projette du sable sur l’ombre des passants ; la victime ne sait pas d’où vient le coup, elle sent seulement la douleur. On ne voit jamais la forme de ce qui frappe une ombre.", ar: "«يو» — قيل في القديم إنه دود يسكن الماء، يحمل الرمل ويرميه على الظلّ، فمن أُصيب لا يدري من أين جاءه، ولا يحسّ إلا الألم. دود في الماء، يصيب الظلّ ولا يُرى. وكما يقال: ما يصيبك من حيث لا ترى شكله." } , translations: ["en", "fr", "ar"] },
      { num: 36, name: "赤鱬", title: { zh: "第三十六章 赤鱬", en: "Chapter Thirty-Six: Chiru", fr: "Chapitre trente-six : Le Poisson Ru rouge", ar: "الفصل السادس والثلاثون: سمكة رو الحمراء" }, bio: { en: "“Chiru” — In the Classic of Mountains and Seas (“Southern Mountains”), the Ying River near Mount Qingqiu brings forth the chiru, shaped like a fish but with a human face, its cry like a mandarin duck’s; whoever eats its flesh will never get scabies. A human face on a fish’s body, a voice like a mandarin duck — out of the Ying River it comes, to play among people.", zh: "“赤鱬”——《山海经·南山经》里，青丘之山附近的英水出赤鱬，形状像鱼，却长着人的脸，叫声像鸳鸯。吃了它的肉可以不生疥疮。人面鱼身，音如鸳鸯，出于英水，游戏人间。", fr: "« Le Poisson Ru rouge » — dans le Classique des montagnes et des mers, section « Monts du Sud », la rivière Ying, au pied du mont Qingqiu, abrite le poisson Ru : un corps de poisson, un visage d’homme, et un cri qui ressemble à celui du canard mandarin. Qui mange de sa chair ne souffre plus de gale. Un visage d’homme sur un corps qui n’est pas le sien : il suffit de s’approcher pour ne plus savoir à qui l’on parle.", ar: "«سمكة رو الحمراء» — في «كتاب الجبال والبحار»، قسم «جبال الجنوب»: يخرج نهر ينغ عند جبل تشينغتشيو، وفيه سمكة اسمها رو، على هيئة السمك ولها وجه إنسان، وصوتها كصوت بطة المندرين. ومن أكل لحمها لم تصبه الجرب؛ هكذا وصفها الكتاب. وجه إنسان على جسم سمكة: قريب إلى حدّ أن تُرى ملامحه، وبعيد إلى حدّ ألّا يُمسّ." } , translations: ["en", "fr", "ar"] },
      { num: 37, name: "并封", title: { zh: "第三十七章 并封", en: "Chapter Thirty-Seven: Bingfeng", fr: "Chapitre trente-sept : Bingfeng", ar: "الفصل السابع والثلاثون: بينغفنغ" }, bio: { en: "“Bingfeng” — In the Classic of Mountains and Seas (“Western Lands Beyond the Seas”), the bingfeng lives east of Wuxian; it is shaped like a pig, with a head at both front and back, and it is black. Two heads, one in front and one behind, on the same body: one wants to go east, the other west; neither can overpower the other, and neither can leave the other. As the saying goes: two heads on one body, growing in opposite directions — you say a line and I answer it, neither gives way, neither gives in; evenly matched at the chessboard, a general meeting a worthy foe.", zh: "“并封”——《山海经·海外西经》里，并封在巫咸东，其状如彘，前后皆有首，黑。两个头，一前一后，长在同一个身子上，一个要往东，一个要往西，谁也压不过谁，谁也离不开谁。正所谓双头共身，反向而生，你问一句我接一句，谁也不让，谁也不服，棋逢对手，将遇良才。", fr: "« Bingfeng » — dans le « Classique des montagnes et des mers », section des contrées de l’Ouest, il vit à l’est de Wu Xian : il a la forme d’un porc, une tête devant, une tête derrière, et il est noir. Deux têtes sur un seul corps : l’une veut aller à l’est, l’autre à l’ouest, aucune ne l’emporte, aucune ne peut se séparer de l’autre. Comme on dit : deux têtes pour un corps, nées à contresens ; l’une demande, l’autre répond ; ni trêve ni défaite, et chacune trouve enfin son égal.", ar: "«بينغفنغ» — في «كتاب الجبال والبحار»، قسم «الغرب الخارجي»: عند جبل ووشيان من الشرق، حيوان على هيئة خنزير أسود، له رأسان، رأسان في جسد واحد، أحدهما في المقدّمة والآخر في المؤخّرة، هذا يريد الشرق وذاك يريد الغرب، لا يقهر أحدهما الآخر، ولا يستغني أحدهما عن صاحبه. رأسان في جسد واحد، وكلٌّ منهما يسير في وجهة الآخر." } , translations: ["en", "fr", "ar"] },
      { num: 38, name: "狙如", title: { zh: "第三十八章 狙如", en: "Chapter Thirty-Eight: Juru", fr: "Chapitre trente-huit : Juru", ar: "الفصل الثامن والثلاثون: جورو" }, bio: { en: "“Juru” — In the Classic of Mountains and Seas (“Central Mountains, Book Eleven”), on Mount Yidi there is a beast shaped like a fei-rat, with white ears and a white snout, called the juru; when it appears, its land sees great war. As the saying goes: white ears, white snout, a rat’s body that keeps itself hidden — when it appears, troops rise; it moves before it makes a sound.", zh: "“狙如”——《山海经·中次十一经》里，倚帝之山有兽，状如鼣鼠，白耳白喙，名曰狙如，见则其国有大兵。正所谓白耳白喙，鼠身而藏，见则兵起，不鸣而先动。", fr: "« Juru » — dans le « Classique des montagnes et des mers », onzième section des montagnes du Centre : sur le mont Yidi vit une bête qui a la forme d’un rat, les oreilles blanches et le museau blanc ; on l’appelle Juru. Quand elle paraît, le pays sombre dans la grande guerre. Une bête qui ne crie pas, qui se tapit dans l’ombre, et qui annonce le combat avant que quiconque ait dégainé.", ar: "«جورو» — في «كتاب الجبال والبحار»، القسم الحادي عشر من الأقسام الوسطى: في جبل ييدي حيوان على هيئة فأر ضخم، أبيض الأذنين وأبيض الخطم، اسمه جورو، ومن ظهر في بلدٍ قامت فيه حرب كبرى. أبيض الأذنين والخطم، وبدن فأر يختبئ في جحره. لا يصيح ولا يعلن، بل يتحرّك أولًا، وحين يتحرّك يكون الصفّ قد انقسم في الخفاء." } , translations: ["en", "fr", "ar"] },
      { num: 39, name: "天马", title: { zh: "第三十九章 天马", en: "Chapter Thirty-Nine: Tianma", fr: "Chapitre trente-neuf : Le Cheval céleste", ar: "الفصل التاسع والثلاثون: الحصان السماوي" }, bio: { en: "“Tianma” — In the Classic of Mountains and Seas (“Northern Mountains”), on Mount Macheng there is a beast shaped like a white dog with a black head; when it sees people it takes flight. It is called the tianma, the Heavenly Horse.", zh: "“天马”——《山海经·北山经》，马成之山有兽，状如白犬而黑头，见人则飞，其名曰天马。", fr: "« Le Cheval céleste » — dans le « Classique des montagnes et des mers », section des montagnes du Nord : au mont Macheng vit une bête qui a la forme d’un chien blanc à tête noire ; dès qu’elle voit un homme, elle s’envole. On l’appelle le Cheval céleste. Une bête qui s’élève à l’approche de la main : on croit la tenir, et il ne reste que l’élan.", ar: "«الحصان السماوي» — في «كتاب الجبال والبحار»، قسم الجبال الشمالية: في جبل ماتشنغ حيوان على هيئة كلب أبيض برأس أسود، إذا رأى إنسانًا طار، واسمه الحصان السماوي. كلب أبيض برأس أسود، لا يثبت أمام عين بشرية. ومن يطير كلّما اقترب منه أحد، لا يُعرف إلى أيّ أرض نزل، ولا من كان معه حين نزل." } , translations: ["en", "fr", "ar"] },
      { num: 40, name: "媪", title: { zh: "第四十章 媪", en: "Chapter Forty: Ao", fr: "Chapitre quarante : Ao", ar: "الفصل الأربعون: آو" }, bio: { en: "“Ao” — In the Classic of Mountains and Seas (“Western Mountains”), on Jade Mountain there is a beast called the ao, shaped like a dog with a human face; when it sees people it laughs, and it moves like the wind.", zh: "“媪”——《山海经·西山经》，玉山有兽名“媪”，状如犬而人面，见人则笑，其行如风。", fr: "« Ao » — dans le « Classique des montagnes et des mers », section des montagnes de l’Ouest, il y a sur le mont Yu une bête du nom de Ao : elle a la forme d’un chien et un visage humain, elle rit quand elle voit quelqu’un, et son pas est comme le vent. Un chien à face d’homme, un sourire offert, une course plus rapide que la main qui veut la retenir. Comme on dit : ce qui vient en riant n’est parfois qu’un souffle qui passe.", ar: "«آو» — في «كتاب الجبال والبحار»، قسم «جبال الغرب»: في جبل اليشم حيوان اسمه «آو»، جسمه جسم كلب ووجهه وجه إنسان، إذا لقي إنسانًا ضحك، ويسير سير الريح. يضحك كي لا يُقرأ وجهه، ويسير أسرع من السؤال." } , translations: ["en", "fr", "ar"] },
      { num: 41, name: "犀渠", title: { zh: "第四十一章 犀渠", en: "Chapter Forty-One: Xiqu", fr: "Chapitre quarante et un : Xiqu", ar: "الفصل الحادي والأربعون: شيتشي" }, bio: { en: "“Xiqu” — In the Classic of Mountains and Seas (“Central Mountains”), on Mount Li there is a beast shaped like an ox, with a dark blue-green body; its cry is like a baby’s, it eats people, and it is called the xiqu. As the saying goes: blue-green, ox-shaped, crying like a baby — it builds no den of its own, but moves into other beasts’ burrows.", zh: "“犀渠”——《山海经·中山经》里，釐山有兽，状如牛，苍身，其音如婴儿，是食人，名曰犀渠。正所谓苍身牛形，其音如婴，不筑己巢，占他兽之洞。", fr: "« Xiqu » — dans le « Classique des montagnes et des mers », section des montagnes du Centre, sur le mont Li vit une bête : elle a la forme d’un bœuf, le corps vert sombre, le cri d’un nourrisson, et elle dévore les hommes. On l’appelle Xiqu. Corps vert, forme de bœuf, voix d’enfant : elle ne bâtit pas son propre repaire, elle prend celui d’un autre. Comme on dit : qui n’a pas de nid sait toujours où se coucher.", ar: "«شيتشي» — في «كتاب الجبال والبحار»، قسم «جبال الوسط»: في جبل لي حيوان على هيئة ثور، جسمه أخضر مسودّ، وصوته صوت رضيع، وهو يأكل الناس، اسمه «شيتشي». جسم غليظ وصوت رقيق، ولا يبني عشّه، بل يسكن جحر غيره." } , translations: ["en", "fr", "ar"] },
      { num: 42, name: "孟极", title: { zh: "第四十二章 孟极", en: "Chapter Forty-Two: Mengji", fr: "Chapitre quarante-deux : Mengji", ar: "الفصل الثاني والأربعون: منغجي" }, bio: { en: "“Mengji” — In the Classic of Mountains and Seas (“Northern Mountains”), on Mount Shizhe there is a beast shaped like a leopard, with a patterned forehead and a white body, called the mengji; it is good at lying hidden, and it cries out its own name. As the saying goes: however deep it lies hidden, when it opens its mouth, out comes its own name.", zh: "“孟极”——《山海经·北山经》里，石者之山有兽，状如豹而文题白身，名曰孟极，是善伏，其鸣自呼。正所谓伏得再深，开口仍是自己的名字。", fr: "« Mengji » — dans le « Classique des montagnes et des mers », section des montagnes du Nord : sur le mont Shizhe vit une bête qui a la forme d’une panthère, le front tacheté et le corps blanc ; on l’appelle Mengji. Elle excelle à se tapir, et son cri est son propre nom. Comme on dit : on a beau se tapir au plus profond, quand on ouvre la bouche, c’est encore son nom qu’on entend.", ar: "«منغجي» — في «كتاب الجبال والبحار»، قسم «جبال الشمال»: في جبل شيتشه حيوان على هيئة نمر، جبهته مرقّطة وجسمه أبيض، اسمه منغجي، يحسن التخفّي، وصوته ينادي باسمه. مهما بلغ عمق التخفّي، فحين يفتح فمه ينطق اسمه." } , translations: ["en", "fr", "ar"] },
      { num: 43, name: "合窳", title: { zh: "第四十三章 合窳", en: "Chapter Forty-Three: Heyu", fr: "Chapitre quarante-trois : Heyu", ar: "الفصل الثالث والأربعون: هييو" }, bio: { en: "“Heyu” — In the Classic of Mountains and Seas (“Eastern Mountains”), on Mount Shan there is a beast shaped like a pig with a human face, a yellow body and a red tail, called the heyu; when it appears, all the world is flooded. As the saying goes: a pig’s body and a human face, yellow body and red tail — it lies hidden in the wilds, and when it appears, the great flood comes.", zh: "“合窳”——《山海经·东山经》里，剡山有兽，其状如彘而人面，黄身而赤尾，其名曰合窳，见则天下大水。正所谓彘身人面，黄身赤尾，暗伏于野，见则大水。", fr: "« Heyu » — dans le « Classique des montagnes et des mers », section des montagnes de l’Est : sur le mont Shan vit une bête qui a la forme d’un porc, un visage humain, le corps jaune et la queue rouge ; on l’appelle Heyu. Quand elle paraît, la grande crue submerge le pays. Comme on dit : corps de porc et face humaine, jaune de peau, queue écarlate ; tapie dans les champs, elle paraît, et l’eau monte.", ar: "«هييو» — في «كتاب الجبال والبحار»، قسم «جبال الشرق»: في جبل يانشان حيوان على هيئة خنزير بوجه إنسان، أصفر الجسم أحمر الذيل، اسمه هييو، وظهوره إنذار بفيضان يعمّ الأرض. جسم خنزير ووجه إنسان، أصفر الجسم أحمر الذيل، يكمن في البرية، فإذا ظهر عمّ الماء." },
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
        },
        translations: ["en", "fr", "ar"],
      },
      { num: 44, name: "诸犍", title: { zh: "第四十四章 诸犍", en: "Chapter Forty-Four: Zhujian", fr: "Chapitre quarante-quatre : Zhujian", ar: "الفصل الرابع والأربعون: تشوجيان" }, bio: { en: "“Zhujian” — In the Classic of Mountains and Seas (“Northern Mountains”), on Mount Danzhang there is a beast shaped like a leopard with a long tail, a human head, an ox’s ears and a single eye, called the zhujian. It is a great roarer, and when it walks it carries its tail in its mouth. As the saying goes: a leopard’s body and a long tail, a human head and ox’s ears, one eye looking out alone; when it walks, it carries its tail in its mouth. The zhujian has only one eye: when it looks left it can’t watch the right, when it looks ahead it can’t watch behind. When it walks it has to bite its own tail, for fear its head and tail won’t be able to look after each other.", zh: "“诸犍”——《山海经·北山经》里，单张之山有兽，其状如豹，而长尾，人首而牛耳，一目，名曰诸犍。善吒，行则衔其尾。正所谓豹身长尾，人首牛耳，一目独视，行则衔尾。诸犍只有一只眼睛，看左边就顾不了右边，看前头就顾不了后头；它走路的时候，必须咬着自己的尾巴，生怕首尾不能相顾。", fr: "« Zhujian » — dans le « Classique des montagnes et des mers », section des montagnes du Nord, au mont Danzhang, vit une bête qui a la forme d’un léopard, une longue queue, une tête d’homme, des oreilles de bœuf et un seul œil ; on l’appelle Zhujian. Elle pousse de grands cris, et quand elle marche, elle tient sa queue entre ses dents. Un seul œil : regarder devant, c’est perdre l’arrière ; alors il mord sa queue, pour que le début et la fin se tiennent encore.", ar: "«تشوجيان» — في «كتاب الجبال والبحار»، قسم «جبال الشمال»: في جبل دانشان حيوان على هيئة فهد، طويل الذيل، له رأس إنسان وأذنا ثور، وعين واحدة، اسمه تشوجيان، يحسن الصياح، وإذا مشى حمل ذيله في فمه. عين واحدة لا تجمع بين اليمين واليسار، ولا بين الأمام والخلف، وذيله في فمه كي لا يفلت منه طرفاه." } , translations: ["en", "fr", "ar"] },
      { num: 45, name: "猲狙", title: { zh: "第四十五章 猲狙", en: "Chapter Forty-Five: Heju", fr: "Chapitre quarante-cinq : Heju", ar: "الفصل الخامس والأربعون: هيجو" }, bio: { zh: "“猲狙”——《山海经·东山经》里，北号之山有兽，状如狼，赤首鼠目，音如豚，是食人。正所谓狼形在侧，赤首在前，鼠目在暗，豚声在耳，人使食人。", en: "“Heju” — In the Classic of Mountains and Seas (“Eastern Mountains”), on Mount Beihao there is a beast shaped like a wolf, with a red head and rat’s eyes, whose cry is like a pig’s, and it eats men. As the saying goes: a wolf’s shape at your side, a red head before you, rat’s eyes in the dark, a pig’s grunt at your ear — and it makes men eat men.", fr: "« Heju » — dans le « Classique des montagnes et des mers », section des montagnes de l’Est, au mont Beihao vit une bête qui a la forme d’un loup, une tête rouge et des yeux de rat, dont le cri est celui d’un porc, et qui dévore les hommes. Comme on dit : une forme de loup à côté de soi, une tête rouge devant soi, des yeux de rat dans l’obscurité, un groin dans l’oreille — elle fait des hommes des mangeurs d’hommes.", ar: "«هيجو» — في «كتاب الجبال والبحار»، قسم «جبال الشرق»: في جبل بيهاو حيوان على هيئة ذئب، أحمر الرأس، عيناه عينا جرذ، وصوته كصوت خنزير، وهو يأكل الناس. وكما يقال: هيئة ذئب إلى جانبك، ورأس أحمر أمامك، وعينا جرذ في العتمة، وصوت خنزير في أذنك — وهو يجعل الناس يأكلون الناس." }, translations: ["en", "fr", "ar"] },
      { num: 46, name: "狌狌", title: { zh: "第四十六章 狌狌", en: "Chapter Forty-Six: Xingxing", fr: "Chapitre quarante-six : Xingxing", ar: "الفصل السادس والأربعون: شينغشينغ" }, bio: { zh: "“狌狌”——《山海经·南山经》里，招摇之山有兽焉，其状如禺而白耳，伏行人走，其名曰狌狌，食之善走。又言其知人名，能言，而不知往。正所谓知人之名，不知己往——看得清别人，看不清自己。", en: "“Xingxing” — In the Classic of Mountains and Seas (“Southern Mountains”), on Mount Zhaoyao there is a beast shaped like an ape with white ears; it crouches to walk and runs like a man, and its name is the xingxing; eaten, it makes a person a good runner. It is also said that the xingxing knows people’s names and can speak, but does not know where it is going. As the saying goes: it knows other men’s names but not its own going — it sees others clearly, and itself not at all.", fr: "« Xingxing » — dans le « Classique des montagnes et des mers », section des montagnes du Sud, au mont Zhaoyao vit une bête qui a la forme d’un singe aux oreilles blanches ; elle marche accroupie et court comme un homme, et son nom est xingxing ; mangée, elle rend bon coureur. On dit aussi que le xingxing connaît le nom des gens et sait parler, mais ne sait pas où il va. Comme on dit : il connaît le nom des autres, non son propre chemin — il voit clair chez les autres, et pas du tout en lui-même.", ar: "«شينغشينغ» — في «كتاب الجبال والبحار»، قسم «جبال الجنوب»: في جبل تشاوياو حيوان على هيئة قرد أبيض الأذنين، يمشي مكبًّا ويسعى سعي الإنسان، اسمه شينغشينغ، ومن أكله كان سريع الجري. ويقال أيضًا إنه يعرف أسماء الناس ويتكلم، لكنه لا يدري إلى أين يمضي. وكما يقال: يعرف أسماء الناس ولا يعرف أين يمضي — يرى الآخرين بوضوح، ولا يرى نفسه." }, translations: ["en", "fr", "ar"] },
      { num: 47, name: "寓", title: { zh: "第四十七章 寓", en: "Chapter Forty-Seven: Yu", fr: "Chapitre quarante-sept : Yu", ar: "الفصل السابع والأربعون: يو" }, bio: { zh: "“寓”——《山海经·北山经》：有鸟焉，其状如夸父而彘毛，其音如呼，见则天下大水。鸟大而无力，依附而存。", en: "“Yu” — In the Classic of Mountains and Seas (“Northern Mountains”), there is a bird shaped like the kuafu ape but covered in boar bristles; its cry is like a call, and when it appears the whole world is flooded. A great bird without strength, it lives only by clinging to something else.", fr: "« Yu » — dans le « Classique des montagnes et des mers », section des montagnes du Nord : il est un oiseau qui a la forme du singe kuafu, mais avec des soies de sanglier ; son cri est comme un appel, et dès qu’il paraît, le monde entier est sous les eaux. Grand oiseau sans force, il ne subsiste qu’en s’attachant à autre chose.", ar: "«يو» — في «كتاب الجبال والبحار»، قسم «جبال الشمال»: ثمة طائر على هيئة قرد كوافو لكن بفرو خنزير، وصوته كالنداء، وإذا ظهر فاض الماء على الدنيا كلها. طائر ضخم لا قوة له، لا يعيش إلا متعلّقًا بغيره." }, translations: ["en", "fr", "ar"] },
      { num: 48, name: "猼訑", title: { zh: "第四十八章 猼訑", en: "Chapter Forty-Eight: Boyi", fr: "Chapitre quarante-huit : Boyi", ar: "الفصل الثامن والأربعون: بويي" }, bio: { zh: "“猼訑”——《山海经·南山经》里，基山有兽焉，其状如羊，九尾四耳，其目在背，其名曰猼訑，佩之不畏。正所谓九尾四耳，目在背上——看得见身后的人，才走得稳前面的路。", en: "“Boyi” — In the Classic of Mountains and Seas (“Southern Mountains”), on Mount Ji there is a beast shaped like a sheep, with nine tails and four ears and its eyes set in its back; its name is Boyi, and whoever wears it knows no fear. Nine tails, four ears, eyes on its back: only one who can see what lies behind walks steadily on the road ahead.", fr: "« Boyi » — dans le « Classique des montagnes et des mers », section des montagnes du Sud : au mont Ji vit une bête qui a la forme d’un mouton, neuf queues, quatre oreilles et les yeux sur le dos ; elle se nomme Boyi, et qui la porte ne connaît plus la peur. Neuf queues, quatre oreilles, les yeux dans le dos : seul celui qui voit ce qui est derrière lui marche d’un pas sûr sur la route devant lui.", ar: "«بويي» — في «كتاب الجبال والبحار»، قسم «جبال الجنوب»: في جبل جي وحشٌ على هيئة خروف، له تسعة أذيال وأربع آذان، وعيناه على ظهره، يُسمّى بويي، ومن حمله لم يعرف الخوف. تسعة أذيال وأربع آذان، وعينان على الظهر: لا يثبت قدمُ امرئٍ على الطريق أمامه إلا إذا رأى ما خلفه." }, translations: ["en", "fr", "ar"] },
      { num: 49, name: "獓𤟎", title: {"zh": "第四十九章 獓𤟎", "en": "Chapter Forty-Nine: Aoye", "fr": "Chapitre quarante-neuf : Aoye", "ar": "الفصل التاسع والأربعون: آوييه"}, bio: {"zh": "“獓𤟎”——《山海经·西山经》里，三危之山，有兽焉，其状如牛，白身四角，其豪如披蓑，是食人。正所谓四角白身，貌似温和——藏于暗处的利齿，从不轻易咬向陌生人，专挑熟面孔的咽喉。", "en": "“Aoye” — In the Classic of Mountains and Seas (“Western Mountains”), on Mount Sanwei there is a beast shaped like an ox, with a white body and four horns, its bristles like a woven straw cape, and it eats men. As the saying goes: four horns, a white body, a mild look — but the fangs kept in the dark are never bared at strangers; they go for the throat of a familiar face.", "fr": "« Aoye » — dans le « Classique des montagnes et des mers », section des montagnes de l’Ouest : au mont Sanwei vit une bête qui a la forme d’un bœuf, le corps blanc, quatre cornes, le poil comme un manteau de paille tressée, et qui dévore les hommes. Comme on dit : quatre cornes, le corps blanc, l’air doux — mais les crocs tenus dans l’ombre ne se montrent pas aux inconnus : ils vont à la gorge d’un visage familier.", "ar": "«آوييه» — في «كتاب الجبال والبحار»، قسم «جبال الغرب»: في جبل سانوي وحشٌ على هيئة ثور، أبيض الجسد، له أربعة قرون، وشعره كعباءة من القش، وهو يأكل الناس. وكما يقال: أربعة قرون وجسد أبيض ووجه وديع — لكن الأنياب المخبأة في العتمة لا تنهش الغرباء، بل تقصد حلق من تعرفه."}, translations: ["en", "fr", "ar"] }
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
