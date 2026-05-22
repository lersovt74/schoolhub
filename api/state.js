// api/state.js — persistent SchoolHub state API
// Priority:
// 1) Supabase table via REST API (SUPABASE_URL + SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY)
// 2) Upstash/Vercel KV via REST (legacy fallback)
// 3) Local JSON file fallback (self-hosted fallback)

import fs from "node:fs/promises";
import path from "node:path";

const KEY = process.env.SCHOOLHUB_STATE_KEY || "schoolhub:state:v1";
const FILE_PATH = path.join(process.cwd(), ".storage", "schoolhub-state.json");

function send(res, code, payload) {
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

function mergeArrays(existing, incoming, fieldName = "") {
  if (!Array.isArray(existing)) return Array.isArray(incoming) ? incoming : existing;
  if (!Array.isArray(incoming)) return existing;

  const existingKeys = existing.map(pickEntityKey);
  const incomingKeys = incoming.map(pickEntityKey);
  const canKey =
    existing.length > 0 &&
    incoming.length > 0 &&
    existing.every((item, i) => !!existingKeys[i]) &&
    incoming.every((item, i) => !!incomingKeys[i]);

  if (!canKey) return incoming;

  const map = new Map();
  existing.forEach((item) => map.set(pickEntityKey(item), item));
  incoming.forEach((item) => {
    const key = pickEntityKey(item);
    const prev = map.get(key);
    map.set(key, mergeValue(prev, item, fieldName));
  });

  const ordered = [];
  const seen = new Set();
  incoming.forEach((item) => {
    const key = pickEntityKey(item);
    if (seen.has(key)) return;
    ordered.push(map.get(key));
    seen.add(key);
  });
  existing.forEach((item) => {
    const key = pickEntityKey(item);
    if (seen.has(key)) return;
    ordered.push(map.get(key));
    seen.add(key);
  });
  return ordered;
}

function mergeValue(existing, incoming, fieldName = "") {
  if (incoming == null) return existing;
  if (existing == null) return incoming;

  if (Array.isArray(existing) || Array.isArray(incoming)) {
    return mergeArrays(existing, incoming, fieldName);
  }

  if (typeof existing === "number" && typeof incoming === "number") {
    if (fieldName === "likes" || fieldName === "recent") return Math.max(existing, incoming);
    return incoming;
  }

  if (isObject(existing) && isObject(incoming)) {
    const next = { ...existing };
    for (const key of Object.keys(incoming)) {
      next[key] = mergeValue(existing[key], incoming[key], key);
    }
    return next;
  }

  return incoming;
}

function mergeState(existing, incoming) {
  if (!isObject(existing)) return incoming;
  if (!isObject(incoming)) return existing;
  return mergeValue(existing, incoming, "");
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

async function supabaseGetState() {
  const cfg = supabaseCfg();
  if (!cfg) return null;
  const url = `${cfg.url}/rest/v1/schoolhub_state?id=eq.${encodeURIComponent(KEY)}&select=state,updated_at&limit=1`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase GET failed: ${res.status} ${text}`);
  }
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  return row?.state && typeof row.state === "object" ? row.state : null;
}

async function supabaseWriteState(next) {
  const cfg = supabaseCfg();
  if (!cfg) return null;

  const existing = (await supabaseGetState()) || {};
  const merged = mergeState(existing, next);
  const url = `${cfg.url}/rest/v1/schoolhub_state?on_conflict=id`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([{ id: KEY, state: merged }]),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase POST failed: ${res.status} ${text}`);
  }
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  return row?.state && typeof row.state === "object" ? row.state : merged;
}

async function readState() {
  const fromSupabase = await supabaseGetState();
  if (fromSupabase) return fromSupabase;

  const fromKv = await kvCmd(["GET", KEY]);
  if (fromKv) {
    const parsed = safeParse(fromKv, null);
    if (parsed && typeof parsed === "object") return parsed;
  }

  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = safeParse(raw, null);
    if (parsed && typeof parsed === "object") return parsed;
  } catch (_) {}

  return null;
}

async function writeState(next) {
  const body = JSON.stringify(next);

  if (supabaseCfg()) {
    const merged = await supabaseWriteState(next);
    return merged;
  }

  const kvUsed = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
  if (kvUsed) {
    await kvCmd(["SET", KEY, body]);
  }

  try {
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    await fs.writeFile(FILE_PATH, body, "utf8");
  } catch (_) {
    // Ignore filesystem failure on serverless.
  }
  return next;
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const state = await readState();
      return send(res, 200, { ok: true, state });
    }

    if (req.method === "POST") {
      const next = req.body?.state;
      if (!next || typeof next !== "object") {
        return send(res, 400, { ok: false, error: "Invalid state payload" });
      }
      const state = await writeState(next);
      return send(res, 200, { ok: true, state });
    }

    return send(res, 405, { ok: false, error: "Method not allowed" });
  } catch (err) {
    return send(res, 500, { ok: false, error: err?.message || "Server error" });
  }
}
