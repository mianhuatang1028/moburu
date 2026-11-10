#!/usr/bin/env node
/* ============================================================
   默不如小说官网 · 静态存档页 / sitemap / robots / llms.txt 生成

   用法：先 node tools/publish.js，再 node tools/build-pages.js

   做什么：
   1. 读 chapters/<作品>/<章号>.json（中文正文真源）、
      chapters/<作品>/<章号>.<语言>.json（各语言译本真源）、
      translations.json（已发布译本清单）、posts.json（首发存证）。
   2. 每章生成一份不依赖 JavaScript 的中文 HTML 存档页；有译本的章再各生成
      一份该语言存档页（含 hreflang 互链、阿拉伯语 RTL、译本首发时间、
      Chapter JSON-LD）—— 搜索引擎 / AI 可直接抓取全文。
   3. 生成 sitemap.xml、robots.txt、llms.txt（供 AI 检索作品与章节入口）。

   注意：静态页由脚本生成，请勿手工编辑；正文只改 JSON，重跑即可。
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://moburu.vip';

/* 社交分享：微信 / X / Facebook 抓 og 标签生成卡片，抓取方不跑 JS，
   所以每张静态页都要把标题、描述、图写死。图全站共用一张（无文字、跨语言通用）。 */
const OG_IMAGE = SITE_URL + '/assets/img/og/og-cover.jpg';
const OG_LOCALE = { zh: 'zh_CN', en: 'en_US', ja: 'ja_JP', fr: 'fr_FR', ar: 'ar_AR' };

/* 静态存档页的 CSS / JS 版本号：取文件内容 sha1 前 8 位。
   内容不变版本号就不变（不会每次 build 都产生 188 个文件的 diff），
   内容一改版本号自动变（读者不会吃到缓存里的旧样式）。 */
function assetVer(rel) {
  try {
    return crypto.createHash('sha1')
      .update(fs.readFileSync(path.join(ROOT, rel)))
      .digest('hex').slice(0, 8);
  } catch (e) { return '1'; }
}
const CSS_VER = assetVer('assets/css/style.css');
const GUARD_VER = assetVer('assets/js/guard.js');
const DATA_JS = path.join(ROOT, 'assets', 'js', 'data.js');
const POSTS_JSON = path.join(ROOT, 'posts.json');

