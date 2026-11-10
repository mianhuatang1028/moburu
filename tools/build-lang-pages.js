/* ============================================================
   默不如小说官网 · 多语言页面 + 社交分享卡片（og）生成

   为什么需要这个脚本：
   微信 / X / Facebook / WhatsApp 的分享卡片，是**发送时由服务器抓取链接 HTML 的
   og: 标签**生成的，抓取方不执行 JavaScript、也读不到读者的 localStorage。
   所以「同一个链接、按读者当前语言自动变卡片」在静态站上物理上做不到。
   唯一正确的做法是让语言进入 URL：每个语言一套真实页面（/en/ /ja/ /fr/ /ar/），
   各自 head 里写死本语言的 title / description / og:image。
   读者分享出去的链接自带语言，卡片自然是那个语言。

   做什么：
   1. 给 6 个中文根页（index/works/work/reader/about/pricing）注入 og + hreflang；
   2. 为 en / ja / fr / ar 各生成一份子目录页面，head 写死本语言文案，
      资源路径改根绝对，并注入 window.__PAGE_LANG（锁定语言）/ window.__BASE（路径前缀）；
   3. 输出 tools/pages-sitemap.json，供 build-pages.js 拼进 sitemap.xml。

   用法：node tools/build-lang-pages.js
        然后 node tools/build-pages.js（会读 pages-sitemap.json）
        再跑 官网_缓存版本号.py

   注意：生成页由脚本产出，请勿手工编辑；改文案改本文件里的 COPY 表。
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://moburu.vip';
const OG_IMG = SITE + '/assets/img/og/og-cover.jpg';

const LANGS = ['zh', 'en', 'ja', 'fr', 'ar'];
const HTML_LANG = { zh: 'zh-CN', en: 'en', ja: 'ja', fr: 'fr', ar: 'ar' };
const OG_LOCALE = { zh: 'zh_CN', en: 'en_US', ja: 'ja_JP', fr: 'fr_FR', ar: 'ar_AR' };
const SITE_NAME = { zh: '默不如 · MOBURU', en: 'MOBURU', ja: 'MOBURU', fr: 'MOBURU', ar: 'موبورو' };

const PAGES = [
  { id: 'index',   file: 'index.html',   pri: '1.0' },
  { id: 'works',   file: 'works.html',   pri: '0.9' },
  { id: 'work',    file: 'work.html',    pri: '0.9' },
  { id: 'reader',  file: 'reader.html',  pri: '0.8' },
  { id: 'about',   file: 'about.html',   pri: '0.6' },
  { id: 'pricing', file: 'pricing.html', pri: '0.5' }
];

/* 每页 × 每语言的标题与描述。描述保留「官网优先更新」这个核心卖点。 */
const COPY = {
  zh: {
    index: {
      title: '默不如 · 小说宇宙 | MOBURU Fiction Universe',
      desc: '默不如小说官网——军工写实、山海经叙事、中年逆袭。作者默不如的独立小说宇宙，三部作品全本在线，官网优先更新。',
      alt: '默不如 · MOBURU 官网'
    },
    works: {
      title: '作品目录 - 默不如 | Works',
      desc: '默不如作品目录——恨长沙、光环、牧者之歌，全本在线，官网优先更新，持续连载。',
      alt: '默不如作品目录'
    },
    work: {
      title: '作品 - 默不如 | Work',
      desc: '默不如作品详情——军工写实、山海经叙事的中年逆袭小说，全本在线，官网优先更新。',
      alt: '默不如作品详情'
    },
    reader: {
      title: '阅读 - 默不如 | Read',
      desc: '默不如小说章节阅读——中文原文与英日法阿译本，全本在线，官网优先更新。',
      alt: '默不如小说在线阅读'
    },
    about: {
      title: '关于默不如 | About',
      desc: '关于默不如——把伺服电机、流体力学和《山海经》写进小说的人。',
      alt: '关于默不如'
    },
    pricing: {
      title: '会员 - 默不如 | Membership',
      desc: '默不如小说官网会员与付费阅读（预留端口），正式上线前不扣费。',
      alt: '默不如会员说明'
    }
  },
  en: {
    index: {
      title: 'Moburu · Fiction Universe',
      desc: 'The official site of Moburu — hard-tech realism, Classic of Mountains and Seas mythology, a midlife comeback. Three novels, free to read in full, published here first.',
      alt: 'Moburu — official site'
    },
    works: {
      title: 'Works · Moburu',
      desc: 'Every novel by Moburu — Lost in Changsha, Halo, The Shepherd’s Song. Free to read in full, published here first.',
      alt: 'Works by Moburu'
    },
    work: {
      title: 'Novel · Moburu',
      desc: 'Novel details — hard-tech realism and Classic of Mountains and Seas mythology, free to read in full, published here first.',
      alt: 'A novel by Moburu'
    },
    reader: {
      title: 'Read · Moburu',
      desc: 'Read Moburu’s novels online — Chinese original with English, Japanese, French and Arabic translations, published here first.',
      alt: 'Read Moburu online'
    },
    about: {
      title: 'About Moburu',
      desc: 'About Moburu — the writer who puts servo motors, fluid dynamics and the Classic of Mountains and Seas into fiction.',
      alt: 'About Moburu'
    },
    pricing: {
      title: 'Membership · Moburu',
      desc: 'Membership and paid reading on Moburu’s official site — currently a placeholder, nothing is charged before launch.',
      alt: 'Moburu membership'
    }
  },
  ja: {
    index: {
      title: 'Moburu（ムブル）· 小説の世界',
      desc: 'Moburu 公式サイト——リアルな技術描写、山海経の物語、中年からの逆転。三作品を全文公開、公式サイトが最速更新。',
      alt: 'Moburu 公式サイト'
    },
    works: {
      title: '作品一覧 · Moburu',
      desc: 'Moburu の全作品——『長沙に迷う』『光環』『羊飼いの歌』。全文公開、公式サイトが最速更新。',
      alt: 'Moburu の作品一覧'
    },
    work: {
      title: '作品 · Moburu',
      desc: '作品詳細——技術描写と山海経を軸にした物語。全文公開、公式サイトが最速更新。',
      alt: 'Moburu の作品'
    },
    reader: {
      title: '読む · Moburu',
      desc: 'Moburu の小説をオンラインで読む——中国語原文と英語・日本語・フランス語・アラビア語の翻訳。公式サイトが最速更新。',
      alt: 'Moburu をオンラインで読む'
    },
    about: {
      title: 'Moburu について',
      desc: 'Moburu——サーボモーター、流体力学、山海経を小説に書き込む作家。',
      alt: 'Moburu について'
    },
    pricing: {
      title: 'メンバーシップ · Moburu',
      desc: 'Moburu 公式サイトのメンバーシップと有料閲覧（準備中）。公開前は一切課金されません。',
      alt: 'Moburu メンバーシップ'
    }
  },
  fr: {
    index: {
      title: 'Moburu · Univers romanesque',
      desc: 'Le site officiel de Moburu — réalisme technique, mythologie du Classique des montagnes et des mers, reconquête de la maturité. Trois romans à lire intégralement, publiés ici en premier.',
      alt: 'Moburu — site officiel'
    },
    works: {
      title: 'Œuvres · Moburu',
      desc: 'Toutes les œuvres de Moburu — Perdu à Changsha, Halo, Le Chant du pasteur. À lire intégralement, publiées ici en premier.',
      alt: 'Les œuvres de Moburu'
    },
    work: {
      title: 'Roman · Moburu',
      desc: 'Détails du roman — réalisme technique et mythologie du Classique des montagnes et des mers, à lire intégralement.',
      alt: 'Un roman de Moburu'
    },
    reader: {
      title: 'Lire · Moburu',
      desc: 'Lire les romans de Moburu en ligne — texte chinois original et traductions anglaise, japonaise, française et arabe, publiés ici en premier.',
      alt: 'Lire Moburu en ligne'
    },
    about: {
      title: 'À propos de Moburu',
      desc: 'Moburu — l’écrivaine qui met des servomoteurs, la mécanique des fluides et le Classique des montagnes et des mers dans ses romans.',
      alt: 'À propos de Moburu'
    },
    pricing: {
      title: 'Abonnement · Moburu',
      desc: 'Abonnement et lecture payante sur le site officiel de Moburu — espace réservé, aucun paiement avant le lancement.',
      alt: 'Abonnement Moburu'
    }
  },
  ar: {
    index: {
      title: 'موبورو · عالم الرواية',
      desc: 'الموقع الرسمي لموبورو — واقعية تقنية، وأساطير «كتاب الجبال والبحار»، وصعود من منتصف العمر. ثلاث روايات تُقرأ كاملة، وتُنشر هنا أولًا.',
      alt: 'موبورو — الموقع الرسمي'
    },
    works: {
      title: 'الأعمال · موبورو',
      desc: 'جميع أعمال موبورو — «ضائع في تشانغشا»، «هالة»، «أغنية الراعي». تُقرأ كاملة، وتُنشر هنا أولًا.',
      alt: 'أعمال موبورو'
    },
    work: {
      title: 'رواية · موبورو',
      desc: 'تفاصيل الرواية — واقعية تقنية وأساطير «كتاب الجبال والبحار»، تُقرأ كاملة على الموقع الرسمي.',
      alt: 'رواية لموبورو'
    },
    reader: {
      title: 'اقرأ · موبورو',
      desc: 'اقرأ روايات موبورو على الإنترنت — النص الصيني الأصلي مع ترجمات بالإنجليزية واليابانية والفرنسية والعربية، تُنشر هنا أولًا.',
      alt: 'اقرأ موبورو على الإنترنت'
    },
    about: {
      title: 'عن موبورو',
      desc: 'موبورو — الكاتبة التي تُدخل محركات السيرفو وميكانيكا الموائع و«كتاب الجبال والبحار» في الرواية.',
      alt: 'عن موبورو'
    },
    pricing: {
      title: 'العضوية · موبورو',
      desc: 'العضوية والقراءة المدفوعة على الموقع الرسمي لموبورو — مساحة محجوزة، ولا يُخصم أي مبلغ قبل الإطلاق.',
      alt: 'عضوية موبورو'
    }
  }
};

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function urlOf(lang, file) {
  return lang === 'zh' ? SITE + '/' + file : SITE + '/' + lang + '/' + file;
}

