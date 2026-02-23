import { useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

export function useMiniKitUser() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState("initializing");

  useEffect(() => {
    const init = async () => {
      if (!MiniKit.isInstalled()) {
        setStatus("not-installed");
        return;
      }

      try {
        // 👇 ESTA ES LA CLAVE
        const wallet = await MiniKit.commandsAsync.getWallet();

        console.log("Wallet RAW:", wallet);

        if (wallet?.address) {
          setWalletAddress(wallet.address);
          setStatus("found");
        } else {
          setStatus("no-wallet");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    // Espera 1 segundo antes de pedir wallet
    setTimeout(init, 1000);
  }, []);

  return { walletAddress, status };
}
