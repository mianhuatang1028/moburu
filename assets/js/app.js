/* ============================================================
   默不如小说官网 · 渲染逻辑（多语言 + 付费端口预留）
   ============================================================ */

/* 首访语言推断：只有「读者从没手动点过语言按钮」时才按浏览器语言自动选。
   手动点过 → localStorage 已写入 → 永久记住，不再被浏览器语言覆盖。
   浏览器语言判断只看前两位（zh-CN / zh-TW / zh-Hant 都算中文），
   站里没有的语言一律回到中文，不会出现空白页。 */
function detectLang() {
  var saved = localStorage.getItem("moburu_lang") || localStorage.getItem("mobuyu_lang");
  if (saved) return saved;
  var prefer = "";
  if (typeof navigator !== "undefined") {
    prefer = (navigator.languages && navigator.languages.length)
      ? navigator.languages[0] : (navigator.language || "");
  }
  var p = String(prefer).toLowerCase().slice(0, 2);
  var map = { zh: "zh", en: "en", ja: "ja", fr: "fr", ar: "ar" };
  return map[p] || "zh";
}

/* 当前语言（持久化到 localStorage；首访按浏览器语言推断） */
var LANG = detectLang();
var MEMBER = false;        // 预留会员状态；接入支付/登录后由后端决定
var SHOW_MEMBER = false;   // 付费入口总开关：false=全站隐藏会员/付费 UI；未来开放改 true 即可

/* 进入页面立刻同步 <html lang> 与 RTL：自动识别到阿拉伯语时，若不同步 dir，
   整个页面会按从左到右排版（正文、导航全反）。内联脚本只调 renderNav，
   不会替我们做这一步，所以在这里先设一次。 */
(function () {
  var map = { zh: "zh-CN", en: "en", ja: "ja", fr: "fr", ar: "ar" };
  document.documentElement.lang = map[LANG] || "zh-CN";
  document.documentElement.dir = (LANG === "ar") ? "rtl" : "ltr";
})();

function setLang(code) {
  LANG = code;
  localStorage.setItem("moburu_lang", code);
  var langMap = { zh: "zh-CN", en: "en", ja: "ja", fr: "fr", ar: "ar" };
  document.documentElement.lang = langMap[code] || "zh-CN";
  document.documentElement.dir = (code === "ar") ? "rtl" : "ltr"; // 阿拉伯语右到左
  if (window.__render) window.__render();   // 重渲染当前页
}

/* 取 UI 文案 */
/* 取当前语言的 UI 词条。支持点号路径（nav.home 这种嵌套键）。
   回退链：当前语言 → 中文 → 空串。取不到时返回空串而不是键名，
   否则页面会把 nav_home 这种内部键直接印在导航栏上。 */
function _pick(pack, key) {
  if (!pack) return null;
  if (pack[key] != null) return pack[key];
  if (key.indexOf(".") < 0) return null;
  var cur = pack, parts = key.split(".");
  for (var i = 0; i < parts.length; i++) {
    if (cur == null) return null;
    cur = cur[parts[i]];
  }
  return cur == null ? null : cur;
}
function t(key) {
  var v = _pick(I18N[LANG], key);
  if (v == null) v = _pick(I18N.zh, key);
  if (v == null) {
    if (typeof console !== "undefined" && console.warn) console.warn("[i18n] 缺少词条: " + key);
    return "";
  }
  return v;
}
/* 取多语言内容字段（回退链：当前语言 → 中文原文，绝不回退英文，避免中英文混排） */
function tv(obj) {
  if (obj == null) return "";
  if (obj[LANG] != null) return obj[LANG];
  if (obj.zh != null) return obj.zh;
  if (obj.en != null) return obj.en;
  return "";
}

/* 作者署名：中文页保留中文名，非中文页用拼音 Moburu（与域名一致）。
   结构化数据里两种写法都保留，并附笔名释义 "rather silence"，便于 AI 关联同一作者。 */
function authorDisplay() {
  return (LANG === "zh") ? SITE.author : (SITE.latinName || "Moburu");
}
function personLd(name) {
  return {
    "@type": "Person",
    "name": name || SITE.author,
    "alternateName": SITE.latinName || "Moburu",
    "description": SITE.nameMeaningOfficial || "rather silence",
    "gender": SITE.gender || "female"
  };
}

