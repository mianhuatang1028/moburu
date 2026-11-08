/* ============================================================
   默不如小说官网 · 渲染逻辑（多语言 + 付费端口预留）
   ============================================================ */

/* 当前语言（持久化到 localStorage） */
var LANG = localStorage.getItem("mobuyu_lang") || "zh";
var MEMBER = false;        // 预留会员状态；接入支付/登录后由后端决定
var SHOW_MEMBER = false;   // 付费入口总开关：false=全站隐藏会员/付费 UI；未来开放改 true 即可

function setLang(code) {
  LANG = code;
  localStorage.setItem("mobuyu_lang", code);
  var langMap = { zh: "zh-CN", en: "en", ja: "ja", fr: "fr", ar: "ar" };
  document.documentElement.lang = langMap[code] || "zh-CN";
  document.documentElement.dir = (code === "ar") ? "rtl" : "ltr"; // 阿拉伯语右到左
  if (window.__render) window.__render();   // 重渲染当前页
}

/* 取 UI 文案 */
function t(key) { return (I18N[LANG] && I18N[LANG][key] != null) ? I18N[LANG][key] : (I18N.zh[key] || key); }
/* 取多语言内容字段（回退链：当前语言 → 中文原文，绝不回退英文，避免中英文混排） */
function tv(obj) {
  if (obj == null) return "";
  if (obj[LANG] != null) return obj[LANG];
  if (obj.zh != null) return obj.zh;
  if (obj.en != null) return obj.en;
  return "";
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
function beastName(c) {
  var n = _beastNames(c);
  return (LANG === "zh" || LANG === "ja") ? (n.zh || n.en) : (n.en || n.zh);
}
function chapterTitle(c) {
  var n = _beastNames(c), num = c.num;
  if (LANG === "zh" || LANG === "ja") return (c.title && c.title.zh) || (c.title && c.title.en) || "";
  if (LANG === "en") return (c.title && c.title.en) || (c.title && c.title.zh) || "";
  if (LANG === "fr") return (num === 0 ? "Prologue" : "Chapitre " + num) + " : " + n.en;
  if (LANG === "ar") return (num === 0 ? "مقدمة" : "الفصل " + num) + " : " + n.en;
  return (c.title && c.title.en) || "";
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ---------- 导航（注入 + 多语言 + 语言切换器） ---------- */
function renderNav() {
  var el = document.getElementById("nav");
  if (!el) return;
  var path = location.pathname.split("/").pop() || "index.html";
  function active(p) { return (path === p) ? " class=\"active\"" : ""; }
  var links =
    '<a href="index.html"' + active("index.html") + '>' + t("nav_home") + '</a>' +
    '<a href="works.html"' + active("works.html") + '>' + t("nav_works") + '</a>' +
    '<a href="about.html"' + active("about.html") + '>' + t("nav_about") + '</a>' +
    (SHOW_MEMBER ? '<a href="pricing.html"' + active("pricing.html") + '>' + t("nav_pricing") + '</a>' : '');
  var sw = LANGS.map(function (l) {
    var on = (l.code === LANG) ? " style=\"color:var(--gold);border-color:var(--gold-dim)\"" : "";
    return '<button class="lang-btn"' + on + ' onclick="setLang(\'' + l.code + '\')">' + l.label + '</button>';
  }).join("");
  el.innerHTML =
    '<div class="brand">' + t("brand") + '</div>' +
    '<div class="links">' + links + '</div>' +
    '<div class="lang-switch">' + sw + '</div>';
}

/* ---------- 页脚（注入 + 多语言） ---------- */
function renderFooter() {
  var el = document.getElementById("footer");
  if (!el) return;
  var y = new Date().getFullYear();
  el.innerHTML =
    '<div class="row">' +
      '<div>' + esc(t("footerNote")) + '</div>' +
      '<div>© ' + y + ' ' + esc(SITE.author) + ' · ' + esc(t("footerRights")) + '</div>' +
    '</div>';
}

/* ---------- 注入 Book 结构化数据（AI / 搜索引擎友好） ---------- */
function injectBookJsonLd(work) {
  var ld = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": tv(work.title),
    "author": { "@type": "Person", "name": work.author },
    "genre": tv(work.tags),
    "description": tv(work.summary),
    "url": location.href,
    "sameAs": [work.qidianUrl],
    "publisher": { "@type": "Organization", "name": t("brand") + " Official" },
    "inLanguage": (LANG === "zh") ? "zh-CN" : (LANG === "en") ? "en" : (LANG === "ja") ? "ja" : (LANG === "fr") ? "fr" : (LANG === "ar") ? "ar" : "zh-CN",
    "bookFormat": "https://schema.org/EBook",
    "keywords": [tv(work.title), work.author].concat(tv(work.tags)).join(",")
  };
  var s = document.createElement("script");
  s.type = "application/ld+json";
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
  var lastNum = w.chapters && w.chapters.length ? w.chapters[w.chapters.length - 1].num : 0;

  var chapters = (w.chapters || []).map(function (c) {
    var locked = SHOW_MEMBER && c.locked && !MEMBER;
    var cls = "ch-item" + (locked ? " locked" : (c.excerpt ? " has-excerpt" : ""));
    var href = locked
      ? "pricing.html?work=" + esc(w.id) + "&ch=" + esc(c.num)
      : "reader.html?work=" + esc(w.id) + "&ch=" + esc(c.num);
    var go = locked
      ? '<span class="go lock">🔒 ' + esc(t("locked")) + '</span>'
      : (c.excerpt ? '<span class="go">›</span>' : '<span class="go dim">…</span>');
    return '' +
      '<a class="' + cls + '" href="' + href + '">' +
        '<div class="beast">' + esc(beastName(c)) + '</div>' +
        '<div class="meta"><div class="t">' + esc(chapterTitle(c)) + '</div>' +
        '<div class="b">' + (w.beastIndex ? (esc(t("chIndexSub").replace("。", "")) + ' · ' + esc(beastName(c))) : esc(chapterTitle(c))) + '</div></div>' +
        go +
      '</a>';
  }).join("");

  el.innerHTML = '' +
    '<div class="wrap">' +
      '<p class="crumb"><a href="works.html">‹ ' + esc(t("backWorks")) + '</a></p>' +
      '<h1 class="work-title">' + esc(tv(w.title)) +
        (w.officialFirst ? ' <span class="first-badge">' + esc(t("firstBadge")) + '</span>' : '') + '</h1>' +
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
}

/* ---------- 章节阅读器 ---------- */
function renderReader(elId) {
  var params = new URLSearchParams(location.search);
  var wid = params.get("work") || (WORKS[0] && WORKS[0].id);
  var ch = parseInt(params.get("ch"), 10);
  var w = getWork(wid);
  var el = document.getElementById(elId);
  if (!w) { el.innerHTML = "<p>" + esc(t("updateSoon")) + "</p>"; return; }
  var c = (w.chapters || []).find(function (x) { return x.num === ch; });
  if (!c) { el.innerHTML = "<p>" + esc(t("updateSoon")) + "</p>"; return; }

  var locked = SHOW_MEMBER && c.locked && !MEMBER;
  var body;
  if (locked) {
    body = '<div class="content" style="color:var(--text-dim)">🔒 ' + esc(t("locked")) +
      '<br><br><a class="btn primary" href="pricing.html?work=' + esc(w.id) + '&ch=' + esc(c.num) + '">' +
      esc(t("becomeMember")) + '</a></div>';
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
      body +
    '</div>';
  document.title = chapterTitle(c) + " - " + tv(w.title) + " - " + t("brand");
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
