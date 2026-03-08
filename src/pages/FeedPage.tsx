import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { supabase } from '../supabaseClient';
import { MiniKit } from '@worldcoin/minikit-js';

const PAGE_SIZE = 8;

interface Post {
  id: string;
  content?: string;
  timestamp: string;
  profile?: {
    username?: string;
  };
  [key: string]: any;
}

interface FeedPageProps {
  posts: Post[];
  loading?: boolean;
  error?: string | null;
  currentUserId: string | null;
  userTier: "free" | "basic" | "premium" | "premium+";
}

const FeedPage: React.FC<FeedPageProps> = ({ posts, loading, error, currentUserId, userTier }) => {
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"premium" | "premium+" | null>(null);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [slotsLeft, setSlotsLeft] = useState<number>(0);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);

  useEffect(() => {
    if (selectedTier) {
      const fetchPriceAndSlots = async () => {
        const { count } = await supabase
          .from("upgrades")
          .select("*", { count: "exact" })
          .eq("tier", selectedTier);

        const limit = selectedTier === "premium" ? 10000 : 3000;
        setSlotsLeft(limit - (count || 0));
        setPrice(count < limit ? (selectedTier === "premium" ? 10 : 15) : (selectedTier === "premium" ? 20 : 35));
      };
      fetchPriceAndSlots();
    }
  }, [selectedTier]);

  const handleUpgrade = () => {
    setShowUpgradeOptions(true);
  };

  const selectTier = (tier: "premium" | "premium+") => {
    setSelectedTier(tier);
    setShowSlideModal(true);
  };

  const cancelUpgrade = () => {
    setShowSlideModal(false);
    setSelectedTier(null);
    setShowUpgradeOptions(false);
  };

  const confirmUpgrade = async () => {
    if (!currentUserId || !selectedTier) {
      setUpgradeError("No se encontró tu ID o tier seleccionado.");
      return;
    }

    setLoadingUpgrade(true);
    setUpgradeError(null);
    setShowInsufficientFunds(false);
    console.log("[UPGRADE] Iniciando pago para tier:", selectedTier, "precio:", price, "userId:", currentUserId);

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit no instalado o World App no detectada");
      }

      // Si wallet undefined, autentica wallet con walletAuth (pide firma por código)
      if (!MiniKit.walletAddress) {
        console.log("[UPGRADE] Autenticando wallet con walletAuth...");
        const res = await fetch('/api/nonce')  // Backend genera nonce
        const { nonce } = await res.json();

        const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
          nonce: nonce,
          requestId: '0', // Optional
          expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
          notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          statement: 'Autenticar wallet para upgrade',
        });

        if (finalPayload.status !== 'success') {
          throw new Error("Autenticación de wallet fallida");
        }

        console.log("[UPGRADE] Wallet autenticada:", MiniKit.walletAddress);
      }

      // Pago real con MiniKit (cobra WLD)
      const payRes = await MiniKit.commandsAsync.pay({
        amount: price,
        currency: 'WLD',
        recipient: '0x4df4a99b05945b0594db02127ad3cdffea619f4cb',  // tu wallet
      });
      console.log("[UPGRADE] Pago respuesta:", payRes);

      if (payRes.status !== "success") {
        if (payRes.error?.includes("insufficient") || payRes.error?.includes("funds")) {
          setShowInsufficientFunds(true);
          throw new Error("Fondos insuficientes en tu wallet");
        }
        throw new Error("Pago cancelado o fallido");
      }

      const transactionId = payRes.transactionId;
      console.log("[UPGRADE] txId obtenido:", transactionId);

      // Enviar a backend
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, tier: selectedTier, transactionId }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }

      const data = await res.json();
      console.log("[UPGRADE] Backend respuesta:", data);

      if (!data.success) throw new Error(data.error || "Error al procesar upgrade");

      alert(`¡Upgrade a ${selectedTier} exitoso! Precio: ${price} WLD. Tu referral token: ${data.referralToken}`);
      setUserTier(selectedTier);
      cancelUpgrade();
    } catch (err: any) {
      console.error("[UPGRADE] Error completo:", err);
      setUpgradeError(err.message || "Error al procesar el upgrade");
    } finally {
      setLoadingUpgrade(false);
    }
  };

  // ... resto del código igual (handleUpgrade, selectTier, return, etc.)
};

export default FeedPage;
