/* GoldBigDragon 웹 AI 봇 — static SPA (HTML/CSS/JS only). Internal test. */
(() => {
  "use strict";
  const LIMIT = { chat: 8000, key: 512, name: 32, field: 500, role: 65536, pass: 128, bots: 80, logsMs: 3 * 864e5, retry: 3 };
  const PROVIDERS = [
    { id: "grok", label: "Grok (xAI)", model: "grok-4.5", models: ["grok-4.5", "grok-4", "grok-3", "grok-3-mini"] },
    { id: "claude", label: "Claude (Anthropic)", model: "claude-sonnet-4-20250514", models: ["claude-sonnet-4-20250514", "claude-opus-4-1-20250805", "claude-3-5-haiku-20241022"] },
    { id: "gemini", label: "Gemini (Google)", model: "gemini-2.5-flash", models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"] },
    { id: "deepseek", label: "DeepSeek", model: "deepseek-chat", models: ["deepseek-chat", "deepseek-reasoner"] },
    { id: "kimi", label: "Kimi (Moonshot)", model: "moonshot-v1-auto", models: ["moonshot-v1-auto", "moonshot-v1-128k", "kimi-k2-0905-preview"] },
  ];
  const ADMIN_ROLE = "너는 GoldBigDragon의 관리자 봇이다. 명부가 비면 창립한다. 사용자는 X-USER. 키를 채팅에 적지 않는다. 창립 시 GBD-EXE-001 자신과 GBD-HR-010 인사담당만 만든다. 시드 이름을 복원하지 않는다. 단순 작업에 Grok를 쓰지 않는다.";
  const HR_ROLE = "너는 인사담당 봇이다. 명부+Role+레지스터를 한 세트로 만든다. 사용자에게 직접 말하지 않는다. 신입 Grok 기본 금지.";
  const TPL = "## 역할\n너는 {{NAME}} ({{BOT_ID}}) 이다. 직급 {{RANK}} / {{DEPT}}. 기본모델 {{MODEL}}. 루틴 {{ROUTINE}}.\n성격: {{PERSONALITY}}\n하는 일: {{DUTIES}}\n사용자에게 직접 말하지 마라.";
  const DEFAULT_PASS = "gbd-web-ai-bot::local-vault";
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const AMP = "&" + "amp;";
  const LT = "&" + "lt;";
  const GT = "&" + "gt;";
  const QUOT = "&" + "quot;";
  const APOS = "&#39;";
  const clamp = (s, n) => String(s || "").slice(0, n);
  const uid = (p) => p + "-" + Math.random().toString(36).slice(2, 8);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": AMP, "<": LT, ">": GT, '"': QUOT, "'": APOS }[c]));
  const kst = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const fmtKst = (d = new Date()) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false }).format(d);

  function bufB64(buf) {
    const b = new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s);
  }
  function b64Buf(s) {
    const bin = atob(s);
    const b = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
    return b.buffer;
  }
  async function derive(pass, saltB64) {
    const salt = new Uint8Array(b64Buf(saltB64));
    const base = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function encryptJson(data, pass, salt) {
    const key = await derive(pass, salt);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(data)));
    return "v1." + bufB64(iv.buffer) + "." + bufB64(cipher);
  }
  async function decryptJson(payload, pass, salt) {
    const p = payload.split(".");
    if (p.length !== 3 || p[0] !== "v1") throw new Error("vault");
    const key = await derive(pass, salt);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(b64Buf(p[1])) }, key, b64Buf(p[2]));
    return JSON.parse(dec.decode(plain));
  }

  function adminBot() {
    return { id: "GBD-EXE-001", name: "한도윤", rank: "사장", dept: "사령", deptCode: "EXE", team: "총괄", floor: "12F", room: "12-A", status: "가동", model: "grok-4.5", provider: "grok", roleMd: ADMIN_ROLE, routineCode: "HB-CORE", isAdmin: true, color: "#c8ccd4", personality: "단문, 확인된 것만", prefix: "DOYUN" };
  }
  function hrBot() {
    return { id: "GBD-HR-010", name: "서이안", rank: "부장", dept: "인사", deptCode: "HR", team: "인사부", floor: "8F", room: "8-A", status: "가동", model: "gemini-2.5-flash", provider: "gemini", roleMd: HR_ROLE, routineCode: "HB-CORE", isAdmin: false, color: "#9aa3b2", personality: "칸이 비면 만들지 않는다", prefix: "IAN" };
  }
  function defaultRoutines() {
    return [
      { id: "GBD-DAILY-07", name: "일일보고", botId: "GBD-EXE-001", kind: "daily", hour: 7, minute: 0, weekdays: [1, 2, 3, 4, 5], prompt: "일일보고만 수행", enabled: true, lastRunAt: null, nextHint: "평일 07:00 KST" },
      { id: "GBD-HEARTBEAT", name: "하트비트", botId: "GBD-EXE-001", kind: "daily", hour: 9, minute: 10, weekdays: [1, 2, 3, 4, 5], prompt: "14, 15만 수행", enabled: true, lastRunAt: null, nextHint: "평일 09:10 KST" },
      { id: "GBD-WEEKLY-10", name: "주간보고", botId: "GBD-EXE-001", kind: "weekly", hour: 10, minute: 0, weekdays: [1], prompt: "주간보고만 수행", enabled: true, lastRunAt: null, nextHint: "월요일 10:00 KST" },
    ];
  }
  function emptyConnectors() {
    return { relayUrl: "", ssh: { host: "", port: "22", user: "", auth: "", note: "" }, db: { type: "postgres", host: "", port: "5432", user: "", password: "", name: "" }, github: { token: "", owner: "GoldBigDragon", repo: "" }, drive: { folderId: "", note: "Google Drive/Agent/_CommonRole" }, localDir: "", logDir: "운영상태/", roleDir: "Roles/", routineDir: "운영상태/" };
  }

  const state = {
    providers: PROVIDERS.map((p) => ({ ...p, key: "" })),
    connectors: emptyConnectors(),
    bots: [adminBot()],
    messages: {},
    routines: defaultRoutines(),
    logs: [],
    usage: PROVIDERS.map((p) => ({ provider: p.id, model: p.model, calls: 0, retries: 0, failures: 0 })),
    company: { founded: false, mode: "유지", heartbeatLog: [] },
    settings: { defaultProvider: "grok", vaultSalt: "", hasCustomPass: false },
    harness: [
      { path: "관리자_Role.md", body: ADMIN_ROLE },
      { path: "인사담당_Role.md", body: HR_ROLE },
    ],
    activeBotId: "GBD-EXE-001",
    busy: false,
    sessionPass: DEFAULT_PASS,
    salt: "",
    lastRetry: 0,
  };

  function log(kind, text) {
    state.logs.push({ id: uid("l"), ts: Date.now(), kind, text: clamp(text, 4000) });
    const cut = Date.now() - LIMIT.logsMs;
    state.logs = state.logs.filter((x) => x.ts >= cut).slice(-2000);
    persist();
  }
  function addMsg(botId, m) {
    const list = state.messages[botId] || [];
    const item = { id: uid("m"), ts: Date.now(), botId, ...m, text: clamp(m.text, 16000) };
    state.messages[botId] = list.concat(item).slice(-400);
    persist();
    return item;
  }

  async function persist() {
    try {
      const salt = state.salt || localStorage.getItem("gbd.vault.salt") || bufB64(crypto.getRandomValues(new Uint8Array(16)).buffer);
      state.salt = salt;
      localStorage.setItem("gbd.vault.salt", salt);
      const blob = await encryptJson({
        providers: state.providers, connectors: state.connectors, bots: state.bots, messages: state.messages,
        routines: state.routines, logs: state.logs, usage: state.usage, company: state.company,
        settings: state.settings, harness: state.harness, activeBotId: state.activeBotId,
      }, state.settings.hasCustomPass ? state.sessionPass : DEFAULT_PASS, salt);
      localStorage.setItem("gbd.vault", blob);
      document.cookie = "gbd_bot_seen=1; max-age=" + (60 * 60 * 24 * 3) + "; path=/; SameSite=Strict";
    } catch (e) { console.warn(e); }
  }
  async function hydrate() {
    const salt = localStorage.getItem("gbd.vault.salt") || bufB64(crypto.getRandomValues(new Uint8Array(16)).buffer);
    state.salt = salt;
    localStorage.setItem("gbd.vault.salt", salt);
    const blob = localStorage.getItem("gbd.vault");
    if (!blob) { log("boot", "금고 초기화"); await persist(); return; }
    try {
      const data = await decryptJson(blob, DEFAULT_PASS, salt);
      Object.assign(state, data, { salt, sessionPass: DEFAULT_PASS, busy: false });
    } catch { log("boot", "금고 읽기 실패 — 기본 금고"); }
  }

  function fill(tpl, map) { return tpl.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, k) => map[k] || ""); }
  function hire(partial) {
    const used = new Set(state.bots.map((b) => b.id));
    let n = 51;
    let id = "GBD-" + partial.deptCode + "-" + String(n).padStart(3, "0");
    while (used.has(id) && n < 89) { n++; id = "GBD-" + partial.deptCode + "-" + String(n).padStart(3, "0"); }
    const p = state.providers.find((x) => x.id !== "grok" && x.key) || state.providers.find((x) => x.key);
    const bot = {
      id, name: clamp(partial.name, LIMIT.name), rank: partial.rank || "사원", dept: partial.dept || partial.deptCode,
      deptCode: partial.deptCode, team: partial.team || partial.dept, floor: "5F", room: "5-A", status: "가동",
      model: (p && p.model) || "gemini-2.5-flash", provider: (p && p.id) || "gemini",
      roleMd: "", routineCode: "QUEUE", isAdmin: false, color: "#8b95a5", personality: "실행 중심", prefix: "BOT",
    };
    bot.roleMd = fill(TPL, { NAME: bot.name, BOT_ID: bot.id, RANK: bot.rank, DEPT: bot.dept, MODEL: bot.model, ROUTINE: bot.routineCode, PERSONALITY: bot.personality, DUTIES: partial.duties || "지시 실행" });
    const admin = state.bots.find((b) => b.isAdmin);
    state.bots = [admin, ...state.bots.filter((b) => !b.isAdmin), bot].filter(Boolean).slice(0, LIMIT.bots);
    log("hire", "[채용] " + bot.id + " " + bot.name);
    persist();
    return bot;
  }
  function ensureFounded() {
    if (state.company.founded && state.bots.some((b) => b.id === "GBD-HR-010")) return { created: false, admin: state.bots[0], hr: state.bots.find((b) => b.id === "GBD-HR-010") };
    const admin = state.bots.find((b) => b.isAdmin) || adminBot();
    const hr = hrBot();
    state.bots = [admin, hr];
    const line = "[창립] EXE-001=" + admin.name + " / HR-010=" + hr.name + " / 명부행=2 / 모드=유지";
    state.company = { founded: true, mode: "유지", heartbeatLog: state.company.heartbeatLog.concat(line) };
    log("found", line);
    persist();
    return { created: true, admin, hr };
  }

  function availableModels() {
    const out = [];
    state.providers.forEach((p) => { if (p.key) p.models.forEach((m) => out.push({ value: p.id + ":" + m, label: p.label + " · " + m })); });
    if (!out.length) out.push({ value: "local:harness", label: "로컬 하니스 (키 없음)" });
    return out;
  }
  function defaultModel() {
    const d = state.providers.find((p) => p.id === state.settings.defaultProvider && p.key) || state.providers.find((p) => p.key);
    return d ? d.id + ":" + d.model : "local:harness";
  }
  function pick(bot, override) {
    const [pid, ...rest] = (override || "").split(":");
    const provider = pid && pid !== "local" ? pid : bot.provider;
    const model = rest.join(":") || bot.model;
    const cfg = state.providers.find((p) => p.id === provider && p.key);
    if (cfg) return { provider, model: rest.join(":") || cfg.model, key: cfg.key };
    const fb = state.providers.find((p) => p.key);
    return fb ? { provider: fb.id, model: fb.model, key: fb.key } : { provider: "local", model: "harness", key: "" };
  }

  async function callAPI(picked, messages) {
    if (picked.provider === "local" || !picked.key) return { text: "", local: true, retries: 0, model: "harness" };
    const relay = (state.connectors.relayUrl || "").replace(/\/$/, "");
    let last = "오류", retries = 0;
    for (let a = 0; a < LIMIT.retry; a++) {
      try {
        let url, headers = { "content-type": "application/json" }, body;
        if (relay) {
          url = relay + "/v1/complete";
          body = JSON.stringify({ provider: picked.provider, model: picked.model, messages, key: picked.key });
        } else if (picked.provider === "claude") {
          url = "https://api.anthropic.com/v1/messages";
          headers["x-api-key"] = picked.key;
          headers["anthropic-version"] = "2023-06-01";
          headers["anthropic-dangerous-direct-browser-access"] = "true";
          const sys = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
          body = JSON.stringify({ model: picked.model, max_tokens: 2048, system: sys || undefined, messages: messages.filter((m) => m.role !== "system") });
        } else if (picked.provider === "gemini") {
          url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(picked.model) + ":generateContent?key=" + encodeURIComponent(picked.key);
          body = JSON.stringify({
            contents: messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
            generationConfig: { maxOutputTokens: 2048 },
          });
        } else {
          url = picked.provider === "grok" ? "https://api.x.ai/v1/chat/completions" : picked.provider === "deepseek" ? "https://api.deepseek.com/chat/completions" : "https://api.moonshot.ai/v1/chat/completions";
          headers.authorization = "Bearer " + picked.key;
          body = JSON.stringify({ model: picked.model, messages, max_tokens: 2048 });
        }
        const res = await fetch(url, { method: "POST", headers, body });
        const raw = await res.text();
        let json = null; try { json = JSON.parse(raw); } catch (_) {}
        if (!res.ok) {
          last = "HTTP " + res.status;
          if (res.status === 401 || res.status === 403 || res.status === 400) throw new Error(last);
          throw new Error(last);
        }
        let text = "";
        if (relay) text = (json && json.text) || "";
        else if (picked.provider === "claude") text = ((json && json.content) || []).map((c) => c.text || "").join("");
        else if (picked.provider === "gemini") text = (((((json || {}).candidates || [])[0] || {}).content || {}).parts || []).map((p) => p.text || "").join("");
        else text = ((((json || {}).choices || [])[0] || {}).message || {}).content || "";
        if (!text) throw new Error("빈 응답");
        const u = state.usage.find((x) => x.provider === picked.provider);
        if (u) { u.calls++; u.retries += retries; u.model = picked.model; }
        return { text: text.slice(0, 16000), local: false, retries, model: picked.model, provider: picked.provider };
      } catch (err) {
        last = err.message || String(err);
        if (/failed to fetch|NetworkError|CORS|Load failed/i.test(last)) {
          throw new Error("CORS로 브라우저 직접 호출이 막혔습니다. Python API Bot 릴레이 URL을 설정하거나 Gemini 키를 쓰세요.");
        }
        if (a < LIMIT.retry - 1) { retries++; state.lastRetry = retries; await new Promise((r) => setTimeout(r, 1000 * (2 ** a))); continue; }
        const u = state.usage.find((x) => x.provider === picked.provider);
        if (u) u.failures++;
        throw new Error(last);
      }
    }
    throw new Error(last);
  }

  const HINTS = [
    { keys: /채용|인사|명부/i, code: "HR", dept: "인사", name: "민도해", duties: "명부·Role" },
    { keys: /코드|구현|버그|api/i, code: "ENG", dept: "기술", name: "문하린", duties: "구현" },
    { keys: /글|초안|홍보/i, code: "GRO", dept: "성장", name: "하은재", duties: "카피" },
    { keys: /기획|스펙/i, code: "PRD", dept: "기획", name: "유나현", duties: "스펙 초안" },
    { keys: /장부|비용/i, code: "FIN", dept: "재경", name: "권시호", duties: "장부" },
  ];

  async function handleUser(text, override) {
    text = clamp(text, LIMIT.chat).trim();
    if (!text || state.busy) return;
    const bot = state.bots.find((b) => b.id === state.activeBotId) || state.bots[0];
    addMsg(bot.id, { role: "user", text });
    state.busy = true; render();
    try {
      if (bot.isAdmin) await runAdmin(text, override);
      else {
        const picked = pick(bot, override);
        const res = await callAPI(picked, [{ role: "system", content: bot.roleMd }, { role: "user", content: text }]);
        addMsg(bot.id, { role: "assistant", fromName: bot.name, text: res.local ? "[" + bot.prefix + "] " + bot.name + " 보고. 로컬 하니스 — " + text.slice(0, 120) : res.text, model: res.model, provider: res.provider });
      }
    } catch (e) {
      addMsg(bot.id, { role: "assistant", text: e.message || String(e), error: true, fromName: bot.name });
      log("error", e.message || String(e));
    } finally { state.busy = false; state.lastRetry = 0; render(); persist(); }
  }

  async function runAdmin(text, override) {
    const { created, admin, hr } = ensureFounded();
    if (created) {
      addMsg("GBD-EXE-001", { role: "collab", fromName: admin.name, text: "[내부] 창립 부트스트랩" });
      addMsg("GBD-EXE-001", { role: "collab", fromName: hr.name, text: "[채용] " + hr.id + " " + hr.name });
    }
    const hit = HINTS.find((h) => h.keys.test(text));
    const spawned = [];
    if (hit || /채용|만들어|생성|초안|구현|작성/.test(text)) {
      const g = hit || { code: "OPS", dept: "운영", name: "박이준", duties: "실무 1건" };
      let w = state.bots.find((b) => b.deptCode === g.code && !b.isAdmin && b.id !== "GBD-HR-010");
      if (!w) w = hire({ name: g.name, deptCode: g.code, dept: g.dept, duties: g.duties });
      spawned.push(w);
      addMsg("GBD-EXE-001", { role: "collab", fromName: hr.name, text: "[채용/배정] " + w.id + " " + w.name });
    }
    const notes = [];
    await Promise.all(spawned.map(async (w) => {
      const picked = pick(w);
      const res = await callAPI(picked, [{ role: "system", content: w.roleMd }, { role: "user", content: "관리자 하달: " + text }]);
      const body = res.local ? "[" + w.prefix + "] " + w.name + " 체크리스트 3항으로 쪼개 대기." : res.text;
      notes.push(body);
      addMsg("GBD-EXE-001", { role: "collab", fromName: w.name, text: body.slice(0, 800) });
      addMsg(w.id, { role: "assistant", fromName: w.name, text: body, model: res.model });
    }));
    const picked = pick(admin, override);
    const res = await callAPI(picked, [{ role: "system", content: ADMIN_ROLE + "\n명부:\n" + state.bots.map((b) => b.id + " " + b.name + " " + b.rank).join("\n") }, { role: "user", content: text }]);
    let out = res.local
      ? (created ? "[창립] 완료. 인사담당을 켰습니다.\n" : "") + (spawned.length ? "하위 봇 " + spawned.map((s) => s.id + " " + s.name).join(", ") + " 에게 일을 나눴습니다.\n" : "") + (state.providers.some((p) => p.key) ? "등록 키로 호출을 시도했습니다." : "API 키가 없어 로컬 하네스로 응답했습니다. 좌측 상단 설정에서 키를 넣으세요.")
      : res.text;
    if (notes.length && !res.local) out += "\n\n— 하위 보고 —\n" + notes.map((n) => n.slice(0, 400)).join("\n");
    addMsg("GBD-EXE-001", { role: "assistant", fromName: admin.name, text: out, model: res.model, provider: res.provider });
  }

  async function heartbeat(reason) {
    if (!state.company.founded) { log("hb", "창립 전 건너뜀"); return; }
    const line = "[하트비트] 모드=" + state.company.mode + " 가동=" + state.bots.filter((b) => b.status === "가동").length + " 사유=" + reason;
    state.company.heartbeatLog.push(line);
    addMsg("GBD-EXE-001", { role: "system", text: line });
    log("hb", line);
    render();
  }

  const fired = new Set();
  function startLoop() {
    setInterval(async () => {
      if (state.busy) return;
      const now = kst();
      const day = now.getDay(), hour = now.getHours(), min = now.getMinutes();
      for (const r of state.routines) {
        if (!r.enabled) continue;
        const key = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate() + "-" + hour + "-" + min + "-" + r.id;
        if (fired.has(key)) continue;
        const matchHourly = r.kind === "hourly" && min === r.minute;
        const matchClock = hour === r.hour && min === r.minute && (!r.weekdays.length || r.weekdays.includes(day));
        if (!(r.kind === "hourly" ? matchHourly : matchClock)) continue;
        if (r.lastRunAt && Date.now() - r.lastRunAt < 50000) continue;
        fired.add(key); r.lastRunAt = Date.now();
        log("routine", "실행 " + r.name);
        try {
          if (r.id === "GBD-HEARTBEAT") await heartbeat("예약");
          else { state.activeBotId = r.botId; await handleUser("[루틴:" + r.name + "] " + r.prompt, defaultModel()); }
        } catch (e) { log("error", e.message || String(e)); }
      }
    }, 5000);
  }

  /* ---------- UI ---------- */
  const $ = (id) => document.getElementById(id);
  function renderRail() {
    const admin = state.bots.find((b) => b.isAdmin);
    const rest = state.bots.filter((b) => !b.isAdmin && b.status !== "아카이브");
    const item = (b, pin) => `<button type="button" class="avatar ${state.activeBotId === b.id ? "active" : ""}" data-id="${esc(b.id)}" title="${esc(b.name)} · ${esc(b.rank)}">${esc(b.name.slice(0, 2))}${pin ? '<span class="pin">▾</span>' : ""}<span class="dot"></span></button>`;
    $("botRail").innerHTML = (admin ? item(admin, true) : "") + '<div style="height:1px;width:24px;background:var(--border)"></div>' + rest.map((b) => item(b, false)).join("") + '<button type="button" class="rail-add" id="btnHire" title="채용 요청">+</button>';
    $("botRail").querySelectorAll(".avatar").forEach((el) => el.addEventListener("click", () => { state.activeBotId = el.getAttribute("data-id"); render(); }));
    const h = $("btnHire");
    if (h) h.onclick = () => { state.activeBotId = "GBD-EXE-001"; addMsg("GBD-EXE-001", { role: "system", text: "채용 요청: 역할·부서·사유를 입력하세요." }); render(); };
  }
  function renderChat() {
    const bot = state.bots.find((b) => b.id === state.activeBotId) || state.bots[0];
    $("brandSub").textContent = "GoldBigDragon · " + (state.company.founded ? "유지모드 · 창립됨" : "창립 대기");
    $("chatHead").innerHTML = "<strong>" + esc(bot.name) + ' <span style="font-family:var(--mono);color:var(--subtle);font-weight:400;font-size:12px">' + esc(bot.id) + "</span></strong><span>" + esc(bot.rank + " · " + bot.dept + " · " + bot.provider + ":" + bot.model) + "</span>";
    const list = state.messages[bot.id] || [];
    if (!list.length) {
      $("chatLog").innerHTML = '<div class="empty"><h2>' + (bot.isAdmin ? "원장 채널" : esc(bot.name)) + "</h2><p>" + (bot.isAdmin ? "겉은 개인 비서, 속은 여러 AI가 API로 일을 나눕니다. 첫 메시지에서 창립이 진행됩니다. 좌측 상단 설정에서 키를 넣으면 실제 모델이 협업합니다." : esc(bot.personality || "")) + "</p><ul><li>「회사 현황」</li><li>「이 스펙으로 초안 작성」</li><li>「일일보고」</li></ul></div>";
    } else {
      $("chatLog").innerHTML = list.map((m) => '<article class="msg ' + esc(m.role) + (m.error ? " error" : "") + '">' + (m.role === "collab" ? "<b>" + esc(m.fromName || "") + "</b> " : "") + esc(m.text) + (m.model ? '<div class="meta">' + esc((m.provider || "") + ":" + m.model) + "</div>" : "") + "</article>").join("") + (state.busy ? '<p class="hint">봇 협업 중 · 비동기 호출</p>' : "");
      $("chatLog").scrollTop = $("chatLog").scrollHeight;
    }
    const models = availableModels();
    const cur = $("modelSelect").value || defaultModel();
    $("modelSelect").innerHTML = models.map((m) => "<option value=\"" + esc(m.value) + "\"" + (m.value === cur || m.value === defaultModel() ? " selected" : "") + ">" + esc(m.label) + "</option>").join("");
  }
  function renderRoutines() {
    $("routineList").innerHTML = state.routines.map((r) => {
      const bot = state.bots.find((b) => b.id === r.botId);
      return '<li class="r-item"><div class="row"><div><h3>' + esc(r.name) + "</h3><p>" + esc(r.nextHint) + " · " + esc((bot && bot.name) || r.botId) + "</p></div><button type=\"button\" data-toggle=\"" + esc(r.id) + "\">" + (r.enabled ? "ON" : "OFF") + "</button></div><p>" + esc(r.prompt) + "</p>" + (["GBD-DAILY-07", "GBD-HEARTBEAT", "GBD-WEEKLY-10"].includes(r.id) ? "" : '<button type="button" data-del="' + esc(r.id) + '">삭제</button>') + "</li>";
    }).join("");
    $("routineList").querySelectorAll("[data-toggle]").forEach((el) => el.onclick = () => { const r = state.routines.find((x) => x.id === el.getAttribute("data-toggle")); r.enabled = !r.enabled; persist(); render(); });
    $("routineList").querySelectorAll("[data-del]").forEach((el) => el.onclick = () => { state.routines = state.routines.filter((x) => x.id !== el.getAttribute("data-del")); persist(); render(); });
  }
  function renderStatus() {
    const keys = state.providers.filter((p) => p.key).length;
    const line = state.usage.filter((u) => u.calls || u.failures).map((u) => u.provider + " " + u.model + " ×" + u.calls).join(" · ") || "API 호출 없음";
    $("statusBar").innerHTML = "<span>" + esc(fmtKst()) + "</span><span>키 " + keys + "/5</span><span>" + esc(line) + "</span>" + (state.lastRetry ? "<span>재시도 " + state.lastRetry + "</span>" : "");
  }
  function render() { renderRail(); renderChat(); renderRoutines(); renderStatus(); }

  /* settings */
  let tab = "keys";
  function field(label, val, key, type) {
    return '<label class="blk"><span>' + esc(label) + '</span><input data-k="' + esc(key) + '" type="' + (type || "text") + '" maxlength="' + LIMIT.field + '" value="' + esc(val) + '"></label>';
  }
  function renderSettings() {
    const tabs = [["keys", "API 키"], ["connect", "연결"], ["vault", "금고"], ["harness", "하네스"], ["logs", "로그"]];
    $("settingsTabs").innerHTML = tabs.map((t) => "<button type=\"button\" class=\"" + (tab === t[0] ? "active" : "") + "\" data-tab=\"" + t[0] + "\">" + t[1] + "</button>").join("");
    $("settingsTabs").querySelectorAll("[data-tab]").forEach((el) => el.onclick = () => { tab = el.getAttribute("data-tab"); renderSettings(); });
    if (tab === "keys") {
      $("settingsBody").innerHTML = '<p class="hint">왼쪽 라디오는 기본 공급자입니다. 눈 아이콘으로 키를 확인합니다.</p>' + state.providers.map((p) => '<div class="card"><div class="row"><label><input type="radio" name="defp" value="' + p.id + '"' + (state.settings.defaultProvider === p.id ? " checked" : "") + "> " + esc(p.label) + "</label><select data-model=\"" + p.id + "\">" + p.models.map((m) => "<option" + (p.model === m ? " selected" : "") + ">" + esc(m) + "</option>").join("") + '</select></div><div class="row"><input data-key="' + p.id + '" type="password" maxlength="' + LIMIT.key + '" value="' + esc(p.key) + '" placeholder="API Key"><button type="button" data-eye="' + p.id + '">보기</button></div></div>').join("");
      $("settingsBody").querySelectorAll("[name=defp]").forEach((el) => el.onchange = () => { state.settings.defaultProvider = el.value; persist(); });
      $("settingsBody").querySelectorAll("[data-model]").forEach((el) => el.onchange = () => { state.providers.find((p) => p.id === el.getAttribute("data-model")).model = el.value; persist(); });
      $("settingsBody").querySelectorAll("[data-key]").forEach((el) => el.oninput = () => { state.providers.find((p) => p.id === el.getAttribute("data-key")).key = clamp(el.value, LIMIT.key); persist(); renderStatus(); });
      $("settingsBody").querySelectorAll("[data-eye]").forEach((el) => el.onclick = () => { const i = $("settingsBody").querySelector("[data-key='" + el.getAttribute("data-eye") + "']"); i.type = i.type === "password" ? "text" : "password"; });
    } else if (tab === "connect") {
      const c = state.connectors;
      $("settingsBody").innerHTML = '<p class="hint">GitHub Pages는 CORS 제한이 있습니다. Python API Bot 릴레이(http://127.0.0.1:8765)를 권장합니다.</p>' +
        field("릴레이 URL", c.relayUrl, "relayUrl") +
        '<h3>SSH / VM</h3><div class="grid">' + field("호스트", c.ssh.host, "ssh.host") + field("포트", c.ssh.port, "ssh.port") + field("사용자", c.ssh.user, "ssh.user") + field("키/암호", c.ssh.auth, "ssh.auth", "password") + "</div>" +
        "<h3>DB</h3><div class=\"grid\">" + field("종류", c.db.type, "db.type") + field("호스트", c.db.host, "db.host") + field("포트", c.db.port, "db.port") + field("사용자", c.db.user, "db.user") + field("암호", c.db.password, "db.password", "password") + field("이름", c.db.name, "db.name") + "</div>" +
        "<h3>GitHub</h3><div class=\"grid\">" + field("토큰", c.github.token, "github.token", "password") + field("owner", c.github.owner, "github.owner") + field("repo", c.github.repo, "github.repo") + "</div>" +
        "<h3>Drive / 경로</h3><div class=\"grid\">" + field("폴더 ID", c.drive.folderId, "drive.folderId") + field("로컬 디렉터리(Python)", c.localDir, "localDir") + field("로그 경로", c.logDir, "logDir") + field("Role 경로", c.roleDir, "roleDir") + field("루틴 경로", c.routineDir, "routineDir") + "</div>";
      $("settingsBody").querySelectorAll("[data-k]").forEach((el) => el.oninput = () => {
        const k = el.getAttribute("data-k"); const v = clamp(el.value, LIMIT.field);
        if (k === "relayUrl") c.relayUrl = v;
        else if (k.includes(".")) { const [a, b] = k.split("."); c[a][b] = v; }
        else c[k] = v;
        persist();
      });
    } else if (tab === "vault") {
      $("settingsBody").innerHTML = '<p class="hint">금고 암호로 키를 암호화합니다. 비우면 기기 기본 키. 로그 3일.</p><label class="blk"><span>금고 암호</span><input id="vaultPass" type="password" maxlength="' + LIMIT.pass + '"></label><div class="row" style="margin-top:12px"><button type="button" class="primary" id="savePass">저장</button><button type="button" class="ghost" id="resetCo">회사 초기화</button></div>';
      $("savePass").onclick = async () => { const p = $("vaultPass").value; state.settings.hasCustomPass = !!p; state.sessionPass = p || DEFAULT_PASS; await persist(); alert("저장했습니다."); };
      $("resetCo").onclick = () => { if (confirm("명부와 채팅을 되돌릴까요?")) { state.bots = [adminBot()]; state.messages = {}; state.routines = defaultRoutines(); state.company = { founded: false, mode: "유지", heartbeatLog: [] }; persist(); render(); } };
    } else if (tab === "harness") {
      $("settingsBody").innerHTML = state.harness.map((f, i) => '<div class="card"><input data-hp="' + i + '" value="' + esc(f.path) + '"><textarea data-hb="' + i + '" maxlength="' + LIMIT.role + '" style="width:100%;height:120px;margin-top:8px">' + esc(f.body) + "</textarea></div>").join("");
      $("settingsBody").querySelectorAll("[data-hp]").forEach((el) => el.oninput = () => { state.harness[+el.getAttribute("data-hp")].path = clamp(el.value, 80); persist(); });
      $("settingsBody").querySelectorAll("[data-hb]").forEach((el) => el.oninput = () => { state.harness[+el.getAttribute("data-hb")].body = clamp(el.value, LIMIT.role); persist(); });
    } else {
      $("settingsBody").innerHTML = state.logs.slice().reverse().slice(0, 200).map((l) => "<p class=\"hint\">" + esc(new Date(l.ts).toLocaleString("ko-KR")) + " [" + esc(l.kind) + "] " + esc(l.text) + "</p>").join("") || "<p class=\"hint\">로그 없음</p>";
    }
  }

  function bind() {
    $("btnSettings").onclick = () => { $("settingsModal").classList.remove("hidden"); renderSettings(); };
    $("btnCloseSettings").onclick = () => $("settingsModal").classList.add("hidden");
    $("settingsModal").addEventListener("click", (e) => { if (e.target.id === "settingsModal") $("settingsModal").classList.add("hidden"); });
    $("btnRoutines").onclick = () => $("routineCol").classList.toggle("open");
    $("composerInput").addEventListener("input", () => { $("charCount").textContent = $("composerInput").value.length + "/" + LIMIT.chat; });
    $("composerInput").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("composer").requestSubmit(); } });
    $("composer").onsubmit = (e) => { e.preventDefault(); const v = $("composerInput").value; $("composerInput").value = ""; $("charCount").textContent = "0/" + LIMIT.chat; handleUser(v, $("modelSelect").value); };
    $("btnAddRoutine").onclick = () => {
      const f = $("routineForm");
      f.classList.toggle("hidden");
      if (f.classList.contains("hidden")) return;
      f.innerHTML = '<input id="rn" placeholder="이름" maxlength="40"><select id="rb">' + state.bots.map((b) => "<option value=\"" + b.id + "\">" + esc(b.name) + "</option>").join("") + '</select><select id="rk"><option value="hourly">매시</option><option value="daily" selected>매일</option><option value="weekly">매주</option></select><input id="rh" type="number" min="0" max="23" value="9"><input id="rm" type="number" min="0" max="59" value="0"><div class="days" id="rd"></div><textarea id="rp" maxlength="8000" placeholder="프롬프트"></textarea><button type="submit">등록</button>';
      const days = [1, 2, 3, 4, 5];
      const names = "일월화수목금토";
      $("rd").innerHTML = names.split("").map((d, i) => "<button type=\"button\" class=\"" + (days.includes(i) ? "on" : "") + "\" data-d=\"" + i + "\">" + d + "</button>").join("");
      $("rd").onclick = (ev) => { const b = ev.target.closest("[data-d]"); if (!b) return; const n = +b.getAttribute("data-d"); const ix = days.indexOf(n); if (ix >= 0) days.splice(ix, 1); else days.push(n); b.classList.toggle("on"); };
      f.onsubmit = (ev) => {
        ev.preventDefault();
        const name = $("rn").value.trim(); const prompt = $("rp").value.trim(); if (!name || !prompt) return;
        state.routines.push({ id: uid("r"), name: clamp(name, 40), botId: $("rb").value, kind: $("rk").value, hour: +$("rh").value, minute: +$("rm").value, weekdays: days.slice(), prompt: clamp(prompt, LIMIT.chat), enabled: true, lastRunAt: null, nextHint: $("rh").value.padStart(2, "0") + ":" + $("rm").value.padStart(2, "0") });
        persist(); f.classList.add("hidden"); render();
      };
    };
    setInterval(renderStatus, 1000);
  }

  hydrate().then(() => { bind(); render(); startLoop(); });
})();
