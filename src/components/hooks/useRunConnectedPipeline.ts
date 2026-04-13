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

export function useRunConnectedPipeline(): UseRunConnectedPipelineReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (params: RunPipelineParams): Promise<RunPipelineResult> => {
      const { category, account, topic, count } = params;

      setIsLoading(true);
      setError(null);

      try {
        const { data: fnData, error: fnError } =
          await supabase.functions.invoke<any>("generate-posts", {
            body: { category, account, topic, count },
          });

        if (fnError) {
          throw new Error(`Content generation unavailable: ${fnError.message}`);
        }

        if (!fnData || !fnData.posts) {
          throw new Error("Content generation returned no posts");
        }

        const topics: string[] = Array.from({ length: count }, (_, i) =>
          i === 0 ? topic : `${topic} — angle ${i + 1}`
        );

        return {
          queued: fnData.posts.length ?? count,
          topics,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown pipeline error";

        console.error("❌ [Pipeline] Error:", message);
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
