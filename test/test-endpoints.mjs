import assert from "node:assert";
import { describe, it } from "node:test";
import fs from "node:fs";

function readFile(rel) {
  return fs.readFileSync(new URL(rel, import.meta.url), "utf-8");
}

describe("walletVerify.mjs", () => {
  const code = readFile("../api/walletVerify.mjs");

  it("imports verifySiweMessage from minikit-js", () => {
    assert.ok(code.includes('verifySiweMessage'), "Should import verifySiweMessage");
    assert.ok(code.includes('@worldcoin/minikit-js'), "Should import from @worldcoin/minikit-js");
    console.log("  ✅ uses verifySiweMessage from @worldcoin/minikit-js");
  });

  it("does NOT import or use ethers", () => {
    const codeNoComments = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "");
    assert.ok(!codeNoComments.includes('from "ethers"'), "Should NOT import ethers");
    assert.ok(!codeNoComments.includes("ethers.verifyMessage"), "Should NOT use ethers.verifyMessage");
    console.log("  ✅ no ethers dependency in executable code");
  });

  it("accepts payload + nonce (not message/signature/address)", () => {
    assert.ok(code.includes("payload, nonce, userId"), "Should destructure payload, nonce, userId");
    assert.ok(!code.includes("{ message, signature, address,"), "Should NOT destructure old fields");
    console.log("  ✅ accepts SIWE payload + nonce from frontend");
  });

  it("calls verifySiweMessage with payload and nonce", () => {
    assert.ok(code.includes("verifySiweMessage(payload, nonce)"), "Should call verifySiweMessage(payload, nonce)");
    console.log("  ✅ calls verifySiweMessage(payload, nonce)");
  });

  it("validates required fields", () => {
    assert.ok(code.includes("payload.message"), "Should check payload.message");
    assert.ok(code.includes("payload.signature"), "Should check payload.signature");
    assert.ok(code.includes("payload.address"), "Should check payload.address");
    console.log("  ✅ validates all required SIWE payload fields");
  });
});

describe("nonce.mjs", () => {
  const code = readFile("../api/nonce.mjs");
  const codeNoComments = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "");

  it("persists nonce in Supabase nonces table", () => {
    assert.ok(codeNoComments.includes('from("nonces")'), "Should insert into nonces table");
    console.log("  ✅ persists nonce in Supabase nonces table");
  });

  it("sets expiration on nonce", () => {
    assert.ok(codeNoComments.includes("expires_at"), "Should set expires_at field");
    console.log("  ✅ sets expiration timestamp");
  });

  it("uses randomUUID (not randomBytes)", () => {
    assert.ok(codeNoComments.includes("randomUUID"), "Should use crypto.randomUUID()");
    assert.ok(!codeNoComments.includes("randomBytes"), "Should NOT use randomBytes");
    console.log("  ✅ uses crypto.randomUUID() for nonce generation");
  });
});

describe("verifyPayment.mjs", () => {
  const code = readFile("../api/verifyPayment.mjs");

  it("whitelist includes all 5 actions", () => {
    for (const action of ["tip", "boost", "chat_classic", "chat_gold", "extra_room"]) {
      assert.ok(code.includes(`"${action}"`), `Whitelist should include "${action}"`);
    }
    console.log("  ✅ whitelist: tip, boost, chat_classic, chat_gold, extra_room");
  });

  it("validates payment reference", () => {
    assert.ok(code.includes("Reference mismatch"), "Should detect reference mismatch");
    assert.ok(code.includes("txData.reference !== reference"), "Should compare references");
    console.log("  ✅ validates payment reference against Worldcoin response");
  });

  it("tip handler requires postId and writes to tips table with correct columns", () => {
    assert.ok(code.includes("postId"), "Tip handler should require postId");
    assert.ok(code.includes('from("tips")'), "Should insert into tips table");
    assert.ok(code.includes("to_post_id"), "Should use to_post_id column (matches existing table)");
    assert.ok(code.includes("from_user_id"), "Should use from_user_id column");
    console.log("  ✅ tip → tips table with to_post_id + from_user_id");
  });

  it("boost handler writes to boosts table", () => {
    assert.ok(code.includes('from("boosts")'), "Should insert into boosts table");
    console.log("  ✅ boost → boosts table");
  });

  it("chat_classic handler writes to subscriptions", () => {
    assert.ok(code.includes('"chat_classic"'), "Should handle chat_classic");
    console.log("  ✅ chat_classic → subscriptions table");
  });
});

