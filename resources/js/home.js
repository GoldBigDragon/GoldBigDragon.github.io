(function () {
  "use strict";

  const FILES = {
    career: { src: "/resources/data/index/career.js", key: "DATA_CAREER" },
    education: { src: "/resources/data/index/education.js", key: "DATA_EDUCATION" },
    certificate: { src: "/resources/data/index/certificate.js", key: "DATA_CERTIFICATE" },
    etc: { src: "/resources/data/index/etc.js", key: "DATA_ETC" }
  };

  const cache = {
    career: null,
    education: null,
    certificate: null,
    etc: null
  };

  let view = { category: null, index: null };
  let lastFocus = null;

  function readLoaded(key) {
    let value = window[key];
    try {
      switch (key) {
        case "DATA_CAREER":
          if (typeof DATA_CAREER !== "undefined") value = DATA_CAREER;
          break;
        case "DATA_EDUCATION":
          if (typeof DATA_EDUCATION !== "undefined") value = DATA_EDUCATION;
          break;
        case "DATA_CERTIFICATE":
          if (typeof DATA_CERTIFICATE !== "undefined") value = DATA_CERTIFICATE;
          break;
        case "DATA_ETC":
          if (typeof DATA_ETC !== "undefined") value = DATA_ETC;
          break;
      }
    } catch (_) {}
    if (!Array.isArray(value) || value.length === 0) {
      try {
        value = eval(key);
      } catch (_) {}
    }
    return Array.isArray(value) ? value : [];
  }

  async function ensure(category) {
    if (cache[category]) return cache[category];
    const spec = FILES[category];
    await GBD.loadScript(spec.src);
    cache[category] = readLoaded(spec.key);
    return cache[category];
  }

  function openModal() {
    const modal = document.getElementById("modal");
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("modalClose").focus();
  }

  function closeModal() {
    document.getElementById("modal").hidden = true;
    document.body.style.overflow = "";
    view = { category: null, index: null };
    document.querySelectorAll(".dock-btn").forEach((b) => b.classList.remove("is-active"));
    if (lastFocus) lastFocus.focus();
  }

  function setHead(showBack, title) {
    const back = document.getElementById("modalBack");
    back.hidden = !showBack;
    document.getElementById("modalTitle").textContent = title;
  }

  function renderBadges(category, data) {
    setHead(false, GBD.t(category));
    const body = document.getElementById("modalBody");
    const grid = document.createElement("div");
    grid.className = "badge-grid";
    data.forEach((item, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "badge";
      btn.setAttribute("aria-label", GBD.pick(item["logo-title"]));
      const img = document.createElement("img");
      img.src = item.logo;
      img.alt = "";
      img.loading = "lazy";
      const cap = document.createElement("span");
      cap.textContent = GBD.pick(item["logo-title"]);
      btn.append(img, cap);
      btn.addEventListener("click", () => showDetail(category, index));
      grid.appendChild(btn);
    });
    body.replaceChildren(grid);
  }

  function row(label, value, asHtml, asLink) {
    if (!value) return null;
    const wrap = document.createElement("div");
    wrap.className = "kv";
    const k = document.createElement("div");
    k.className = "k";
    k.textContent = label;
    const v = document.createElement("div");
    v.className = "v";
    if (asLink) {
      const a = document.createElement("a");
      a.href = value;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = value;
      v.appendChild(a);
    } else if (asHtml) {
      v.innerHTML = GBD.safeHtml(value);
    } else {
      v.textContent = value;
    }
    wrap.append(k, v);
    return wrap;
  }

  function period(item) {
    const start = item["start-date"] || "";
    const end = item["end-date"];
    const endText = end && typeof end === "object" ? GBD.pick(end) : end || "";
    return start && endText ? `${start} – ${endText}` : start || endText;
  }

  function showDetail(category, index) {
    view = { category, index };
    const item = cache[category][index];
    setHead(true, GBD.pick(item["logo-title"]) || GBD.t(category));
    const body = document.getElementById("modalBody");
    const box = document.createElement("div");
    box.className = "detail";
    if (item.logo) {
      const logo = document.createElement("img");
      logo.className = "detail-logo";
      logo.src = item.logo;
      logo.alt = GBD.pick(item["logo-title"]);
      box.appendChild(logo);
    }
    const fields = [];
    if (category === "career") {
      fields.push(
        row(GBD.t("companyName"), item.company),
        row(GBD.t("companySite"), item["company-link"], false, true),
        row(GBD.t("period"), period(item)),
        row(GBD.t("department"), GBD.pick(item.department)),
        row(GBD.t("team"), GBD.pick(item.team)),
        row(GBD.t("position"), GBD.pick(item.position)),
        row(GBD.t("task"), GBD.pick(item.task), true)
      );
    } else if (category === "education") {
      fields.push(
        row(GBD.t("educationName"), GBD.pick(item.name)),
        row(GBD.t("period"), period(item)),
        row(GBD.t("companySite"), item.url, false, true),
        row(GBD.t("department"), GBD.pick(item.department)),
        row(GBD.t("degree"), GBD.pick(item.degree)),
        row(GBD.t("institution"), GBD.pick(item["educational-institution"]))
      );
    } else if (category === "certificate") {
      fields.push(
        row(GBD.t("certName"), GBD.pick(item.name)),
        row(GBD.t("issuer"), GBD.pick(item["issuing-authority"])),
        row(GBD.t("certNo"), item["certificate-no"]),
        row(GBD.t("acquired"), item["acquisition-date"])
      );
    } else {
      fields.push(
        row(GBD.t("awardName"), GBD.pick(item["award-name"])),
        row(GBD.t("org"), GBD.pick(item["awarding-organization"])),
        row(GBD.t("awardDate"), item["award-date"]),
        row(GBD.t("reason"), GBD.pick(item.reason), true)
      );
    }
    fields.filter(Boolean).forEach((el) => box.appendChild(el));
    if (item.proof) {
      const img = document.createElement("img");
      img.className = "detail-proof";
      img.src = item.proof;
      img.alt = GBD.t("proof");
      img.loading = "lazy";
      box.appendChild(img);
    }
    body.replaceChildren(box);
    document.getElementById("modalBack").focus();
  }

  async function openCategory(category, trigger) {
    lastFocus = trigger || document.activeElement;
    document.querySelectorAll(".dock-btn").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.cat === category);
    });
    view = { category, index: null };
    openModal();
    setHead(false, GBD.t(category));
    const body = document.getElementById("modalBody");
    body.innerHTML = `<div class="loading" role="status"><div class="spinner"></div><div>${GBD.escapeHtml(GBD.t("loading"))}</div></div>`;
    try {
      const data = await ensure(category);
      renderBadges(category, data);
    } catch (err) {
      body.innerHTML = `<p class="empty">${GBD.escapeHtml(err.message)}</p>`;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".dock-btn").forEach((btn) => {
      btn.addEventListener("click", () => openCategory(btn.dataset.cat, btn));
    });
    document.getElementById("modalClose").addEventListener("click", closeModal);
    document.getElementById("modalBack").addEventListener("click", () => {
      if (view.category) renderBadges(view.category, cache[view.category] || []);
      view.index = null;
    });
    document.getElementById("modalBackdrop").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !document.getElementById("modal").hidden) {
        e.preventDefault();
        if (view.index != null) {
          renderBadges(view.category, cache[view.category] || []);
          view.index = null;
        } else closeModal();
      }
    });
    document.addEventListener("gbd:lang", () => {
      if (document.getElementById("modal").hidden) return;
      if (view.category && view.index != null) showDetail(view.category, view.index);
      else if (view.category && cache[view.category]) renderBadges(view.category, cache[view.category]);
    });
  });
})();
