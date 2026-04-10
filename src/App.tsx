import React, { useState, useEffect, useRef } from "react";
  import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
  import { useTheme } from "./lib/ThemeContext";
  import HomePage from "./pages/HomePage";

  const App = () => {
    const [wallet, setWallet] = useState<string | null>(null);
    const [verified, setVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [miniKitReady, setMiniKitReady] = useState(false);
    const [orbVerifying, setOrbVerifying] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);
    const walletLoading = useRef(false);

    const { setUsername: setGlobalUsername } = useTheme();

    // Espera MiniKit hasta maxAttempts × 250ms
    const waitForMiniKit = (maxAttempts: number): Promise<boolean> =>
      new Promise((resolve) => {
        if (MiniKit.isInstalled()) { resolve(true); return; }
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (MiniKit.isInstalled()) {
            clearInterval(interval);
            resolve(true);
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            resolve(false);
          }
        }, 250);
      });

    const applyMiniKitUser = () => {
      if (MiniKit.user) {
        const u = MiniKit.user.username || null;
        const a = MiniKit.user.avatar_url || null;
        if (u) { setUsername(u); setGlobalUsername(u); }
        if (a) setAvatar(a);
      }
    };

    useEffect(() => {
      const storedId = localStorage.getItem("userId");

      if (storedId) {
        // ── USUARIO RECURRENTE: muestra la app de inmediato ──
        setUserId(storedId);
        setVerified(true);
        // MiniKit se inicializa en background sin bloquear la UI
        (async () => {
          const ready = await waitForMiniKit(4); // máximo 1s
          if (ready) {
            setMiniKitReady(true);
            applyMiniKitUser();
          }
        })();
        return;
      }

      // ── USUARIO NUEVO: espera MiniKit máximo 1s ──
      (async () => {
        try {
          const ready = await waitForMiniKit(4); // 4 × 250ms = 1s máximo
          if (!ready) {
            setError("Abre esta app desde World App");
            return;
          }
          setMiniKitReady(true);
          applyMiniKitUser();
          await runVerification();
        } catch (err) {
          console.error("[APP] Init error:", err);
          setError("Error inicializando la app");
        }
      })();
    }, []);

    useEffect(() => {
      const loadWallet = async () => {
        if (!verified || wallet || verifying || !miniKitReady || walletLoading.current) return;
        walletLoading.current = true;

        try {
          const nonceRes = await fetch("/api/nonce");
          if (!nonceRes.ok) throw new Error("No se pudo obtener nonce");
          const { nonce } = await nonceRes.json();

          const auth = await MiniKit.commandsAsync.walletAuth({
            nonce,
            requestId: "wallet-auth-" + Date.now(),
            expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            notBefore: new Date(Date.now() - 60 * 1000),
            statement: "Autenticar wallet para H humans",
          });

          const payload = auth?.finalPayload;

          if (payload?.status === "error") {
            console.warn("[APP] WalletAuth error:", payload);
          } else if (payload?.address && payload?.message && payload?.signature) {
            try {
              const vRes = await fetch("/api/walletVerify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payload, nonce, userId }),
              });
              const vData = await vRes.json();
              if (vData.success) {
                setWallet(vData.address);
              }
            } catch (e) {
              console.warn("[APP] Wallet verify error:", e);
            }
          }

          // Fetch username + avatar desde Worldcoin API
          const resolvedAddress = wallet || payload?.address || MiniKit.walletAddress;
          if (resolvedAddress) {
            try {
              const wcRes = await fetch(`https://usernames.worldcoin.org/api/v1/${resolvedAddress}`);
              if (wcRes.ok) {
                const wcData = await wcRes.json();
                const u = wcData.username || null;
                const a = wcData.profile_picture_url || wcData.profilePictureUrl || null;
                if (u) { setUsername(u); setGlobalUsername(u); }
                if (a) setAvatar(a);
              }
            } catch (e) {
              console.warn("[APP] Worldcoin username API error:", e);
            }
          }

          // Fallback a MiniKit.user
          if (!username && MiniKit.user) {
            const u = MiniKit.user.username || null;
            const a = MiniKit.user.avatar_url || MiniKit.user.profilePictureUrl || null;
            if (u) { setUsername(u); setGlobalUsername(u); }
            if (a) setAvatar(a);
          }
        } catch (err: any) {
          console.error("[APP] Error walletAuth:", err);
        } finally {
          walletLoading.current = false;
        }
      };

      loadWallet();
    }, [verified, wallet, verifying, miniKitReady]);

    const runVerification = async () => {
      setVerifying(true);
      setError(null);

      try {
        if (!MiniKit.isInstalled()) throw new Error("MiniKit no instalado");

        const verifyRes = await MiniKit.commandsAsync.verify({
          action: "verify-user",
          verification_level: VerificationLevel.Device,
        });

        const proof = verifyRes?.finalPayload;
        if (!proof) throw new Error("No se recibió proof");

        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: proof }),
        });

        if (!res.ok) {
          const text = await res.text();
          if (text.includes("already verified") && proof.nullifier_hash) {
            const id = proof.nullifier_hash;
            localStorage.setItem("userId", id);
            setUserId(id);
            setVerified(true);
            return;
          } else {
            throw new Error("Error de verificación. Intenta de nuevo.");
          }
        }

        const backend = await res.json();

        if (backend.success && proof.nullifier_hash) {
          const id = proof.nullifier_hash;
          localStorage.setItem("userId", id);
          setUserId(id);
          setVerified(true);
        } else {
          throw new Error(backend.error || "Backend rechazó la prueba");
        }
      } catch (err: any) {
        console.error("[APP] Verify error:", err);
        setError(err.message || "Error verificando usuario");
      } finally {
        setVerifying(false);
      }
    };

    const verifyUser = async () => {
      if (verifying || !miniKitReady) return;
      await runVerification();
    };

    const verifyOrb = async (): Promise<{ success: boolean; proof?: any }> => {
      if (!miniKitReady || orbVerifying) return { success: false };
      setOrbVerifying(true);
      try {
        const verifyRes = await MiniKit.commandsAsync.verify({
          action: "user-orb",
          signal: wallet ?? "",
          verification_level: VerificationLevel.Orb,
        });
        const proof = verifyRes?.finalPayload;
        if (proof?.status === "error") {
          console.warn("[APP] Orb verify error:", proof.error_code);
          return { success: false };
        }
        if (proof && proof.verification_level === "orb") {
          return { success: true, proof };
        }
        return { success: false };
      } catch (err: any) {
        console.error("[APP] Orb verify failed:", err);
        return { success: false };
      } finally {
        setOrbVerifying(false);
      }
    };

    return (
      <HomePage
        userId={userId}
        verifyUser={verifyUser}
        verified={verified}
        wallet={wallet}
        username={username}
        avatar={avatar}
        error={error}
        verifying={verifying}
        setUserId={setUserId}
        verifyOrb={verifyOrb}
      />
    );
  };

  export default App;
  