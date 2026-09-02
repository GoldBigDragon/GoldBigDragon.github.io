(function () {
  "use strict";

  function matches(item, field, q) {
    if (!q) return true;
    if (field === "tag") return (item.tag || []).some((t) => t.toLowerCase().includes(q));
    return GBD.pick(item.name).toLowerCase().includes(q);
  }

  function render(list) {
    const area = document.getElementById("catalog");
    area.replaceChildren();
    if (!list.length) {
      area.innerHTML = `<p class="empty">${GBD.escapeHtml(GBD.t("empty"))}</p>`;
      return;
    }
    list.forEach((item) => {
      const a = document.createElement("a");
      a.className = "item-card";
      a.href = item.url;
      const img = document.createElement("img");
      img.src = item.icon;
      img.alt = GBD.pick(item.name);
      img.loading = "lazy";
      const body = document.createElement("div");
      const h = document.createElement("h3");
      h.textContent = GBD.pick(item.name);
      const p = document.createElement("p");
      p.textContent = GBD.pick(item.description);
      const tags = document.createElement("div");
      tags.className = "tags";
      (item.tag || []).forEach((tag) => {
        const s = document.createElement("span");
        s.className = "chip";
        s.textContent = tag;
        tags.appendChild(s);
      });
      body.append(h, p, tags);
      a.append(img, body);
      area.appendChild(a);
    });
  }

  function run(e) {
    if (e) e.preventDefault();
    const field = document.getElementById("searchField").value;
    const q = document.getElementById("searchInput").value.trim().toLowerCase();
    render(SERVICE_LIST.filter((item) => matches(item, field, q)));
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("searchForm").addEventListener("submit", run);
    render(SERVICE_LIST);
    document.addEventListener("gbd:lang", run);
  });
})();
