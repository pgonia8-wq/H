import React, { useState, useEffect, useRef } from "react";
  import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
  import { useTheme } from "./lib/ThemeContext";
  import HomePage from "./pages/HomePage";

  const APP_ID = (import.meta as any).env?.VITE_APP_ID ?? "";

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

    useEffect(() => {
      const t0 = Date.now();
      console.log("[ERUDA:INIT] ▶ App init started", { ts: t0 });

      const storedId = localStorage.getItem("userId");
      if (storedId) {
        setUserId(storedId);
        setVerified(true);
        console.log("[ERUDA:INIT] ✅ Returning user — verified from cache");
      }

      const cachedWallet = localStorage.getItem("wallet");
      if (cachedWallet) {
        setWallet(cachedWallet);
        console.log("[ERUDA:INIT] ⚡ Wallet from cache:", cachedWallet.slice(0, 10) + "...");
      }

      setTimeout(() => {
        const pollStart = Date.now();
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          const installed = MiniKit.isInstalled();
          if (installed || attempts >= 10) {
            clearInterval(interval);
            console.log("[ERUDA:POLL] MiniKit poll done. installed:", installed, "(" + (Date.now() - pollStart) + "ms)");
            setMiniKitReady(true);
            try {
              MiniKit.commands.appReady();
              console.log("[ERUDA:POLL] ✅ appReady() called");
            } catch (_) {
              try { (MiniKit.commands as any).ready(); } catch (_2) {}
            }
            if (MiniKit.user) {
              const u = MiniKit.user.username || null;
              const a = MiniKit.user.avatar_url || null;
              if (u) { setUsername(u); setGlobalUsername(u); }
              if (a) setAvatar(a);
            }
          }
        }, 100);
      }, 0);

      console.log("[ERUDA:INIT] ◀ Init done (sync) in " + (Date.now() - t0) + "ms");
    }, []);

    useEffect(() => {
      if (!verified || wallet || verifying || !miniKitReady || walletLoading.current) {
        return;
      }

      if (localStorage.getItem("wallet")) {
        setWallet(localStorage.getItem("wallet")!);
        console.log("[ERUDA:WALLET] ⚡ Cache hit on effect — skip walletAuth");
        return;
      }

      walletLoading.current = true;
      console.log("[ERUDA:WALLET] 🔄 walletAuth starting (fire-and-forget)...");

      fetch("/api/nonce")
        .then(r => {
          if (!r.ok) throw new Error("nonce failed: " + r.status);
          return r.json();
        })
        .then(({ nonce }) => {
          console.log("[ERUDA:WALLET] Nonce received, calling walletAuth...");
          const t1 = Date.now();
          MiniKit.commandsAsync.walletAuth({
            nonce,
            requestId: "wallet-auth-" + Date.now(),
            expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            notBefore: new Date(Date.now() - 60 * 1000),
            statement: "Autenticar wallet para H humans",
          }).then((auth: any) => {
            console.log("[ERUDA:WALLET] walletAuth resolved (" + (Date.now() - t1) + "ms)");
            const payload = auth?.finalPayload;
            if (payload?.status === "error") {
              console.warn("[ERUDA:WALLET] ❌ walletAuth error:", JSON.stringify(payload));
              walletLoading.current = false;
              return;
            }
            if (payload?.address && payload?.message && payload?.signature) {
              console.log("[ERUDA:WALLET] ✅ walletAuth success:", payload.address.slice(0, 10) + "...");
              fetch("/api/walletVerify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payload, nonce, userId }),
              })
                .then(r => r.json())
                .then(vData => {
                  if (vData.success) {
                    setWallet(vData.address);
                    localStorage.setItem("wallet", vData.address);
                    console.log("[ERUDA:WALLET] ✅ Wallet cached:", vData.address.slice(0, 10) + "...");
                  } else {
                    console.warn("[ERUDA:WALLET] ❌ walletVerify rejected:", vData.error);
                  }
                  walletLoading.current = false;
                })
                .catch(e => {
                  console.warn("[ERUDA:WALLET] ❌ walletVerify error:", e);
                  walletLoading.current = false;
                });

              const addr = payload.address || MiniKit.walletAddress;
              if (addr) {
                fetch(`https://usernames.worldcoin.org/api/v1/${addr}`)
                  .then(r => r.ok ? r.json() : null)
                  .then(data => {
                    if (data) {
                      const u = data.username || null;
                      const a = data.profile_picture_url || data.profilePictureUrl || null;
                      if (u) { setUsername(u); setGlobalUsername(u); }
                      if (a) setAvatar(a);
                    }
                  })
                  .catch(() => {});
              }
            } else {
              console.warn("[ERUDA:WALLET] ⚠ No address in payload");
              walletLoading.current = false;
            }
          }).catch((err: any) => {
            console.warn("[ERUDA:WALLET] ⚠ walletAuth failed:", err.message);
            walletLoading.current = false;
          });
        })
        .catch(err => {
          console.warn("[ERUDA:WALLET] ⚠ nonce fetch failed:", err.message);
          walletLoading.current = false;
        });
    }, [verified, wallet, verifying, miniKitReady]);

    const runVerification = async () => {
      console.log("[ERUDA:VERIFY] ▶ runVerification started");
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
        console.error("[ERUDA:VERIFY] ❌ Error:", err);
        setError(err.message || "Error verificando usuario");
      } finally {
        setVerifying(false);
      }
    };

    const verifyUser = async () => {
      if (verifying) return;
      if (!miniKitReady) {
        let attempts = 0;
        while (!MiniKit.isInstalled() && attempts < 10) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }
        if (!MiniKit.isInstalled()) {
          setError("Abre esta app dentro de World App");
          return;
        }
        setMiniKitReady(true);
      }
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
        if (proof?.status === "error") return { success: false };
        if (proof && proof.verification_level === "orb") return { success: true, proof };
        return { success: false };
      } catch (err: any) {
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
  