const LABEL = { en: 'English', ja: '日本語', fr: 'Français', ar: 'العربية' };
const HREFLANG = { en: 'en', ja: 'ja', fr: 'fr', ar: 'ar' };
/* 译文存档页的界面文案（正文之外的所有文字都用该语言，避免混排） */
const UI = {
  en: {
    colon: ': ',
    first: 'First published here', body: 'Full text published',
    trFirst: 'Translation first published', updated: 'Last updated',
    rights: 'All rights reserved', words: 'characters', record: 'Publication record',
    reader: 'Read online', other: 'Other languages', original: 'Chinese original',
    chPrev: 'Previous chapter', chNext: 'Next chapter', chFirst: 'This is the first chapter', chLast: 'This is the last chapter',
    chList: 'Contents', chNavAria: 'Chapter navigation',
    foot: 'Static archive page of the author\u2019s independent website. This work is the author\u2019s original creation and is not licensed exclusively to any platform.',
    contact: 'Contact'
  },
  ja: {
    colon: '：',
    first: '本サイト初公開', body: '全文初公開',
    trFirst: '翻訳初公開', updated: '最終更新',
    rights: '無断転載を禁じます', words: '字', record: '公開記録',
    reader: 'オンラインで読む', other: '他の言語版', original: '中国語原文',
    chPrev: '前の章', chNext: '次の章', chFirst: '最初の章です', chLast: '最後の章です',
    chList: '目次', chNavAria: '章の移動',
    foot: '作者独立公式サイトの静的アーカイブページです。本作は作者のオリジナル作品であり、いかなるプラットフォームにも独占掲載を許諾していません。',
    contact: '連絡先'
  },
  fr: {
    colon: ' : ',
    first: 'Première publication ici', body: 'Texte intégral publié',
    trFirst: 'Première publication de la traduction', updated: 'Dernière mise à jour',
    rights: 'Tous droits réservés', words: 'caractères', record: 'Registre de publication',
    reader: 'Lire en ligne', other: 'Autres langues', original: 'Original chinois',
    chPrev: 'Chapitre précédent', chNext: 'Chapitre suivant', chFirst: 'Premier chapitre', chLast: 'Dernier chapitre',
    chList: 'Sommaire', chNavAria: 'Navigation des chapitres',
    foot: 'Page d\u2019archive statique du site indépendant de l\u2019autrice. \u0152uvre originale de l\u2019autrice, aucune plateforme n\u2019en détient l\u2019exclusivité.',
    contact: 'Contact'
  },
  ar: {
    colon: ': ',
    first: 'أول نشر هنا', body: 'نشر النص الكامل',
    trFirst: 'أول نشر للترجمة', updated: 'آخر تحديث',
    rights: 'جميع الحقوق محفوظة', words: 'حرفًا', record: 'سجل النشر',
    reader: 'القراءة عبر الموقع', other: 'لغات أخرى', original: 'النص الصيني الأصلي',
    chPrev: 'الفصل السابق', chNext: 'الفصل التالي', chFirst: 'هذا هو الفصل الأول', chLast: 'هذا هو الفصل الأخير',
    chList: 'الفهرس', chNavAria: 'التنقل بين الفصول',
    foot: 'صفحة أرشيف ثابتة في الموقع المستقل للكاتبة. العمل تأليف أصلي للكاتبة، ولم يُمنح أي منصة حق النشر الحصري.',
    contact: 'تواصل'
  }
};

function loadConst(src, name) {
  const ctx = {};
  vm.runInNewContext(src + '\n;globalThis.__OUT__ = ' + name + ';', ctx, { timeout: 3000 });
  return ctx.__OUT__;
}
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function stamp(s, withTime) {
  const m = String(s || '').match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return m ? (m[1] + (withTime ? ' ' + m[2] : '')) : String(s || '').slice(0, 10);
}
function hreflangLinks(workId, num, langs) {
  const base = SITE_URL + '/chapters/' + workId + '/' + num;
  let s = '<link rel="alternate" hreflang="zh-CN" href="' + base + '.html">\n' +
          '<link rel="alternate" hreflang="x-default" href="' + base + '.html">\n';
  for (const l of langs) {
    s += '<link rel="alternate" hreflang="' + HREFLANG[l] + '" href="' + base + '.' + l + '.html">\n';
  }
  return s;
}

const DATA_SRC = fs.readFileSync(DATA_JS, 'utf8');
const SITE = loadConst(DATA_SRC, 'SITE');
const WORKS = loadConst(DATA_SRC, 'WORKS') || [];

/* 书名按语言取（官方国际名见 data.js 的 WORKS[].title.en）；
   作者笔名中文页用中文，非中文页用拼音 Moburu，两种写法都保留。 */
function bookTitle(workId, lang) {
  const w = WORKS.filter(x => x.id === workId)[0];
  const t = (w && w.title) || {};
  return t[lang] || t.zh || '';
}
function authorLabel(lang) {
  return lang === 'zh' ? SITE.author : (SITE.latinName || 'Moburu');
}
function nameMeaning(lang) {
  return (SITE.nameMeaning && SITE.nameMeaning[lang]) || SITE.nameMeaningOfficial || '';
}
function personLd(name) {
  return {
    '@type': 'Person',
    'name': name || SITE.author,
    'alternateName': SITE.latinName || 'Moburu',
    'description': SITE.nameMeaningOfficial || 'rather silence',
    'gender': SITE.gender || 'female'
  };
}

