import { useState } from "react";
import { api, type SellRequest } from "@/services/api";
import type { SellResult } from "@/services/types";

interface UseSellResult {
  sell: (request: SellRequest) => Promise<SellResult>;
  loading: boolean;
  error: string | null;
  result: SellResult | null;
  reset: () => void;
}

export function useSell(): UseSellResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SellResult | null>(null);

  const sell = async (request: SellRequest): Promise<SellResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.sellToken(request);
      setResult(res);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sell failed";
      setError(msg);
      const failed: SellResult = { success: false, message: msg, wldReceived: 0, fee: 0, grossWld: 0, avgPrice: 0, newPrice: 0, newPriceUsd: 0, newSupply: 0, curvePercent: 0 };
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

  return { sell, loading, error, result, reset };
}
