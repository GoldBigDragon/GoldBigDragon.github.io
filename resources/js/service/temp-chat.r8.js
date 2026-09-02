(function () {
  "use strict";

  var PUBLIC_PASSPHRASE = "goldbigdragon.github.io";
  var GROUP_SEP = "\u001f";
  var UID_COOKIE = "gbd_chat_uid";
  var TTL_OPTS = [
    { sec: 60, key: "ttl1m" },
    { sec: 600, key: "ttl10m" },
    { sec: 1800, key: "ttl30m" },
    { sec: 3600, key: "ttl1h" },
    { sec: 21600, key: "ttl6h" },
    { sec: 86400, key: "ttl1d" },
    { sec: 259200, key: "ttl3d" }
  ];

  var te = new TextEncoder();
  var td = new TextDecoder();

  var state = {
    room: null,
    modal: null,
    messages: [],
    hasMore: true,
    busy: false,
    stick: true,
    loadingOlder: false,
    newest: null,
    oldest: null,
    clientId: "",
    poll: 0,
    sendTick: 0,
    pendingImg: null
  };

  function t(key) {
    var bag = ((window.LANGUAGE_OBJECT || {}).TEMP_CHAT_LANG) || window.TEMP_CHAT_LANG || {};
    var pack = bag[key];
    return pack ? GBD.pick(pack) : key;
  }

  function apiBase() {
    if (typeof window.GBD_CHAT_API === "string" && window.GBD_CHAT_API) return window.GBD_CHAT_API;
    try {
      var stored = localStorage.getItem("gbd_chat_api");
      if (stored) return stored;
    } catch (_) {}
    return "/api/chat";
  }

  function onPages() {
    return /\.github\.io$/i.test(location.hostname);
  }

  var NTFY = "https://ntfy.sh";
  var RATE_MAX = 60;
  var RATE_MS = 60000;
  var MAX_AGE_MS = 259200000;
  var NTFY_INLINE = 3500;

  function topicOf(hash) {
    return "gbd" + String(hash).slice(0, 40);
  }

  function withRetry(fn, times) {
    times = times || 3;
    function attempt(n) {
      return fn().catch(function (err) {
        if (n >= times || (err && err.message === "rate")) throw err;
        return new Promise(function (resolve) {
          setTimeout(resolve, 280 * n * n);
        }).then(function () {
          return attempt(n + 1);
        });
      });
    }
    return attempt(1);
  }

  function ntfyFetch(url, init) {
    var opts = init ? Object.assign({}, init) : {};
    opts.headers = Object.assign({ Accept: "application/json" }, opts.headers || {});
    opts.signal = opts.signal || AbortSignal.timeout(12000);
    return withRetry(function () {
      return fetch(url, opts).then(function (res) {
        if (res.status === 502 || res.status === 503 || res.status === 429) {
          throw new Error(res.status === 429 ? "rate" : "error");
        }
        return res;
      });
    });
  }

  function writerIp() {
    return fetch("https://get.geojs.io/v1/ip.json", { signal: AbortSignal.timeout(8000) }).then(function (res) {
      return res.json();
    }).then(function (d) {
      return String((d && d.ip) || "").trim() || "0.0.0.0";
    }).catch(function () {
      return "0.0.0.0";
    });
  }

  function readRate() {
    var now = Date.now();
    var list = [];
    try {
      list = JSON.parse(localStorage.getItem("gbd_chat_rate") || "[]");
      if (!Array.isArray(list)) list = [];
    } catch (_) {
      list = [];
    }
    return list.filter(function (r) {
      return r && now - Number(r.at) < RATE_MS;
    });
  }

  function rateWaitMs() {
    var list = readRate();
    if (list.length < RATE_MAX) return 0;
    var oldest = Number(list[0].at) || Date.now();
    return Math.max(0, oldest + RATE_MS - Date.now());
  }

  function rateCommit(ip) {
    var list = readRate();
    list.push({ ip: ip || "", at: Date.now() });
    try {
      localStorage.setItem("gbd_chat_rate", JSON.stringify(list));
    } catch (_) {}
  }

  function formatWait(ms) {
    var sec = Math.max(0, Math.ceil(ms / 1000));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  function parseEnvelope(raw) {
    var obj = raw;
    if (typeof raw === "string") {
      try {
        obj = JSON.parse(raw);
      } catch (_) {
        return null;
      }
    }
    if (!obj || typeof obj !== "object") return null;
    if (typeof obj.c !== "string" || !obj.c) return null;
    return {
      ciphertext: obj.c,
      ip: typeof obj.ip === "string" && obj.ip ? obj.ip : "0.0.0.0",
      createdAt: obj.createdAt,
      expiresAt: obj.expiresAt
    };
  }

  function eventToRow(ev) {
    function finish(env, id, time) {
      if (!env) return null;
      var created = env.createdAt || new Date((time || 0) * 1000).toISOString();
      return {
        id: id,
        ciphertext: env.ciphertext,
        ip: env.ip,
        createdAt: created,
        expiresAt: env.expiresAt
      };
    }
    if (!ev || ev.event !== "message") return Promise.resolve(null);
    var att = ev.attachment && ev.attachment.url;
    if (att) {
      return ntfyFetch(att).then(function (res) {
        if (!res.ok) return null;
        return res.text();
      }).then(function (text) {
        return finish(parseEnvelope(text), ev.id, ev.time);
      }).catch(function () {
        return null;
      });
    }
    return Promise.resolve(finish(parseEnvelope(ev.message), ev.id, ev.time));
  }

  function kvGet(hash, query) {
    var now = Date.now();
    var floor = now - MAX_AGE_MS;
    var url = NTFY + "/" + topicOf(hash) + "/json?poll=1";
    return ntfyFetch(url).then(function (res) {
      if (!res.ok) throw new Error("error");
      return res.text();
    }).then(function (text) {
      var events = [];
      String(text || "").split("\n").forEach(function (line) {
        line = line.trim();
        if (!line) return;
        try {
          events.push(JSON.parse(line));
        } catch (_) {}
      });
      return Promise.all(events.map(eventToRow));
    }).then(function (rows) {
      var list = rows.filter(function (r) {
        if (!r || typeof r.ciphertext !== "string") return false;
        var created = Date.parse(r.createdAt);
        var exp = Date.parse(r.expiresAt);
        if (isNaN(created) || created < floor) return false;
        if (!isNaN(exp) && exp <= now) return false;
        if (query.before && created >= Date.parse(query.before)) return false;
        if (query.after && created <= Date.parse(query.after)) return false;
        return true;
      });
      list.sort(function (a, b) {
        return Date.parse(a.createdAt) - Date.parse(b.createdAt);
      });
      var limit = query.limit || 20;
      if (query.after) return list.slice(0, limit);
      return list.slice(-limit);
    });
  }

  function kvPost(hash, ciphertext, ttl) {
    var ms = Math.min(MAX_AGE_MS, Math.max(60000, Number(ttl) * 1000 || 86400000));
    var createdAt = new Date().toISOString();
    var expiresAt = new Date(Date.now() + ms).toISOString();
    if (rateWaitMs() > 0) return Promise.reject(new Error("rate"));
    return writerIp().then(function (ip) {
      var envelope = JSON.stringify({
        c: ciphertext,
        ip: ip,
        createdAt: createdAt,
        expiresAt: expiresAt
      });
      var topic = topicOf(hash);
      var headers;
      var body = envelope;
      if (envelope.length <= NTFY_INLINE) {
        headers = { "Content-Type": "text/plain;charset=UTF-8" };
      } else {
        headers = {
          "Content-Type": "application/octet-stream",
          Filename: "m.json"
        };
      }
      return ntfyFetch(NTFY + "/" + topic, {
        method: "POST",
        headers: headers,
        body: body
      }).then(function (res) {
        if (res.status === 429) throw new Error("rate");
        if (!res.ok) throw new Error("error");
        var ctype = (res.headers.get("content-type") || "").toLowerCase();
        if (ctype.indexOf("json") === -1) throw new Error("error");
        return res.json();
      }).then(function (ev) {
        if (!ev || !ev.id) throw new Error("error");
        rateCommit(ip);
        return {
          id: ev.id,
          ciphertext: ciphertext,
          ip: ip,
          createdAt: createdAt,
          expiresAt: expiresAt
        };
      });
    });
  }

  function clearEl(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function bufToHex(buf) {
    return Array.from(new Uint8Array(buf)).map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }

  function bufToB64(bytes) {
    var s = "";
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }

  function b64ToBytes(b64) {
    var s = atob(b64);
    var out = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }

  function sha256(text) {
    return crypto.subtle.digest("SHA-256", te.encode(text));
  }

  function groupPassphrase(title, password) {
    return String(title).normalize("NFC") + GROUP_SEP + String(password).normalize("NFC");
  }

  function roomHash(passphrase) {
    return sha256("gbd.room\0" + passphrase).then(bufToHex);
  }

  function aesKey(passphrase) {
    return sha256("gbd.aes\0" + passphrase).then(function (raw) {
      return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
    });
  }

  function encryptPayload(passphrase, payload) {
    return aesKey(passphrase).then(function (key) {
      var iv = crypto.getRandomValues(new Uint8Array(12));
      return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, te.encode(JSON.stringify(payload))).then(function (ctBuf) {
        var ct = new Uint8Array(ctBuf);
        var out = new Uint8Array(12 + ct.byteLength);
        out.set(iv, 0);
        out.set(ct, 12);
        return bufToB64(out);
      });
    });
  }

  function validImg(img) {
    if (!img || typeof img !== "object") return null;
    var w = Number(img.w);
    var h = Number(img.h);
    if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
    w = w | 0;
    h = h | 0;
    if (w < 1 || h < 1 || w > 32 || h > 32) return null;
    if (typeof img.p !== "string" || !img.p) return null;
    try {
      if (b64ToBytes(img.p).length !== w * h * 4) return null;
    } catch (_) {
      return null;
    }
    return { w: w, h: h, p: img.p };
  }

  function decryptPayload(passphrase, b64) {
    var raw;
    try {
      raw = b64ToBytes(b64);
    } catch (_) {
      return Promise.resolve(null);
    }
    if (raw.length < 13) return Promise.resolve(null);
    var iv = raw.slice(0, 12);
    var data = raw.slice(12);
    return aesKey(passphrase).then(function (key) {
      return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
    }).then(function (pt) {
      var obj = JSON.parse(td.decode(pt));
      if (!obj || obj.v !== 1 || typeof obj.nick !== "string" || typeof obj.text !== "string") return null;
      if (obj.kind !== "chat" && obj.kind !== "welcome") return null;
      obj.img = validImg(obj.img);
      if (obj.kind === "chat" && !obj.text && !obj.img) return null;
      return obj;
    }).catch(function () {
      return null;
    });
  }

  function getClientId() {
    var id = getCookie(UID_COOKIE);
    if (id && id.length >= 8) return id;
    id = crypto.randomUUID();
    setCookie(UID_COOKIE, id, 365);
    return id;
  }

  function formatStamp(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    function p(n) { return String(n).padStart(2, "0"); }
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }

  function isCoarse() {
    return window.matchMedia("(pointer: coarse)").matches;
  }

  function isComposingEvent(e) {
    return e.isComposing || e.keyCode === 229;
  }

  function apiGet(hash, query) {
    if (onPages()) return kvGet(hash, query);
    var u = new URL(apiBase(), location.origin);
    u.searchParams.set("roomHash", hash);
    u.searchParams.set("limit", String(query.limit));
    if (query.before) u.searchParams.set("before", query.before);
    if (query.after) u.searchParams.set("after", query.after);
    return fetch(u.toString()).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || "error");
        return data.messages || [];
      });
    });
  }

  function apiPost(hash, ciphertext, ttl) {
    if (onPages()) return kvPost(hash, ciphertext, ttl);
    return fetch(apiBase(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomHash: hash, ciphertext: ciphertext, ttl: ttl })
    }).then(function (res) {
      return res.json().then(function (data) {
        if (res.status === 429) throw new Error("rate");
        if (!res.ok) throw new Error(data.error || "error");
        return data;
      });
    });
  }

  function decodeMany(rows, passphrase, clientId) {
    return Promise.all(rows.map(function (row) {
      return decryptPayload(passphrase, row.ciphertext).then(function (payload) {
        if (!payload) return null;
        return {
          id: row.id,
          nick: payload.nick,
          text: payload.text,
          img: payload.img || null,
          ip: row.ip,
          createdAt: row.createdAt,
          mine: payload.clientId === clientId,
          kind: payload.kind
        };
      });
    })).then(function (list) {
      return list.filter(Boolean);
    });
  }

  function toast(msg) {
    if (window.ToastManager && ToastManager.show) ToastManager.show(msg);
    else window.alert(msg);
  }

  function setTitle(text) {
    var h = document.getElementById("pageTitle");
    if (h) h.textContent = text;
  }

  function pixelCanvas(img) {
    var parsed = validImg(img);
    if (!parsed) return null;
    var bytes = b64ToBytes(parsed.p);
    var canvas = document.createElement("canvas");
    canvas.width = parsed.w;
    canvas.height = parsed.h;
    canvas.className = "chat-pixel";
    var ctx = canvas.getContext("2d");
    ctx.putImageData(new ImageData(new Uint8ClampedArray(bytes), parsed.w, parsed.h), 0, 0);
    return canvas;
  }

  function loadImageFile(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !String(file.type || "").startsWith("image/")) {
        reject(new Error("type"));
        return;
      }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var sw = img.naturalWidth || img.width;
        var sh = img.naturalHeight || img.height;
        if (!sw || !sh) {
          reject(new Error("type"));
          return;
        }
        var canvas = document.createElement("canvas");
        var ctx;
        if (sw <= 32 && sh <= 32) {
          canvas.width = sw;
          canvas.height = sh;
          ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, sw, sh);
          ctx.drawImage(img, 0, 0);
        } else {
          var scale = Math.min(32 / sw, 32 / sh);
          var dw = Math.max(1, Math.round(sw * scale));
          var dh = Math.max(1, Math.round(sh * scale));
          canvas.width = 32;
          canvas.height = 32;
          ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, 32, 32);
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(img, Math.floor((32 - dw) / 2), Math.floor((32 - dh) / 2), dw, dh);
        }
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve({ w: canvas.width, h: canvas.height, p: bufToB64(data.data) });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("type"));
      };
      img.src = url;
    });
  }

  var ICO = {
    globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3.6 9h16.8 M3.6 15h16.8 M12 3c2.5 3 3.8 6 3.8 9s-1.3 6-3.8 9c-2.5-3-3.8-6-3.8-9s1.3-6 3.8-9z",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
  };

  function svgIcon(d) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    s.classList.add("chat-ico");
    var p = document.createElementNS(ns, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "currentColor");
    p.setAttribute("stroke-width", "1.75");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    s.appendChild(p);
    return s;
  }

  function gateCard(icon, title, desc, primary, onClick) {
    var btn = el("button", "chat-gate-card" + (primary ? " is-primary" : ""));
    btn.type = "button";
    btn.disabled = state.busy;
    var ico = el("span", "chat-gate-ico");
    ico.appendChild(svgIcon(icon));
    var copy = el("span", "chat-gate-copy");
    copy.appendChild(el("strong", "", title));
    copy.appendChild(el("span", "", desc));
    btn.append(ico, copy);
    btn.addEventListener("click", onClick);
    return btn;
  }

  function renderGate(root) {
    clearEl(root);
    root.className = "chat-app";
    var gate = el("div", "chat-gate");
    var lead = el("div", "chat-gate-lead");
    lead.appendChild(el("p", "chat-kicker", t("kicker")));
    lead.appendChild(el("p", "chat-hint", t("hint")));
    var list = el("div", "chat-gate-list");
    list.appendChild(gateCard(ICO.globe, t("joinPublic"), t("publicDesc"), true, joinPublic));
    list.appendChild(gateCard(ICO.users, t("joinGroup"), t("joinDesc"), false, function () { openModal("join"); }));
    list.appendChild(gateCard(ICO.key, t("createGroup"), t("createDesc"), false, function () { openModal("create"); }));
    gate.append(lead, list);
    root.appendChild(gate);
    setTitle(t("title"));
  }

  function paintPending() {
    var wrap = document.getElementById("chatAttachPreview");
    if (!wrap) return;
    clearEl(wrap);
    if (!state.pendingImg) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    var c = pixelCanvas(state.pendingImg);
    if (c) wrap.appendChild(c);
    var rm = el("button", "btn chat-attach-remove", t("removeImage"));
    rm.type = "button";
    rm.addEventListener("click", function () {
      state.pendingImg = null;
      var input = document.getElementById("chatFile");
      if (input) input.value = "";
      paintPending();
    });
    wrap.appendChild(rm);
  }

  function updateSendButton() {
    var btn = document.getElementById("chatSend");
    if (!btn) return;
    if (state.busy) {
      btn.disabled = true;
      btn.textContent = t("sending");
      btn.classList.remove("is-wait");
      return;
    }
    var wait = rateWaitMs();
    if (wait > 0) {
      btn.disabled = true;
      btn.textContent = formatWait(wait);
      btn.classList.add("is-wait");
      return;
    }
    btn.disabled = false;
    btn.textContent = t("send");
    btn.classList.remove("is-wait");
  }

  function startSendTick() {
    stopSendTick();
    updateSendButton();
    state.sendTick = window.setInterval(updateSendButton, 250);
  }

  function stopSendTick() {
    if (state.sendTick) {
      window.clearInterval(state.sendTick);
      state.sendTick = 0;
    }
  }

  function renderRoom(root) {
    clearEl(root);
    root.className = "chat-app is-room";
    var bar = el("div", "chat-room-bar");
    var ident = el("div", "chat-room-id");
    var kind = state.room.kind === "public" ? t("publicRoom") : t("groupRoom");
    ident.appendChild(el("span", "chat-room-kind", kind));
    ident.appendChild(el("strong", "chat-room-name", state.room.kind === "public" ? t("publicRoom") : state.room.title));
    var leave = el("button", "btn chat-leave-btn", t("leave"));
    leave.type = "button";
    leave.addEventListener("click", leaveRoom);
    bar.append(ident, leave);
    var log = el("div", "chat-log");
    log.id = "chatLog";
    log.addEventListener("scroll", onLogScroll);
    paintLog(log);
    var notice = el("p", "chat-notice");
    notice.id = "chatNotice";
    notice.hidden = true;
    var form = el("form", "chat-composer");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      send();
    });
    var row = el("div", "chat-composer-row");
    var nickField = field("nick", t("nick"));
    var nickInput = document.createElement("input");
    nickInput.type = "text";
    nickInput.maxLength = 16;
    nickInput.id = "chatNick";
    nickInput.autocomplete = "nickname";
    try {
      var saved = localStorage.getItem("gbd_chat_nick");
      if (saved) nickInput.value = saved.slice(0, 16);
    } catch (_) {}
    nickField.appendChild(nickInput);
    var ttlField = field("ttl", t("expiry"));
    var sel = document.createElement("select");
    sel.id = "chatTtl";
    TTL_OPTS.forEach(function (opt) {
      var o = document.createElement("option");
      o.value = String(opt.sec);
      o.textContent = t(opt.key);
      if (opt.sec === 86400) o.selected = true;
      sel.appendChild(o);
    });
    ttlField.appendChild(sel);
    row.append(nickField, ttlField);
    var msgField = field("", t("message") + " · 0/1024");
    msgField.querySelector("span").id = "chatCount";
    var area = document.createElement("textarea");
    area.id = "chatText";
    area.maxLength = 1024;
    area.rows = 3;
    area.addEventListener("input", function () {
      document.getElementById("chatCount").textContent = t("message") + " · " + area.value.length + "/1024";
    });
    area.addEventListener("keydown", onComposerKey);
    msgField.appendChild(area);
    var preview = el("div", "chat-attach-preview");
    preview.id = "chatAttachPreview";
    preview.hidden = true;
    var actions = el("div", "chat-composer-actions");
    var file = document.createElement("input");
    file.type = "file";
    file.accept = "image/*";
    file.id = "chatFile";
    file.className = "chat-file";
    file.addEventListener("change", function () {
      var f = file.files && file.files[0];
      if (!f) return;
      loadImageFile(f).then(function (img) {
        state.pendingImg = img;
        paintPending();
      }).catch(function () {
        showNotice(t("needImage"));
        file.value = "";
      });
    });
    var attachBlock = el("div", "chat-attach-block");
    var attach = el("button", "btn", t("attach"));
    attach.type = "button";
    attach.addEventListener("click", function () { file.click(); });
    attachBlock.appendChild(attach);
    attachBlock.appendChild(el("p", "chat-attach-hint", t("imgHint")));
    var nl = el("button", "btn chat-newline-btn", t("newline"));
    nl.type = "button";
    nl.addEventListener("click", insertNewline);
    var sendBtn = el("button", "btn primary chat-send-btn", t("send"));
    sendBtn.type = "submit";
    sendBtn.id = "chatSend";
    var sendWrap = el("div", "chat-send-wrap");
    sendWrap.append(nl, sendBtn);
    actions.append(attachBlock, sendWrap);
    form.append(row, msgField, preview, file, actions);
    root.append(bar, log, notice, form);
    var label = state.room.kind === "public" ? t("publicRoom") : state.room.title;
    setTitle(t("title") + " · " + label);
    paintPending();
    startSendTick();
    requestAnimationFrame(function () {
      log.scrollTop = log.scrollHeight;
    });
  }

  function field(extra, label) {
    var wrap = el("label", "chat-field" + (extra ? " " + extra : ""));
    wrap.appendChild(el("span", "", label));
    return wrap;
  }

  function paintLog(log) {
    clearEl(log);
    if (!state.messages.length) {
      log.appendChild(el("p", "chat-empty", t("empty")));
      return;
    }
    state.messages.forEach(function (m) {
      if (m.kind === "welcome") {
        log.appendChild(el("p", "chat-system", t("welcome")));
        return;
      }
      var art = el("article", "chat-row " + (m.mine ? "is-mine" : "is-theirs"));
      art.appendChild(el("span", "chat-nick", m.nick));
      var bubble = el("div", "chat-bubble" + (m.mine ? " is-mine" : ""));
      if (m.text) bubble.appendChild(document.createTextNode(m.text));
      if (m.img) {
        var c = pixelCanvas(m.img);
        if (c) bubble.appendChild(c);
      }
      art.appendChild(bubble);
      art.appendChild(el("span", "chat-meta", formatStamp(m.createdAt) + " · " + m.ip));
      log.appendChild(art);
    });
  }

  function showNotice(msg) {
    var n = document.getElementById("chatNotice");
    if (!n) {
      if (msg) toast(msg);
      return;
    }
    if (!msg) {
      n.hidden = true;
      n.textContent = "";
      return;
    }
    n.hidden = false;
    n.textContent = msg;
  }

  function render() {
    var root = document.getElementById("chatRoot");
    if (!root) return;
    closeModal();
    if (!state.room) {
      stopSendTick();
      renderGate(root);
    } else renderRoom(root);
  }

  function joinPublic() {
    if (state.busy) return;
    state.busy = true;
    render();
    roomHash(PUBLIC_PASSPHRASE).then(function (hash) {
      return enterRoom({
        kind: "public",
        title: t("publicRoom"),
        passphrase: PUBLIC_PASSPHRASE,
        hash: hash
      });
    }).then(function (ok) {
      if (!ok && !state.room) {
        state.busy = false;
        render();
      }
    }).catch(function () {
      toast(t("error"));
      state.busy = false;
      render();
    });
  }

  function enterRoom(next, requireDecrypt, attempt) {
    state.busy = true;
    return apiGet(next.hash, { limit: 20 }).then(function (rows) {
      return decodeMany(rows, next.passphrase, state.clientId).then(function (decoded) {
        if (requireDecrypt && decoded.length === 0 && !attempt) {
          return new Promise(function (resolve) {
            setTimeout(resolve, 800);
          }).then(function () {
            return enterRoom(next, true, 1);
          });
        }
        if (requireDecrypt && decoded.length === 0) {
          toast(t("closed"));
          state.busy = false;
          return false;
        }
        state.room = next;
        state.messages = decoded;
        state.newest = decoded.length ? decoded[decoded.length - 1].createdAt : null;
        state.oldest = decoded.length ? decoded[0].createdAt : null;
        state.hasMore = rows.length >= 20;
        state.stick = true;
        startPoll();
        render();
        state.busy = false;
        updateSendButton();
        return true;
      });
    }).catch(function () {
      toast(t("error"));
      state.busy = false;
      return false;
    });
  }

  function leaveRoom() {
    stopPoll();
    stopSendTick();
    state.room = null;
    state.messages = [];
    state.pendingImg = null;
    render();
  }

  function openModal(mode) {
    closeModal();
    state.modal = mode;
    var overlay = el("div", "chat-modal is-open");
    overlay.id = "chatModal";
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });
    var panel = el("div", "chat-modal-panel");
    var head = el("div", "chat-modal-head");
    head.appendChild(el("h2", "", mode === "create" ? t("createGroup") : t("joinGroup")));
    var x = el("button", "icon-btn", "×");
    x.type = "button";
    x.addEventListener("click", closeModal);
    head.appendChild(x);
    var form = el("form", "chat-modal-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitGroup(mode);
    });
    var titleField = field("", t("roomTitle"));
    var titleIn = document.createElement("input");
    titleIn.type = "text";
    titleIn.maxLength = 64;
    titleIn.id = "groupTitle";
    titleIn.autocomplete = "off";
    titleField.appendChild(titleIn);
    var pwField = field("", t("password"));
    var pwIn = document.createElement("input");
    pwIn.type = "password";
    pwIn.maxLength = 128;
    pwIn.id = "groupPassword";
    pwIn.autocomplete = "new-password";
    pwField.appendChild(pwIn);
    var err = el("p", "chat-notice");
    err.id = "groupError";
    err.hidden = true;
    var actions = el("div", "chat-composer-actions");
    var cancel = el("button", "btn", t("cancel"));
    cancel.type = "button";
    cancel.addEventListener("click", closeModal);
    var ok = el("button", "btn primary", t("confirm"));
    ok.type = "submit";
    actions.append(cancel, ok);
    form.append(titleField, pwField, err, actions);
    panel.append(head, form);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    titleIn.focus();
  }

  function closeModal() {
    var m = document.getElementById("chatModal");
    if (m) m.parentNode.removeChild(m);
    state.modal = null;
  }

  function submitGroup(mode) {
    var titleIn = document.getElementById("groupTitle");
    var pwIn = document.getElementById("groupPassword");
    var err = document.getElementById("groupError");
    var roomTitle = ((titleIn && titleIn.value) || "").trim().normalize("NFC");
    var pw = ((pwIn && pwIn.value) || "").normalize("NFC");
    function fail(msg) {
      if (err) {
        err.hidden = false;
        err.textContent = msg;
      } else toast(msg);
    }
    if (!roomTitle) return fail(t("needTitle"));
    if (!pw) return fail(t("needPassword"));
    var passphrase = groupPassphrase(roomTitle, pw);
    roomHash(passphrase).then(function (hash) {
      if (mode === "create") {
        var payload = {
          v: 1,
          kind: "welcome",
          nick: t("system"),
          text: roomTitle,
          clientId: "system",
          at: Date.now()
        };
        return encryptPayload(passphrase, payload).then(function (ciphertext) {
          return apiPost(hash, ciphertext, 259200);
        }).then(function () {
          closeModal();
          return enterRoom({ kind: "group", title: roomTitle, passphrase: passphrase, hash: hash });
        }).catch(function (e) {
          fail(e.message === "rate" ? t("rateLimit") : t("error"));
        });
      }
      return enterRoom({ kind: "group", title: roomTitle, passphrase: passphrase, hash: hash }, true).then(function (ok) {
        if (ok) closeModal();
        else fail(t("closed"));
      });
    });
  }

  function onLogScroll(e) {
    var log = e.currentTarget;
    state.stick = log.scrollHeight - log.scrollTop - log.clientHeight < 80;
    if (log.scrollTop < 48) loadOlder();
  }

  function loadOlder() {
    if (!state.room || state.loadingOlder || !state.hasMore || !state.oldest) return;
    state.loadingOlder = true;
    var log = document.getElementById("chatLog");
    var prev = log ? log.scrollHeight : 0;
    apiGet(state.room.hash, { limit: 30, before: state.oldest }).then(function (rows) {
      return decodeMany(rows, state.room.passphrase, state.clientId).then(function (decoded) {
        if (rows.length < 30) state.hasMore = false;
        if (decoded.length) {
          state.oldest = decoded[0].createdAt;
          var seen = {};
          state.messages.forEach(function (m) { seen[m.id] = true; });
          state.messages = decoded.filter(function (m) { return !seen[m.id]; }).concat(state.messages);
          if (log) {
            paintLog(log);
            log.scrollTop = log.scrollHeight - prev;
          }
        } else if (!rows.length) {
          state.hasMore = false;
        }
      });
    }).catch(function () {}).then(function () {
      state.loadingOlder = false;
    });
  }

  function startPoll() {
    stopPoll();
    state.poll = window.setInterval(function () {
      if (document.hidden || !state.room) return;
      apiGet(state.room.hash, {
        limit: 30,
        after: state.newest || "1970-01-01T00:00:00.000Z"
      }).then(function (rows) {
        if (!rows.length) return;
        return decodeMany(rows, state.room.passphrase, state.clientId).then(function (decoded) {
          if (!decoded.length) return;
          state.newest = decoded[decoded.length - 1].createdAt;
          var seen = {};
          state.messages.forEach(function (m) { seen[m.id] = true; });
          decoded.forEach(function (m) {
            if (!seen[m.id]) state.messages.push(m);
          });
          var log = document.getElementById("chatLog");
          if (log) {
            paintLog(log);
            if (state.stick) log.scrollTop = log.scrollHeight;
          }
        });
      }).catch(function () {});
    }, onPages() ? 8000 : 4000);
  }

  function stopPoll() {
    if (state.poll) {
      window.clearInterval(state.poll);
      state.poll = 0;
    }
  }

  function onComposerKey(e) {
    if (isComposingEvent(e)) return;
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;
    if (isCoarse()) return;
    e.preventDefault();
    send();
  }

  function insertNewline() {
    var area = document.getElementById("chatText");
    if (!area) return;
    var start = area.selectionStart;
    var end = area.selectionEnd;
    var v = area.value;
    area.value = v.slice(0, start) + "\n" + v.slice(end);
    area.selectionStart = area.selectionEnd = start + 1;
    area.dispatchEvent(new Event("input"));
    area.focus();
  }

  function send() {
    if (!state.room || state.busy) return;
    if (rateWaitMs() > 0) {
      updateSendButton();
      return;
    }
    var nickEl = document.getElementById("chatNick");
    var textEl = document.getElementById("chatText");
    var ttlEl = document.getElementById("chatTtl");
    var name = (nickEl && nickEl.value || "").trim();
    var body = (textEl && textEl.value || "").trim();
    var img = state.pendingImg;
    if (!name) return showNotice(t("needNick"));
    if (!body && !img) return showNotice(t("needText"));
    state.busy = true;
    updateSendButton();
    showNotice("");
    try { localStorage.setItem("gbd_chat_nick", name); } catch (_) {}
    var payload = {
      v: 1,
      kind: "chat",
      nick: name.slice(0, 16),
      text: body.slice(0, 1024),
      clientId: state.clientId,
      at: Date.now()
    };
    if (img) payload.img = img;
    encryptPayload(state.room.passphrase, payload).then(function (ciphertext) {
      return apiPost(state.room.hash, ciphertext, Number(ttlEl && ttlEl.value || 86400));
    }).then(function (row) {
      var view = {
        id: row.id,
        nick: payload.nick,
        text: payload.text,
        img: img,
        ip: row.ip,
        createdAt: row.createdAt,
        mine: true,
        kind: "chat"
      };
      var exists = state.messages.some(function (m) { return m.id === view.id; });
      if (!exists) state.messages.push(view);
      state.newest = row.createdAt;
      if (!state.oldest) state.oldest = row.createdAt;
      if (textEl) {
        textEl.value = "";
        textEl.dispatchEvent(new Event("input"));
      }
      state.pendingImg = null;
      var file = document.getElementById("chatFile");
      if (file) file.value = "";
      paintPending();
      state.stick = true;
      var log = document.getElementById("chatLog");
      if (log) {
        paintLog(log);
        log.scrollTop = log.scrollHeight;
      }
    }).catch(function (e) {
      showNotice(e.message === "rate" ? t("rateLimit") : t("error"));
    }).then(function () {
      state.busy = false;
      updateSendButton();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    state.clientId = getClientId();
    render();
    document.addEventListener("gbd:lang", render);
  });
})();