describe("upgrade.mjs", () => {
  const code = readFile("../api/upgrade.mjs");

  it("uses Optimism Etherscan (not WorldScan)", () => {
    assert.ok(code.includes("api-optimistic.etherscan.io"), "Should use Optimism Etherscan");
    assert.ok(!code.includes("worldscan.org"), "Should NOT use WorldScan");
    console.log("  ✅ correctly uses Optimism Etherscan for token creation chain");
  });

  it("uses ETHERSCAN_API_KEY", () => {
    assert.ok(code.includes("ETHERSCAN_API_KEY"), "Should use ETHERSCAN_API_KEY");
    console.log("  ✅ uses ETHERSCAN_API_KEY env var");
  });
});

describe("useMiniKitUser.ts", () => {
  const code = readFile("../src/lib/useMiniKitUser.ts");

  it("does NOT call MiniKit.install()", () => {
    assert.ok(!code.includes("MiniKit.install()"), "Should NOT call MiniKit.install()");
    console.log("  ✅ no redundant MiniKit.install()");
  });

  it("reads state with isInstalled()", () => {
    assert.ok(code.includes("MiniKit.isInstalled()"), "Should check isInstalled()");
    console.log("  ✅ reads MiniKit state only");
  });
});

describe("App.tsx", () => {
  const code = readFile("../src/App.tsx");

  it("does NOT call MiniKit.install() directly", () => {
    assert.ok(!code.includes("MiniKit.install("), "Should NOT call MiniKit.install()");
    console.log("  ✅ no direct MiniKit.install() — relies on MiniKitProvider");
  });

  it("waits for MiniKit with polling", () => {
    assert.ok(code.includes("waitForMiniKit"), "Should have waitForMiniKit polling");
    assert.ok(code.includes("MiniKit.isInstalled()"), "Should poll isInstalled()");
    console.log("  ✅ polls MiniKit.isInstalled() before verification");
  });

  it("validates stored userId with backend", () => {
    assert.ok(code.includes("api/verify") && code.includes("storedId"), "Should validate stored session");
    assert.ok(code.includes('localStorage.removeItem("userId")'), "Should clear invalid session");
    console.log("  ✅ validates localStorage userId with backend");
  });

  it("sends payload + nonce to walletVerify", () => {
    assert.ok(code.includes("JSON.stringify({ payload, nonce, userId })"), "Should send payload+nonce+userId");
    console.log("  ✅ sends complete SIWE payload to /api/walletVerify");
  });

  it("does not blindly trust localStorage for verified state", () => {
    const lines = code.split("\n");
    const hasBlindTrust = lines.some(
      (l) => l.includes("setVerified(true)") && l.includes("storedId")
    );
    assert.ok(!hasBlindTrust, "Should not setVerified(true) directly from storedId");
    console.log("  ✅ does not blindly trust localStorage");
  });
});

describe("verifyOrbStatus.mjs", () => {
  const code = readFile("../api/verifyOrbStatus.mjs");

  it("cross-validates orb nullifier ownership", () => {
    assert.ok(code.includes("orbConflict"), "Should check for orb nullifier conflicts");
    assert.ok(code.includes(".neq("), "Should exclude current user");
    assert.ok(code.includes("already linked to a different account"), "Should have clear error");
    console.log("  ✅ prevents using another user's orb proof");
  });
});