/* 章节标题 / 神兽名：按当前语言派生，保证单语言一致（非 CJK 语言用罗马音，不掺中文） */
function _beastNames(c) {
  var zh = (c.title && c.title.zh) || "";
  var en = (c.title && c.title.en) || "";
  var zhName = (zh.indexOf("：") >= 0) ? zh.split("：").pop().trim()
            : (zh.indexOf("章 ") >= 0 ? zh.split("章 ").pop().trim() : zh.trim());
  var enName = (en.indexOf(":") >= 0) ? en.split(":").pop().trim()
            : en.replace(/^Ch\.\s*\d+\s*/i, "").trim();
  return { zh: zhName, en: enName };
}
/* 该章是否已发布当前语言译本（译文按章存于 chapters/<作品>/<num>.<lang>.json） */
function hasTranslation(c, lang) {
  var code = lang || LANG;
  return code !== "zh" && !!(c && c.translations && c.translations.indexOf(code) >= 0);
}
function langLabel(code) {
  var hit = (typeof LANGS !== "undefined" ? LANGS : []).filter(function (l) { return l.code === code; })[0];
  return hit ? hit.label : code;
}
/* 有译文标题时，神兽名也从译名里派生，避免非中文页面冒出汉字 */
function _localBeast(c) {
  var loc = c.title && c.title[LANG];
  if (!loc || LANG === "zh") return "";
  var sep = loc.indexOf("：") >= 0 ? "：" : (loc.indexOf(":") >= 0 ? ":" : "");
  return sep ? loc.split(sep).pop().trim() : "";
}
function beastName(c) {
  var local = _localBeast(c);
  if (local) return local;
  var n = _beastNames(c);
  return (LANG === "zh" || LANG === "ja") ? (n.zh || n.en) : (n.en || n.zh);
}
function chapterTitle(c) {
  /* 优先用该语言译名；未翻译的章沿用原有派生规则（零回归） */
  if (c.title && c.title[LANG]) return c.title[LANG];
  var n = _beastNames(c), num = c.num;
  if (LANG === "zh" || LANG === "ja") return (c.title && c.title.zh) || (c.title && c.title.en) || "";
  if (LANG === "en") return (c.title && c.title.en) || (c.title && c.title.zh) || "";
  if (LANG === "fr") return (num === 0 ? "Prologue" : "Chapitre " + num) + " : " + n.en;
  if (LANG === "ar") return (num === 0 ? "مقدمة" : "الفصل " + num) + " : " + n.en;
  return (c.title && c.title.en) || "";
}

/* 章节展示顺序：作品可用 chapterOrder（num 数组）自由重排叙事顺序。
   未配置时按 chapters 数组原顺序（零回归）。num 始终不变：URL、神兽名、
   正文、起点对应关系都不动，读者收藏的旧链接不会失效。 */
