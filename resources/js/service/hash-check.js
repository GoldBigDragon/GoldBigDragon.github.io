(function () {
  "use strict";

  var rows = [];
  var MAX = 128 * 1024 * 1024;

  function L(key) {
    var bag = (window.LANGUAGE_OBJECT || {}).HASH_CHECK_LANG;
    var lang = GBD.getLang();
    return (bag && bag[key] && (bag[key][lang] || bag[key].en)) || key;
  }

  function toast(msg) {
    if (typeof showToast === "function") showToast(msg);
  }

  function human(n) {
    if (n < 1024) return n + " B";
    var u = ["KB", "MB", "GB", "TB"];
    var i = -1;
    do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
    return n.toFixed(2) + " " + u[i];
  }

  function hex(bytes) {
    var s = "";
    for (var i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
    return s;
  }

  function add(a, b) { return (a + b) >>> 0; }
  function rol(x, n) { return (x << n) | (x >>> (32 - n)); }
  function cmn(q, a, b, x, s, t) { return add(rol(add(add(a, q), add(x, t)), s), b); }

  function md5(buffer) {
    var bytes = new Uint8Array(buffer);
    var len = bytes.length;
    var words = [];
    for (var i = 0; i < len; i++) words[i >> 2] |= bytes[i] << ((i % 4) * 8);
    words[len >> 2] |= 0x80 << ((len % 4) * 8);
    var bits = len * 8;
    var size = (((len + 8) >> 6) + 1) * 16;
    while (words.length < size) words.push(0);
    words[size - 2] = bits & 0xffffffff;
    words[size - 1] = Math.floor(bits / 0x100000000);
    var a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (i = 0; i < words.length; i += 16) {
      var oa = a, ob = b, oc = c, od = d;
      var w = words.slice(i, i + 16);
      function ff(a0, b0, c0, d0, x, s, t) { return cmn((b0 & c0) | (~b0 & d0), a0, b0, x, s, t); }
      function gg(a0, b0, c0, d0, x, s, t) { return cmn((b0 & d0) | (c0 & ~d0), a0, b0, x, s, t); }
      function hh(a0, b0, c0, d0, x, s, t) { return cmn(b0 ^ c0 ^ d0, a0, b0, x, s, t); }
      function ii(a0, b0, c0, d0, x, s, t) { return cmn(c0 ^ (b0 | ~d0), a0, b0, x, s, t); }
      a = ff(a, b, c, d, w[0], 7, -680876936);
      d = ff(d, a, b, c, w[1], 12, -389564586);
      c = ff(c, d, a, b, w[2], 17, 606105819);
      b = ff(b, c, d, a, w[3], 22, -1044525330);
      a = ff(a, b, c, d, w[4], 7, -176418897);
      d = ff(d, a, b, c, w[5], 12, 1200080426);
      c = ff(c, d, a, b, w[6], 17, -1473231341);
      b = ff(b, c, d, a, w[7], 22, -45705983);
      a = ff(a, b, c, d, w[8], 7, 1770035416);
      d = ff(d, a, b, c, w[9], 12, -1958414417);
      c = ff(c, d, a, b, w[10], 17, -42063);
      b = ff(b, c, d, a, w[11], 22, -1990404162);
      a = ff(a, b, c, d, w[12], 7, 1804603682);
      d = ff(d, a, b, c, w[13], 12, -40341101);
      c = ff(c, d, a, b, w[14], 17, -1502002290);
      b = ff(b, c, d, a, w[15], 22, 1236535329);
      a = gg(a, b, c, d, w[1], 5, -165796510);
      d = gg(d, a, b, c, w[6], 9, -1069501632);
      c = gg(c, d, a, b, w[11], 14, 643717713);
      b = gg(b, c, d, a, w[0], 20, -373897302);
      a = gg(a, b, c, d, w[5], 5, -701558691);
      d = gg(d, a, b, c, w[10], 9, 38016083);
      c = gg(c, d, a, b, w[15], 14, -660478335);
      b = gg(b, c, d, a, w[4], 20, -405537848);
      a = gg(a, b, c, d, w[9], 5, 568446438);
      d = gg(d, a, b, c, w[14], 9, -1019803690);
      c = gg(c, d, a, b, w[3], 14, -187363961);
      b = gg(b, c, d, a, w[8], 20, 1163531501);
      a = gg(a, b, c, d, w[13], 5, -1444681467);
      d = gg(d, a, b, c, w[2], 9, -51403784);
      c = gg(c, d, a, b, w[7], 14, 1735328473);
      b = gg(b, c, d, a, w[12], 20, -1926607734);
      a = hh(a, b, c, d, w[5], 4, -378558);
      d = hh(d, a, b, c, w[8], 11, -2022574463);
      c = hh(c, d, a, b, w[11], 16, 1839030562);
      b = hh(b, c, d, a, w[14], 23, -35309556);
      a = hh(a, b, c, d, w[1], 4, -1530992060);
      d = hh(d, a, b, c, w[4], 11, 1272893353);
      c = hh(c, d, a, b, w[7], 16, -155497632);
      b = hh(b, c, d, a, w[10], 23, -1094730640);
      a = hh(a, b, c, d, w[13], 4, 681279174);
      d = hh(d, a, b, c, w[0], 11, -358537222);
      c = hh(c, d, a, b, w[3], 16, -722521979);
      b = hh(b, c, d, a, w[6], 23, 76029189);
      a = hh(a, b, c, d, w[9], 4, -640364487);
      d = hh(d, a, b, c, w[12], 11, -421815835);
      c = hh(c, d, a, b, w[15], 16, 530742520);
      b = hh(b, c, d, a, w[2], 23, -995338651);
      a = ii(a, b, c, d, w[0], 6, -198630844);
      d = ii(d, a, b, c, w[7], 10, 1126891415);
      c = ii(c, d, a, b, w[14], 15, -1416354905);
      b = ii(b, c, d, a, w[5], 21, -57434055);
      a = ii(a, b, c, d, w[12], 6, 1700485571);
      d = ii(d, a, b, c, w[3], 10, -1894986606);
      c = ii(c, d, a, b, w[10], 15, -1051523);
      b = ii(b, c, d, a, w[1], 21, -2054922799);
      a = ii(a, b, c, d, w[8], 6, 1873313359);
      d = ii(d, a, b, c, w[15], 10, -30611744);
      c = ii(c, d, a, b, w[6], 15, -1560198380);
      b = ii(b, c, d, a, w[13], 21, 1309151649);
      a = ii(a, b, c, d, w[4], 6, -145523070);
      d = ii(d, a, b, c, w[11], 10, -1120210379);
      c = ii(c, d, a, b, w[2], 15, 718787259);
      b = ii(b, c, d, a, w[9], 21, -343485551);
      a = add(a, oa); b = add(b, ob); c = add(c, oc); d = add(d, od);
    }
    function le(n) {
      return [n, n >> 8, n >> 16, n >> 24].map(function (x) {
        return (x & 255).toString(16).padStart(2, "0");
      }).join("");
    }
    return le(a) + le(b) + le(c) + le(d);
  }

  async function sha(algo, buffer) {
    var out = await crypto.subtle.digest(algo, buffer);
    return hex(new Uint8Array(out));
  }

  function render() {
    var list = document.getElementById("downloadLinks");
    list.replaceChildren();
    rows.forEach(function (row) {
      var card = document.createElement("article");
      card.className = "hash-card";
      var h = document.createElement("h3");
      h.textContent = row.name;
      var size = document.createElement("div");
      size.className = "note";
      size.textContent = human(row.size);
      card.append(h, size);
      [["MD5", row.md5], ["SHA-1", row.sha1], ["SHA-256", row.sha256]].forEach(function (pair) {
        var line = document.createElement("div");
        line.className = "hash-row";
        var k = document.createElement("div");
        k.className = "k";
        k.textContent = pair[0];
        var code = document.createElement("code");
        code.textContent = pair[1];
        var copy = document.createElement("button");
        copy.type = "button";
        copy.className = "btn";
        copy.textContent = L("copy");
        copy.addEventListener("click", function () {
          navigator.clipboard.writeText(pair[1]).then(function () {
            toast(L("copied"));
          }).catch(function (err) { toast(String(err)); });
        });
        line.append(k, code, copy);
        card.appendChild(line);
      });
      list.appendChild(card);
    });
    document.getElementById("csvBtn").disabled = !rows.length;
    document.getElementById("jsonBtn").disabled = !rows.length;
  }

  async function handleFiles(fileList) {
    var files = Array.from(fileList || []);
    if (!files.length) return;
    document.getElementById("loading").hidden = false;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (file.size > MAX) {
        toast(file.name + " — " + L("too_large"));
        continue;
      }
      try {
        var buf = await file.arrayBuffer();
        rows.push({
          name: file.name,
          size: file.size,
          md5: md5(buf),
          sha1: await sha("SHA-1", buf),
          sha256: await sha("SHA-256", buf)
        });
        render();
      } catch (err) {
        toast(file.name + ": " + (err.message || err));
      }
    }
    document.getElementById("loading").hidden = true;
  }

  function download(name, text, type) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type }));
    a.download = name;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  function downloadJSON() {
    var obj = {};
    rows.forEach(function (r) {
      obj[r.name] = { size: human(r.size), MD5: r.md5, "SHA-1": r.sha1, "SHA-256": r.sha256 };
    });
    download("hashes.json", JSON.stringify(obj, null, 2), "application/json");
  }

  function downloadCSV() {
    var csv = "Name,Size,MD5,SHA-1,SHA-256\n";
    rows.forEach(function (r) {
      csv += '"' + r.name.replace(/"/g, '""') + '",' + r.size + "," + r.md5 + "," + r.sha1 + "," + r.sha256 + "\n";
    });
    download("hashes.csv", csv, "text/csv;charset=utf-8;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var drop = document.getElementById("dropZone");
    var input = document.getElementById("fileInput");
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
    document.getElementById("clearHistoryButton").addEventListener("click", function () {
      rows = [];
      render();
    });
    document.getElementById("csvBtn").addEventListener("click", downloadCSV);
    document.getElementById("jsonBtn").addEventListener("click", downloadJSON);
    document.addEventListener("gbd:lang", render);
  });
})();
