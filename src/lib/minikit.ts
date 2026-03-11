import { MiniKit } from "@worldcoin/minikit-js";

export function isMiniKitInstalled(): boolean {
  try {
    return MiniKit.isInstalled();
  } catch {
    return false;
  }
}

export function getWalletAddress(): string | null {
  try {
    return MiniKit.walletAddress ?? null;
  } catch {
    return null;
  }
}

export function getMiniKit() {
  return MiniKit;
}