function orderedChapters(w) {
  var list = (w.chapters || []).slice();
  if (!w.chapterOrder || !w.chapterOrder.length) return list;
  var rank = {};
  w.chapterOrder.forEach(function (n, i) { rank[n] = i; });
  return list.sort(function (a, b) {
    var ra = (rank[a.num] != null) ? rank[a.num] : 10000 + a.num;
    var rb = (rank[b.num] != null) ? rank[b.num] : 10000 + b.num;
    return ra - rb;
  });
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ---------- 首发时间戳 / 版权存证（读 posts.js，由 tools/publish.js 生成） ---------- */
function postInfo(work, c) {
  if (typeof POST_LOG === "undefined" || !POST_LOG.works) return null;
  var g = POST_LOG.works[work.id];
  return (g && g[String(c.num)]) || null;
}
/* "2026-11-09T21:27:27+08:00" -> "2026-11-09" 或 "2026-11-09 21:27" */
function fmtStamp(s, withTime) {
  if (!s) return "";
  var m = String(s).match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return m ? (m[1] + (withTime ? " " + m[2] : "")) : String(s).slice(0, 10);
}
/* 作品最早首发 / 最后修订：取全部章节的极值 */
function workFirstPosted(work) {
  var first = "";
  (work.chapters || []).forEach(function (c) {
    var p = postInfo(work, c);
    if (p && p.firstPostedAt && (!first || p.firstPostedAt < first)) first = p.firstPostedAt;
  });
  return first;
}
function workLastUpdated(work) {
  var last = "";
  (work.chapters || []).forEach(function (c) {
    var p = postInfo(work, c);
    if (p && p.updatedAt && p.updatedAt > last) last = p.updatedAt;
  });
  return last;
}
function langCode() {
  return (LANG === "zh") ? "zh-CN" : (LANG === "en") ? "en" : (LANG === "ja") ? "ja" : (LANG === "fr") ? "fr" : (LANG === "ar") ? "ar" : "zh-CN";
}

/* ---------- 导航（注入 + 多语言 + 语言切换器） ---------- */
function renderNav() {
  var el = document.getElementById("nav");
  if (!el) return;
  var path = location.pathname.split("/").pop() || "index.html";
  function active(p) { return (path === p) ? " class=\"active\"" : ""; }
  var links =
    '<a href="index.html"' + active("index.html") + '>' + t("nav.home") + '</a>' +
    '<a href="works.html"' + active("works.html") + '>' + t("nav.works") + '</a>' +
    '<a href="about.html"' + active("about.html") + '>' + t("nav.about") + '</a>' +
    (SHOW_MEMBER ? '<a href="pricing.html"' + active("pricing.html") + '>' + t("nav.pricing") + '</a>' : '');
  /* 语言切换器：五枚等宽胶囊，当前语言金底实心。
     title / aria-label 用完整语言名，缩写 EN、FR 也能被悬停和读屏说清。 */
  var sw = LANGS.map(function (l) {
    var on = (l.code === LANG);
    return '<button class="lang-btn' + (on ? ' is-on' : '') + '"' +
      ' title="' + esc(l.full || l.label) + '"' +
      ' aria-label="' + esc(l.full || l.label) + '"' +
      (on ? ' aria-current="true"' : '') +
      ' onclick="setLang(\'' + l.code + '\')">' + l.label + '</button>';
  }).join("");
  el.innerHTML =
    '<div class="brand">' + t("brand") + '</div>' +
    '<div class="links">' + links + '</div>' +
    '<div class="lang-switch" role="group" aria-label="Language">' + sw + '</div>';
}

/* ---------- 页脚（注入 + 多语言） ---------- */
function renderFooter() {
  var el = document.getElementById("footer");
  if (!el) return;
  var y = new Date().getFullYear();
  el.innerHTML =
    '<div class="wrap"><div class="row">' +
      '<div>' + esc(t("footerNote")) +
        ' <a class="prov-link" href="posts.json" target="_blank" rel="noopener">' + esc(t("provenance")) + '</a></div>' +
      '<div>© ' + y + ' ' + esc(authorDisplay()) + ' · ' + esc(t("footerRights")) + '</div>' +
    '</div></div>';
}

/* ---------- 注入 Book 结构化数据（AI / 搜索引擎友好） ---------- */
function injectBookJsonLd(work) {
  var old = document.getElementById("ld-book");
  if (old && old.parentNode) old.parentNode.removeChild(old);
  var first = workFirstPosted(work), last = workLastUpdated(work);
  var ld = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": tv(work.title),
    "alternateName": work.title.en || "",     // 官方国际名 Lost in Changsha，各语言页都能被检索到
    "author": personLd(work.author),
    "copyrightHolder": personLd(work.author),
    "copyrightYear": new Date().getFullYear(),
    "genre": tv(work.tags),
    "description": tv(work.summary),
    "url": location.href,
    "sameAs": work.qidianUrl ? [work.qidianUrl] : [],
    "publisher": { "@type": "Organization", "name": t("brand") + (LANG === "zh" ? " 官网" : " Official") },
    "inLanguage": langCode(),
    "bookFormat": "https://schema.org/EBook",
    "keywords": [tv(work.title), work.title.en, work.author, SITE.latinName].concat(tv(work.tags)).join(",")
  };
  if (first) ld.datePublished = first;          // 全书最早首发时间
  if (last) ld.dateModified = last;             // 全书最后修订时间
  var s = document.createElement("script");
  s.type = "application/ld+json";
  s.id = "ld-book";
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);
}

/* 章节级结构化数据：AI / 搜索引擎可检索到「本章首发时间」，也是原创性佐证 */
function injectChapterJsonLd(work, c) {
  var old = document.getElementById("ld-chapter");
  if (old && old.parentNode) old.parentNode.removeChild(old);
  var p = postInfo(work, c);
  var ld = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    "name": chapterTitle(c),
    "position": c.num,
    "author": personLd(work.author),
    "copyrightHolder": personLd(work.author),
    "copyrightYear": new Date().getFullYear(),
    "url": location.href,
    /* 尚未翻译的章节展示的是中文原文，结构化数据的语言要如实标 zh-CN */
    "inLanguage": (LANG !== "zh" && !hasTranslation(c, LANG)) ? "zh-CN" : langCode(),
    "isPartOf": {
      "@type": "Book",
      "name": tv(work.title),
      "alternateName": work.title.en || "",
      "url": location.href.split("?")[0].replace(/reader\.html$/, "work.html") + "?id=" + work.id
    }
  };
  if (p) {
    ld.datePublished = p.firstPostedAt;
    ld.dateModified = p.updatedAt || p.firstPostedAt;
  }
  var s = document.createElement("script");
  s.type = "application/ld+json";
  s.id = "ld-chapter";
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);
}

