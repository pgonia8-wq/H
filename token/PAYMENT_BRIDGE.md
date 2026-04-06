# Payment Bridge — HomePage handler for Token mini-app

The Token mini-app (iframe) sends `REQUEST_PAYMENT` to the parent via `postMessage`.
The parent (HomePage) must listen for this, execute `MiniKit.commandsAsync.pay()`,
and send back `PAYMENT_RESULT`.

## Add to `/src/pages/HomePage.tsx`

### 1. Add imports (near the top)

```ts
import { MiniKit, Tokens, tokenToDecimals } from "@worldcoin/minikit-js";
```

### 2. Add receiver constant (after TOKEN_APP_URL)

```ts
const RECEIVER = (import.meta as any).env?.VITE_PAYMENT_RECEIVER ?? "";
```

### 3. Add generatePayReference helper

```ts
function generatePayReference(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
```

### 4. Replace the existing postMessage useEffect (lines ~302-312) with:

```ts
useEffect(() => {
  const handler = async (e: MessageEvent) => {
    if (!e.data || typeof e.data !== "object") return;
    const { type, payload } = e.data as { type: string; payload?: any };

    if (type === "MINI_APP_READY") {
      injectTokenContext();
      return;
    }

    // Payment bridge: Token iframe requests payment → we execute MiniKit
    if (type === "REQUEST_PAYMENT") {
      const win = tokenIframeRef.current?.contentWindow;
      if (!win) return;

      try {
        if (!MiniKit.isInstalled()) {
          win.postMessage({
            type: "PAYMENT_RESULT",
            payload: { success: false, error: "World App not detected" },
          }, TOKEN_APP_URL || "*");
          return;
        }

        const amount = payload?.amount ?? 0;
        const description = payload?.description ?? "Token Market payment";
        const receiver = payload?.to || RECEIVER;

        const payRes = await MiniKit.commandsAsync.pay({
          reference: generatePayReference(),
          to: receiver,
          tokens: [{
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(amount, Tokens.WLD).toString(),
          }],
          description,
        });

        if (payRes?.finalPayload?.status === "success") {
          win.postMessage({
            type: "PAYMENT_RESULT",
            payload: {
              success: true,
              transactionId: payRes.finalPayload.transaction_id,
            },
          }, TOKEN_APP_URL || "*");
        } else {
          win.postMessage({
            type: "PAYMENT_RESULT",
            payload: {
              success: false,
              error: "Payment cancelled or failed",
            },
          }, TOKEN_APP_URL || "*");
        }
      } catch (err: any) {
        const win2 = tokenIframeRef.current?.contentWindow;
        win2?.postMessage({
          type: "PAYMENT_RESULT",
          payload: { success: false, error: err.message || "Payment error" },
        }, TOKEN_APP_URL || "*");
      }
    }
  };

  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}, [injectTokenContext]);
```

This replaces the old `useEffect` that only listened for `MINI_APP_READY`.