/* 山海经神兽图鉴卡片：图 + 小传。只在 chapters/<workId>/ 下的章节存档页使用，
   所以图片路径固定为 ../../assets/img/beasts/。
   图与语言无关，任何语言版本都显示同一张；某语言未译出小传时只放图，绝不回退中文。 */
function beastPanel(num, altText, bioText) {
  const file = String(num).padStart(2, '0') + '.webp';
  const has = fs.existsSync(path.join(ROOT, 'assets/img/beasts', file));
  const fig = has
    ? '<figure class="beast-fig"><img src="../../assets/img/beasts/' + file +
      '" alt="' + esc(altText || '') + '" width="800" height="1148" loading="lazy" decoding="async"></figure>'
    : '';
  if (!fig && !bioText) return '';
  return '<div class="beast-panel">' + fig +
    (bioText ? '<div class="beast-bio">' + esc(bioText) + '</div>' : '') + '</div>\n  ';
}

/* 统一翻页条：阅读页 (app.js) 与本脚本生成的存档页共用同一套 class，
   样式完全一致。prev/next 传 {href, label} 或 null（首章 / 末章）。
   ul 需要 prev/next/first/last/list/listHref/navAria 字段。 */
function chNavHtml(prev, next, ul) {
  const cell = (o, dir) => {
    const label = esc(dir === 'prev' ? ul.chPrev : ul.chNext);
    const arrow = dir === 'prev' ? '\u2039' : '\u203A';
    const head = '<em class="ch-nav-k"><span class="ch-nav-arrow">' + arrow + '</span> ' + label + '</em>';
    const tail = '<span class="ch-nav-t">' +
      esc(o ? o.label : (dir === 'prev' ? ul.chFirst : ul.chLast)) + '</span>';
    return o
      ? '<a class="ch-nav-btn ' + dir + '" href="' + esc(o.href) + '" rel="' + dir + '">' + head + tail + '</a>'
      : '<span class="ch-nav-btn is-off ' + dir + '">' + head + tail + '</span>';
  };
  const mid = ul.chList
    ? '<a class="ch-nav-btn ch-nav-mid" href="' + esc(ul.chListHref) + '">' + esc(ul.chList) + '</a>'
    : '';
  return '<nav class="ch-nav" aria-label="' + esc(ul.chNavAria) + '">' +
    cell(prev, 'prev') + mid + cell(next, 'next') + '</nav>';
}

const POST = fs.existsSync(POSTS_JSON)
  ? JSON.parse(fs.readFileSync(POSTS_JSON, 'utf8')) : { works: {} };

const chapterRoot = path.join(ROOT, 'chapters');
const workDirs = fs.readdirSync(chapterRoot).filter(d =>
  fs.statSync(path.join(chapterRoot, d)).isDirectory() &&
  fs.existsSync(path.join(chapterRoot, d, 'index.json')));

const sitemap = [];
const llms = [];
const trLines = [];
let pageCount = 0;
let trPageCount = 0;
let totalChars = 0;

