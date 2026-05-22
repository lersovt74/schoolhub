// api/assets.js — Supabase Storage-backed file upload/download proxy.

const BUCKET = process.env.SCHOOLHUB_ASSET_BUCKET || "schoolhub-assets";

function send(res, code, payload) {
  res.status(code).json(payload);
}

function supabaseCfg() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function safeName(name = "file") {
  return String(name)
    .trim()
    .replace(/[^\w.\-가-힣]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "file";
}

function encodeObjectPath(objectPath = "") {
  return String(objectPath).split("/").map(encodeURIComponent).join("/");
}

function dataUrlToBuffer(dataUrl = "") {
  const match = String(dataUrl).match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) return null;
  const mime = match[1] || "application/octet-stream";
  const isBase64 = !!match[2];
  const raw = match[3] || "";
  const buffer = isBase64 ? Buffer.from(raw, "base64") : Buffer.from(decodeURIComponent(raw), "utf8");
  return { mime, buffer };
}

async function storageFetch(path, options = {}) {
  const cfg = supabaseCfg();
  if (!cfg) throw new Error("Supabase environment variables are missing");
  return fetch(`${cfg.url}${path}`, {
    ...options,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      ...(options.headers || {}),
    },
  });
}

async function ensureBucket() {
  const check = await storageFetch(`/storage/v1/bucket/${encodeURIComponent(BUCKET)}`, { method: "GET" });
  if (check.ok) return;
  if (check.status !== 404) {
    const text = await check.text();
    throw new Error(`Storage bucket check failed: ${check.status} ${text}`);
  }
  const create = await storageFetch("/storage/v1/bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: false,
      file_size_limit: 10485760,
    }),
  });
  if (!create.ok && create.status !== 409) {
    const text = await create.text();
    throw new Error(`Storage bucket create failed: ${create.status} ${text}`);
  }
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const host = req.headers.host || "localhost";
      const parsedUrl = new URL(req.url || "/", `https://${host}`);
      const rawPath = String(parsedUrl.searchParams.get("path") || "");
      if (!rawPath || rawPath.includes("..")) return send(res, 400, { ok: false, error: "Invalid path" });
      const file = await storageFetch(`/storage/v1/object/authenticated/${encodeURIComponent(BUCKET)}/${encodeObjectPath(rawPath)}`, { method: "GET" });
      if (!file.ok) {
        const text = await file.text();
        return send(res, file.status, { ok: false, error: text || "File not found" });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      res.setHeader("Content-Type", file.headers.get("content-type") || "application/octet-stream");
      res.setHeader("Cache-Control", "private, max-age=3600");
      res.status(200).send(buffer);
      return;
    }

    if (req.method !== "POST") return send(res, 405, { ok: false, error: "Method not allowed" });

    await ensureBucket();
    const { name, type, dataUrl } = req.body || {};
    const parsed = dataUrlToBuffer(dataUrl);
    if (!parsed?.buffer?.length) return send(res, 400, { ok: false, error: "Invalid file payload" });
    if (parsed.buffer.length > 10 * 1024 * 1024) {
      return send(res, 413, { ok: false, error: "File is too large" });
    }

    const filename = safeName(name);
    const folder = new Date().toISOString().slice(0, 10);
    const objectPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${filename}`;
    const upload = await storageFetch(`/storage/v1/object/${encodeURIComponent(BUCKET)}/${encodeObjectPath(objectPath)}`, {
      method: "POST",
      headers: {
        "Content-Type": type || parsed.mime,
        "x-upsert": "false",
      },
      body: parsed.buffer,
    });
    if (!upload.ok) {
      const text = await upload.text();
      throw new Error(`Storage upload failed: ${upload.status} ${text}`);
    }

    return send(res, 200, {
      ok: true,
      asset: {
        storage: "supabase",
        storagePath: objectPath,
        url: `/api/assets?path=${encodeURIComponent(objectPath)}`,
      },
    });
  } catch (err) {
    return send(res, 500, { ok: false, error: err?.message || "Asset server error" });
  }
}
