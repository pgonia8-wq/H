import { ReactNode, useEffect, useState } from "react";
    import { MiniKit } from "@worldcoin/minikit-js";

    export default function MiniKitProvider({ children }: { children: ReactNode }) {
      const [ready, setReady] = useState(false);

      useEffect(() => {
        const appId = (import.meta as any).env?.VITE_APP_ID || "";
        console.log("[MiniKitProvider] Installing with appId:", appId);

        try {
          MiniKit.install(appId);
          console.log("[MiniKitProvider] isInstalled:", MiniKit.isInstalled());
          console.log("[MiniKitProvider] user:", JSON.stringify((MiniKit as any).user));
        } catch (err) {
          console.error("[MiniKitProvider] Install error:", err);
        }

        setReady(true);
      }, []);

      if (!ready) return null;

      return <>{children}</>;
    }
  