for (const workId of workDirs) {
  const dir = path.join(chapterRoot, workId);
  const idx = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
  totalChars += idx.totalChars || 0;
  const recs = (POST.works && POST.works[workId]) || {};
  const list = idx.chapters || [];
  const transFile = path.join(dir, 'translations.json');
  const transMap = fs.existsSync(transFile)
    ? (JSON.parse(fs.readFileSync(transFile, 'utf8')).chapters || {}) : {};

  for (let k = 0; k < list.length; k++) {
    const meta = list[k];
    const num = meta.num;
    const data = JSON.parse(fs.readFileSync(path.join(dir, num + '.json'), 'utf8'));
    const p = recs[String(num)] || {};
    const paras = data.paragraphs || [];
    const bio = data.bio || '';
    const firstPosted = p.firstPostedAt || '';
    const bodyPosted = p.bodyFirstPostedAt || '';
    const updated = p.updatedAt || firstPosted;
    const url = SITE_URL + '/chapters/' + workId + '/' + num + '.html';
    const readerUrl = SITE_URL + '/reader.html?work=' + workId + '&ch=' + num;
    const langs = (transMap[String(num)] || []).filter(l =>
      fs.existsSync(path.join(dir, num + '.' + l + '.json')));
    const zhBook = bookTitle(workId, 'zh');
    const enBook = bookTitle(workId, 'en');

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Chapter',
      'name': data.title,
      'headline': data.title,
      'position': num,
      'author': personLd(SITE.author),
      'copyrightHolder': personLd(SITE.author),
      'copyrightYear': 2026,
      'inLanguage': 'zh-CN',
      'url': url,
      'isPartOf': { '@type': 'Book', 'name': zhBook, 'alternateName': enBook, 'url': SITE_URL + '/work.html?id=' + workId },
      'wordCount': data.chars || 0
    };
    if (firstPosted) ld.datePublished = firstPosted;
    if (updated) ld.dateModified = updated;
    ld.description = '《' + idx.title + '》' + data.title + '，作者默不如原创。' +
      (firstPosted ? '本站首发 ' + stamp(firstPosted, true) + ' (UTC+8)；' : '') +
      (bodyPosted ? '全文首发 ' + stamp(bodyPosted, true) + ' (UTC+8)。' : '');

    const desc = paras.join('').replace(/\s/g, '').slice(0, 150);
    const bodyHtml = paras.map(x => '<p>' + esc(x).replace(/\n/g, '<br>') + '</p>').join('\n');
    /* 翻页：按 index.json 的章节顺序取相邻章（num 是永久身份，不靠 num ± 1 推算）。
       prev/next 同时留给下面的译本页复用。 */
    const pMeta = k > 0 ? list[k - 1] : null;
    const nMeta = k < list.length - 1 ? list[k + 1] : null;
    const zhNav = chNavHtml(
      pMeta ? { href: pMeta.num + '.html', label: pMeta.title } : null,
      nMeta ? { href: nMeta.num + '.html', label: nMeta.title } : null,
      {
        chPrev: '上一章', chNext: '下一章', chFirst: '已是第一章', chLast: '已是最后一章',
        chList: '作品目录', chListHref: '../../work.html?id=' + workId, chNavAria: '章节翻页'
      });
    const otherLangHtml = langs.length
      ? '<div class="archive-nav lang-links"><span>其他语言版本：</span>' +
          langs.map(l => '<a href="' + num + '.' + l + '.html">' + esc(LABEL[l]) + '</a>').join(' · ') +
        '</div>'
      : '';

    const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(data.title)} - ${esc(idx.title)} - 默不如</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="${esc(SITE.author)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="默不如 · MOBURU">
<meta property="og:locale" content="zh_CN">
<meta property="og:title" content="${esc(data.title)} - ${esc(idx.title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
${langs.length ? hreflangLinks(workId, num, langs) : ''}<link rel="stylesheet" href="../../assets/css/style.css?v=${CSS_VER}">
<script src="../../assets/js/guard.js?v=${GUARD_VER}" defer></script>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body class="archive-page">
<div class="wrap reader archive">
  <p class="crumb"><a href="../../index.html">默不如</a> › <a href="../../work.html?id=${esc(workId)}">${esc(idx.title)}</a></p>
  <div class="beast-line">${esc(data.beast)}</div>
  <h1 class="chapter-title">${esc(data.title)}</h1>
  <div class="post-stamp">
    <span>本站首发：${esc(stamp(firstPosted, true))} (UTC+8)</span>
    ${bodyPosted ? '<span>全文首发：' + esc(stamp(bodyPosted, true)) + ' (UTC+8)</span>' : ''}
    ${p.revisions && p.revisions.length ? '<span>最后修订：' + esc(stamp(updated, true)) + '</span>' : ''}
    <span>© 2026 ${esc(SITE.author)} · 保留所有权利</span>
  </div>
  ${beastPanel(num, data.beast, bio)}<article class="content novel-text lang-zh">
