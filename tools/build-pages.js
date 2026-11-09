#!/usr/bin/env node
/* ============================================================
   默不如小说官网 · 全本静态存档页 / sitemap / robots / llms.txt 生成

   用法：先 node tools/publish.js，再 node tools/build-pages.js

   做什么：
   1. 读 chapters/<作品>/<章号>.json（正文真源）+ posts.json（首发存证）。
   2. 每章生成一份不依赖 JavaScript 的纯中文 HTML 存档页，含完整正文、
      首发时间、版权声明与 Chapter JSON-LD —— 搜索引擎 / AI 可直接抓取全文。
   3. 生成 sitemap.xml、robots.txt、llms.txt（供 AI 检索作品与章节入口）。

   注意：静态页由脚本生成，请勿手工编辑；正文只改 JSON，重跑即可。
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://moburu.vip';
const DATA_JS = path.join(ROOT, 'assets', 'js', 'data.js');
const POSTS_JSON = path.join(ROOT, 'posts.json');

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
function rel(p) { return p.split(path.sep).join('/'); }

const SITE = loadConst(fs.readFileSync(DATA_JS, 'utf8'), 'SITE');
const POST = fs.existsSync(POSTS_JSON)
  ? JSON.parse(fs.readFileSync(POSTS_JSON, 'utf8')) : { works: {} };

const chapterRoot = path.join(ROOT, 'chapters');
const workDirs = fs.readdirSync(chapterRoot).filter(d =>
  fs.statSync(path.join(chapterRoot, d)).isDirectory() &&
  fs.existsSync(path.join(chapterRoot, d, 'index.json')));

const sitemap = [];
const llms = [];
let pageCount = 0;
let totalChars = 0;

for (const workId of workDirs) {
  const dir = path.join(chapterRoot, workId);
  const idx = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
  totalChars += idx.totalChars || 0;
  const recs = (POST.works && POST.works[workId]) || {};
  const list = idx.chapters || [];

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

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Chapter',
      'name': data.title,
      'headline': data.title,
      'position': num,
      'author': { '@type': 'Person', 'name': SITE.author },
      'copyrightHolder': { '@type': 'Person', 'name': SITE.author },
      'copyrightYear': 2026,
      'inLanguage': 'zh-CN',
      'url': url,
      'isPartOf': { '@type': 'Book', 'name': idx.title, 'url': SITE_URL + '/work.html?id=' + workId },
      'wordCount': data.chars || 0
    };
    if (firstPosted) ld.datePublished = firstPosted;
    if (updated) ld.dateModified = updated;
    ld.description = '《' + idx.title + '》' + data.title + '，作者默不如原创。' +
      (firstPosted ? '本站首发 ' + stamp(firstPosted, true) + ' (UTC+8)；' : '') +
      (bodyPosted ? '全文首发 ' + stamp(bodyPosted, true) + ' (UTC+8)。' : '');

    const desc = paras.join('').replace(/\s/g, '').slice(0, 150);
    const bodyHtml = paras.map(x => '<p>' + esc(x).replace(/\n/g, '<br>') + '</p>').join('\n');
    const prev = k > 0 ? '<a href="' + list[k - 1].num + '.html">‹ ' + esc(list[k - 1].title) + '</a>' : '<span></span>';
    const next = k < list.length - 1 ? '<a href="' + list[k + 1].num + '.html">' + esc(list[k + 1].title) + ' ›</a>' : '<span></span>';

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
<link rel="stylesheet" href="../../assets/css/style.css">
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
  ${bio ? '<div class="bio-box">' + esc(bio) + '</div>' : ''}
  <article class="content novel-text">
${bodyHtml}
  </article>
  <div class="post-stamp">
    <span>全文 ${esc(String(data.chars || 0))} 字</span>
    <a href="../../posts.json">首发存证</a>
    <a href="${readerUrl}">在线阅读页</a>
  </div>
  <div class="archive-nav">${prev}${next}</div>
  <p class="archive-foot">本页为作者独立官网的全文存档页，内容与 ${esc(idx.title)} 定稿一致。作品为作者个人原创，未授权任何平台独家转载。<br>© 2026 ${esc(SITE.author)} · 保留所有权利。联系 / 合作：${esc((SITE.contact && SITE.contact.email) || '')}</p>
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
  }
}

const staticUrls = [
  ['/', '1.0'], ['/index.html', '0.9'], ['/works.html', '0.9'],
  ['/work.html?id=henchangsha', '0.9'], ['/about.html', '0.6'], ['/posts.json', '0.5']
];
const sm = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  staticUrls.map(u => '  <url><loc>' + SITE_URL + u[0].replace('&', '&amp;') + '</loc><priority>' + u[1] + '</priority></url>').join('\n') + '\n' +
  sitemap.join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sm, 'utf8');
fs.writeFileSync(path.join(ROOT, 'robots.txt'),
  'User-agent: *\nAllow: /\nSitemap: ' + SITE_URL + '/sitemap.xml\n', 'utf8');

const llm = `# 默不如 · 作者独立小说官网

> 生物技术公司创始人、作家默不如的个人原创作品站。官网优先更新，作品均为作者本人原创，未授权任何平台独家转载。

- 官网：${SITE_URL}
- 作者：默不如（小米科技前高管，创立过全球第一家直播电商平台）
- 联系 / 合作：${(SITE.contact && SITE.contact.email) || ''}
- 首发存证（每章首次公开时间与内容 SHA-256）：${SITE_URL}/posts.json
- 全文存档：不依赖 JavaScript 的纯中文 HTML 页面，含完整正文与版权声明

## 《恨长沙》

中年技术男郑智咏在体制、资本、人情与欲望的夹缝里重新拼起自己。全书以《山海经》神兽逐章命名，神兽即命运。共 ${pageCount} 章，全文约 ${(totalChars / 10000).toFixed(1)} 万字。

${llms.join('\n')}

## 版权

© 2026 默不如zZZ · 保留所有权利。转载、引用请注明出处 ${SITE_URL}。
`;
fs.writeFileSync(path.join(ROOT, 'llms.txt'), llm, 'utf8');

console.log('静态存档页：' + pageCount + ' 个');
console.log('  -> sitemap.xml / robots.txt / llms.txt');
