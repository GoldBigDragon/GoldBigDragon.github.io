(function () {
  "use strict";

  var pagesData = [];
  var pageIdCounter = 0;

  function L(key) {
    var bag = (window.LANGUAGE_OBJECT || {}).PDF_EDITOR_LANG;
    var lang = GBD.getLang();
    return (bag && bag[key] && (bag[key][lang] || bag[key].en)) || key;
  }

  function toast(msg) {
    if (typeof showToast === "function") showToast(msg);
  }

  function setBusy(on) {
    document.getElementById("loading").hidden = !on;
    document.getElementById("exportPdf").disabled = on || !pagesData.length;
    document.getElementById("exportPng").disabled = on || !pagesData.length;
  }

  function refreshButtons() {
    var empty = !pagesData.length;
    document.getElementById("exportPdf").disabled = empty;
    document.getElementById("exportPng").disabled = empty;
  }

  async function addPdfFile(file) {
    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
      toast(file.name + " — " + L("unsupported"));
      return;
    }
    if (typeof pdfjsLib === "undefined") {
      toast("PDF.js is not available.");
      return;
    }
    pdfjsLib.disableWorker = true;
    var buf = await file.arrayBuffer();
    var pdf = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
    for (var i = 1; i <= pdf.numPages; i++) {
      var page = await pdf.getPage(i);
      var item = {
        fileName: file.name,
        pageNum: i,
        bytes: buf.slice(0),
        removed: false,
        pageId: pageIdCounter++
      };
      pagesData.push(item);
      await renderThumb(page, item);
    }
  }

  async function renderThumb(page, pageData) {
    var viewport = page.getViewport({ scale: 0.35 });
    var canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: viewport }).promise;

    var card = document.createElement("article");
    card.className = "pdf-card";
    card.draggable = true;
    card.dataset.pageId = String(pageData.pageId);
    var cap = document.createElement("div");
    cap.className = "pdf-cap";
    var label = document.createElement("span");
    label.textContent = pageData.fileName.replace(/\.pdf$/i, "") + " · " + pageData.pageNum;
    var del = document.createElement("button");
    del.type = "button";
    del.className = "pdf-del";
    del.setAttribute("aria-label", L("clear"));
    del.innerHTML = (window.GBD && GBD.ICON && GBD.ICON.close) || "×";
    del.addEventListener("click", function (e) {
      e.stopPropagation();
      pagesData = pagesData.filter(function (p) { return p.pageId !== pageData.pageId; });
      card.remove();
      refreshButtons();
    });
    cap.append(label, del);
    card.append(canvas, cap);
    makeDraggable(card);
    document.getElementById("pdfContainer").appendChild(card);
  }

  function updateOrder() {
    var cards = document.querySelectorAll("#pdfContainer .pdf-card");
    var next = [];
    cards.forEach(function (card) {
      var id = parseInt(card.dataset.pageId, 10);
      var found = pagesData.find(function (p) { return p.pageId === id; });
      if (found) next.push(found);
    });
    if (next.length === pagesData.length) pagesData = next;
  }

  function makeDraggable(item) {
    item.addEventListener("dragstart", function (e) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", item.dataset.pageId);
      item.classList.add("dragging");
    });
    item.addEventListener("dragend", function () {
      item.classList.remove("dragging");
      updateOrder();
    });
    item.addEventListener("dragover", function (e) {
      e.preventDefault();
      var dragging = document.querySelector(".pdf-card.dragging");
      var over = e.target.closest(".pdf-card");
      if (!dragging || !over || dragging === over) return;
      var box = over.getBoundingClientRect();
      var before = e.clientY < box.top + box.height / 2;
      var grid = document.getElementById("pdfContainer");
      grid.insertBefore(dragging, before ? over : over.nextSibling);
    });
  }

  async function handleFiles(fileList) {
    var files = Array.from(fileList || []);
    if (!files.length) return;
    setBusy(true);
    for (var i = 0; i < files.length; i++) {
      try { await addPdfFile(files[i]); }
      catch (err) { toast(files[i].name + ": " + (err.message || err)); }
    }
    setBusy(false);
    refreshButtons();
  }

  function downloadBlob(blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  async function exportPDF() {
    if (!pagesData.length || typeof PDFLib === "undefined") return;
    setBusy(true);
    try {
      var out = await PDFLib.PDFDocument.create();
      for (var i = 0; i < pagesData.length; i++) {
        var info = pagesData[i];
        var src = await PDFLib.PDFDocument.load(info.bytes);
        var copied = await out.copyPages(src, [info.pageNum - 1]);
        out.addPage(copied[0]);
      }
      var bytes = await out.save();
      downloadBlob(new Blob([bytes], { type: "application/pdf" }), "edited.pdf");
    } catch (err) {
      toast(err.message || String(err));
    }
    setBusy(false);
    refreshButtons();
  }

  async function exportPNG() {
    if (!pagesData.length) return;
    setBusy(true);
    try {
      pdfjsLib.disableWorker = true;
      var files = [];
      for (var i = 0; i < pagesData.length; i++) {
        var info = pagesData[i];
        var pdf = await pdfjsLib.getDocument({ data: info.bytes.slice(0) }).promise;
        var page = await pdf.getPage(info.pageNum);
        var viewport = page.getViewport({ scale: 2 });
        var canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport: viewport }).promise;
        var blob = await new Promise(function (res) { canvas.toBlob(res, "image/png"); });
        files.push({
          name: "page_" + String(i + 1).padStart(2, "0") + ".png",
          data: new Uint8Array(await blob.arrayBuffer())
        });
      }
      downloadBlob(GBDCompress.zipStore(files), "pages.zip");
    } catch (err) {
      toast(err.message || String(err));
    }
    setBusy(false);
    refreshButtons();
  }

  function clearHistory() {
    pagesData = [];
    document.getElementById("pdfContainer").replaceChildren();
    document.getElementById("pdfInput").value = "";
    refreshButtons();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var drop = document.getElementById("dropZone");
    var input = document.getElementById("pdfInput");
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
    document.getElementById("resetButton").addEventListener("click", clearHistory);
    document.getElementById("exportPdf").addEventListener("click", exportPDF);
    document.getElementById("exportPng").addEventListener("click", exportPNG);
  });
})();