${bodyHtml}
  </article>
  <div class="post-stamp">
    <span>全文 ${esc(String(data.chars || 0))} 字</span>
    <a href="../../posts.json">首发存证</a>
    <a href="${readerUrl}">在线阅读页</a>
  </div>
${zhNav}
${otherLangHtml}
  <p class="archive-foot">本页为作者独立官网的全文存档页，内容与 ${esc(zhBook)} 定稿一致。作品为作者个人原创，未授权任何平台独家转载。<br>笔名释义：${esc(nameMeaning('zh'))}<br>© 2026 ${esc(SITE.author)} · 保留所有权利。联系 / 合作：${esc((SITE.contact && SITE.contact.email) || '')}</p>
</div>
</body>
</html>
`;
    fs.writeFileSync(path.join(dir, num + '.html'), html, 'utf8');
    sitemap.push('  <url><loc>' + url + '</loc><lastmod>' + (updated ? stamp(updated, false) : '2026-11-09') +
      '</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>');
    llms.push('- [' + data.title + '](' + url + ')：' + data.chars + ' 字，首发 ' + stamp(firstPosted, false) +
      (bodyPosted ? '，全文首发 ' + stamp(bodyPosted, false) : ''));
    pageCount++;

    /* ---- 该章各语言译本存档页 ---- */
    for (const lang of langs) {
      const u = UI[lang];
      const tBook = bookTitle(workId, lang);
      const aLabel = authorLabel(lang);
      const t = JSON.parse(fs.readFileSync(path.join(dir, num + '.' + lang + '.json'), 'utf8'));
      const tr = ((p.translations || {})[lang]) || {};
      const tUrl = SITE_URL + '/chapters/' + workId + '/' + num + '.' + lang + '.html';
      const rtl = (lang === 'ar');
      const dirAttr = rtl ? ' dir="rtl"' : ' dir="ltr"';
      const tParas = t.paragraphs || [];
      const tBody = tParas.map(x => '<p>' + esc(x).replace(/\n/g, '<br>') + '</p>').join('\n');
      /* 神兽名与山海经小传：只在该语言译本自己提供了译文时显示，绝不回退中文；
         配图与语言无关，照常显示 */
      const tBeastLine = t.beast ? '<div class="beast-line">' + esc(t.beast) + '</div>\n  ' : '';
      const tBioBox = beastPanel(num, t.beast || data.beast, t.bio);
      /* 西文 / 阿拉伯语译文必须保留词间空格，不能像中文那样压缩空白 */
      const tDesc = (tParas[0] || '').trim().replace(/\s+/g, ' ').slice(0, 180);
      const tLd = {
        '@context': 'https://schema.org',
        '@type': 'Chapter',
        'name': t.title,
        'headline': t.title,
        'position': num,
        'author': personLd(SITE.author),
        'copyrightHolder': personLd(SITE.author),
        'copyrightYear': 2026,
        'inLanguage': HREFLANG[lang],
        'url': tUrl,
        'isPartOf': { '@type': 'Book', 'name': tBook, 'alternateName': enBook, 'url': SITE_URL + '/work.html?id=' + workId },
        'isBasedOn': { '@type': 'Chapter', 'name': data.title, 'inLanguage': 'zh-CN', 'url': url },
        'wordCount': t.chars || 0
      };
      if (tr.firstPostedAt) tLd.datePublished = tr.firstPostedAt;
      if (tr.updatedAt) tLd.dateModified = tr.updatedAt;
      tLd.description = t.title + ' — ' + LABEL[lang] + ' / ' + tBook + ' / ' + aLabel;
      /* 小传是「神兽即命运」的结构线索，纳入结构化摘要便于检索与 AI 理解 */
      if (t.bio) tLd.description += ' / ' + t.bio.replace(/\s+/g, ' ').slice(0, 120);

      /* 译本页翻页：相邻章若也有本语言译本，就链到同语言页；
         没有译本则回落到该章中文存档页，并在标题后注明「中文原文」，
         与阅读页「无译本显示中文原文」的既有约定一致。 */
      const langsOfNav = n => (transMap[String(n)] || [])
        .filter(l => fs.existsSync(path.join(dir, n + '.' + l + '.json')));
      const trTitle = n => {
        try {
          return JSON.parse(fs.readFileSync(path.join(dir, n + '.' + lang + '.json'), 'utf8')).title || '';
        } catch (e) { return ''; }
      };
      const navItem = m => {
        if (!m) return null;
        if (langsOfNav(m.num).indexOf(lang) >= 0) {
          return { href: m.num + '.' + lang + '.html', label: trTitle(m.num) || m.title };
        }
        return { href: m.num + '.html', label: m.title + ' · ' + u.original };
      };
      const tNav = chNavHtml(navItem(pMeta), navItem(nMeta), {
        chPrev: u.chPrev, chNext: u.chNext, chFirst: u.chFirst, chLast: u.chLast,
        chList: u.chList, chListHref: '../../work.html?id=' + workId, chNavAria: u.chNavAria
      });

      const langNav = '<div class="archive-nav lang-links"><span>' + esc(u.other) + esc(u.colon) + '</span>' +
        '<a href="' + num + '.html">' + esc(u.original) + '</a>' +
        langs.filter(x => x !== lang).map(x =>
          ' · <a href="' + num + '.' + x + '.html">' + esc(LABEL[x]) + '</a>').join('') +
        '</div>';
      const tHtml = `<!doctype html>
