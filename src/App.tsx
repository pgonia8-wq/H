useEffect(() => {
  const test = async () => {
    console.log("isInstalled:", MiniKit.isInstalled());

    try {
      const wallet = await MiniKit.commandsAsync.getWallet();
      console.log("RAW getWallet result:", wallet);
    } catch (e) {
      console.error("getWallet error:", e);
    }
  };

  setTimeout(test, 1000);
}, []);
