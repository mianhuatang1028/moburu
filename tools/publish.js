#!/usr/bin/env node
/* ============================================================
   默不如小说官网 · 首发时间戳 / 版权存证生成脚本

   用法：在项目根目录执行  node tools/publish.js

   做什么：
   1. 读取 assets/js/data.js 里的 WORKS（按 num 逐章比对）。
   2. 章节「首次出现」→ 写入 firstPostedAt（当前 UTC+8 时间）+ 首发内容 SHA-256。
      中文正文首次公开 → 另写 bodyFirstPostedAt（全文首发）；
      各语言译本首次公开 → 另写 translations[lang].firstPostedAt（译本首发）。
      三者都只写一次。
   3. 已存在但内容变了（含正文增删、译本改稿）→ 只追加一条 revisions 记录，
      **绝不改写任何 firstPostedAt**。译本改动另在该语言下追加修订链。
   4. 生成 assets/js/posts.js（页面同步读取）与 posts.json（公开存证文件）。

   重要：firstPostedAt 只写一次。以后正文补发、修订、改错别字，都只会
   追加修订记录，最早的那次发布时间永远保留 —— 这正是原创性存证的意义。
   每次发布请把 posts.js / posts.json 一起 git commit；git 提交时间、
   GitHub Pages 部署记录、网络存档共同构成第三方可核验的时间证据。
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DATA_JS = path.join(ROOT, 'assets', 'js', 'data.js');
const POSTS_JS = path.join(ROOT, 'assets', 'js', 'posts.js');
const POSTS_JSON = path.join(ROOT, 'posts.json');

/* 北京时间（UTC+8）ISO 字符串，例如 2026-11-09T21:20:00+08:00 */
function nowStamp() {
  return new Date(Date.now() + 8 * 3600 * 1000)
    .toISOString().replace(/\.\d{3}Z$/, '+08:00');
}

/* 在沙箱里执行数据文件，取出顶层 const 常量 */
function loadConst(src, name) {
  const ctx = {};
  vm.runInNewContext(src + '\n;globalThis.__OUT__ = ' + name + ';', ctx, { timeout: 3000 });
  return ctx.__OUT__;
}

/* 正文按章存放于 chapters/<作品>/<章号>.json；把正文哈希纳入章节指纹，
   这样正文的任何增删改动都会留下一条修订记录，且能单独记录「全文首发」时间。 */
function bodyInfo(work, c) {
  const fp = path.join(ROOT, 'chapters', work.id, String(c.num) + '.json');
  if (!fs.existsSync(fp)) return null;
  try {
    const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const paragraphs = Array.isArray(j.paragraphs) ? j.paragraphs : [];
    return {
      hash: sha256(JSON.stringify(paragraphs)),
      chars: j.chars || 0,
      paragraphs: paragraphs.length
    };
  } catch (e) { return null; }
}
/* 译本按章存于 chapters/<作品>/<章号>.<语言>.json；
   每种语言单独算哈希，用于独立记录「译本首发」并留下修订链。 */
const TR_LANGS = ['en', 'ja', 'fr', 'ar'];
function translationInfo(work, c) {
  const out = {};
  for (const lang of TR_LANGS) {
    const fp = path.join(ROOT, 'chapters', work.id, c.num + '.' + lang + '.json');
    if (!fs.existsSync(fp)) continue;
    try {
      const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
      const paragraphs = Array.isArray(j.paragraphs) ? j.paragraphs : [];
      /* 神兽小传与神兽名同属译本内容；只在译本提供时才纳入，避免已有译本产生虚假修订 */
      const payload = { title: j.title || '', paragraphs: paragraphs };
      if (j.beast) payload.beast = j.beast;
      if (j.bio) payload.bio = j.bio;
      out[lang] = {
        hash: sha256(JSON.stringify(payload)),
        chars: j.chars || 0,
        paragraphs: paragraphs.length
      };
    } catch (e) { /* 忽略损坏的译文文件，下次修复后重跑即可 */ }
  }
  return out;
}
/* 章节内容指纹：所有内容字段都参与，任何改动都会被检出（含各语言译本） */
function chapterPayload(work, c, bodyHash, trHashes) {
  const p = {
    work: work.id,
    num: c.num,
    name: c.name || '',
    title: c.title || {},
    /* 章节级存证只认中文目录；其他语言的小传由各译本自己的哈希记录，
       因此给 bio 增加新语言不会让中文正文产生无意义的修订记录 */
    bio: (c.bio && c.bio.zh) ? { zh: c.bio.zh } : (c.bio || {}),
    excerpt: c.excerpt || {},
    content: c.content || {},
    body: bodyHash || ''
  };
  /* 无译本的章节保持与旧版完全一致的 payload，避免产生无意义修订记录 */
  if (trHashes && Object.keys(trHashes).length) {
    p.translations = c.translations || [];
    p.translationBodies = trHashes;
  }
  return JSON.stringify(p);
}
function sha256(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}
function hasContent(c) {
  return (c.bio && Object.keys(c.bio).length) ||
         (c.excerpt && Object.keys(c.excerpt).length) ||
         (c.content && Object.keys(c.content).length) ||
         (c.translations && c.translations.length);
}

const WORKS = loadConst(fs.readFileSync(DATA_JS, 'utf8'), 'WORKS');