<html lang="${HREFLANG[lang]}"${dirAttr}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.title)} - ${esc(tBook)} - ${esc(aLabel)}</title>
<meta name="description" content="${esc(tDesc)}">
<meta name="author" content="${esc(aLabel)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${tUrl}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="MOBURU">
<meta property="og:locale" content="${OG_LOCALE[lang]}">
<meta property="og:title" content="${esc(t.title)} - ${esc(tBook)}">
<meta property="og:description" content="${esc(tDesc)}">
<meta property="og:url" content="${tUrl}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
${hreflangLinks(workId, num, langs)}<link rel="stylesheet" href="../../assets/css/style.css?v=${CSS_VER}">
<script src="../../assets/js/guard.js?v=${GUARD_VER}" defer></script>
<script type="application/ld+json">${JSON.stringify(tLd)}</script>
</head>
<body class="archive-page">
<div class="wrap reader archive">
  <p class="crumb"><a href="../../index.html">${esc(aLabel)}</a> › <a href="../../work.html?id=${esc(workId)}">${esc(tBook)}</a></p>
  ${tBeastLine}<h1 class="chapter-title">${esc(t.title)}</h1>
  <div class="post-stamp">
    ${tr.firstPostedAt ? '<span>' + esc(u.trFirst) + esc(u.colon) + esc(stamp(tr.firstPostedAt, true)) + ' (UTC+8)</span>' : ''}
    <span>${esc(u.first)}${esc(u.colon)}${esc(stamp(firstPosted, true))} (UTC+8)</span>
    ${tr.revisions && tr.revisions.length ? '<span>' + esc(u.updated) + esc(u.colon) + esc(stamp(tr.updatedAt, true)) + '</span>' : ''}
    <span>© 2026 ${esc(aLabel)} · ${esc(u.rights)}</span>
  </div>
  ${tBioBox}<article class="content novel-text lang-${lang}">
${tBody}
  </article>
  <div class="post-stamp">
    <span>${esc(String(t.chars || 0))} ${esc(u.words)}</span>
    <a href="../../posts.json">${esc(u.record)}</a>
    <a href="${readerUrl}">${esc(u.reader)}</a>
  </div>
${tNav}
${langNav}
  <p class="archive-foot">${esc(u.foot)}<br>${esc(nameMeaning(lang))}<br>© 2026 ${esc(aLabel)} · ${esc(u.rights)}. ${esc(u.contact)}${esc(u.colon)}${esc((SITE.contact && SITE.contact.email) || '')}</p>
