(function (global) {
  "use strict";

  const LANGS = ["en", "kr", "jp", "cn", "ru"];
  const COOKIE = "lang";
  const I18N = {
    menu: { en: "Menu", kr: "메뉴", jp: "メニュー", cn: "菜单", ru: "Меню" },
    home: { en: "Home", kr: "홈", jp: "ホーム", cn: "主页", ru: "Главная" },
    cartoon: { en: "Cartoon", kr: "만화", jp: "カートゥーン", cn: "漫画", ru: "Комикс" },
    music: { en: "Music", kr: "음악", jp: "音楽", cn: "音乐", ru: "Музыка" },
    service: { en: "Service", kr: "서비스", jp: "サービス", cn: "服务", ru: "Сервис" },
    program: { en: "Program", kr: "프로그램", jp: "プログラム", cn: "程序", ru: "Программы" },
    career: { en: "Career", kr: "경력", jp: "経歴", cn: "经历", ru: "Карьера" },
    education: { en: "Education", kr: "교육", jp: "教育", cn: "教育", ru: "Образование" },
    certificate: { en: "Certificate", kr: "자격증", jp: "資格", cn: "证书", ru: "Сертификаты" },
    etc: { en: "Awards", kr: "기타", jp: "表彰", cn: "表彰", ru: "Награды" },
    name: { en: "Name", kr: "이름", jp: "名前", cn: "姓名", ru: "Имя" },
    nameValue: { en: "TaeRyong Kim", kr: "김태룡", jp: "金泰龍", cn: "金泰龍", ru: "TaeRyong Kim" },
    country: { en: "Country", kr: "국적", jp: "国籍", cn: "国籍", ru: "Страна" },
    countryValue: { en: "South Korea", kr: "대한민국", jp: "韓国", cn: "韩国", ru: "Южная Корея" },
    contact: { en: "Contact", kr: "연락처", jp: "連絡先", cn: "联系", ru: "Контакт" },
    close: { en: "Close", kr: "닫기", jp: "閉じる", cn: "关闭", ru: "Закрыть" },
    back: { en: "Back", kr: "뒤로", jp: "戻る", cn: "返回", ru: "Назад" },
    language: { en: "Language", kr: "언어", jp: "言語", cn: "语言", ru: "Язык" },
    loading: { en: "Loading", kr: "불러오는 중", jp: "読み込み中", cn: "加载中", ru: "Загрузка" },
    search: { en: "Search", kr: "검색", jp: "検索", cn: "搜索", ru: "Поиск" },
    companyName: { en: "Company", kr: "회사", jp: "会社", cn: "公司", ru: "Компания" },
    companySite: { en: "Link", kr: "홈페이지", jp: "リンク", cn: "链接", ru: "Ссылка" },
    period: { en: "Period", kr: "기간", jp: "期間", cn: "期间", ru: "Период" },
    department: { en: "Department", kr: "부서", jp: "部署", cn: "部门", ru: "Отдел" },
    team: { en: "Team", kr: "팀", jp: "チーム", cn: "团队", ru: "Команда" },
    position: { en: "Position", kr: "직급", jp: "職級", cn: "职级", ru: "Должность" },
    task: { en: "Work", kr: "수행 업무", jp: "業務", cn: "工作", ru: "Задачи" },
    educationName: { en: "Program", kr: "교육명", jp: "教育名", cn: "教育名称", ru: "Программа" },
    degree: { en: "Degree", kr: "학위", jp: "学位", cn: "学位", ru: "Степень" },
    institution: { en: "Institution", kr: "교육기관", jp: "機関", cn: "机构", ru: "Учреждение" },
    proof: { en: "Proof", kr: "증빙", jp: "証明", cn: "证明", ru: "Подтверждение" },
    certName: { en: "Certificate", kr: "자격증명", jp: "資格名", cn: "证书名称", ru: "Сертификат" },
    issuer: { en: "Issuer", kr: "발급기관", jp: "発行機関", cn: "发证机关", ru: "Орган" },
    certNo: { en: "Number", kr: "번호", jp: "番号", cn: "编号", ru: "Номер" },
    acquired: { en: "Acquired", kr: "취득일", jp: "取得日", cn: "取得日期", ru: "Получено" },
    awardName: { en: "Award", kr: "상훈명", jp: "賞名", cn: "奖项", ru: "Награда" },
    org: { en: "Organization", kr: "기관", jp: "機関", cn: "机构", ru: "Организация" },
    awardDate: { en: "Date", kr: "일자", jp: "日付", cn: "日期", ru: "Дата" },
    reason: { en: "Reason", kr: "사유", jp: "理由", cn: "事由", ru: "Причина" },
    download: { en: "Download", kr: "다운로드", jp: "ダウンロード", cn: "下载", ru: "Скачать" },
    document: { en: "Document", kr: "문서", jp: "資料", cn: "文档", ru: "Документ" },
    video: { en: "Video", kr: "영상", jp: "動画", cn: "视频", ru: "Видео" },
    tag: { en: "Tag", kr: "태그", jp: "タグ", cn: "标签", ru: "Тег" },
    nameField: { en: "Name", kr: "이름", jp: "名前", cn: "名称", ru: "Имя" },
    progLang: { en: "Language", kr: "언어", jp: "言語", cn: "语言", ru: "Язык" },
    updated: { en: "Updated", kr: "수정일", jp: "更新日", cn: "更新日期", ru: "Обновлено" },
    created: { en: "Created", kr: "등록일", jp: "登録日", cn: "创建日期", ru: "Создано" },
    playlist: { en: "Playlist", kr: "플레이리스트", jp: "プレイリスト", cn: "播放列表", ru: "Плейлист" },
    tracks: { en: "Tracks", kr: "곡", jp: "曲", cn: "曲目", ru: "Треки" },
    lyrics: { en: "Lyrics", kr: "가사", jp: "歌詞", cn: "歌词", ru: "Текст" },
    composedAt: { en: "Composed", kr: "작곡일", jp: "作曲日", cn: "作曲日期", ru: "Написано" },
    composedWith: { en: "Tool", kr: "작곡 도구", jp: "ツール", cn: "工具", ru: "Инструмент" },
    instrumentation: { en: "Instrumentation", kr: "악기 구성", jp: "編成", cn: "乐器", ru: "Состав" },
    key: { en: "Key", kr: "키", jp: "キー", cn: "调", ru: "Тональность" },
    tempo: { en: "Tempo", kr: "템포", jp: "テンポ", cn: "速度", ru: "Темп" },
    meter: { en: "Meter", kr: "박자", jp: "拍子", cn: "拍号", ru: "Метр" },
    duration: { en: "Duration", kr: "길이", jp: "長さ", cn: "时长", ru: "Длительность" },
    details: { en: "Details", kr: "상세", jp: "詳細", cn: "详情", ru: "Подробнее" },
    empty: { en: "No results", kr: "결과가 없습니다", jp: "結果がありません", cn: "没有结果", ru: "Нет результатов" },
    translating: { en: "Translation", kr: "번역", jp: "翻訳", cn: "翻译", ru: "Перевод" },
    page: { en: "Page", kr: "페이지", jp: "ページ", cn: "页", ru: "Страница" },
    unfinished: { en: "This tool is not finished yet.", kr: "아직 완성되지 않은 도구입니다.", jp: "未完成のツールです。", cn: "该工具尚未完成。", ru: "Этот инструмент ещё не готов." },
    logoDescription: { en: "동양 용 문양", kr: "동양 용 문양", jp: "동양 용 문양", cn: "동양 용 문양", ru: "동양 용 문양" }
  };

  function svg(path, view) {
    return `<svg viewBox="${view || "0 0 24 24"}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  }

  const ICON = {
    menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    back: svg('<path d="M15 5l-7 7 7 7"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/>'),
    github: svg('<path d="M9 19c-4.3 1.4-4.3-2.1-6-2.5m12 5v-3.4c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6 0C6.1 2.4 5 2.7 5 2.7a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 3.6 9.1c0 4.6 2.7 5.7 5.5 6-.6.5-.6 1.2-.5 2V21"/>'),
    youtube: svg('<rect x="2.5" y="6" width="19" height="12" rx="3"/><path d="M10 9.5v5l5-2.5-5-2.5z" fill="currentColor" stroke="none"/>'),
    cafe: svg('<path d="M4 8h13v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 4s.5 1.2 0 2M12 4s.5 1.2 0 2"/>'),
    briefcase: svg('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1M3 13h18"/>'),
    education: svg('<path d="M3 10l9-5 9 5-9 5-9-5z"/><path d="M7 12.5V17c0 .8 2.2 2 5 2s5-1.2 5-2v-4.5"/>'),
    medal: svg('<circle cx="12" cy="8" r="5"/><path d="M8.5 12.5L7 21l5-2.5L17 21l-1.5-8.5"/>'),
    trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H5a3 3 0 0 0 3 5M17 6h2a3 3 0 0 1-3 5"/>'),
    book: svg('<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5z"/><path d="M6 19a2 2 0 0 1 2-2h10"/>'),
    music: svg('<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>'),
    wrench: svg('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4L15 12l-3-3 2.7-2.7z"/>'),
    code: svg('<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>'),
    search: svg('<circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/>'),
    play: svg('<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>'),
    pause: svg('<rect x="6" y="5" width="4" height="14" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" fill="currentColor" stroke="none"/>'),
    prev: svg('<path d="M18 5L9 12l9 7M6 5v14"/>'),
    next: svg('<path d="M6 5l9 7-9 7M18 5v14"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 8h.01"/>'),
    download: svg('<path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/>'),
    trash: svg('<path d="M4 7h16M9 7V5h6v2M6 7l1 14h10l1-14"/>')
  };

  const LANGUAGE_OBJECT = global.LANGUAGE_OBJECT || {};
  global.LANGUAGE_OBJECT = LANGUAGE_OBJECT;

  function getCookie(name) {
    const m = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
    return m ? decodeURIComponent(m[2]) : null;
  }
  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    let s = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
    if (location.protocol === "https:") s += ";Secure";
    document.cookie = s;
  }

  function getLang() {
    const v = getCookie(COOKIE);
    return LANGS.includes(v) ? v : "kr";
  }
  function t(key) {
    const row = I18N[key];
    if (!row) return key;
    return row[getLang()] || row.en || key;
  }
  function pick(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return obj[getLang()] || obj.en || "";
  }

  function applyI18n(root) {
    const lang = getLang();
    global.NOW_LANG = lang;
    (root || document).querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.documentElement.lang = lang === "kr" ? "ko" : lang;
    (root || document).querySelectorAll(".lang").forEach((el) => {
      try {
        const bag = LANGUAGE_OBJECT[el.dataset.langVar];
        if (bag && bag[el.dataset.lang]) el.innerHTML = bag[el.dataset.lang][lang];
      } catch (_) {}
    });
    (root || document).querySelectorAll(".lang-src").forEach((el) => {
      try {
        const bag = LANGUAGE_OBJECT[el.dataset.langVar];
        if (bag && bag[el.dataset.lang]) el.src = bag[el.dataset.lang][lang];
      } catch (_) {}
    });
    paintLangBtn();
  }

  function setLang(next) {
    if (!LANGS.includes(next)) return;
    setCookie(COOKIE, next, 31);
    applyI18n();
    document.dispatchEvent(new CustomEvent("gbd:lang", { detail: next }));
  }

  function getBase() {
    const segs = location.pathname.split("/").filter(Boolean);
    const last = segs[segs.length - 1] || "";
    const depth = last.includes(".") ? Math.max(0, segs.length - 1) : segs.length;
    return depth > 0 ? "../".repeat(depth) : "./";
  }

  function href(page) {
    return getBase() + page.replace(/^\.\//, "");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "\u0026amp;")
      .replace(/</g, "\u0026lt;")
      .replace(/>/g, "\u0026gt;")
      .replace(/"/g, "\u0026quot;");
  }

  function safeHtml(html) {
    const t = document.createElement("template");
    t.innerHTML = String(html || "");
    t.content.querySelectorAll("*").forEach((el) => {
      if (!["UL", "OL", "LI", "BR", "B", "STRONG", "EM", "SPAN", "P"].includes(el.tagName)) {
        el.replaceWith(...el.childNodes);
        return;
      }
      [...el.attributes].forEach((a) => {
        if (a.name === "style" && el.tagName === "UL") return;
        el.removeAttribute(a.name);
      });
    });
    return t.innerHTML;
  }

  const loadedScripts = new Map();
  function loadScript(src) {
    if (loadedScripts.has(src)) return loadedScripts.get(src);
    const p = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load " + src));
      document.head.appendChild(s);
    });
    loadedScripts.set(src, p);
    return p;
  }

  function currentPage() {
    return document.body.getAttribute("data-page") || "home";
  }

  function buildMenu() {
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.id = "menuOverlay";
    overlay.innerHTML = `<div class="menu-panel" role="dialog" aria-label="${escapeHtml(t("menu"))}">
      <ul class="menu-list">
        <li><a data-nav="home" href="${href("index.html")}">${ICON.menu}<span data-i18n="home"></span></a></li>
        <li><a data-nav="cartoon" href="${href("cartoon.html")}">${ICON.book}<span data-i18n="cartoon"></span></a></li>
        <li><a data-nav="music" href="${href("music.html")}">${ICON.music}<span data-i18n="music"></span></a></li>
        <li><a data-nav="service" href="${href("service.html")}">${ICON.wrench}<span data-i18n="service"></span></a></li>
        <li><a data-nav="program" href="${href("program.html")}">${ICON.code}<span data-i18n="program"></span></a></li>
      </ul>
    </div>`;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeOverlays();
    });
    document.body.appendChild(overlay);
    const page = currentPage();
    overlay.querySelectorAll("[data-nav]").forEach((a) => {
      if (a.getAttribute("data-nav") === page) a.classList.add("is-active");
    });
  }

  function flagUrl(code) {
    return "/resources/img/header/lang/" + code + ".png";
  }

  function paintLangBtn() {
    const langBtn = document.getElementById("langBtn");
    if (!langBtn) return;
    const lang = getLang();
    let img = langBtn.querySelector("img.lang-flag");
    if (!img) {
      langBtn.replaceChildren();
      img = document.createElement("img");
      img.className = "lang-flag";
      img.alt = "";
      img.width = 28;
      img.height = 28;
      const sr = document.createElement("span");
      sr.className = "sr-only";
      sr.setAttribute("data-i18n", "language");
      langBtn.append(img, sr);
    }
    img.src = flagUrl(lang);
    langBtn.setAttribute("aria-label", t("language"));
  }

  function buildLangMenu() {
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.id = "langOverlay";
    const names = { en: "English", kr: "한국어", jp: "日本語", cn: "中文", ru: "Русский" };
    const items = LANGS.map((code) => {
      return `<button type="button" class="lang-option${code === getLang() ? " is-active" : ""}" data-lang="${code}">
        <img class="lang-flag" src="${flagUrl(code)}" alt="" width="20" height="20">
        <span class="lang-code">${code.toUpperCase()}</span>
        <span class="lang-name">${names[code]}</span>
      </button>`;
    }).join("");
    overlay.innerHTML = `<div class="lang-panel" role="listbox" aria-label="${escapeHtml(t("language"))}">${items}</div>`;
    overlay.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-lang]");
      if (btn) {
        setLang(btn.getAttribute("data-lang"));
        closeOverlays();
        overlay.querySelectorAll(".lang-option").forEach((b) => {
          b.classList.toggle("is-active", b.getAttribute("data-lang") === getLang());
        });
      } else if (e.target === overlay) closeOverlays();
    });
    document.body.appendChild(overlay);
  }

  function closeOverlays() {
    document.querySelectorAll(".overlay").forEach((el) => el.classList.remove("is-open"));
    document.getElementById("menuBtn")?.setAttribute("aria-expanded", "false");
    document.getElementById("langBtn")?.setAttribute("aria-expanded", "false");
  }

  function toggleOverlay(id, btn) {
    const el = document.getElementById(id);
    const open = !el.classList.contains("is-open");
    closeOverlays();
    if (open) {
      el.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    }
  }

  function mountChrome() {
    if (!getCookie(COOKIE)) setCookie(COOKIE, "kr", 31);
    global.NOW_LANG = getLang();

    const menuBtn = document.getElementById("menuBtn");
    const langBtn = document.getElementById("langBtn");
    if (menuBtn) {
      menuBtn.innerHTML = ICON.menu + `<span class="sr-only" data-i18n="menu"></span>`;
      menuBtn.addEventListener("click", () => toggleOverlay("menuOverlay", menuBtn));
    }
    if (langBtn) {
      paintLangBtn();
      langBtn.addEventListener("click", () => toggleOverlay("langOverlay", langBtn));
    }
    buildMenu();
    buildLangMenu();
    applyI18n();
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeOverlays();
    });
    installPreviewBridge();
  }

  function installPreviewBridge() {
    if (window.parent === window) return;
    const CHANNEL = "grok-preview-bridge";
    const ancestor =
      typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0
        ? location.ancestorOrigins[0]
        : null;
    let parentOrigin = null;
    try {
      if (document.referrer) parentOrigin = new URL(document.referrer).origin;
    } catch (_) {}
    if (ancestor) parentOrigin = ancestor;
    if (!parentOrigin) return;

    const post = (msg) => window.parent.postMessage(msg, parentOrigin);
    const report = () =>
      post({
        channel: CHANNEL,
        version: 1,
        type: "location",
        path: location.pathname || "/",
        search: location.search,
        hash: location.hash
      });
    const routes = ["/", "/index.html", "/cartoon.html", "/music.html", "/service.html", "/program.html"];
    const announce = () => {
      report();
      post({ channel: CHANNEL, version: 1, type: "routes", paths: routes });
      post({ channel: CHANNEL, version: 1, type: "ready" });
    };
    window.addEventListener("message", (event) => {
      if (event.source !== window.parent || event.origin !== parentOrigin) return;
      const data = event.data;
      if (!data || data.channel !== CHANNEL || data.version !== 1) return;
      if (data.type === "hello") announce();
      if (data.type === "navigate" && typeof data.path === "string" && data.path.startsWith("/")) {
        location.assign(data.path);
      }
      if (data.type === "history" && (data.delta === -1 || data.delta === 1)) {
        history.go(data.delta);
      }
    });
    announce();
  }

  global.GBD = {
    LANGS,
    I18N,
    ICON,
    t,
    pick,
    getLang,
    setLang,
    applyI18n,
    getBase,
    href,
    escapeHtml,
    safeHtml,
    loadScript,
    mountChrome,
    closeOverlays,
    currentPage,
    flagUrl
  };
  global.NOW_LANG = getLang();
  global.loadLanguage = () => applyI18n();
  global.getCookie = getCookie;
  global.setCookie = setCookie;

  document.addEventListener("DOMContentLoaded", mountChrome);
})(window);
