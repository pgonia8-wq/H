/**
 * ShellContext — Navegación interna del trade shell.
 * NO gestiona auth: userId/wallet/orb/verifyOrb vienen como props de App.tsx.
 * ONCHAIN WINS: nunca mutamos estado de totem aquí; solo navegación.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Screen = "discovery" | "token" | "creator" | "profile";

export interface ShellCtx {
  // auth passthrough
  userId:          string;
  walletAddress:   string | null;
  isOrbVerified:   boolean;
  verifyOrb:       () => Promise<void>;
  onOrbVerifiedChange: (v: boolean) => void;
  // nav
  screen:          Screen;
  setScreen:       (s: Screen) => void;
  selectedAddress: string | null;
  openToken:       (address: string) => void;
  closeToken:      () => void;
  openCreator:     () => void;
  closeCreator:    () => void;
  goBack:          () => void;
  // close whole shell
  onClose:         () => void;
}

const Ctx = createContext<ShellCtx | null>(null);

export function useShell(): ShellCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShell must be used inside <ShellProvider>");
  return v;
}

interface Props {
  userId:          string;
  walletAddress:   string | null;
  isOrbVerified:   boolean;
  verifyOrb:       () => Promise<void>;
  onOrbVerifiedChange: (v: boolean) => void;
  onClose:         () => void;
  children:        React.ReactNode;
}

export function ShellProvider({
  userId, walletAddress, isOrbVerified, verifyOrb, onOrbVerifiedChange, onClose, children,
}: Props) {
  const [screen,  setScreen]  = useState<Screen>("discovery");
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const openToken = useCallback((address: string) => {
    setSelectedAddress(address);
    setScreen("token");
  }, []);
  const closeToken = useCallback(() => {
    setSelectedAddress(null);
    setScreen("discovery");
  }, []);
  const openCreator  = useCallback(() => setScreen("creator"), []);
  const closeCreator = useCallback(() => setScreen("discovery"), []);
  const goBack = useCallback(() => {
    if (screen === "token")   { closeToken();   return; }
    if (screen === "creator") { closeCreator(); return; }
    if (screen === "profile") { setScreen("discovery"); return; }
    onClose();
  }, [screen, closeToken, closeCreator, onClose]);

  const value: ShellCtx = useMemo(() => ({
    userId, walletAddress, isOrbVerified, verifyOrb, onOrbVerifiedChange,
    screen, setScreen,
    selectedAddress, openToken, closeToken,
    openCreator, closeCreator, goBack, onClose,
  }), [
    userId, walletAddress, isOrbVerified, verifyOrb, onOrbVerifiedChange,
    screen, selectedAddress, openToken, closeToken, openCreator, closeCreator, goBack, onClose,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
