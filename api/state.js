// api/state.js — persistent SchoolHub state API
// Storage priority:
// 1) Supabase table via REST API (SUPABASE_URL + SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY)
// 2) Upstash/Vercel KV via REST (legacy fallback)
// 3) Local JSON file (local dev only — NOT durable on serverless)
//
// Every write is merged into the stored document on the server. Clients only ever
// send the keys they own, so a device with a stale snapshot can never wipe another
// device's data.

import fs from "node:fs/promises";
import path from "node:path";

const KEY = process.env.SCHOOLHUB_STATE_KEY || "schoolhub:state:v1";
const FILE_PATH = path.join(process.cwd(), ".storage", "schoolhub-state.json");
const MAX_WRITE_ATTEMPTS = 5;

function send(res, code, payload) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.status(code).json(payload);
}

function safeParse(raw, fallback = null) {
  try {
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function pickEntityKey(item) {
  if (!isObject(item)) return "";
  return String(item.id || item.code || item.key || item.slug || "").trim();
}

function mergeDeletedMaps(existing, incoming) {
  const next = isObject(existing) ? { ...existing } : {};
  if (!isObject(incoming)) return next;
  for (const [bucket, values] of Object.entries(incoming)) {
    if (!isObject(values)) continue;
    next[bucket] = { ...(next[bucket] || {}), ...values };
  }
  return next;
}

function deletedFor(deletedMap, fieldName) {
  if (!fieldName || !isObject(deletedMap)) return {};
  return isObject(deletedMap[fieldName]) ? deletedMap[fieldName] : {};
}

function mergeArrays(existing, incoming, fieldName = "", deletedMap = {}) {
  if (!Array.isArray(existing)) return Array.isArray(incoming) ? incoming : existing;
  if (!Array.isArray(incoming)) return existing;
  const deleted = deletedFor(deletedMap, fieldName);
  const alive = (item) => {
    const key = pickEntityKey(item);
    return !(key && deleted[key]);
  };

  // An empty side is never a deletion signal — real deletions come through __deleted.
  if (existing.length === 0) return incoming.filter(alive);
  if (incoming.length === 0) return existing.filter(alive);

  const keyable = (arr) => arr.every((item) => !!pickEntityKey(item));
  // Positional arrays (timetable rows, plain strings…) are replaced, not unioned.
  if (!keyable(existing) || !keyable(incoming)) return incoming.filter(alive);

  const map = new Map();
  existing.forEach((item) => {
    if (alive(item)) map.set(pickEntityKey(item), item);
  });
  incoming.forEach((item) => {
    if (!alive(item)) return;
    const key = pickEntityKey(item);
    map.set(key, mergeValue(map.get(key), item, fieldName, deletedMap));
  });

  const ordered = [];
  const seen = new Set();
  const push = (item) => {
    const key = pickEntityKey(item);
    if (seen.has(key) || deleted[key]) return;
    ordered.push(map.get(key));
    seen.add(key);
  };
  incoming.forEach(push);
  existing.forEach(push);
  return ordered;
}

function mergeValue(existing, incoming, fieldName = "", deletedMap = {}) {
  if (incoming == null) return existing;
  if (existing == null) return incoming;

  if (Array.isArray(existing) || Array.isArray(incoming)) {
    return mergeArrays(existing, incoming, fieldName, deletedMap);
  }

  if (typeof existing === "number" && typeof incoming === "number") {
    if (fieldName === "likes" || fieldName === "recent" || fieldName === "__updatedAt") {
      return Math.max(existing, incoming);
    }
    return incoming;
  }

  if (isObject(existing) && isObject(incoming)) {
    const next = { ...existing };
    for (const key of Object.keys(incoming)) {
      next[key] = mergeValue(existing[key], incoming[key], key, deletedMap);
    }
    return next;
  }

  return incoming;
}

function mergeState(existing, incoming) {
  if (!isObject(existing)) return isObject(incoming) ? incoming : {};
  if (!isObject(incoming)) return existing;
  const deletedMap = mergeDeletedMaps(existing.__deleted, incoming.__deleted);
  const merged = mergeValue(existing, incoming, "", deletedMap);
  if (Object.keys(deletedMap).length > 0) merged.__deleted = deletedMap;
  return merged;
}

async function kvCmd(cmd) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cmd),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`KV request failed: ${resp.status} ${text}`);
  }
  const json = await resp.json();
  return json?.result ?? null;
}

function supabaseCfg() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function kvConfigured() {
  return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
}

function backendName() {
  if (supabaseCfg()) return "supabase";
  if (kvConfigured()) return "kv";
  return "file";
}

function supabaseHeaders(cfg, extra = {}) {
  return {
    apikey: cfg.key,
    Authorization: `Bearer ${cfg.key}`,
    Accept: "application/json",
    ...extra,
  };
}

