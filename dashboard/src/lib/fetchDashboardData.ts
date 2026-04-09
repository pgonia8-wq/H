import { supabase } from "../../../src/supabaseClient";
import { getFlag } from "./utils";
import type { AdMetric, AudienceGroup, ChartPoint, DashboardData, Post, PostEarning, PostStats } from "./types";

const LIKE_VALUE_WLD = 0.001;

function emptyData(): DashboardData {
  return {
    totalEarnings: 0,
    totalEstimatedWLD: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    activeAds: 0,
    chartData: [],
    topPosts: [],
    postEarnings: [],
    countries: [],
    languages: [],
    interests: [],
    activity: [],
  };
}

export async function fetchDashboardData(userId: string): Promise<DashboardData> {

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id, content, likes, tips_total, boost_score")
    .eq("user_id", userId);

  if (postsError) throw new Error(postsError.message);
  if (!Array.isArray(posts) || posts.length === 0) return emptyData();

  const postEarnings: PostEarning[] = posts.map((p: any) => ({
    id: p.id,
    content: p.content ?? "",
    likes: p.likes ?? 0,
    tips_total: p.tips_total ?? 0,
    boost_score: p.boost_score ?? 0,
    estimated_wld:
      ((p.tips_total ?? 0) * 0.70) +
      ((p.likes ?? 0) * LIKE_VALUE_WLD) +
      ((p.boost_score ?? 0) * 0.01),
  }));

  const totalEstimatedWLD = postEarnings.reduce(
    (sum, p) => sum + (p.estimated_wld ?? 0),
    0
  );

  const postIds = posts.map((p: Post) => p.id);

  const { data: metrics, error: metricsError } = await supabase
    .from("ad_metrics")
    .select("*")
    .in("post_id", postIds);

  if (metricsError) throw new Error(metricsError.message);

  const safeMetrics = Array.isArray(metrics) ? metrics : [];

  const clicks = safeMetrics.filter((m: AdMetric) => m.type === "click").length;
  const impressions = safeMetrics.filter((m: AdMetric) => m.type === "impression").length;
  const adEarnings = safeMetrics.reduce(
    (s: number, m: AdMetric) => s + (m.creator_earning || 0),
    0
  );
  const totalEarnings = adEarnings + totalEstimatedWLD;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

  const postMap = new Map<string, PostStats>();
  posts.forEach((p: Post) =>
    postMap.set(p.id, { id: p.id, content: p.content, earnings: 0, clicks: 0, impressions: 0 })
  );

  safeMetrics.forEach((m: AdMetric) => {
    const ps = postMap.get(m.post_id);
    if (!ps) return;
    if (m.type === "click") {
      ps.clicks++;
      ps.earnings += m.creator_earning || 0;
    }
    if (m.type === "impression") ps.impressions++;
  });

  postEarnings.forEach((pe) => {
    const ps = postMap.get(pe.id);
    if (ps) {
      ps.earnings += pe.estimated_wld;
    }
  });

  const topPosts = Array.from(postMap.values())
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 5);

  const byDay = new Map<string, number>();
  safeMetrics.forEach((m: AdMetric) => {
    if (m.value > 0) {
      const day = new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      byDay.set(day, (byDay.get(day) || 0) + m.value);
    }
  });
  const chartData: ChartPoint[] = Array.from(byDay.entries())
    .map(([date, earnings]) => ({ date, earnings: parseFloat(earnings.toFixed(4)) }))
    .slice(-7);

  function groupBy(field: "country" | "language" | "interests", withFlag = false): AudienceGroup[] {
    const map = new Map<string, number>();
    safeMetrics.filter((m: AdMetric) => m.type === "click").forEach((m: AdMetric) => {
      const k = (m[field] as string) || "Unknown";
      map.set(k, (map.get(k) || 0) + 1);
    });
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, count]) => ({
        label: withFlag ? `${getFlag(label)} ${label}` : label,
        count,
        pct: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
      }));
  }

  const countries = groupBy("country", true);
  const languages = groupBy("language");
  const interests = groupBy("interests");

  const activity = [...safeMetrics]
    .sort((a: AdMetric, b: AdMetric) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((m: AdMetric, i: number) => ({ ...m, id: String(i) }));

  const activeAds = new Set(
    safeMetrics.filter((m: AdMetric) => m.type === "impression").map((m: AdMetric) => m.post_id)
  ).size;

  return { totalEarnings, totalEstimatedWLD, impressions, clicks, ctr, activeAds, chartData, topPosts, postEarnings, countries, languages, interests, activity };
}
