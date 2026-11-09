#!/usr/bin/env node
/* ============================================================
   默不如小说官网 · 首发时间戳 / 版权存证生成脚本

   用法：在项目根目录执行  node tools/publish.js

   做什么：
   1. 读取 assets/js/data.js 里的 WORKS（按 num 逐章比对）。
   2. 章节「首次出现」→ 写入 firstPostedAt（当前 UTC+8 时间）+ 首发内容 SHA-256。
      正文首次公开 → 另写 bodyFirstPostedAt（全文首发），同样只写一次。
   3. 已存在但内容变了（含正文增删）→ 只追加一条 revisions 记录，
      **绝不改写 firstPostedAt / bodyFirstPostedAt**。
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
/* 章节内容指纹：所有内容字段都参与，任何改动都会被检出 */
function chapterPayload(work, c, bodyHash) {
  return JSON.stringify({
    work: work.id,
    num: c.num,
    name: c.name || '',
    title: c.title || {},
    bio: c.bio || {},
    excerpt: c.excerpt || {},
    content: c.content || {},
    body: bodyHash || ''
  });
}
function sha256(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}
function hasContent(c) {
  return (c.bio && Object.keys(c.bio).length) ||
         (c.excerpt && Object.keys(c.excerpt).length) ||
         (c.content && Object.keys(c.content).length);
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
  rules: 'firstPostedAt 只在章节首次出现时写入、bodyFirstPostedAt 只在正文首次公开时写入，两者之后永不覆盖；内容变更只追加 revisions 与 updatedAt。sha256 含正文哈希。',
  verification: '本文件与 assets/js/posts.js 随每次发布一并提交到公开 GitHub 仓库。git commit 时间、GitHub Pages 部署记录、搜索引擎收录与网络存档（如 Wayback Machine）共同构成第三方可核验的时间证据；sha256 为发布当时章节内容的哈希。',
  copyright: '© 2026 默不如zZZ. All rights reserved. / 保留所有权利。',
  generatedAt: now,
  works: {}
};

let added = 0, changed = 0, kept = 0;
for (const w of WORKS) {
  const oldMap = oldWorks[w.id] || {};
  const out = {};
  for (const c of (w.chapters || [])) {
    if (!hasContent(c)) continue;          // 纯占位章节（如「即将上线」的序）不记首发
    const key = String(c.num);
    const bi = bodyInfo(w, c);
    const h = sha256(chapterPayload(w, c, bi && bi.hash));
    const p = oldMap[key];
    if (!p) {
      const rec = {
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
      out[key] = rec;
      added++;
    } else {
      const rec = JSON.parse(JSON.stringify(p));
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
      out[key] = rec;
    }
  }
  log.works[w.id] = out;
}

const banner =
  '/* 自动生成，请勿手工编辑 —— 由 node tools/publish.js 生成 */\n' +
  '/* firstPostedAt = 内容首次发布到本站的时间，只写一次、永不覆盖 */\n';
fs.writeFileSync(POSTS_JS, banner + 'const POST_LOG = ' + JSON.stringify(log, null, 2) + ';\n', 'utf8');
fs.writeFileSync(POSTS_JSON, JSON.stringify(log, null, 2) + '\n', 'utf8');

console.log('首发时间戳已生成：' + now);
console.log('  新增首发章节 ' + added + ' 章 / 内容有修订 ' + changed + ' 章 / 未变 ' + kept + ' 章');
console.log('  -> assets/js/posts.js');
console.log('  -> posts.json');
console.log('提醒：请把这两个文件一起 git commit；firstPostedAt 永不被后续修订覆盖。');