function metaBlock(lang, page) {
  const c = COPY[lang][page.id];
  const T = escAttr(c.title), D = escAttr(c.desc), A = escAttr(c.alt);
  const L = [];
  L.push('  <!-- og:start · 由 tools/build-lang-pages.js 生成，请勿手工编辑 -->');
  L.push('  <title>' + T + '</title>');
  L.push('  <meta name="description" content="' + D + '">');
  L.push('  <link rel="canonical" href="' + urlOf(lang, page.file) + '">');
  for (const l of LANGS) {
    L.push('  <link rel="alternate" hreflang="' + HTML_LANG[l] + '" href="' + urlOf(l, page.file) + '">');
  }
  L.push('  <link rel="alternate" hreflang="x-default" href="' + urlOf('zh', page.file) + '">');
  L.push('  <meta property="og:type" content="website">');
  L.push('  <meta property="og:site_name" content="' + escAttr(SITE_NAME[lang]) + '">');
  L.push('  <meta property="og:locale" content="' + OG_LOCALE[lang] + '">');
  for (const l of LANGS) {
    if (l !== lang) L.push('  <meta property="og:locale:alternate" content="' + OG_LOCALE[l] + '">');
  }
  L.push('  <meta property="og:title" content="' + T + '">');
  L.push('  <meta property="og:description" content="' + D + '">');
  L.push('  <meta property="og:url" content="' + urlOf(lang, page.file) + '">');
  L.push('  <meta property="og:image" content="' + OG_IMG + '">');
  L.push('  <meta property="og:image:secure_url" content="' + OG_IMG + '">');
  L.push('  <meta property="og:image:type" content="image/jpeg">');
  L.push('  <meta property="og:image:width" content="1200">');
  L.push('  <meta property="og:image:height" content="630">');
  L.push('  <meta property="og:image:alt" content="' + A + '">');
  L.push('  <meta name="twitter:card" content="summary_large_image">');
  L.push('  <meta name="twitter:title" content="' + T + '">');
  L.push('  <meta name="twitter:description" content="' + D + '">');
  L.push('  <meta name="twitter:image" content="' + OG_IMG + '">');
  L.push('  <!-- og:end -->');
  return L.join('\n');
}

