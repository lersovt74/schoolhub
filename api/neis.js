// api/neis.js — server-side proxy for NEIS OpenAPI (Vercel Serverless Function).

const BASE_URL = "https://open.neis.go.kr/hub";
const NEIS_BROWSER_HEADERS = {
  Accept: "*/*",
  "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
};

function getQueryEntries(req) {
  const rawUrl = typeof req?.url === "string" ? req.url : "/";
  const parsed = new URL(rawUrl, "https://local.schoolhub");
  return [...parsed.searchParams.entries()];
}

function normalizeApiKey(raw) {
  const value = String(raw || "").trim().replace(/^["']|["']$/g, "");
  if (!value) return "";
  try {
    if (value.includes("%")) {
      return decodeURIComponent(value);
    }
  } catch (_) {
    // Keep original when decoding fails.
  }
  return value;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const queryEntries = getQueryEntries(req);
    const queryMap = new Map(queryEntries);
    const endpoint = String(queryMap.get("endpoint") || "").trim().replace(/^\/+/, "");
    if (!endpoint) {
      res.status(400).json({ error: "Missing endpoint" });
      return;
    }

    const key = normalizeApiKey(process.env.NEIS_API_KEY);
    if (!key) {
      res.status(500).json({ error: "Server key is not configured" });
      return;
    }

    const url = new URL(`${BASE_URL}/${endpoint}`);
    queryEntries.forEach(([k, v]) => {
      if (k === "endpoint" || k === "KEY") return;
      if (v === undefined || v === null || v === "") return;
      url.searchParams.set(k, String(v));
    });
    url.searchParams.set("KEY", key);

    const upstream = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: NEIS_BROWSER_HEADERS,
    });
    const text = await upstream.text();
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json; charset=utf-8");
    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(500).json({
      error: "Proxy failed",
      message: err?.message || String(err),
      url: typeof req?.url === "string" ? req.url : null,
      hint: "Check NEIS_API_KEY and endpoint query parameters",
    });
  }
}
