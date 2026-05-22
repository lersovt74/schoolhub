// api/neis.js — server-side proxy for NEIS OpenAPI (Vercel Serverless Function).

const BASE_URL = "https://open.neis.go.kr/hub";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const endpoint = String(req.query.endpoint || "").trim();
    if (!endpoint) {
      res.status(400).json({ error: "Missing endpoint" });
      return;
    }

    const key = process.env.NEIS_API_KEY;
    if (!key) {
      res.status(500).json({ error: "Server key is not configured" });
      return;
    }

    const url = new URL(`${BASE_URL}/${endpoint}`);
    Object.entries(req.query).forEach(([k, v]) => {
      if (k === "endpoint" || k === "KEY") return;
      if (v === undefined || v === null || v === "") return;
      url.searchParams.set(k, String(v));
    });
    url.searchParams.set("KEY", key);

    const upstream = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const text = await upstream.text();
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(500).json({ error: "Proxy failed", message: err?.message || String(err) });
  }
}

