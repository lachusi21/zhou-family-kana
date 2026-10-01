// 周家五十音的成績 API：GET/POST /api/scores，資料存在 Cloudflare D1；其他路徑交給靜態網頁
const MEMBERS = ["dad", "mom", "sis", "bro"];
const ALLOWED_ORIGINS = ["https://lachusi21.github.io"];
const KANA = /^[ぁ-ゖァ-ヺ]$/;

let ready = false;
async function ensureTable(db) {
  if (ready) return;
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS scores (
      id TEXT PRIMARY KEY,
      member TEXT NOT NULL,
      date TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      wrong TEXT NOT NULL,
      at INTEGER NOT NULL
    )`
  ).run();
  ready = true;
}

function cors(request) {
  const origin = request.headers.get("Origin");
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

function clean(r) {
  if (!r || typeof r !== "object") return null;
  const { id, member, date, score, at } = r;
  const wrong = Array.isArray(r.wrong) ? r.wrong : [];
  if (typeof id !== "string" || !/^[\w.-]{1,80}$/.test(id)) return null;
  if (!MEMBERS.includes(member)) return null;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (!Number.isInteger(score) || score < 0 || score > 20) return null;
  if (!Number.isInteger(at) || at < 1.7e12 || at > Date.now() + 864e5) return null;
  if (wrong.length > 20 || !wrong.every((k) => typeof k === "string" && KANA.test(k))) return null;
  return { id, member, date, score, total: 20, wrong, at };
}

async function api(request, env) {
  const h = cors(request);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
  await ensureTable(env.DB);

  if (request.method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT id, member, date, score, total, wrong, at FROM scores ORDER BY at DESC LIMIT 1000"
    ).all();
    return json({ scores: results.map((r) => ({ ...r, wrong: JSON.parse(r.wrong) })) }, 200, h);
  }

  if (request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "不是正確的 JSON" }, 400, h); }
    const list = (Array.isArray(body) ? body : [body]).slice(0, 50).map(clean);
    if (!list.length || list.some((r) => !r)) return json({ error: "成績格式不對" }, 400, h);
    await env.DB.batch(list.map((r) =>
      env.DB.prepare(
        "INSERT OR IGNORE INTO scores (id, member, date, score, total, wrong, at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(r.id, r.member, r.date, r.score, r.total, JSON.stringify(r.wrong), r.at)
    ));
    return json({ saved: list.length }, 200, h);
  }

  return json({ error: "不支援這個方法" }, 405, h);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/scores") {
      try { return await api(request, env); }
      catch (e) { return json({ error: "伺服器暫時出錯" }, 500, cors(request)); }
    }
    return env.ASSETS.fetch(request);
  },
};
