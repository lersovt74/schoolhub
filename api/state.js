// api/state.js — persistent SchoolHub state API
// Priority:
// 1) Upstash/Vercel KV via REST (KV_REST_API_URL, KV_REST_API_TOKEN)
// 2) Local JSON file fallback (for self-hosted Node runtime)

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

async function readState() {
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
      await writeState(next);
      return send(res, 200, { ok: true });
    }

    return send(res, 405, { ok: false, error: "Method not allowed" });
  } catch (err) {
    return send(res, 500, { ok: false, error: err?.message || "Server error" });
  }
}

