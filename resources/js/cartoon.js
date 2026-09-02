(function () {
  "use strict";

  let current = 0;
  let lastFocus = null;

  function coverSrc(uid) {
    return `/resources/img/cartoon/${uid}/${GBD.getLang()}/cover.png`;
  }
  function pageSrc(uid, file) {
    return `/resources/img/cartoon/${uid}/${GBD.getLang()}/${file}`;
  }

  function setCrumb(seriesTitle) {
    const sep = document.getElementById("crumbSep");
    const leaf = document.getElementById("crumbLeaf");
    const head = document.getElementById("pageHead");
    const reading = Boolean(seriesTitle);
    sep.hidden = !reading;
    leaf.hidden = !reading;
    leaf.textContent = seriesTitle || "";
    document.body.classList.toggle("is-reading", reading);
    if (head) head.classList.toggle("is-reading", reading);
  }

  function renderCovers() {
    const area = document.getElementById("coverArea");
    area.replaceChildren();
    CARTOON_LIST.forEach((item, index) => {
      const el = document.createElement("article");
      el.className = "cover";
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      const img = document.createElement("img");
      img.src = coverSrc(item.uid);
      img.alt = GBD.pick(item.title);
      img.loading = "lazy";
      const h = document.createElement("h3");
      h.textContent = GBD.pick(item.title);
      const sub = document.createElement("div");
      sub.className = "sub";
      sub.textContent = GBD.pick(item.translating);
      el.append(img, h, sub);
      const open = () => openReader(index);
      el.addEventListener("click", open);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
      area.appendChild(el);
    });
  }

  function openReader(index) {
    lastFocus = document.activeElement;
    current = index;
    const item = CARTOON_LIST[index];
    document.getElementById("coverArea").hidden = true;
    document.getElementById("reader").hidden = false;
    setCrumb(GBD.pick(item.title));
    const sel = document.getElementById("pageSelect");
    sel.replaceChildren();
    item.pages.forEach((p, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i + 1}. ${GBD.pick(p.title)}`;
      sel.appendChild(opt);
    });
    document.getElementById("maxPage").textContent = String(item.pages.length);
    goPage(Math.max(0, item.pages.length - 1));
  }

  function closeReader() {
    document.getElementById("reader").hidden = true;
    document.getElementById("coverArea").hidden = false;
    setCrumb("");
    if (lastFocus) lastFocus.focus();
  }

  function goPage(n) {
    const item = CARTOON_LIST[current];
    const max = item.pages.length - 1;
    n = Math.max(0, Math.min(max, n));
    const page = item.pages[n];
    document.getElementById("pageInput").value = String(n + 1);
    document.getElementById("pageSelect").value = String(n);
    document.getElementById("readerTitle").textContent = GBD.pick(page.title);
    document.getElementById("readerDate").textContent = page["created-at"] || "";
    const img = document.getElementById("pageImage");
    img.src = pageSrc(item.uid, page.img);
    img.alt = GBD.pick(page.title);
    const frame = document.getElementById("pageFrame");
    frame.style.background = page["background-color"] || "transparent";
    const disabledPrev = n <= 0 ? "true" : "false";
    const disabledNext = n >= max ? "true" : "false";
    ["prevPage", "prevPageBar"].forEach((id) => {
      document.getElementById(id).setAttribute("aria-disabled", disabledPrev);
    });
    ["nextPage", "nextPageBar"].forEach((id) => {
      document.getElementById(id).setAttribute("aria-disabled", disabledNext);
    });
  }

  function currentPageIndex() {
    return parseInt(document.getElementById("pageInput").value, 10) - 1;
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderCovers();
    document.getElementById("pageTitle").addEventListener("click", () => {
      if (!document.getElementById("reader").hidden) closeReader();
    });
    document.getElementById("pageSelect").addEventListener("change", (e) => goPage(parseInt(e.target.value, 10)));
    document.getElementById("pageGo").addEventListener("click", () => goPage(currentPageIndex()));
    document.getElementById("pageInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") goPage(currentPageIndex());
    });
    const prev = () => goPage(currentPageIndex() - 1);
    const next = () => goPage(currentPageIndex() + 1);
    document.getElementById("prevPage").addEventListener("click", prev);
    document.getElementById("nextPage").addEventListener("click", next);
    document.getElementById("prevPageBar").addEventListener("click", prev);
    document.getElementById("nextPageBar").addEventListener("click", next);
    document.addEventListener("keydown", (e) => {
      const reader = document.getElementById("reader");
      if (reader.hidden) return;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") closeReader();
    });
    document.addEventListener("gbd:lang", () => {
      renderCovers();
      if (!document.getElementById("reader").hidden) {
        setCrumb(GBD.pick(CARTOON_LIST[current].title));
        goPage(currentPageIndex());
      }
    });
  });
})();