/* ---------- 作品卡片网格（作品目录） ---------- */
function renderWorksGrid(elId) {
  var el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = WORKS.map(function (w) {
    var first = w.officialFirst ? '<span class="first-badge">' + esc(t("firstBadge")) + '</span>' : "";
    var tags = tv(w.tags).slice(0, 4).map(function (x) {
      return '<span class="tag">' + esc(x) + "</span>";
    }).join("");
    var coverChar = esc(tv(w.title));
    return '' +
      '<a class="card" href="work.html?id=' + esc(w.id) + '">' +
        '<div class="cover">' + coverChar + '</div>' +
        '<div class="body">' +
          '<h3>' + esc(tv(w.title)) + first + '</h3>' +
          '<div class="cat">' + esc(tv(w.category)) + ' · ' + esc(tv(w.status)) + '</div>' +
          '<p>' + esc(tv(w.summary)) + '</p>' +
          '<div class="tags">' + tags + '</div>' +
        '</div>' +
      '</a>';
  }).join("");
}

/* ---------- 作品详情页 ---------- */
function renderWorkDetail(elId) {
  var params = new URLSearchParams(location.search);
  var id = params.get("id") || (WORKS[0] && WORKS[0].id);
  var w = getWork(id);
  var el = document.getElementById(elId);
  if (!w) { el.innerHTML = "<p>" + esc(t("updateSoon")) + "</p>"; return; }
  injectBookJsonLd(w);

  var tags = tv(w.tags).map(function (x) { return '<span class="tag">' + esc(x) + "</span>"; }).join("");
  var ordered = orderedChapters(w);
  var fp = workFirstPosted(w);
  /* 译本按章交付：仅当当前语言仍有未译章节时才提示；该语言已全本则不显示，避免读者误以为尚未译完 */
  var trMissing = (LANG !== "zh")
    ? ordered.filter(function (c) { return !hasTranslation(c, LANG); }).length : 0;
  var trNotice = (LANG !== "zh" && w.fullText && trMissing > 0)
    ? '<p class="trans-note">' + esc(t("translationProgress")) + '</p>' : '';
  var provBar = fp
    ? '<div class="provenance-bar">' + esc(t("firstPostedFull")) + '：' + esc(fmtStamp(fp, true)) +
      ' (UTC+8) · © ' + new Date().getFullYear() + ' ' + esc(authorDisplay()) +
      ' · ' + esc(t("footerRights")) +
      ' <a href="posts.json" target="_blank" rel="noopener">' + esc(t("provenance")) + '</a></div>'
    : '';
  /* 「读最新章」始终指连载进度最大的章号，不受展示顺序重排影响 */
  var lastNum = ordered.length ? Math.max.apply(null, ordered.map(function (c) { return c.num; })) : 0;

  var chapters = ordered.map(function (c) {
    var locked = SHOW_MEMBER && c.locked && !MEMBER;
    var readable = w.fullText || c.excerpt;
    var cls = "ch-item" + (locked ? " locked" : (readable ? " has-excerpt" : ""));
    var href = locked
      ? "pricing.html?work=" + esc(w.id) + "&ch=" + esc(c.num)
      : "reader.html?work=" + esc(w.id) + "&ch=" + esc(c.num);
    var go = locked
      ? '<span class="go lock">🔒 ' + esc(t("locked")) + '</span>'
      : (readable ? '<span class="go">›</span>' : '<span class="go dim">…</span>');
    var pi = postInfo(w, c);
    var stamp = pi
      ? ' · <span class="ch-stamp">' + esc(t("firstPosted")) + ' ' + esc(fmtStamp(pi.firstPostedAt)) + '</span>'
      : '';
    if (w.fullText) stamp += ' · <span class="ch-full">' + esc(t("fullTextBadge")) + '</span>';
    /* 徽章只标「当前语言确实有译本」的章，避免日文/英文读者看到一堆自己读不了的译本标记；
       中文页是全站概览，仍列出所有含译本的章节。 */
    if (c.translations && c.translations.length && (LANG === "zh" || hasTranslation(c, LANG)))
      stamp += ' · <span class="ch-tr">' + esc(t("translationBadge")) + '</span>';
    return '' +
      '<a class="' + cls + '" href="' + href + '">' +
        '<div class="beast" data-num="' + esc(c.num) + '">' + esc(beastName(c)) + '</div>' +
        '<div class="meta"><div class="t">' + esc(chapterTitle(c)) + '</div>' +
        '<div class="b">' + (w.beastIndex ? (esc(t("chIndexSub").replace("。", "")) + ' · ' + esc(beastName(c))) : esc(chapterTitle(c))) + stamp + '</div></div>' +
        go +
      '</a>';
  }).join("");

  el.innerHTML = '' +
    '<div class="wrap">' +
      '<p class="crumb"><a href="works.html">‹ ' + esc(t("backWorks")) + '</a></p>' +
      '<h1 class="work-title">' + esc(tv(w.title)) +
        (w.officialFirst ? ' <span class="first-badge">' + esc(t("firstBadge")) + '</span>' : '') + '</h1>' +
      provBar +
      trNotice +
      '<p class="section-sub">' + esc(tv(w.category)) + ' · ' + esc(tv(w.status)) + '</p>' +
      '<p class="work-summary">' + esc(tv(w.summary)) + '</p>' +
      '<div class="tags" style="margin:16px 0 26px">' + tags + '</div>' +
      '<div class="actions">' +
        '<a class="btn primary" href="reader.html?work=' + esc(w.id) + '&ch=' + esc(lastNum) + '">' + esc(t("readLatest")) + '</a>' +
        (w.qidianUrl ? '<a class="btn" href="' + esc(w.qidianUrl) + '" target="_blank" rel="noopener">' + esc(t("qidian")) + '</a>' : '') +
        (w.paywall && SHOW_MEMBER ? '<a class="btn" href="pricing.html?work=' + esc(w.id) + '">' + esc(t("becomeMember")) + '</a>' : '') +
      '</div>' +
      '<h2 class="ch-h">' + esc(w.beastIndex ? t("chIndex") : t("chCatalog")) + '</h2>' +
      '<p class="section-sub">' + esc(w.beastIndex ? t("chIndexSub") : t("chCatalogSub")) + '</p>' +
      '<div class="ch-list">' + chapters + '</div>' +
    '</div>';
  document.title = tv(w.title) + " - " + t("brand");
  fitBeastLabels(el);
}