</div>
</body>
</html>
`;
      fs.writeFileSync(path.join(dir, num + '.' + lang + '.html'), tHtml, 'utf8');
      sitemap.push('  <url><loc>' + tUrl + '</loc><lastmod>' +
        (tr.updatedAt ? stamp(tr.updatedAt, false) : (updated ? stamp(updated, false) : '2026-11-09')) +
        '</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>');
      trLines.push('- [' + t.title + ' · ' + LABEL[lang] + '](' + tUrl + ')：' +
        t.paragraphCount + ' 段，译本首发 ' + stamp(tr.firstPostedAt, false));
      trPageCount++;
    }
  }
}

/* 页面级 sitemap：由 tools/build-lang-pages.js 生成（6 页 × 5 语言，含 hreflang 互通）。
   这里不再手写中文页列表，避免与那份清单重复。 */
const staticUrls = [
  ['/posts.json', '0.5']
];
const langPages = (function () {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'pages-sitemap.json'), 'utf8'));
  } catch (e) { return []; }
})();
const langBlocks = langPages.map(function (p) {
  const alts = (p.alternates || []).map(function (a) {
    return '    <xhtml:link rel="alternate" hreflang="' + a.hreflang + '" href="' + a.href + '"/>';
  }).join('\n');
  return '  <url>\n    <loc>' + p.loc + '</loc>\n    <changefreq>weekly</changefreq>\n' +
    '    <priority>' + p.priority + '</priority>\n' + alts + '\n  </url>';
});
const sm = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  staticUrls.map(u => '  <url><loc>' + SITE_URL + u[0].replace('&', '&amp;') + '</loc><priority>' + u[1] + '</priority></url>').join('\n') + '\n' +
  langBlocks.join('\n') + '\n' +
  sitemap.join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sm, 'utf8');
fs.writeFileSync(path.join(ROOT, 'robots.txt'),
  'User-agent: *\nAllow: /\nSitemap: ' + SITE_URL + '/sitemap.xml\n', 'utf8');

const trSection = trLines.length
  ? '\n## 多语言译本（按章交付，各语言有独立首发时间）\n\n' + trLines.join('\n') + '\n'
  : '';
const llm = `# 默不如 · 作者独立小说官网

> 生物技术公司创始人、作家默不如的个人原创作品站。官网优先更新，作品均为作者本人原创，未授权任何平台独家转载。

- 官网：${SITE_URL}
- 作者：默不如 / ${SITE.latinName || 'Moburu'}（女性作者 / female author；笔名释义 "${SITE.nameMeaningOfficial || 'rather silence'}"，意为「不如沉默」；小米科技前高管，创立过全球第一家直播电商平台）
- 联系 / 合作：${(SITE.contact && SITE.contact.email) || ''}
- 首发存证（每章首次公开时间与内容 SHA-256，含各语言译本）：${SITE_URL}/posts.json
- 全文存档：不依赖 JavaScript 的静态 HTML 页面，含完整正文与版权声明

## 《恨长沙》 / ${bookTitle('henchangsha', 'en')}

> 官方国际书名 ${bookTitle('henchangsha', 'en')}。书名中的「恨」意为「遗憾 / 失落」，不是「憎恨」。

中年技术男郑智咏在体制、资本、人情与欲望的夹缝里重新拼起自己。全书以《山海经》神兽逐章命名，神兽即命运。共 ${pageCount} 章，全文约 ${(totalChars / 10000).toFixed(1)} 万字。

${llms.join('\n')}
${trSection}
## 版权

© 2026 默不如zZZ · 保留所有权利。转载、引用请注明出处 ${SITE_URL}。
`;
fs.writeFileSync(path.join(ROOT, 'llms.txt'), llm, 'utf8');

console.log('中文静态存档页：' + pageCount + ' 个');
console.log('译文静态存档页：' + trPageCount + ' 个');
console.log('  -> sitemap.xml / robots.txt / llms.txt');
