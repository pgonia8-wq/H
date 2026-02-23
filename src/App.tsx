import React, { useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

export default function App() {
  const [wallet, setWallet] = useState<string | null>("loading");

  useEffect(() => {
    const init = async () => {
      console.log("MiniKit:", MiniKit);
      console.log("isInstalled:", MiniKit.isInstalled());

      if (!MiniKit.isInstalled()) {
        setWallet("NOT INSTALLED");
        return;
      }

      try {
        const result = await MiniKit.commandsAsync.getWallet();
        console.log("FULL RESULT:", result);

        if (result && result.address) {
          setWallet(result.address);
        } else {
          setWallet("NULL RESULT");
        }
      } catch (e) {
        console.error(e);
        setWallet("ERROR");
      }
    };

    setTimeout(init, 1500);
  }, []);

  return (
    <div style={{ background: "black", color: "white", height: "100vh", padding: 20 }}>
      <h2>Wallet Test</h2>
      <p>{wallet}</p>
    </div>
  );
}