/* 章节列表左侧的金色方块里放的是各语言兽名：中文 2-3 字、罗马音 7-9 字母，
   法/阿译名最长到 26 字符（L'Oiseau aux ailes jumelles）。方块尺寸固定，
   必然有些名字塞不下 —— 这里量一次 18px 下的真实文字宽度，按比例缩字号；
   缩到 9px 仍放不下的（极长译名）退回显示章号，保证任何语言都不会出现
   「文字被方块切掉一半」的情况。 */
/* 章节列表左侧的金色方块放的是各语言兽名：中文 2-3 字、罗马音 7-10 字母，
   法/阿译名最长到 26 字符。方块尺寸固定必然有名字放不下 —— 做法是：
   ① 先给整页方块算一个统一宽度（按最长的那条，夹在 52–76px 之间），保持左边缘对齐；
   ② 每条再按自己的文字宽度单独缩字号，短的用满 18px、长的缩到刚好贴边；
   ③ 18px 下超过 136px 的极长译名取首词（Neuf Nourrissons → Neuf），
      首词仍放不下才退回两位章号。任何语言都不会出现文字被方块切掉。 */
function fitBeastLabels(root) {
  if (!root || !root.querySelectorAll) return;
  var els = root.querySelectorAll(".ch-item .beast");
  var n = els.length;
  if (!n) return;
  var BASE = 18, MIN = 9, MINW = 52, MAXW = 76, PAD = 8, SLACK = 1, LIMIT = 136;
  var vw = (typeof window !== "undefined" && window.innerWidth) || 0;
  if (vw > 720) MINW = 58;

  /* 量尺：临时插一个同款方块纯量文字宽度，量完立刻删掉 */
  var probe = document.createElement("div");
  probe.className = "beast";
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "position:absolute;left:-9999px;top:0;width:auto;height:auto;" +
    "visibility:hidden;display:inline-block;white-space:nowrap;padding:0;font-size:" + BASE + "px;";
  root.appendChild(probe);
  function measure(text) {
    probe.textContent = text;
    return probe.getBoundingClientRect().width;
  }

  var texts = [], widths = [], maxW = 0, i, el, label, w;
  for (i = 0; i < n; i++) {
    el = els[i];
    label = el.getAttribute("data-label");
    if (label === null) { label = el.textContent; el.setAttribute("data-label", label); }
    w = measure(label);
    if (w > LIMIT) {
      var first = String(label).split(/\s+/)[0];
      if (first && first !== label) { label = first; w = measure(label); }
    }
    if (w > LIMIT) {
      var num = parseInt(el.getAttribute("data-num"), 10);
      if (!isNaN(num)) { label = (num < 10 ? "0" : "") + num; w = measure(label); }
    }
    texts[i] = label;
    widths[i] = w;
    if (w > maxW) maxW = w;
  }
  root.removeChild(probe);
  if (!maxW) return;

  var boxW = Math.max(MINW, Math.min(MAXW, Math.ceil(maxW + PAD + SLACK)));
  var inner = boxW - PAD - SLACK;   /* 留 1px：字号按 0.1 取整会有亚像素误差 */
  for (i = 0; i < n; i++) {
    el = els[i];
    el.textContent = texts[i];
    el.style.width = boxW + "px";
    el.style.height = boxW + "px";
    var fs = widths[i] <= inner ? BASE : Math.floor((BASE * inner / widths[i]) * 10) / 10;
    el.style.fontSize = Math.max(MIN, Math.min(BASE, fs)) + "px";
  }
}

