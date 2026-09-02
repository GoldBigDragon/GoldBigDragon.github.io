// Cloudflare Worker for GoldBigDragon temporary chat.
// Bind a KV namespace as CHAT_KV (PASTE_KV is accepted as a fallback).
// wrangler deploy --name goldbigdragon-chat

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_CIPHERTEXT = 16 * 1024;
const MAX_TTL = 3 * 24 * 60 * 60;
const MIN_TTL = 60;
const ALLOWED_TTL = new Set([60, 600, 1800, 3600, 21600, 86400, 259200]);
const ROOM_HASH_RE = /^[a-f0-9]{64}$/;
const ipRateMap = new Map();

const ALLOWED_ORIGINS = [
  "https://goldbigdragon.github.io",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

function originAllowed(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const u = new URL(origin);
    if (u.hostname === "goldbigdragon.github.io") return true;
    if (u.hostname.endsWith(".github.io")) return true;
    if (u.hostname.includes("grok")) return true;
    if (u.hostname.endsWith(".workers.dev")) return true;
  } catch (_) {}
  return false;
}

function corsHeaders(origin) {
  const allow = originAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    Vary: "Origin",
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json; charset=utf-8" },
  });
}

function kv(env) {
  return env.CHAT_KV || env.PASTE_KV;
}

function clientIP(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "0.0.0.0"
  ).slice(0, 64);
}

function checkMemoryRate(ip) {
  const now = Date.now();
  const rec = ipRateMap.get(ip) || { count: 0, lastReset: now };
  if (now - rec.lastReset > RATE_LIMIT_WINDOW) {
    rec.count = 0;
    rec.lastReset = now;
  }
  if (rec.count >= MAX_REQUESTS_PER_WINDOW) {
    ipRateMap.set(ip, rec);
    return false;
  }
  rec.count += 1;
  ipRateMap.set(ip, rec);
  return true;
}

function invTs(ms) {
  return String(10000000000000 - ms).padStart(13, "0");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const headers = corsHeaders(origin);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const isChat = path === "/api/chat" || path === "/api/paste" || path === "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    if (!isChat) return new Response("Not Found", { status: 404, headers });

    const store = kv(env);
    if (!store) return json({ error: "storage unavailable" }, 503, origin);

    if (request.method === "GET") {
      const roomHash = String(url.searchParams.get("roomHash") || "");
      if (!ROOM_HASH_RE.test(roomHash)) return json({ error: "invalid room" }, 400, origin);
      let limit = Number(url.searchParams.get("limit") || "20");
      if (!Number.isFinite(limit)) limit = 20;
      limit = Math.max(1, Math.min(30, limit));
      const before = url.searchParams.get("before");
      const after = url.searchParams.get("after");
      const listed = await store.list({ prefix: `m:${roomHash}:`, limit: 200 });
      const rows = [];
      for (const key of listed.keys) {
        const raw = await store.get(key.name);
        if (!raw) continue;
        let row;
        try {
          row = JSON.parse(raw);
        } catch (_) {
          continue;
        }
        if (!row || !row.ciphertext) continue;
        const created = Date.parse(row.createdAt);
        const expires = Date.parse(row.expiresAt);
        const now = Date.now();
        if (!Number.isFinite(created)) continue;
        if (Number.isFinite(expires) && expires <= now) continue;
        if (now - created > MAX_TTL * 1000) continue;
        if (after) {
          const a = Date.parse(after);
          if (Number.isFinite(a) && created <= a) continue;
        }
        if (before) {
          const b = Date.parse(before);
          if (Number.isFinite(b) && created >= b) continue;
        }
        rows.push({
          id: row.id,
          ciphertext: row.ciphertext,
          ip: row.ip,
          createdAt: row.createdAt,
          expiresAt: row.expiresAt,
          _created: created,
        });
      }
      rows.sort((a, b) => a._created - b._created);
      const sliced = after ? rows.slice(0, limit) : rows.slice(-limit);
      return json(
        {
          messages: sliced.map(({ _created, ...rest }) => rest),
        },
        200,
        origin,
      );
    }

    if (request.method === "POST") {
      if (origin && !originAllowed(origin)) {
        return json({ error: "forbidden origin" }, 403, origin);
      }
      const ip = clientIP(request);
      if (!checkMemoryRate(ip)) {
        return json({ error: "rate limit" }, 429, origin);
      }
      let body;
      try {
        body = await request.json();
      } catch (_) {
        return json({ error: "invalid json" }, 400, origin);
      }
      const roomHash = String(body.roomHash || "");
      const ciphertext = String(body.ciphertext || "");
      const ttl = Number(body.ttl);
      if (!ROOM_HASH_RE.test(roomHash)) return json({ error: "invalid room" }, 400, origin);
      if (!ciphertext || ciphertext.length > MAX_CIPHERTEXT) {
        return json({ error: "invalid content" }, 400, origin);
      }
      if (!ALLOWED_TTL.has(ttl) || ttl < MIN_TTL || ttl > MAX_TTL) {
        return json({ error: "invalid ttl" }, 400, origin);
      }
      const id = crypto.randomUUID();
      const created = new Date();
      const expires = new Date(created.getTime() + ttl * 1000);
      const record = {
        id,
        ciphertext,
        ip,
        createdAt: created.toISOString(),
        expiresAt: expires.toISOString(),
      };
      const key = `m:${roomHash}:${invTs(created.getTime())}:${id}`;
      await store.put(key, JSON.stringify(record), { expirationTtl: ttl });
      return json(record, 200, origin);
    }

    return new Response("Method Not Allowed", { status: 405, headers });
  },
};
