/**
 * useRunConnectedPipeline
 *
 * Triggers the content generation pipeline via a Supabase Edge Function
 * ("generate-posts"). The function generates AI-crafted posts and inserts
 * them into the content_queue table with status = "queued".
 *
 * Falls back to a direct DB insert if the Edge Function is not deployed yet,
 * so the hook is usable during local development.
 */

import { useState, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import type { Category, OfficialAccount } from "../lib/database.types";

export interface RunPipelineParams {
  category: Category;
  account: OfficialAccount;
  topic: string;
  count: number;
}

export interface RunPipelineResult {
  queued: number;
  topics: string[];
}

export interface UseRunConnectedPipelineReturn {
  run: (params: RunPipelineParams) => Promise<RunPipelineResult>;
  isLoading: boolean;
  error: string | null;
}

// ─── Content templates ────────────────────────────────────────────────────────

const CONTENT_TEMPLATES: Record<Category, string[]> = {
  crypto_news: [
    "🚨 Breaking: {topic} — what this means for the market and how you can position yourself now.",
    "📰 Latest on {topic}. Here's the breakdown and what analysts are watching closely.",
    "💡 {topic} — the signal everyone in crypto missed this week.",
  ],
  market_analysis: [
    "📊 Deep dive on {topic} — key levels to watch and what the charts are telling us.",
    "🔍 {topic}: technical analysis breakdown with entry zones and risk management tips.",
    "⚡ {topic} alert — momentum building. Here's how to read the current structure.",
  ],
  worldcoin_updates: [
    "🌍 WLD update: {topic}. The Worldcoin ecosystem keeps expanding — stay ahead.",
    "🔵 World App news: {topic} — what this means for WLD holders and builders.",
    "🛡️ {topic}: World ID just got more powerful. Here's everything you need to know.",
  ],
  trading_signals: [
    "📈 Signal detected: {topic}. Risk/reward looking favorable. DYOR — not financial advice.",
    "🎯 {topic} setup forming on the charts. Key zone to watch in the next 24–48h.",
    "⚠️ {topic}: high probability setup. Here's the trade plan with stop-loss levels.",
  ],
  tech: [
    "🤖 {topic} — how this changes Web3 infrastructure and what builders need to know.",
    "🔧 Dev update: {topic}. The tools are getting better — here's what's shipping now.",
    "🚀 {topic}: the tech breakthrough that could reshape decentralized apps.",
  ],
  memecoins: [
    "🐕 {topic} is heating up — community activity through the roof. Eyes on this one.",
    "🎭 {topic}: the memecoin narrative is shifting. Here's what's moving the market.",
    "💎 {topic} spotted — early momentum, high attention. Classic signs of a run. DYOR.",
  ],
};

function generateContent(category: Category, topic: string): string {
  const templates = CONTENT_TEMPLATES[category];
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace(/\{topic\}/g, topic);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRunConnectedPipeline(): UseRunConnectedPipelineReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const run = useCallback(
    async (params: RunPipelineParams): Promise<RunPipelineResult> => {
      const { category, account, topic, count } = params;

      setIsLoading(true);
      setError(null);

      try {
        // ── Edge Function ─────────────────────────────────────────
        const { data: fnData, error: fnError } = await supabase.functions.invoke<RunPipelineResult>(
          "generate-posts",
          {
            body: { category, account, topic, count },
          }
        );

        if (!fnError && fnData) {
          console.log(
            `✅ [useRunConnectedPipeline] Edge Function queued ${fnData.queued} posts`
          );
          return fnData;
        }

        // ── Fallback ──────────────────────────────────────────────
        if (fnError) {
          console.warn(
            `⚠️ [useRunConnectedPipeline] Edge Function unavailable (${fnError.message}). Using fallback.`
          );
        }

        const topics: string[] = [];

        const rows = Array.from({ length: count }, (_, i) => {
          const postTopic = i === 0 ? topic : `${topic} — angle ${i + 1}`;
          topics.push(postTopic);

          return {
            category,
            account,
            topic:        postTopic,
            content:      generateContent(category, postTopic),
            status:       "queued" as const,
            published_at: null,
            scheduled_at: null,
          };
        });

        const { data: inserted, error: insertErr } = await supabase
          .from("content_queue")
          .insert(rows)
          .select("id");

        if (insertErr) throw new Error(insertErr.message);

        const queued = inserted?.length ?? 0;

        console.log(
          `✅ [useRunConnectedPipeline] Direct insert: ${queued} posts queued`
        );

        return { queued, topics };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown pipeline error";

        console.error("❌ [useRunConnectedPipeline] Error:", message);
        setError(message);

        return { queued: 0, topics: [] };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { run, isLoading, error };
}