/* 旋屏 / 改窗口宽度时方块会在 54px 与 44px 之间切换，字号要跟着重算一遍 */
(function () {
  if (typeof window === "undefined" || !window.addEventListener) return;  /* 假 DOM 环境（回归脚本）跳过 */
  var timer = null;
  window.addEventListener("resize", function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      var list = document.querySelector(".ch-list");
      if (list && list.parentNode) fitBeastLabels(list.parentNode);
    }, 180);
  });
})();

/* ---------- 章节阅读器 ---------- *//* 正文按章存放在 chapters/<作品>/<章号>.json，按需加载，避免全站一次下载 20 万字 */
function chapterBodyUrl(w, c) {
  var suffix = hasTranslation(c, LANG) ? "." + LANG : "";
  return "chapters/" + encodeURIComponent(w.id) + "/" + c.num + suffix + ".json";
}
function renderParagraphs(list) {
  return '<div class="content novel-text lang-' + LANG + '">' +
    (list || []).map(function (p) {
      return '<p>' + esc(p).replace(/\n/g, "<br>") + "</p>";
    }).join("") + "</div>";
}
function renderReader(elId) {
  var params = new URLSearchParams(location.search);
  var wid = params.get("work") || (WORKS[0] && WORKS[0].id);
  var ch = parseInt(params.get("ch"), 10);
  var w = getWork(wid);
  var el = document.getElementById(elId);
  if (!w) { el.innerHTML = "<p>" + esc(t("updateSoon")) + "</p>"; return; }
  var c = (w.chapters || []).find(function (x) { return x.num === ch; });
  if (!c) { el.innerHTML = "<p>" + esc(t("updateSoon")) + "</p>"; return; }

  injectChapterJsonLd(w, c);
  var locked = SHOW_MEMBER && c.locked && !MEMBER;
  var pi = postInfo(w, c);
  var tr = (pi && pi.translations && hasTranslation(c, LANG)) ? pi.translations[LANG] : null;
  var trStamp = tr
    ? '<span>' + esc(t("translationFirst")) + '：' + esc(fmtStamp(tr.firstPostedAt, true)) + ' (UTC+8)</span>'
    : '';
  var stampBar = pi
    ? '<div class="post-stamp"><span>' + esc(t("firstPostedFull")) + '：' +
        esc(fmtStamp(pi.firstPostedAt, true)) + ' (UTC+8)</span>' +
      (pi.bodyFirstPostedAt
        ? '<span>' + esc(t("fullTextPosted")) + '：' + esc(fmtStamp(pi.bodyFirstPostedAt, true)) + '</span>' : '') +
      trStamp +
      ((pi.revisions && pi.revisions.length)
        ? '<span>' + esc(t("lastUpdated")) + '：' + esc(fmtStamp(pi.updatedAt || pi.firstPostedAt, true)) + '</span>' : '') +
      '<span>© ' + new Date().getFullYear() + ' ' + esc(authorDisplay()) + ' · ' + esc(t("footerRights")) + '</span></div>'
    : '';
  /* 山海经神兽：小传严格取当前语言译本；该语言未译出时不回退中文，保持页面语言纯净。
     配图与语言无关，任何语言页面都显示同一张（BEAST_IMAGES 登记有图的章号）。 */
  var bioText = (c.bio && typeof c.bio === "object") ? (c.bio[LANG] || "") : "";
  var beastFig = (BEAST_IMAGES.indexOf(c.num) >= 0)
    ? '<figure class="beast-fig"><img src="assets/img/beasts/' +
        (c.num < 10 ? "0" : "") + c.num + '.webp" alt="' + esc(beastName(c)) +
        '" width="800" height="1148" loading="lazy" decoding="async"></figure>'
    : "";
  var bioBox = (beastFig || bioText)
    ? '<div class="beast-panel">' + beastFig +
      (bioText ? '<div class="beast-bio">' + esc(bioText) + '</div>' : '') + '</div>'
    : "";
  var transNote = (LANG !== "zh" && !hasTranslation(c, LANG) && w.fullText)
    ? '<div class="trans-note">' + esc(t("translationMissing")) + '</div>' : '';
  var archiveFile = c.num + (hasTranslation(c, LANG) ? "." + LANG : "") + ".html";
  var langLinks = (c.translations && c.translations.length)
    ? '<div class="lang-links"><span>' + esc(t("otherLanguages")) + '：</span>' +
        '<a href="chapters/' + esc(w.id) + '/' + esc(c.num) + '.html">' + esc(t("originalVersion")) + '</a>' +
        c.translations.map(function (l) {
          return ' · <a href="chapters/' + esc(w.id) + '/' + esc(c.num) + '.' + esc(l) + '.html">' +
            esc(langLabel(l)) + '</a>';
        }).join("") + '</div>'
    : '';
  var archive = w.fullText
    ? '<div class="archive-link"><a href="chapters/' + esc(w.id) + '/' + esc(archiveFile) + '">' +
        esc(t("archivePage")) + ' ›</a> · <a href="posts.json" target="_blank" rel="noopener">' +
        esc(t("provenance")) + '</a></div>' + langLinks
    : '';
  var body;
  if (locked) {
    body = '<div class="content" style="color:var(--text-dim)">🔒 ' + esc(t("locked")) +
      '<br><br><a class="btn primary" href="pricing.html?work=' + esc(w.id) + '&ch=' + esc(c.num) + '">' +
      esc(t("becomeMember")) + '</a></div>';
  } else if (w.fullText) {
    body = '<div id="reader-body" class="content" style="color:var(--text-dim)">' + esc(t("loadingText")) + '</div>';
  } else if (c.excerpt) {
    body = '<div class="content">' + esc(tv(c.excerpt)) + '</div>' +
      '<div class="notice">' + esc(t("excerptNotice")) + '</div>';
  } else {
    body = '<div class="content" style="color:var(--text-dim)">' + esc(t("updateSoon")) +
      ' ' + (w.qidianUrl ? '<a href="' + esc(w.qidianUrl) + '" target="_blank" rel="noopener">' + esc(t("qidian")) + '</a>' : esc(t("qidian"))) + '</div>';
  }

  el.innerHTML = '' +
    '<div class="reader">' +
      '<p class="crumb"><a href="work.html?id=' + esc(w.id) + '">‹ ' + esc(tv(w.title)) + '</a></p>' +
      '<div class="beast-line">' + esc(beastName(c)) + '</div>' +
      '<h1 class="chapter-title">' + esc(chapterTitle(c)) + '</h1>' +
      stampBar +
      bioBox +
      transNote +
      body +
      archive +
    '</div>';
  document.title = chapterTitle(c) + " - " + tv(w.title) + " - " + t("brand");

  if (!locked && w.fullText && typeof fetch !== "function") {
    var noFetch = document.getElementById("reader-body");
    if (noFetch) noFetch.innerHTML = '<div class="notice">' + esc(t("textLoadFail")) + '</div>';
  } else if (!locked && w.fullText) {
    fetch(chapterBodyUrl(w, c))
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(function (data) {
        var box = document.getElementById("reader-body");
        if (!box) return;
        if (!data.paragraphs || !data.paragraphs.length) throw new Error("empty");
        box.outerHTML = renderParagraphs(data.paragraphs);
      })
      .catch(function () {
        var box = document.getElementById("reader-body");
        if (box) box.innerHTML = '<div class="notice">' + esc(t("textLoadFail")) + '</div>' +
          (c.excerpt ? '<div class="content">' + esc(tv(c.excerpt)) + '</div>' : '');
      });
  }
}

