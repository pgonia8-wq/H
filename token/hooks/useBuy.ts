import { useState } from "react";
import { api, type BuyRequest } from "@/services/api";
import type { BuyResult } from "@/services/types";

interface UseBuyResult {
  buy: (request: BuyRequest) => Promise<BuyResult>;
  loading: boolean;
  error: string | null;
  result: BuyResult | null;
  reset: () => void;
}

export function useBuy(): UseBuyResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BuyResult | null>(null);

  const buy = async (request: BuyRequest): Promise<BuyResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.buyToken(request);
      setResult(res);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Purchase failed";
      setError(msg);
      const failed: BuyResult = { success: false, message: msg, tokensReceived: 0, fee: 0, avgPrice: 0, newPrice: 0, newPriceUsd: 0, newSupply: 0, curvePercent: 0 };
      setResult(failed);
      return failed;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setResult(null);
  };

  return { buy, loading, error, result, reset };
}
