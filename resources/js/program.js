(function () {
  "use strict";

  function matches(item, field, q) {
    if (!q) return true;
    if (field === "name") return GBD.pick(item.name).toLowerCase().includes(q);
    if (field === "tag") return (item.tag || []).some((t) => t.toLowerCase().includes(q));
    const lang = String(item.language || "").toLowerCase();
    return lang.includes(q);
  }

  function render(list) {
    const area = document.getElementById("catalog");
    area.replaceChildren();
    if (!list.length) {
      area.innerHTML = `<p class="empty">${GBD.escapeHtml(GBD.t("empty"))}</p>`;
      return;
    }
    list.forEach((item) => {
      const card = document.createElement("article");
      card.className = "item-card";
      const img = document.createElement("img");
      img.src = item.icon;
      img.alt = GBD.pick(item.name);
      img.loading = "lazy";
      const body = document.createElement("div");
      const h = document.createElement("h3");
      h.textContent = GBD.pick(item.name);
      const p = document.createElement("p");
      p.textContent = GBD.pick(item.description);
      const actions = document.createElement("div");
      actions.className = "actions";
      const links = [
        ["download", item.download, GBD.t("download")],
        ["document", item.document, GBD.t("document")],
        ["github", item.github, "GitHub"],
        ["video", item.video, GBD.t("video")],
        ["youtube", item.youtube, "YouTube"]
      ];
      links.forEach(([key, href, label]) => {
        if (!href) return;
        const a = document.createElement("a");
        a.className = "chip" + (key === "download" ? " primary" : "");
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = label;
        actions.appendChild(a);
      });
      const tags = document.createElement("div");
      tags.className = "tags";
      (item.tag || []).forEach((tag) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tag";
        b.textContent = tag;
        b.addEventListener("click", () => {
          document.getElementById("searchField").value = "tag";
          document.getElementById("searchInput").value = tag;
          run();
        });
        tags.appendChild(b);
      });
      body.append(h, p, actions, tags);
      card.append(img, body);
      area.appendChild(card);
    });
  }

  function run(e) {
    if (e) e.preventDefault();
    const field = document.getElementById("searchField").value;
    const q = document.getElementById("searchInput").value.trim().toLowerCase();
    render(PROGRAM_LIST.filter((item) => matches(item, field, q)));
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("searchForm").addEventListener("submit", run);
    render(PROGRAM_LIST);
    document.addEventListener("gbd:lang", run);
  });
})();