/* ---------- 会员 / 付费端口（预留） ---------- */
function renderPricing(elId) {
  var params = new URLSearchParams(location.search);
  var work = params.get("work"), ch = params.get("ch");
  var el = document.getElementById(elId);
  if (!el) return;
  var cards = PLANS.map(function (p) {
    var cta = t(p.ctaKey);
    var intent = (p.id === "chapter" && work)
      ? " data-work=\"" + esc(work) + "\" data-ch=\"" + esc(ch) + "\""
      : "";
    return '' +
      '<div class="plan">' +
        '<h3>' + esc(t(p.key)) + '</h3>' +
        '<div class="price">' + esc(t(p.priceKey)) + '</div>' +
        '<p class="plan-d">' + esc(t(p.descKey)) + '</p>' +
        '<button class="btn primary plan-btn" onclick="alert(\'' +
          esc(t("pricingSub")) + '\')"' + intent + '>' + esc(cta) + '</button>' +
      '</div>';
  }).join("");
  el.innerHTML = '' +
    '<div class="wrap pricing">' +
      '<h1>' + esc(t("pricingTitle")) + '</h1>' +
      '<p class="section-sub">' + esc(t("pricingSub")) + '</p>' +
      '<div class="plans">' + cards + '</div>' +
      '<p class="pricing-note">' + esc(t("pricingNote")) + '</p>' +
    '</div>';
  document.title = t("pricingTitle") + " - " + t("brand");
}

