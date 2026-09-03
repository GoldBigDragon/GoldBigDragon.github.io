/* display-only UI. Python HQ owns API, threads, files. */
(() => {
  const $ = (id) => document.getElementById(id);
  const ESC = { amp: "&" + "amp;", lt: "&" + "lt;", gt: "&" + "gt;", quot: "&" + "quot;", apos: "&#39;" };
  const esc = (s) =>
    String(s || "").replace(/[&<>"']/g, (c) => ({ "&": ESC.amp, "<": ESC.lt, ">": ESC.gt, '"': ESC.quot, "'": ESC.apos }[c]));
  const clamp = (s, n) => String(s || "").slice(0, n);

  const HQ = localStorage.getItem("gbdHq") || "";
  const api = (path, opt = {}) =>
    fetch((HQ || "") + path, {
      ...opt,
      headers: { "content-type": "application/json", "x-requested-with": "GrokBot", ...(opt.headers || {}) },
    }).then(async (r) => {
      const t = await r.text();
      let j = null;
      try {
        j = t ? JSON.parse(t) : null;
      } catch {
        j = { error: t.slice(0, 200) };
      }
      if (!r.ok) throw new Error((j && j.error) || "HTTP " + r.status);
      return j;
    });

  let S = {
    bots: [],
    messages: {},
    routines: [],
    usage: [],
    providers: [],
    connectors: { relayUrl: HQ, ssh: {}, db: {}, github: {}, drive: {} },
    harness: [],
    secrets: [],
    logs: [],
    settings: { defaultProvider: "grok" },
    activeBotId: "admin",
    busy: false,
    backend: false,
    company: {},
  };

  function active() {
    return S.bots.find((b) => b.id === S.activeBotId) || S.bots[0];
  }

  function apply(p) {
    Object.assign(S, p);
    render();
  }

  function render() {
    const bot = active();
    $("brandSub").textContent = S.backend ? "HQ 연결됨" : "HQ 끊김 — python3 main.py";
    const rail = $("botRail");
    const admin = S.bots.find((b) => b.isAdmin);
    const rest = S.bots.filter((b) => !b.isAdmin && b.status !== "아카이브");
    const row = (b) => {
      const last = (S.messages[b.id] || []).slice().reverse().find((m) => m.role === "user" || m.role === "assistant");
      return `<button type="button" class="rail-item ${b.id === S.activeBotId ? "on" : ""}" data-id="${esc(b.id)}">
        <span class="av">${esc((b.name || "?").slice(0, 2))}</span>
        <span><b>${esc(b.name)}</b><i>${esc((last && last.text) || "새 대화")}</i></span>
      </button>`;
    };
    rail.innerHTML = (admin ? row(admin) : "") + rest.map(row).join("");
    rail.querySelectorAll("[data-id]").forEach((el) => {
      el.onclick = () => {
        S.activeBotId = el.getAttribute("data-id");
        api("/api/active", { method: "POST", body: JSON.stringify({ botId: S.activeBotId }) }).catch(() => {});
        render();
      };
    });
    $("chatHead").innerHTML = bot
      ? `<strong>${esc(bot.name)}</strong> <span>${esc(bot.rank)} · ${esc(bot.rolePath || "개인 비서")}</span>`
      : "";
    const log = $("chatLog");
    const msgs = (bot && S.messages[bot.id]) || [];
    log.innerHTML = msgs
      .map((m) => {
        const who = m.role === "user" ? "user" : m.role === "collab" || m.role === "tool" ? "collab" : "bot";
        return `<div class="msg ${who}"><div class="bubble">${esc(m.fromName ? m.fromName + " " : "")}${esc(m.text)}${m.model ? `<small>${esc(m.provider)}:${esc(m.model)}</small>` : ""}</div></div>`;
      })
      .join("");
    log.scrollTop = log.scrollHeight;
    $("modelSelect").innerHTML =
      `<option value="auto:balance">자동</option>` +
      S.providers
        .filter((p) => p.key)
        .map((p) => (p.models || []).map((m) => `<option value="${esc(p.id)}:${esc(m)}">${esc(p.label)} · ${esc(m)}</option>`).join(""))
        .join("");
    $("routineList").innerHTML = (S.routines || [])
      .map(
        (r) =>
          `<li><b>${esc(r.name)}</b> <span>${esc(r.nextHint)}</span>
           <button data-toggle="${esc(r.id)}">${r.enabled ? "ON" : "OFF"}</button>
           <button data-del="${esc(r.id)}">삭제</button>
           <p>${esc(r.prompt)}</p></li>`,
      )
      .join("");
    $("routineList").querySelectorAll("[data-toggle]").forEach((el) => {
      el.onclick = () => {
        const r = S.routines.find((x) => x.id === el.getAttribute("data-toggle"));
        api("/api/routines", { method: "POST", body: JSON.stringify({ action: "update", id: r.id, patch: { enabled: !r.enabled } }) });
      };
    });
    $("routineList").querySelectorAll("[data-del]").forEach((el) => {
      el.onclick = () => api("/api/routines", { method: "POST", body: JSON.stringify({ action: "remove", id: el.getAttribute("data-del") }) });
    });
    const usage = (S.usage || [])
      .filter((u) => u.calls || u.failures)
      .map((u) => `${u.provider} ${u.model} ×${u.calls}`)
      .join(" · ");
    $("statusBar").textContent = `${S.backend ? "HQ" : "HQ 끊김"} · 키 ${(S.providers || []).filter((p) => p.key).length}/5 · ${usage || "API 호출 없음"}`;
  }

  $("composerInput").addEventListener("input", (e) => {
    $("charCount").textContent = `${e.target.value.length}/8000`;
  });
  $("composer").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = clamp($("composerInput").value, 8000).trim();
    if (!text || S.busy) return;
    $("composerInput").value = "";
    api("/api/chat", {
      method: "POST",
      body: JSON.stringify({ botId: S.activeBotId, text, model: $("modelSelect").value || "auto:balance" }),
    }).catch((err) => alert(err.message));
  });

  $("btnSettings").onclick = () => openSettings();
  $("btnCloseSettings").onclick = () => $("settingsModal").classList.add("hidden");
  $("btnRoutines").onclick = () => $("routineCol").classList.toggle("open");
  $("btnAddRoutine").onclick = () => {
    const f = $("routineForm");
    f.classList.toggle("hidden");
    if (!f.classList.contains("hidden")) {
      f.innerHTML = `<input name="name" maxlength="40" placeholder="이름" required>
        <select name="botId">${S.bots.map((b) => `<option value="${esc(b.id)}">${esc(b.name)}</option>`).join("")}</select>
        <select name="kind"><option value="hourly">매시</option><option value="daily">매일</option><option value="weekly">매주</option></select>
        <input name="hour" type="number" min="0" max="23" value="9">
        <input name="minute" type="number" min="0" max="59" value="0">
        <textarea name="prompt" maxlength="8000" placeholder="프롬프트" required></textarea>
        <button type="submit">등록</button>`;
    }
  };
  $("routineForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    api("/api/routines", {
      method: "POST",
      body: JSON.stringify({
        action: "add",
        name: fd.get("name"),
        botId: fd.get("botId"),
        kind: fd.get("kind"),
        hour: Number(fd.get("hour")),
        minute: Number(fd.get("minute")),
        prompt: fd.get("prompt"),
        weekdays: [1, 2, 3, 4, 5],
        enabled: true,
      }),
    });
    e.target.classList.add("hidden");
  });

  function openSettings() {
    const m = $("settingsModal");
    m.classList.remove("hidden");
    $("settingsTabs").innerHTML = ["keys", "connect", "vault", "harness", "logs"]
      .map((t, i) => `<button type="button" data-tab="${t}" class="${i === 0 ? "on" : ""}">${{ keys: "API 키", connect: "연결", vault: "금고", harness: "하네스", logs: "로그" }[t]}</button>`)
      .join("");
    const body = $("settingsBody");
    const showTab = (tab) => {
      $("settingsTabs")
        .querySelectorAll("button")
        .forEach((b) => b.classList.toggle("on", b.getAttribute("data-tab") === tab));
      if (tab === "keys") {
        body.innerHTML = S.providers
          .map(
            (p) => `<label class="block"><input type="radio" name="def" value="${esc(p.id)}" ${S.settings.defaultProvider === p.id ? "checked" : ""}> ${esc(p.label)}
              <select data-model="${esc(p.id)}">${(p.models || []).map((m) => `<option ${m === p.model ? "selected" : ""}>${esc(m)}</option>`).join("")}</select>
              <div class="keyrow"><input data-key="${esc(p.id)}" type="password" maxlength="512" value="${esc(p.key)}" placeholder="API Key"><button type="button" data-eye="${esc(p.id)}">보기</button></div></label>`,
          )
          .join("");
        body.querySelectorAll("[data-key]").forEach((el) => {
          el.oninput = () => {
            const id = el.getAttribute("data-key");
            S.providers = S.providers.map((p) => (p.id === id ? { ...p, key: clamp(el.value, 512) } : p));
            api("/api/providers", { method: "POST", body: JSON.stringify({ providers: S.providers, defaultProvider: S.settings.defaultProvider }) });
          };
        });
        body.querySelectorAll("[data-eye]").forEach((el) => {
          el.onclick = () => {
            const inp = body.querySelector(`[data-key="${el.getAttribute("data-eye")}"]`);
            inp.type = inp.type === "password" ? "text" : "password";
          };
        });
        body.querySelectorAll("[name=def]").forEach((el) => {
          el.onchange = () => {
            S.settings.defaultProvider = el.value;
            api("/api/providers", { method: "POST", body: JSON.stringify({ providers: S.providers, defaultProvider: el.value }) });
          };
        });
      } else if (tab === "connect") {
        const c = S.connectors;
        body.innerHTML = `<label>HQ URL <input id="hqUrl" maxlength="500" value="${esc(c.relayUrl || HQ)}"></label>
          <p class="hint">정적 페이지에서 Python HQ 주소. 같은 호스트면 비워 두세요.</p>
          <label>로컬 디렉터리 <input id="localDir" maxlength="500" value="${esc(c.localDir || "")}"></label>
          <label>SSH 호스트 <input id="sshHost" maxlength="253" value="${esc((c.ssh && c.ssh.host) || "")}"></label>
          <label>GitHub owner/repo <input id="gh" maxlength="160" value="${esc(((c.github && c.github.owner) || "") + "/" + ((c.github && c.github.repo) || ""))}"></label>
          <button type="button" id="saveConn">저장</button>`;
        $("saveConn").onclick = () => {
          const hqUrl = $("hqUrl").value.trim();
          localStorage.setItem("gbdHq", hqUrl);
          const [owner, repo] = ($("gh").value || "/").split("/");
          api("/api/connectors", {
            method: "POST",
            body: JSON.stringify({
              connectors: {
                ...c,
                relayUrl: hqUrl,
                localDir: $("localDir").value,
                ssh: { ...(c.ssh || {}), host: $("sshHost").value },
                github: { ...(c.github || {}), owner, repo },
              },
            }),
          });
        };
      } else if (tab === "vault") {
        body.innerHTML =
          `<label>금고 암호 <input id="vpass" type="password" maxlength="128"></label><button type="button" id="vsave">암호 저장</button>` +
          (S.secrets || []).map((s) => `<p>${esc(s.key)} · ••••••</p>`).join("");
        $("vsave").onclick = () => api("/api/vault", { method: "POST", body: JSON.stringify({ action: "passphrase", pass: $("vpass").value }) });
      } else if (tab === "harness") {
        body.innerHTML = (S.harness || []).map((h) => `<details><summary>${esc(h.path)}</summary><pre>${esc((h.body || "").slice(0, 4000))}</pre></details>`).join("");
      } else {
        body.innerHTML = (S.logs || [])
          .slice()
          .reverse()
          .slice(0, 120)
          .map((l) => `<p class="log">[${esc(l.kind)}] ${esc(l.text)}</p>`)
          .join("");
      }
    };
    $("settingsTabs").onclick = (e) => {
      const t = e.target.getAttribute("data-tab");
      if (t) showTab(t);
    };
    showTab("keys");
  }

  async function boot() {
    try {
      const snap = await api("/api/state");
      apply({ ...snap, backend: true });
    } catch {
      apply({ backend: false });
    }
    const es = new EventSource((HQ || "") + "/api/events");
    es.onmessage = (m) => {
      try {
        const ev = JSON.parse(m.data);
        if (ev.type === "state") apply({ ...ev.payload, backend: true });
        else if (ev.type === "patch") apply({ ...ev.payload, backend: true });
        else if (ev.type === "message") {
          const { botId, message } = ev.payload;
          const list = (S.messages[botId] || []).concat(message);
          S.messages = { ...S.messages, [botId]: list };
          render();
        } else if (ev.type === "log") {
          S.logs = (S.logs || []).concat(ev.payload);
          render();
        }
      } catch {
        /* ignore */
      }
    };
  }
  boot();
})();