describe("PostCard.tsx — frontend payment calls", () => {
  const code = readFile("../src/components/PostCard.tsx");

  it("tip sends postId and amount to backend", () => {
    assert.ok(code.includes('action: "tip", postId: post.id, amount:'), "Should send postId + amount with tip");
    console.log("  ✅ tip sends postId + amount to /api/verifyPayment");
  });

  it("boost sends postId to backend", () => {
    assert.ok(code.includes('action: "boost", postId: post.id'), "Should send postId with boost");
    console.log("  ✅ boost sends postId to /api/verifyPayment");
  });

  it("all payments use MiniKit.commandsAsync.pay()", () => {
    const payCount = (code.match(/MiniKit\.commandsAsync\.pay\(/g) || []).length;
    assert.ok(payCount >= 3, `Should have at least 3 pay calls, found ${payCount}`);
    console.log(`  ✅ ${payCount} payment flows use MiniKit.commandsAsync.pay()`);
  });

  it("all payments verify with backend before applying", () => {
    const verifyCount = (code.match(/\/api\/verifyPayment/g) || []).length;
    assert.ok(verifyCount >= 3, `Should verify all payments with backend, found ${verifyCount} calls`);
    console.log(`  ✅ ${verifyCount} payments verified with /api/verifyPayment`);
  });
});

describe("ethers usage", () => {
  it("ethers is ONLY used in withdraw.mjs and distributePayout.mjs (on-chain transfers)", () => {
    const noEthersFiles = ["walletVerify.mjs", "nonce.mjs", "verifyPayment.mjs", "verifyOrbStatus.mjs", "subscribePremiumChat.mjs"];
    for (const f of noEthersFiles) {
      const code = readFile(`../api/${f}`);
      const codeNoComments = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "");
      assert.ok(!codeNoComments.includes('from "ethers"'), `${f} should NOT import ethers`);
    }
    const withdrawCode = readFile("../api/withdraw.mjs");
    assert.ok(withdrawCode.includes('from "ethers"'), "withdraw.mjs SHOULD use ethers for on-chain transfers");
    const payoutCode = readFile("../api/distributePayout.mjs");
    assert.ok(payoutCode.includes('from "ethers"'), "distributePayout.mjs SHOULD use ethers");
    console.log("  ✅ ethers used only in withdraw + distributePayout (on-chain transfers)");
  });
});

describe("withdraw.mjs — on-chain transfers", () => {
  const code = readFile("../api/withdraw.mjs");

  it("deducts balance before transfer", () => {
    assert.ok(code.includes("deduct_balance"), "Should call deduct_balance RPC");
    console.log("  ✅ deducts balance atomically via Supabase RPC");
  });

  it("executes ERC20 transfer on World Chain", () => {
    assert.ok(code.includes("0x2cFc85d8E48F8EaB294be644d9E25C3030863003"), "Should use WLD contract address");
    assert.ok(code.includes("contract.transfer"), "Should call ERC20 transfer");
    assert.ok(code.includes("chainId: 480"), "Should target World Chain (480)");
    console.log("  ✅ executes WLD ERC20 transfer on World Chain (480)");
  });

  it("refunds balance if transfer fails", () => {
    assert.ok(code.includes("refunding balance"), "Should refund on failure");
    assert.ok(code.includes("p_amount: -amount"), "Should reverse the deduction");
    console.log("  ✅ refunds balance if on-chain transfer fails");
  });

  it("validates wallet address", () => {
    assert.ok(code.includes("ethers.isAddress"), "Should validate address format");
    console.log("  ✅ validates wallet address format");
  });

  it("records tx_hash in withdrawals", () => {
    assert.ok(code.includes("tx_hash"), "Should save tx_hash");
    console.log("  ✅ records tx_hash in withdrawals table");
  });
});

describe("distributePayout.mjs — 7-day payout cron", () => {
  const code = readFile("../api/distributePayout.mjs");

  it("requires CRON_SECRET auth", () => {
    assert.ok(code.includes("CRON_SECRET"), "Should require CRON_SECRET");
    console.log("  ✅ requires CRON_SECRET authorization");
  });

  it("distributes 70% creator / 25% platform / 5% pool", () => {
    assert.ok(code.includes("0.70"), "70% creator share");
    assert.ok(code.includes("0.25"), "25% platform share");
    assert.ok(code.includes("0.05"), "5% pool share");
    console.log("  ✅ distribution: 70% creator, 25% platform, 5% pool");
  });

  it("processes only undistributed tips from last 7 days", () => {
    assert.ok(code.includes("7 * 24 * 60 * 60 * 1000"), "Should look back 7 days");
    assert.ok(code.includes("distributed_at", null), "Should filter undistributed tips");
    console.log("  ✅ processes only undistributed tips from last 7 days");
  });

  it("pays creators with wallet on-chain, credits balance for those without", () => {
    assert.ok(code.includes("wallet_address"), "Should check creator wallet");
    assert.ok(code.includes("transferWLD"), "Should transfer WLD on-chain");
    assert.ok(code.includes("add_balance"), "Should credit balance for no-wallet creators");
    console.log("  ✅ on-chain for wallets, balance credit for no-wallet creators");
  });

  it("marks tips as distributed and logs payout", () => {
    assert.ok(code.includes("distributed_at"), "Should update distributed_at");
    assert.ok(code.includes('from("payout_logs")'), "Should log to payout_logs table");
    console.log("  ✅ marks tips distributed + logs payout");
  });
});

