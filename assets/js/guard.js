/*!
 * guard.js —— 官网版权保护（温和档 + 隐形水印）
 *
 * 设计原则：不破坏正常阅读。文字仍可选中、可划词翻译、可做笔记；
 * 只有「把正文整段搬走」和「把配图存走」会被拦下并改写。
 *
 * 四件事：
 *   1. 复制拦截：正文区长段复制 → 剪贴板换成版权声明；短句引用 → 保留原文并自动附出处
 *   2. 隐形水印：任何从本站复制出去的文字都夹带零宽字符水印（肉眼不可见），可解码溯源
 *   3. 图片保护：禁右键另存、禁拖拽、禁 iOS 长按存图
 *   4. 打印/另存拦截：@media print 隐藏正文，Ctrl+P / Ctrl+S 弹提示
 *
 * 注意：前端防护只能提高手工搬运的成本，挡不住直接请求 JSON 或存档页的爬虫。
 *       真正的证据链是每章的首发时间戳（posts.json）与 git 历史。
 */
(function () {
  "use strict";
  if (window.__moburuGuard) return;
  window.__moburuGuard = true;

  var SITE = "moburu.vip";
  var SITE_URL = "https://moburu.vip";

  /* ---------- 语言 ---------- */
  /* 动态页读 localStorage（与站点当前语言一致）；静态存档页没有 localStorage，
     退回 <html lang> —— 存档页是按语言各自成页的，这个更准。 */
  var LANGS_OK = ["zh", "en", "ja", "fr", "ar"];
  var LANG = (function () {
    try {
      var s = localStorage.getItem("moburu_lang");
      if (s && LANGS_OK.indexOf(s) >= 0) return s;
    } catch (e) { /* 无痕模式 */ }
    var h = (document.documentElement.getAttribute("lang") || "").slice(0, 2).toLowerCase();
    return LANGS_OK.indexOf(h) >= 0 ? h : "zh";
  })();

  var TEXT = {
    zh: {
      notice: "【版权声明】本段内容出自 " + SITE + " ，受著作权法保护。\n" +
              "如需引用或转载，请注明作者「默不如」及来源： " + SITE_URL + "\n" +
              "未经授权，请勿用于商业用途或整章转载。",
      credit: "—— 默不如 · " + SITE,
      copyLong: "整段搬运不客气哦",
      copyLongSub: "本文受版权保护，复制已替换为出处声明",
      img: "配图受版权保护，禁止另存",
      print: "正文不提供打印，请到 " + SITE + " 在线阅读"
    },
    en: {
      notice: "【Copyright Notice】This excerpt is from " + SITE + " and is protected by copyright law.\n" +
              "Please credit the author \"Moburu\" and link to " + SITE_URL + " when quoting.\n" +
              "Unauthorized commercial use or full-chapter reposting is not permitted.",
      credit: "— Moburu · " + SITE,
      copyLong: "Nice try",
      copyLongSub: "This work is copyrighted. Your copy has been replaced with a source notice.",
      img: "Illustrations are copyrighted — saving is disabled.",
      print: "Full text is not available for printing. Please read online at " + SITE
    },
    ja: {
      notice: "【著作権表示】この文章は " + SITE + " の作品であり、著作権法で保護されています。\n" +
              "引用・転載の際は、著者「默不如（Moburu）」と出典 " + SITE_URL + " を明記してください。\n" +
              "無断での商業利用・全章転載はご遠慮ください。",
      credit: "— 默不如（Moburu）· " + SITE,
      copyLong: "おっと",
      copyLongSub: "著作権保護のため、コピーは出典表示に置き換えられました。",
      img: "挿絵は著作権保護の対象です。保存はできません。",
      print: "本文の印刷はできません。" + SITE + " でお読みください。"
    },
    fr: {
      notice: "【Mention de copyright】Ce texte provient de " + SITE + " et est protégé par le droit d'auteur.\n" +
              "Merci de citer l'autrice « Moburu » et la source " + SITE_URL + " en cas de citation.\n" +
              "Toute reproduction intégrale ou usage commercial non autorisé est interdit.",
      credit: "— Moburu · " + SITE,
      copyLong: "Pas si vite",
      copyLongSub: "Cette œuvre est protégée. Votre copie a été remplacée par une mention de source.",
      img: "Les illustrations sont protégées — l'enregistrement est désactivé.",
      print: "Le texte n'est pas imprimable. Merci de lire sur " + SITE
    },
    ar: {
      notice: "【إشعار حقوق النشر】هذا النص من " + SITE + " ومحمي بموجب قانون حقوق النشر.\n" +
              "يرجى ذكر المؤلفة «Moburu» والمصدر " + SITE_URL + " عند الاقتباس.\n" +
              "لا يُسمح بالاستخدام التجاري أو إعادة نشر الفصل كاملًا دون إذن.",
      credit: "— Moburu · " + SITE,
      copyLong: "لحظة من فضلك",
      copyLongSub: "هذا العمل محمي بحقوق النشر. تم استبدال النسخ بإشعار المصدر.",
      img: "الصور محمية بحقوق النشر — الحفظ معطّل.",
      print: "النص غير متاح للطباعة. يرجى القراءة على " + SITE
    }
  };
  var T = TEXT[LANG] || TEXT.zh;
  var RTL = LANG === "ar";

  /* ---------- 隐形水印：把字符串编码成零宽字符 ---------- */
  /* 三种零宽字符承载信息：U+200B(0) / U+200C(1)，U+2060 作起止标记。
     肉眼与排版完全无感，复制时随文本一起走，可用 官网_水印解码.py 还原。
     编码按 8bit/字符 + base36 压缩，一段水印约 100 个不可见码点，
     不会在短句引用里堆成一大串。 */
  var Z0 = "\u200b", Z1 = "\u200c", ZMARK = "\u2060";

  function zwEncode(str) {
    var out = ZMARK;
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i) & 0xff;          /* payload 只有 ASCII */
      for (var b = 7; b >= 0; b--) out += ((code >> b) & 1) ? Z1 : Z0;
    }
    return out + ZMARK;
  }

  /* 水印内容：作品码 + 章号 + 复制时刻（UTC 秒级 base36）。
     同一段文字在不同时间被复制，痕迹不同，能定位到「哪一章、什么时候被拿走的」。 */
  var WORK_CODE = { henchangsha: "h", guanghuan: "g", muzhezhige: "m" };

  function ctxInfo() {
    var ch = null, wid = null;
    var m = /[?&]ch=(\d+)/.exec(location.search);
    if (m) ch = m[1];
    var w = /[?&]work=([a-z0-9]+)/i.exec(location.search);
    if (w) wid = w[1];
    if (!ch || !wid) {
      /* 静态存档页：/chapters/<work>/<num>.<lang>.html */
      var p = /\/chapters\/([a-z0-9]+)\/(\d+)(?:\.[a-z]{2})?\.html$/i.exec(location.pathname);
      if (p) { wid = wid || p[1]; ch = ch || p[2]; }
    }
    return { wid: wid || "-", ch: ch || "-" };
  }

  function watermark() {
    var c = ctxInfo();
    var code = WORK_CODE[c.wid] || "x";
    var ch = c.ch === "-" ? "x" : parseInt(c.ch, 10).toString(36);
    var ts = Math.floor(Date.now() / 1000).toString(36);
    return zwEncode(code + "." + ch + "." + ts);
  }

  /* ---------- 是否落在正文区 ---------- */
  var BODY_SEL = ".novel-text, .beast-bio, .chapter-title, .beast-line";

  function inBody(node) {
    var el = node && (node.nodeType === 1 ? node : node.parentNode);
    while (el && el !== document.body) {
      if (el.matches && el.matches(BODY_SEL)) return true;
      el = el.parentNode;
    }
    return false;
  }

  /* ---------- 轻提示 ---------- */
  var toastEl = null, toastTimer = null;
  function toast(title, sub) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "guard-toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.setAttribute("dir", RTL ? "rtl" : "ltr");
    toastEl.innerHTML = '<b>' + title + '</b>' + (sub ? '<span>' + sub + '</span>' : '');
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2600);
  }

  /* ---------- 1. 复制拦截 ---------- */
  var SHORT_LIMIT = 50;   /* 少于这个字数算「引用一句」，保留原文只加出处 */

  document.addEventListener("copy", function (e) {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    if (!inBody(sel.anchorNode)) return;          /* 导航、页脚照常复制 */

    var text = sel.toString();
    if (!text || !text.trim()) return;

    var wm = watermark();
    var payload;

    if (text.replace(/\s/g, "").length >= SHORT_LIMIT) {
      /* 长段：正文不出去，换成声明 */
      payload = T.notice + "\n" + wm;
      toast(T.copyLong, T.copyLongSub);
    } else {
      /* 短句：保留原文，单独一行附出处，水印挂在最末尾（不夹在字中间） */
      payload = text.replace(/\s+$/, "") + "\n" + T.credit + wm;
    }

    try {
      e.clipboardData.setData("text/plain", payload);
      e.preventDefault();
    } catch (err) { /* 极老浏览器放行 */ }
  });

  /* ---------- 2. 图片保护 ---------- */
  function onImg(target) {
    return !!(target && target.closest && target.closest("img, .beast-fig"));
  }

  document.addEventListener("contextmenu", function (e) {
    if (!onImg(e.target)) return;
    e.preventDefault();
    toast(T.img);
  });

  document.addEventListener("dragstart", function (e) {
    if (onImg(e.target)) e.preventDefault();
  });

  /* ---------- 3. 打印 / 另存拦截 ---------- */
  document.addEventListener("keydown", function (e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    var k = (e.key || "").toLowerCase();
    if (k === "p" || k === "s") {
      e.preventDefault();
      toast(T.print);
    }
  });

  /* iOS / 安卓长按图片会弹系统菜单：交给 CSS 处理，这里补一道 */
  document.addEventListener("selectstart", function (e) {
    if (onImg(e.target)) e.preventDefault();
  });
})();
