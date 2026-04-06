import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Screen = "discovery" | "token" | "airdrops" | "profile" | "creator";

export interface WorldAppUser {
  id: string;
  username: string;
  profilePicture?: string;
  verificationLevel?: "orb" | "device";
}

export interface AppState {
  user: WorldAppUser | null;
  balanceWld: number;
  balanceUsdc: number;
  screen: Screen;
  selectedTokenId: string | null;
  selectedAirdropId: string | null;
  isCreatorModalOpen: boolean;
  worldAppReady: boolean;
}

interface AppContextValue extends AppState {
  navigate: (screen: Screen, params?: { tokenId?: string; airdropId?: string }) => void;
  openCreatorDashboard: () => void;
  closeCreatorDashboard: () => void;
  emitToBridge: (event: string, payload?: unknown) => void;
  updateBalance: (wld: number, usdc: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const MOCK_USER: WorldAppUser = {
  id: "usr_0x1a2b3c4d",
  username: "worlduser.eth",
  profilePicture: "",
  verificationLevel: "orb",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    balanceWld: 0,
    balanceUsdc: 0,
    screen: "discovery",
    selectedTokenId: null,
    selectedAirdropId: null,
    isCreatorModalOpen: false,
    worldAppReady: false,
  });

  useEffect(() => {
    let contextReceived = false;

    const handler = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== "object") return;
      const { type, payload } = e.data;

      if (type === "WORLD_APP_CONTEXT") {
        contextReceived = true;
        setState((s) => ({
          ...s,
          user: {
            id: payload?.userId ?? s.user?.id ?? "usr_guest",
            username: payload?.username ?? s.user?.username ?? "guest",
            profilePicture: payload?.profilePicture ?? "",
            verificationLevel: payload?.verificationLevel ?? "orb",
          },
          balanceWld: payload?.balanceWld ?? s.balanceWld,
          balanceUsdc: payload?.balanceUsdc ?? s.balanceUsdc,
          worldAppReady: true,
        }));
      }
    };

    window.addEventListener("message", handler);

    const origin = (import.meta as any).env?.VITE_PARENT_ORIGIN || "*";

    const retryInterval = setInterval(() => {
      if (contextReceived) { clearInterval(retryInterval); return; }
      window.parent?.postMessage({ type: "MINI_APP_READY" }, origin);
    }, 1000);

    window.parent?.postMessage({ type: "MINI_APP_READY" }, origin);

    const fallbackTimer = setTimeout(() => {
      if (!contextReceived) {
        console.warn("[AppContext] Parent no respondió en 5s, continuando sin contexto");
        setState((s) => ({ ...s, worldAppReady: true }));
      }
    }, 5000);

    return () => {
      window.removeEventListener("message", handler);
      clearInterval(retryInterval);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const emitToBridge = (event: string, payload?: unknown) => {
    const origin = (import.meta as any).env?.VITE_PARENT_ORIGIN || "*";
    window.parent?.postMessage({ type: event, payload }, origin);
  };

  const navigate = (screen: Screen, params?: { tokenId?: string; airdropId?: string }) => {
    setState((s) => ({
      ...s,
      screen,
      selectedTokenId: params?.tokenId ?? s.selectedTokenId,
      selectedAirdropId: params?.airdropId ?? s.selectedAirdropId,
    }));
  };

  const openCreatorDashboard = () =>
    setState((s) => ({ ...s, isCreatorModalOpen: true }));
  const closeCreatorDashboard = () =>
    setState((s) => ({ ...s, isCreatorModalOpen: false }));

  const updateBalance = (wld: number, usdc: number) =>
    setState((s) => ({ ...s, balanceWld: wld, balanceUsdc: usdc }));

  return (
    <AppContext.Provider
      value={{ ...state, navigate, openCreatorDashboard, closeCreatorDashboard, emitToBridge, updateBalance }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