async function supabaseReadRow() {
  const cfg = supabaseCfg();
  if (!cfg) return null;
  const url = `${cfg.url}/rest/v1/schoolhub_state?id=eq.${encodeURIComponent(KEY)}&select=state,updated_at&limit=1`;
  const res = await fetch(url, { method: "GET", headers: supabaseHeaders(cfg) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase GET failed: ${res.status} ${text}`);
  }
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) return null;
  return { state: isObject(row.state) ? row.state : {}, updatedAt: row.updated_at };
}

async function supabaseGetState() {
  const row = await supabaseReadRow();
  return row ? row.state : null;
}

// Read → merge → conditional write. The `updated_at=eq.<previous>` filter makes the
// update fail (0 rows) when another device wrote in between, so we re-merge and retry
// instead of silently dropping their changes.
async function supabaseWriteState(incoming) {
  const cfg = supabaseCfg();
  if (!cfg) return null;

  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
    const row = await supabaseReadRow();

    if (!row) {
      const insert = await fetch(`${cfg.url}/rest/v1/schoolhub_state`, {
        method: "POST",
        headers: supabaseHeaders(cfg, { "Content-Type": "application/json", Prefer: "return=representation" }),
        body: JSON.stringify([{ id: KEY, state: incoming }]),
      });
      if (insert.ok) {
        const rows = await insert.json();
        const created = Array.isArray(rows) ? rows[0] : null;
        return isObject(created?.state) ? created.state : incoming;
      }
      if (insert.status === 409) continue; // someone else created it first — re-read and merge
      const text = await insert.text();
      throw new Error(`Supabase INSERT failed: ${insert.status} ${text}`);
    }

    const merged = mergeState(row.state, incoming);
    const url =
      `${cfg.url}/rest/v1/schoolhub_state` +
      `?id=eq.${encodeURIComponent(KEY)}` +
      `&updated_at=eq.${encodeURIComponent(row.updatedAt)}`;
    const patch = await fetch(url, {
      method: "PATCH",
      headers: supabaseHeaders(cfg, { "Content-Type": "application/json", Prefer: "return=representation" }),
      body: JSON.stringify({ state: merged }),
    });
    if (!patch.ok) {
      const text = await patch.text();
      throw new Error(`Supabase PATCH failed: ${patch.status} ${text}`);
    }
    const rows = await patch.json();
    const updated = Array.isArray(rows) ? rows[0] : null;
    if (updated) return isObject(updated.state) ? updated.state : merged;
    // 0 rows → concurrent write landed first; loop and merge against the new value.
  }

  throw new Error("Supabase write failed after repeated conflicts");
}

async function readState() {
  if (supabaseCfg()) {
    const fromSupabase = await supabaseGetState();
    return fromSupabase || null;
  }

  if (kvConfigured()) {
    const fromKv = await kvCmd(["GET", KEY]);
    if (fromKv) {
      const parsed = safeParse(fromKv, null);
      if (parsed && typeof parsed === "object") return parsed;
    }
  }

  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = safeParse(raw, null);
    if (parsed && typeof parsed === "object") return parsed;
  } catch (_) {}

  return null;
}

async function writeState(incoming) {
  if (supabaseCfg()) return supabaseWriteState(incoming);

  if (kvConfigured()) {
    const current = safeParse(await kvCmd(["GET", KEY]), null);
    const merged = mergeState(isObject(current) ? current : {}, incoming);
    await kvCmd(["SET", KEY, JSON.stringify(merged)]);
    return merged;
  }

  let current = null;
  try {
    current = safeParse(await fs.readFile(FILE_PATH, "utf8"), null);
  } catch (_) {}
  const merged = mergeState(isObject(current) ? current : {}, incoming);
  try {
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    await fs.writeFile(FILE_PATH, JSON.stringify(merged), "utf8");
  } catch (_) {
    // Serverless filesystem is read-only — the response below reports backend "file"
    // so the client can warn that nothing is being shared between devices.
  }
  return merged;
}

export default async function handler(req, res) {
  const backend = backendName();
  const durable = backend !== "file";
  try {
    if (req.method === "GET") {
      const state = await readState();
      return send(res, 200, { ok: true, backend, durable, state });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? safeParse(req.body, null) : req.body;
      const next = body?.state;
      if (!next || typeof next !== "object" || Array.isArray(next)) {
        return send(res, 400, { ok: false, backend, durable, error: "Invalid state payload" });
      }
      const state = await writeState(next);
      return send(res, 200, { ok: true, backend, durable, state });
    }

    return send(res, 405, { ok: false, backend, durable, error: "Method not allowed" });
  } catch (err) {
    return send(res, 500, { ok: false, backend, durable, error: err?.message || "Server error" });
  }
}
