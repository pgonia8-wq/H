let cached = { rate: 3.0, ts: 0 };

export async function fetchWldUsdRate() {
  const now = Date.now();
  if (now - cached.ts < 60000) return cached.rate;
  try {
    const resp = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=WLDUSDT");
    const data = await resp.json();
    const rate = parseFloat(data.price);
    if (rate > 0) {
      cached = { rate, ts: now };
      return rate;
    }
  } catch (e) {
    console.error("[wldRate] fetch error:", e.message);
  }
  return cached.rate;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const rate = await fetchWldUsdRate();
  return res.status(200).json({ rate, ts: cached.ts });
}
