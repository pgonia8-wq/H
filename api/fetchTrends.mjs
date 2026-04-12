const COINGECKO_TRENDING = "https://api.coingecko.com/api/v3/search/trending";
const COINGECKO_GLOBAL = "https://api.coingecko.com/api/v3/global";

const RSS_FEEDS = [
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", category: "world_news", lang: "en" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "world_news", lang: "en" },
  { url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", category: "entertainment", lang: "en" },
  { url: "https://feeds.bbci.co.uk/sport/rss.xml", category: "sports", lang: "en" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml", category: "sports", lang: "en" },
  { url: "https://feeds.feedburner.com/TechCrunch/", category: "tech", lang: "en" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", category: "crypto_news", lang: "en" },
  { url: "https://cointelegraph.com/rss", category: "crypto_news", lang: "en" },
  { url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada", category: "world_news", lang: "es" },
  { url: "https://e00-marca.uecdn.es/rss/portada.xml", category: "sports", lang: "es" },
  { url: "https://www.20minutos.es/rss/", category: "world_news", lang: "es" },
];

function extractFromXml(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`, "gi");
  const matches = [];
  let m;
  while ((m = regex.exec(xml)) !== null) {
    matches.push((m[1] || m[2] || "").trim());
  }
  return matches;
}

function extractImageFromItem(itemXml) {
  const mediaMatch = itemXml.match(/url="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
  if (mediaMatch) return mediaMatch[1];
  const enclosureMatch = itemXml.match(/<enclosure[^>]+url="(https?:\/\/[^"]+)"/i);
  if (enclosureMatch) return enclosureMatch[1];
  const imgMatch = itemXml.match(/<img[^>]+src="(https?:\/\/[^"]+)"/i);
  if (imgMatch) return imgMatch[1];
  return null;
}

async function fetchRss(feed) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { "User-Agent": "HumansApp/1.0 RSS Reader" },
    });
    clearTimeout(timeout);
    if (!res.ok) return [];

    const xml = await res.text();
    const items = xml.split(/<item[\s>]/i).slice(1, 6);

    return items.map((itemXml) => {
      const titles = extractFromXml(`<item>${itemXml}`, "title");
      const descs = extractFromXml(`<item>${itemXml}`, "description");
      const image = extractImageFromItem(itemXml);
      return {
        title: titles[0] || "",
        description: (descs[0] || "").replace(/<[^>]+>/g, "").slice(0, 800),
        category: feed.category,
        lang: feed.lang,
        source: feed.url.match(/\/\/([^/]+)/)?.[1] || "",
        image,
      };
    }).filter((t) => t.title.length > 5);
  } catch {
    return [];
  }
}

async function fetchCryptoTrending() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(COINGECKO_TRENDING, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = await res.json();

    return (data.coins || []).slice(0, 8).map((c) => ({
      title: `${c.item.name} (${c.item.symbol}) trending`,
      description: `Market cap rank #${c.item.market_cap_rank || "?"} — Price: $${c.item.data?.price?.toFixed(4) || "?"} — 24h change: ${c.item.data?.price_change_percentage_24h?.usd?.toFixed(1) || "?"}%`,
      category: "crypto_news",
      lang: "en",
      source: "coingecko.com",
      image: c.item.thumb || c.item.small || null,
    }));
  } catch {
    return [];
  }
}

async function fetchCryptoGlobal() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(COINGECKO_GLOBAL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = await res.json();
    const d = data.data;
    if (!d) return [];

    return [{
      title: `Crypto market: $${(d.total_market_cap?.usd / 1e12)?.toFixed(2) || "?"}T market cap`,
      description: `BTC dominance: ${d.market_cap_percentage?.btc?.toFixed(1) || "?"}% — ETH: ${d.market_cap_percentage?.eth?.toFixed(1) || "?"}% — Active cryptos: ${d.active_cryptocurrencies || "?"} — 24h volume: $${(d.total_volume?.usd / 1e9)?.toFixed(1) || "?"}B`,
      category: "market_analysis",
      lang: "en",
      source: "coingecko.com",
      image: null,
    }];
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const category = req.query?.category || req.body?.category || null;
  const lang = req.query?.lang || req.body?.lang || null;

  try {
    const results = await Promise.allSettled([
      ...RSS_FEEDS.map(fetchRss),
      fetchCryptoTrending(),
      fetchCryptoGlobal(),
    ]);

    let trends = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value);

    if (category) trends = trends.filter((t) => t.category === category);
    if (lang) trends = trends.filter((t) => t.lang === lang);

    trends.sort(() => Math.random() - 0.5);

    return res.status(200).json({
      count: trends.length,
      trends: trends.slice(0, 40),
    });
  } catch (err) {
    console.error("[FETCH_TRENDS] Error:", err.message);
    return res.status(500).json({ error: err.message, trends: [] });
  }
}
