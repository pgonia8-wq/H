export const LIKE_VALUE_WLD = 0.001;
export const BOOST_VALUE_MULTIPLIER = 0.01;
export const DAILY_LIKE_CAP = 50;

const LIKE_TRACK_KEY = "like_tracking_v1";

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getLikeTracking(): Record<string, Record<string, number>> {
  try {
    return JSON.parse(localStorage.getItem(LIKE_TRACK_KEY) || "{}");
  } catch {
    return {};
  }
}

function setLikeTracking(data: Record<string, Record<string, number>>): void {
  try {
    localStorage.setItem(LIKE_TRACK_KEY, JSON.stringify(data));
  } catch {}
}

export function getDailyLikeCount(userId: string | null): number {
  if (!userId) return 0;
  const data = getLikeTracking();
  const today = getTodayKey();
  return data?.[userId]?.[today] ?? 0;
}

export function incrementLikeCount(userId: string | null): void {
  if (!userId) return;
  const data = getLikeTracking();
  const today = getTodayKey();

  if (!data[userId]) data[userId] = {};
  if (!data[userId][today]) data[userId][today] = 0;

  data[userId][today] += 1;

  setLikeTracking(data);
}

export function getLikeMultiplier(userId: string | null): number {
  const count = getDailyLikeCount(userId);
  if (count < 20) return 1;
  if (count < DAILY_LIKE_CAP) return 0.5;
  return 0.1;
}

export function calculatePostEarnings(post: any, viewerId?: string | null): number {
  const likes = post?.likes ?? 0;
  const tips = post?.tips_total ?? 0;
  const boost = post?.boost_score ?? 0;

  const likeMultiplier = viewerId ? getLikeMultiplier(viewerId) : 1;

  const likeValue = likes * LIKE_VALUE_WLD * likeMultiplier;

  return (
    tips * 0.7 +
    likeValue +
    boost * BOOST_VALUE_MULTIPLIER
  );
}