/* 把模板里旧的 title / description / 旧 og 块换成本语言的，再插到 stylesheet 之前 */
function rebuildHead(html, lang, page) {
  let out = html.replace(/[ \t]*<!-- og:start[\s\S]*?<!-- og:end -->\r?\n?/g, '');
  out = out.replace(/[ \t]*<title[^>]*>[\s\S]*?<\/title>\r?\n?/g, '');
  out = out.replace(/[ \t]*<meta\s+name="description"[\s\S]*?>\r?\n?/g, '');
  const anchor = out.match(/[ \t]*<link rel="stylesheet"/);
  if (!anchor) throw new Error(page.file + '：找不到 stylesheet 锚点');
  out = out.replace(anchor[0], metaBlock(lang, page) + '\n' + anchor[0]);
  return out;
}

let nRoot = 0, nSub = 0;
const sitemapPages = [];

for (const page of PAGES) {
  const srcPath = path.join(ROOT, page.file);
  const src = fs.readFileSync(srcPath, 'utf8');
  const zhHtml = rebuildHead(src, 'zh', page);
  fs.writeFileSync(srcPath, zhHtml, 'utf8');
  nRoot++;

  sitemapPages.push({
    loc: urlOf('zh', page.file),
    priority: page.pri,
    alternates: LANGS.map(l => ({ hreflang: HTML_LANG[l], href: urlOf(l, page.file) }))
      .concat([{ hreflang: 'x-default', href: urlOf('zh', page.file) }])
  });

  for (const lang of LANGS) {
    if (lang === 'zh') continue;
    // 先把 head 换成该语言的文案（title / description / og / canonical），再做路径与语言锁定
    let h = rebuildHead(zhHtml, lang, page);
    h = h.replace(/(href|src)="assets\//g, '$1="/assets/');
    // html lang / dir
    h = h.replace(/<html lang="[^"]*"/,
      '<html lang="' + HTML_LANG[lang] + '"' + (lang === 'ar' ? ' dir="rtl"' : ''));
    // 语言锁 + 路径前缀，必须早于 app.js
    const appTag = h.match(/[ \t]*<script src="\/assets\/js\/app\.js[^"]*"><\/script>/);
    if (!appTag) throw new Error(page.file + '：找不到 app.js 引用，无法注入 __PAGE_LANG');
    h = h.replace(appTag[0],
      '  <script>window.__PAGE_LANG="' + lang + '";window.__BASE="/";</script>\n' + appTag[0]);
    const dir = path.join(ROOT, lang);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, page.file), h, 'utf8');
    nSub++;

    sitemapPages.push({
      loc: urlOf(lang, page.file),
      priority: page.pri,
      alternates: LANGS.map(l => ({ hreflang: HTML_LANG[l], href: urlOf(l, page.file) }))
        .concat([{ hreflang: 'x-default', href: urlOf('zh', page.file) }])
    });
  }
}

fs.writeFileSync(path.join(__dirname, 'pages-sitemap.json'),
  JSON.stringify(sitemapPages, null, 1), 'utf8');

console.log('中文根页：' + nRoot + ' 个（已注入 og / hreflang）');
console.log('语言子页：' + nSub + ' 个（en / ja / fr / ar × ' + PAGES.length + ' 页）');
console.log('sitemap 条目：' + sitemapPages.length + ' -> tools/pages-sitemap.json');
console.log('分享图：' + OG_IMG);
