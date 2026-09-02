(function () {
  "use strict";

  var format = "png";
  var sizeMode = "relative";
  var results = [];

  function L(key) {
    var bag = (window.LANGUAGE_OBJECT || {}).IMAGE_CONVERTER_LANG;
    var lang = GBD.getLang();
    return (bag && bag[key] && (bag[key][lang] || bag[key].en)) || key;
  }

  function human(n) {
    if (n < 1024) return n + " B";
    var u = ["KB", "MB", "GB"];
    var i = -1;
    do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
    return n.toFixed(n >= 10 ? 1 : 2) + " " + u[i];
  }

  function setFormat(next) {
    format = next;
    document.querySelectorAll("#formatSeg [data-format]").forEach(function (btn) {
      btn.classList.toggle("is-on", btn.getAttribute("data-format") === next);
    });
  }

  function setSizeMode(next) {
    sizeMode = next;
    document.getElementById("relativeSizeButton").classList.toggle("is-on", next === "relative");
    document.getElementById("absoluteSizeButton").classList.toggle("is-on", next === "absolute");
    document.getElementById("relativeSizeInputs").hidden = next !== "relative";
    document.getElementById("absoluteSizeInputs").hidden = next !== "absolute";
  }

  function render() {
    var list = document.getElementById("downloadLinks");
    list.replaceChildren();
    results.forEach(function (row, index) {
      var card = document.createElement("article");
      card.className = "result-card";
      var img = document.createElement("img");
      img.src = row.url;
      img.alt = "";
      var meta = document.createElement("div");
      meta.className = "meta";
      var name = document.createElement("strong");
      name.textContent = row.name;
      var info = document.createElement("span");
      var saved = row.original - row.result;
      var pct = row.original ? Math.round((saved / row.original) * 100) : 0;
      info.textContent = row.skipped
        ? human(row.original) + " · " + L("skipped")
        : human(row.original) + " → " + human(row.result) + (saved > 0 ? " (−" + pct + "%)" : "");
      meta.append(name, info);
      var dl = document.createElement("div");
      dl.className = "dl";
      var a = document.createElement("a");
      a.className = "btn primary";
      a.href = row.url;
      a.download = row.name;
      a.textContent = L("download");
      dl.appendChild(a);
      card.append(img, meta, dl);
      card.dataset.index = String(index);
      list.appendChild(card);
    });
    document.getElementById("downloadAllButton").disabled = !results.length;
  }

  async function handleFiles(fileList) {
    var files = Array.from(fileList || []).filter(function (f) {
      return /^image\//.test(f.type) || /\.(png|jpe?g|gif|webp|ico)$/i.test(f.name);
    });
    if (!files.length) {
      if (typeof showToast === "function") showToast(L("unsupported"));
      return;
    }
    var opts = {
      format: format,
      sizeMode: sizeMode,
      percent: document.getElementById("percentageInput").value,
      width: document.getElementById("widthInput").value,
      height: document.getElementById("heightInput").value,
      level: parseInt(document.getElementById("compressStrength").value, 10) || 0,
      removeBg: document.getElementById("removeBg").checked,
      skipIfLarger: true
    };
    for (var i = 0; i < files.length; i++) {
      try {
        var out = await GBDCompress.compressFile(files[i], opts);
        results.push({
          name: out.name,
          url: URL.createObjectURL(out.blob),
          blob: out.blob,
          original: out.original,
          result: out.result,
          skipped: out.skipped
        });
        render();
      } catch (err) {
        if (typeof showToast === "function") showToast(files[i].name + ": " + (err.message || err));
      }
    }
  }

  function clearHistory() {
    results.forEach(function (r) { URL.revokeObjectURL(r.url); });
    results = [];
    document.getElementById("imageInput").value = "";
    render();
  }

  async function downloadAll() {
    if (!results.length) return;
    var files = [];
    for (var i = 0; i < results.length; i++) {
      files.push({
        name: results[i].name,
        data: new Uint8Array(await results[i].blob.arrayBuffer())
      });
    }
    var zip = GBDCompress.zipStore(files);
    var a = document.createElement("a");
    a.href = URL.createObjectURL(zip);
    a.download = "converted.zip";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var drop = document.getElementById("dropZone");
    var input = document.getElementById("imageInput");
    drop.addEventListener("dragover", function (e) {
      e.preventDefault();
      drop.classList.add("is-over");
    });
    drop.addEventListener("dragleave", function () { drop.classList.remove("is-over"); });
    drop.addEventListener("drop", function (e) {
      e.preventDefault();
      drop.classList.remove("is-over");
      handleFiles(e.dataTransfer.files);
    });
    input.addEventListener("change", function () {
      handleFiles(input.files);
      input.value = "";
    });
    document.getElementById("formatSeg").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-format]");
      if (btn) setFormat(btn.getAttribute("data-format"));
    });
    document.getElementById("relativeSizeButton").addEventListener("click", function () { setSizeMode("relative"); });
    document.getElementById("absoluteSizeButton").addEventListener("click", function () { setSizeMode("absolute"); });
    document.getElementById("clearHistoryButton").addEventListener("click", clearHistory);
    document.getElementById("downloadAllButton").addEventListener("click", downloadAll);
    document.addEventListener("gbd:lang", render);
  });
})();