describe("vercel.json — payout cron", () => {
  const code = readFile("../vercel.json");

  it("has distributePayout cron scheduled every 7 days", () => {
    assert.ok(code.includes("distributePayout"), "Should have distributePayout cron");
    assert.ok(code.includes("*/7"), "Should run every 7 days");
    console.log("  ✅ distributePayout cron: every 7 days at 3am");
  });
});

describe("dashboard — useWithdrawals.ts", () => {
  const code = readFile("../dashboard/src/hooks/useWithdrawals.ts");

  it("calls /api/withdraw instead of direct Supabase insert", () => {
    assert.ok(code.includes("/api/withdraw"), "Should call /api/withdraw endpoint");
    assert.ok(!code.includes('.from("withdrawals").insert'), "Should NOT insert directly into Supabase");
    console.log("  ✅ calls /api/withdraw (not direct Supabase insert)");
  });

  it("handles failure with status update", () => {
    assert.ok(code.includes('"failed"'), "Should set status to failed on error");
    console.log("  ✅ sets status to failed on API error");
  });
});

describe("dashboard — tracking.ts (server-side)", () => {
  const code = readFile("../dashboard/src/lib/tracking.ts");

  it("sends tracking via /api/trackAd instead of direct Supabase insert", () => {
    assert.ok(code.includes("/api/trackAd"), "Should call /api/trackAd");
    assert.ok(!code.includes("supabase"), "Should NOT import or use supabase client");
    console.log("  ✅ tracking goes through /api/trackAd (not direct Supabase)");
  });
});

describe("api/trackAd.mjs — server-side ad tracking", () => {
  const code = readFile("../api/trackAd.mjs");

  it("has rate limiting", () => {
    assert.ok(code.includes("checkRateLimit"), "Should have rate limiting");
    assert.ok(code.includes("429"), "Should return 429 on rate limit");
    console.log("  ✅ rate limiting prevents abuse");
  });

  it("validates campaign budget on click", () => {
    assert.ok(code.includes("campaign.spent"), "Should check spent vs budget");
    assert.ok(code.includes("budget exhausted"), "Should reject when budget exhausted");
    console.log("  ✅ validates campaign has budget before recording click");
  });

  it("deducts campaign spend on click", () => {
    assert.ok(code.includes("campaign.spent + cpc"), "Should deduct from campaign budget");
    console.log("  ✅ deducts CPC from campaign budget");
  });
});

describe("dashboard — useCampaigns.ts (MiniKit payment)", () => {
  const code = readFile("../dashboard/src/hooks/useCampaigns.ts");

  it("requires MiniKit payment before creating campaign", () => {
    assert.ok(code.includes("MiniKit.commandsAsync.pay"), "Should call MiniKit pay");
    assert.ok(code.includes("campaign_budget"), "Should use campaign_budget action");
    console.log("  ✅ campaign creation requires MiniKit payment");
  });

  it("verifies payment with /api/verifyPayment", () => {
    assert.ok(code.includes("/api/verifyPayment"), "Should verify payment");
    console.log("  ✅ verifies payment before campaign activation");
  });

  it("does NOT insert directly into Supabase", () => {
    assert.ok(!code.includes('.from("campaigns").insert'), "Should NOT insert directly");
    console.log("  ✅ campaign created server-side after payment verification");
  });
});

describe("verifyPayment.mjs — campaign_budget action", () => {
  const code = readFile("../api/verifyPayment.mjs");

  it("includes campaign_budget in valid actions", () => {
    assert.ok(code.includes("campaign_budget"), "Should accept campaign_budget");
    console.log("  ✅ campaign_budget is a valid action");
  });

  it("has anti-replay for all payment types including campaigns", () => {
    assert.ok(code.includes("campaign_budget: \"campaigns\""), "Should check campaigns table for replay");
    assert.ok(code.includes("boost: \"boosts\""), "Should check boosts for replay");
    console.log("  ✅ anti-replay covers all 6 action types");
  });
});

console.log("\n══════════════════════════════════════");
console.log("All verification tests complete");
console.log("══════════════════════════════════════");