/* ---------- 关于作者 ---------- */
function renderAbout(elId) {
  var el = document.getElementById(elId);
  if (!el) return;
  var c = SITE.contact;
  var bio = t("aboutBig");
  var paras = [t("aboutBig"), t("aboutP1"), t("aboutP2")]
    .filter(function (s) { return s && String(s).trim() !== ""; });
  el.innerHTML = '' +
    '<div class="wrap about">' +
      '<div class="author-head">' +
        '<img class="avatar" src="assets/img/avatar.jpg" alt="' + esc(t("brand")) + '">' +
        '<div class="author-meta">' +
          '<h1>' + esc(t("aboutTitle")) + '</h1>' +
          '<p class="author-tag">' + esc(t("tagline")) + '</p>' +
          '<p class="author-meaning">' + esc(tv(SITE.nameMeaning)) + '</p>' +
        '</div>' +
      '</div>' +
      paras.map(function (p) {
        return '<p' + (p === bio ? ' class="big"' : '') + '>' + esc(p) + '</p>';
      }).join('') +
      '<p>' + esc(t("aboutContact")) +
        (c.email ? '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a>' : '') +
      '</p>' +
    '</div>';
  document.title = t("aboutTitle") + " - " + t("brand");
}

/* ---------- 首页（品牌 + 作品矩阵 + 粉丝群） ---------- */
function renderHome(elId) {
  var el = document.getElementById(elId);
  if (!el) return;
  var channels = (t("poolChannels") || []).map(function (x) {
    return '<span class="channel">' + esc(x) + "</span>";
  }).join("");
  el.innerHTML =
    '<section class="hero"><div class="wrap">' +
      '<img class="hero-avatar" src="assets/img/avatar.jpg" alt="' + esc(t("brand")) + '">' +
      '<div class="badge">' + esc(t("heroBadge")) + '</div>' +
      '<h1>' + esc(t("heroH1a")) + ' <span class="accent">' + esc(t("heroH1b")) + '</span></h1>' +
      '<p class="tagline">' + esc(t("tagline")) + '</p>' +
      '<div class="cta">' +
        '<a class="btn primary" href="works.html">' + esc(t("ctaWorks")) + '</a>' +
        '<a class="btn" href="about.html">' + esc(t("ctaAbout")) + '</a>' +
      '</div>' +
    '</div></section>' +
    '<section><div class="wrap">' +
      '<h2>' + esc(t("worksTitle")) + '</h2><p class="section-sub">' + esc(t("worksSub")) + '</p>' +
      '<div id="home-works" class="grid"></div>' +
    '</div></section>' +
    '<section><div class="wrap">' +
      '<div class="pool"><div><h2>' + esc(t("poolTitle")) + '</h2>' + (t("poolSub") ? '<p>' + esc(t("poolSub")) + '</p>' : '') +
      '<div class="channels">' + channels + '</div></div>' +
      '<a class="btn primary" href="about.html">' + esc(t("poolCta")) + '</a>' +
      '</div>' +
    '</div></section>';
  renderWorksGrid('home-works');   // 首页作品矩阵（三部并列）
  document.title = t("brand") + " · " + t("tagline");
}
