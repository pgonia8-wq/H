import {
  MOCK_TOKENS,
  MOCK_AIRDROPS,
  MOCK_HOLDINGS,
  MOCK_ACTIVITY,
  type Token,
  type Airdrop,
  type Holding,
  type ActivityItem,
} from "./mockData";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export interface TokenListResponse {
  tokens: Token[];
  total: number;
  hasMore: boolean;
}

export interface AirdropListResponse {
  airdrops: Airdrop[];
  total: number;
}

export interface HoldingsResponse {
  holdings: Holding[];
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
}

export interface ActivityListResponse {
  activities: ActivityItem[];
  total: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  balanceUsdc: number;
  balanceWld: number;
  totalValue: number;
  tokensCreated: number;
  tokensHeld: number;
  joinedAt: string;
}

export interface BuyRequest {
  tokenId: string;
  amount: number;
  currency: "WLD" | "USDC";
  userId: string;
  paymentMethod: "WLD" | "STRIPE" | "MERCADOPAGO";
}

export interface SellRequest {
  tokenId: string;
  amount: number;
  userId: string;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  amount?: number;
  price?: number;
  total?: number;
  message: string;
}

export interface ClaimAirdropRequest {
  airdropId: string;
  userId: string;
}

export interface ClaimResult {
  success: boolean;
  amount?: number;
  nextClaimAt?: string;
  message: string;
}

export interface CreateTokenRequest {
  name: string;
  symbol: string;
  description: string;
  emoji?: string;
  totalSupply: number;
  creatorId: string;
  lockPercent?: number;
  lockDurationDays?: number;
}

export const api = {
  async getTokens(params?: { search?: string; sort?: string; limit?: number; offset?: number }): Promise<TokenListResponse> {
    try {
      const qs = new URLSearchParams(params as Record<string, string>).toString();
      return await request<TokenListResponse>(`/tokens${qs ? `?${qs}` : ""}`);
    } catch (err) {
      console.warn("[api.getTokens] API no disponible, usando datos locales:", (err as Error).message);
      let tokens = [...MOCK_TOKENS];
      if (params?.search) {
        const q = params.search.toLowerCase();
        tokens = tokens.filter((t) => t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q));
      }
      if (params?.sort === "trending") tokens.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
      if (params?.sort === "volume") tokens.sort((a, b) => b.volume24h - a.volume24h);
      if (params?.sort === "marketcap") tokens.sort((a, b) => b.marketCap - a.marketCap);
      return { tokens, total: tokens.length, hasMore: false };
    }
  },

  async getTrendingTokens(): Promise<TokenListResponse> {
    try {
      return await request<TokenListResponse>("/tokens/trending");
    } catch (err) {
      console.warn("[api.getTrendingTokens] API no disponible, usando datos locales:", (err as Error).message);
      const tokens = MOCK_TOKENS.filter((t) => t.isTrending);
      return { tokens, total: tokens.length, hasMore: false };
    }
  },

  async getToken(id: string): Promise<Token> {
    try {
      return await request<Token>(`/tokens/${id}`);
    } catch (err) {
      console.warn("[api.getToken] API no disponible, usando datos locales:", (err as Error).message);
      const token = MOCK_TOKENS.find((t) => t.id === id);
      if (!token) throw new Error("Token not found");
      return token;
    }
  },

  async getTokenActivity(id: string, limit = 20): Promise<ActivityListResponse> {
    try {
      return await request<ActivityListResponse>(`/tokens/${id}/activity?limit=${limit}`);
    } catch (err) {
      console.warn("[api.getTokenActivity] API no disponible, usando datos locales:", (err as Error).message);
      const activities = MOCK_ACTIVITY.filter((a) => a.tokenId === id);
      return { activities, total: activities.length };
    }
  },

  async buyToken(body: BuyRequest): Promise<TransactionResult> {
    return await request<TransactionResult>(`/tokens/${body.tokenId}/buy`, {
      method: "POST",
      body: JSON.stringify({
        amount: body.amount,
        currency: body.currency,
        userId: body.userId,
        paymentMethod: body.paymentMethod,
      }),
    });
  },

  async sellToken(body: SellRequest): Promise<TransactionResult> {
    return await request<TransactionResult>(`/tokens/${body.tokenId}/sell`, {
      method: "POST",
      body: JSON.stringify({
        amount: body.amount,
        userId: body.userId,
      }),
    });
  },

  async getAirdrops(userId?: string): Promise<AirdropListResponse> {
    try {
      const qs = userId ? `?user_id=${userId}` : "";
      return await request<AirdropListResponse>(`/airdrops${qs}`);
    } catch (err) {
      console.warn("[api.getAirdrops] API no disponible, usando datos locales:", (err as Error).message);
      return { airdrops: MOCK_AIRDROPS, total: MOCK_AIRDROPS.length };
    }
  },

  async getAirdrop(id: string): Promise<Airdrop> {
    try {
      return await request<Airdrop>(`/airdrops/${id}`);
    } catch (err) {
      console.warn("[api.getAirdrop] API no disponible, usando datos locales:", (err as Error).message);
      const a = MOCK_AIRDROPS.find((x) => x.id === id);
      if (!a) throw new Error("Airdrop not found");
      return a;
    }
  },

  async claimAirdrop(body: ClaimAirdropRequest): Promise<ClaimResult> {
    return await request<ClaimResult>(`/airdrops/${body.airdropId}/claim`, {
      method: "POST",
      body: JSON.stringify({ userId: body.userId }),
    });
  },

  async getUser(userId: string): Promise<UserProfile> {
    try {
      return await request<UserProfile>(`/user?user_id=${userId}`);
    } catch (err) {
      console.warn("[api.getUser] API no disponible, usando datos locales:", (err as Error).message);
      return {
        id: userId,
        username: "worlduser.eth",
        balanceUsdc: 380.0,
        balanceWld: 142.5,
        totalValue: 522.5,
        tokensCreated: 0,
        tokensHeld: 2,
        joinedAt: new Date().toISOString(),
      };
    }
  },

  async getUserHoldings(userId: string): Promise<HoldingsResponse> {
    try {
      return await request<HoldingsResponse>(`/user/holdings?user_id=${userId}`);
    } catch (err) {
      console.warn("[api.getUserHoldings] API no disponible, usando datos locales:", (err as Error).message);
      const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.value, 0);
      const totalPnl = MOCK_HOLDINGS.reduce((s, h) => s + h.pnl, 0);
      return {
        holdings: MOCK_HOLDINGS,
        totalValue,
        totalPnl,
        totalPnlPercent: (totalPnl / (totalValue - totalPnl)) * 100,
      };
    }
  },

  async getUserActivity(userId: string): Promise<ActivityListResponse> {
    try {
      return await request<ActivityListResponse>(`/user/activity?user_id=${userId}`);
    } catch (err) {
      console.warn("[api.getUserActivity] API no disponible, usando datos locales:", (err as Error).message);
      return { activities: MOCK_ACTIVITY, total: MOCK_ACTIVITY.length };
    }
  },

  async createToken(body: CreateTokenRequest): Promise<Token> {
    return await request<Token>("/creator/tokens", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