/* 上一版存证：优先读公开 JSON，其次读页面用的 JS */
let prev = null;
if (fs.existsSync(POSTS_JSON)) {
  try { prev = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf8')); } catch (e) { /* 忽略损坏文件 */ }
}
if (!prev && fs.existsSync(POSTS_JS)) {
  try { prev = loadConst(fs.readFileSync(POSTS_JS, 'utf8'), 'POST_LOG'); } catch (e) { /* 忽略 */ }
}
const oldWorks = (prev && prev.works) || {};

const now = nowStamp();
const log = {
  site: 'moburu.vip',
  timezone: 'Asia/Shanghai (UTC+8)',
  purpose: '记录每章内容首次公开发布到本站的时间，用于证明原创性与版权归属。',
  rules: 'firstPostedAt（章节目录）、bodyFirstPostedAt（中文全文）、translations[lang].firstPostedAt（各语言译本）各自只在首次出现时写入，之后永不覆盖；内容变更只追加 revisions 与 updatedAt。sha256 含中文正文与各语言译本哈希。',
  verification: '本文件与 assets/js/posts.js 随每次发布一并提交到公开 GitHub 仓库。git commit 时间、GitHub Pages 部署记录、搜索引擎收录与网络存档（如 Wayback Machine）共同构成第三方可核验的时间证据；sha256 为发布当时章节内容的哈希。',
  copyright: '© 2026 默不如zZZ. All rights reserved. / 保留所有权利。',
  generatedAt: now,
  works: {}
};

let added = 0, changed = 0, kept = 0, trAdded = 0, trChanged = 0;
for (const w of WORKS) {
  const oldMap = oldWorks[w.id] || {};
  const out = {};
  for (const c of (w.chapters || [])) {
    const ti = translationInfo(w, c);
    if (!hasContent(c) && !Object.keys(ti).length) continue;  // 纯占位章节不记首发
    const key = String(c.num);
    const bi = bodyInfo(w, c);
    const trHashes = {};
    Object.keys(ti).forEach(l => { trHashes[l] = ti[l].hash; });
    const h = sha256(chapterPayload(w, c, bi && bi.hash, trHashes));
    const p = oldMap[key];
    let rec;
    if (!p) {
      rec = {
        num: c.num,
        name: c.name || '',
        firstPostedAt: now,
        firstSha256: h,
        sha256: h,
        updatedAt: now,
        revisions: []
      };
      if (bi) {
        rec.bodyFirstPostedAt = now;       // 全文首发：只写一次
        rec.bodyFirstSha256 = bi.hash;
        rec.bodySha256 = bi.hash;
        rec.bodyChars = bi.chars;
      }
      added++;
    } else {
      rec = JSON.parse(JSON.stringify(p));
      if (bi && !rec.bodyFirstPostedAt) {
        rec.bodyFirstPostedAt = now;       // 补发全文：记录全文首发，不改目录首发
        rec.bodyFirstSha256 = bi.hash;
        rec.bodySha256 = bi.hash;
        rec.bodyChars = bi.chars;
      }
      if (p.sha256 !== h) {
        const rev = { at: now, sha256: h, previousSha256: p.sha256 };
        if (bi) { rev.bodySha256 = bi.hash; rev.bodyChars = bi.chars; }
        rec.revisions = (rec.revisions || []).concat([rev]);
        rec.sha256 = h;
        rec.updatedAt = now;
        if (bi) { rec.bodySha256 = bi.hash; rec.bodyChars = bi.chars; }
        changed++;
      } else {
        kept++;
      }
    }

    /* 每种语言的译本单独记「译本首发」，只写一次；改稿只追加该语言的修订链 */
    rec.translations = rec.translations || {};
    for (const lang of Object.keys(ti)) {
      const info = ti[lang];
      const old = rec.translations[lang];
      if (!old) {
        rec.translations[lang] = {
          firstPostedAt: now,
          firstSha256: info.hash,
          sha256: info.hash,
          updatedAt: now,
          chars: info.chars,
          paragraphs: info.paragraphs,
          revisions: []
        };
        trAdded++;
      } else if (old.sha256 !== info.hash) {
        (old.revisions || (old.revisions = [])).push({
          at: now, sha256: info.hash, previousSha256: old.sha256, chars: info.chars
        });
        old.sha256 = info.hash;
        old.updatedAt = now;
        old.chars = info.chars;
        old.paragraphs = info.paragraphs;
        trChanged++;
      }
    }
    out[key] = rec;
  }
  log.works[w.id] = out;
}

const banner =
  '/* 自动生成，请勿手工编辑 —— 由 node tools/publish.js 生成 */\n' +
  '/* firstPostedAt = 内容首次发布到本站的时间，只写一次、永不覆盖 */\n';
fs.writeFileSync(POSTS_JS, banner + 'const POST_LOG = ' + JSON.stringify(log, null, 2) + ';\n', 'utf8');
fs.writeFileSync(POSTS_JSON, JSON.stringify(log, null, 2) + '\n', 'utf8');

console.log('首发时间戳已生成：' + now);
console.log('  章节：新增首发 ' + added + ' / 内容有修订 ' + changed + ' / 未变 ' + kept);
console.log('  译本：新增首发 ' + trAdded + ' / 内容有修订 ' + trChanged + '（按语言分别计）');
console.log('  -> assets/js/posts.js');
console.log('  -> posts.json');
console.log('提醒：请把这两个文件一起 git commit；firstPostedAt 永不被后续修订覆盖。');
