import { supabase, cors } from "./_supabase.mjs";
import { requireOrb } from "./_orbGuard.mjs";
import { recordPriceSnapshot } from "./_snapshot.mjs";
import { createBuyTickets, createGraduationTickets } from "./_ledger.mjs";
import {
  solveBuy, curvePercent, checkGraduation, spotPrice, getWldUsdRate,
  TOTAL_SUPPLY, MAX_CREATOR_HOLD,
  GRADUATION_WLD, GRADUATION_HOLDERS, MAX_RETRIES,
} from "./_curve.mjs";
import { trackRequest, trackTrade, trackOccConflict, trackFailedTrade, triggerAlert, isTradingPaused, isTokenFrozen } from "../../api/_metrics.mjs";
import { canTrade, shouldThrottle } from "../../api/_infra.mjs";
import { smartRateLimit, detectTradingLoop } from "../../api/_smartRate.mjs";
import { createTrace, startSpan, endSpan, failSpan, finishTrace, log, SPANS, LOG_TYPES } from "../../api/_tracer.mjs";

export default async function handler(req, res) {
  const t0 = Date.now();
  const reqId = Math.random().toString(36).slice(2, 10);
  cors(res, req);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const tokenId = req.query.id;
  const body = req.body ?? {};
  const amountWld = body.amountWld;
  const userId = body.userId || body.user_id;
  const transactionId = body.transactionId || body.transaction_id;

  const trace = createTrace("/api/tokenBuy", userId);
  const reqSpan = startSpan(trace, SPANS.REQUEST_START);

  console.log(JSON.stringify({ op: "BUY_START", reqId, traceId: trace.traceId, tokenId, amountWld, userId, transactionId, ts: new Date().toISOString() }));
  if (!tokenId || !amountWld || !userId || !transactionId) {
    endSpan(reqSpan, { reason: "missing_params" });
    finishTrace(trace, "error");
    log(trace, SPANS.REQUEST_START, LOG_TYPES.ERROR, "400", { reason: "missing_params" });
    return res.status(400).json({ error: "Missing tokenId, amountWld, userId" });
  }
  if (amountWld <= 0 || amountWld > 120) {
    trackFailedTrade("max_buy_exceeded");
    endSpan(reqSpan, { reason: "amount_invalid" });
    finishTrace(trace, "error");
    log(trace, SPANS.REQUEST_START, LOG_TYPES.ERROR, "400", { reason: "amount_invalid", amountWld });
    return res.status(400).json({ error: "amountWld must be between 0 and 120 WLD" });
  }

  if (isTradingPaused()) {
    trackFailedTrade("other");
    endSpan(reqSpan, { reason: "trading_paused" });
    finishTrace(trace, "blocked");
    log(trace, SPANS.REQUEST_START, LOG_TYPES.TRADE, "503", { reason: "trading_paused" });
    return res.status(503).json({ error: "Trading is temporarily paused" });
  }
  if (isTokenFrozen(tokenId)) {
    trackFailedTrade("other");
    endSpan(reqSpan, { reason: "token_frozen" });
    finishTrace(trace, "blocked");
    log(trace, SPANS.REQUEST_START, LOG_TYPES.TRADE, "503", { reason: "token_frozen", tokenId });
    return res.status(503).json({ error: "This token is temporarily frozen" });
  }
  if (!canTrade()) {
    trackFailedTrade("other");
    endSpan(reqSpan, { reason: "system_lockdown" });
    finishTrace(trace, "blocked");
    log(trace, SPANS.REQUEST_START, LOG_TYPES.INFRA, "503", { reason: "system_lockdown" });
    return res.status(503).json({ error: "System is in lockdown mode, trading disabled" });
  }
  if (shouldThrottle("BUY")) {
    endSpan(reqSpan, { reason: "throttled" });
    finishTrace(trace, "throttled");
    return res.status(429).json({ error: "System under load, please retry" });
  }

  const rlSpan = startSpan(trace, SPANS.RATE_LIMIT_CHECK);
  const rl = smartRateLimit(userId, "trade", { tokenId, amountWld });
  if (rl.limited) {
    trackFailedTrade("other");
    endSpan(rlSpan, { reason: rl.reason });
    finishTrace(trace, "rate_limited");
    log(trace, SPANS.RATE_LIMIT_CHECK, LOG_TYPES.RATE_LIMIT, "429", { reason: rl.reason, userId });
    return res.status(429).json({ error: "Rate limited: " + rl.reason, retryAfterMs: rl.retryAfterMs });
  }
  const loopCheck = detectTradingLoop(userId, "buy");
  if (loopCheck.looping) {
    trackFailedTrade("other");
    endSpan(rlSpan, { reason: "trading_loop" });
    finishTrace(trace, "rate_limited");
    log(trace, SPANS.RATE_LIMIT_CHECK, LOG_TYPES.RATE_LIMIT, "429", { reason: loopCheck.reason, userId, switchCount: loopCheck.switchCount });
    return res.status(429).json({ error: "Rapid buy/sell loop detected, please slow down" });
  }
  endSpan(rlSpan);

  const authSpan = startSpan(trace, SPANS.AUTH_CHECK);
  const orbOk = await requireOrb(userId, res);
  if (!orbOk) {
    failSpan(authSpan, "orb_check_failed");
    finishTrace(trace, "auth_failed");
    log(trace, SPANS.AUTH_CHECK, LOG_TYPES.TRADE, "403", { reason: "orb_check_failed", userId });
    return;
  }
  endSpan(authSpan);

    const APP_ID = process.env.APP_ID ?? "";
    const RP_KEY = process.env.RP_SIGNING_KEY ?? "";
    if (!RP_KEY) {
      console.error("[tokenBuy] FATAL: RP_SIGNING_KEY not configured");
      return res.status(500).json({ error: "Server misconfiguration: payment verification unavailable" });
    }
    try {
      const txVerify = await fetch(
        `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${APP_ID}`,
        { headers: { Authorization: `Bearer ${RP_KEY}` } }
      );
      const txData = await txVerify.json();
      if (!txVerify.ok || (txData.transaction_status && txData.transaction_status !== "mined")) {
        return res.status(402).json({ error: "Payment not confirmed on-chain", details: txData });
      }
    } catch (verifyErr) {
      console.error("[BUY] Payment verification error:", verifyErr.message);
      return res.status(502).json({ error: "Could not verify payment" });
    }

    const { data: txDupe } = await supabase
      .from("payment_orders")
      .select("id")
      .eq("transaction_id", transactionId)
      .eq("status", "completed")
      .maybeSingle();
    if (txDupe) {
      return res.status(409).json({ error: "Transaction already used for a previous buy" });
    }
  
  const wldUsd = await getWldUsdRate();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();
  const username = profile?.username ?? "anon";

  let orderId = null;
  try {
    const reference = "ref_" + (transactionId || Date.now().toString(36)).slice(0, 16);
    const { data: order } = await supabase
      .from("payment_orders")
      .insert({
        user_id: userId,
        username,
        token_id: tokenId,
        token_symbol: "",
        amount_wld: amountWld,
        estimated_tokens: 0,
        spot_price: 0,
        reference,
        transaction_id: transactionId || null,
        status: "processing",
        type: "buy",
      })
      .select("id")
      .maybeSingle();
    orderId = order?.id || null;
  } catch (e) {
    console.error("[BUY] order creation skipped:", e.message);
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const { data: token, error: tErr } = await supabase
        .from("tokens")
        .select("*")
        .eq("id", tokenId)
        .single();
      if (tErr || !token) return res.status(404).json({ error: "Token not found" });
      if (token.graduated) return res.status(400).json({ error: "Token graduated — trade on DEX" });

      const supply = Number(token.circulating_supply ?? 0);
      const { tokensOut, fee, netWld, newSupply, newPrice } = solveBuy(amountWld, supply);

      if (tokensOut <= 0) return res.status(400).json({ error: "Amount too small" });

      if (userId === token.creator_id) {
        const { data: existing } = await supabase
          .from("holdings")
          .select("amount")
          .eq("user_id", userId)
          .eq("token_id", tokenId)
          .maybeSingle();
        const current = Number(existing?.amount ?? 0);
        if (current + tokensOut > TOTAL_SUPPLY * MAX_CREATOR_HOLD) {
          return res.status(400).json({ error: "Creator max hold: " + (MAX_CREATOR_HOLD * 100) + "%" });
        }
      }

      const newPriceUsd = newPrice * wldUsd;
      const totalWldInCurve = Number(token.total_wld_in_curve ?? 0) + netWld;
      const treasuryBalance = Number(token.treasury_balance ?? 0) + fee;
      const cp = curvePercent(totalWldInCurve);

      const volumeNew = Number(token.volume_24h ?? 0) + amountWld * wldUsd;

      const { data: rpcResult, error: rpcErr } = await supabase.rpc("atomic_token_buy", {
        p_token_id: tokenId,
        p_user_id: userId,
        p_username: username,
        p_amount_wld: amountWld,
        p_tokens_out: tokensOut,
        p_fee: fee,
        p_net_wld: netWld,
        p_new_supply: newSupply,
        p_new_price: newPrice,
        p_new_price_usd: newPriceUsd,
        p_total_wld_in_curve: totalWldInCurve,
        p_treasury_balance: treasuryBalance,
        p_curve_percent: cp,
        p_market_cap: newSupply * newPriceUsd,
        p_volume_24h: volumeNew,
        p_expected_supply: supply,
      });

      if (rpcErr) throw rpcErr;

      if (!rpcResult || !rpcResult.success) {
        if (attempt < MAX_RETRIES - 1) continue;
        return res.status(409).json({ error: "Concurrent trade detected, please retry" });
      }

      const prevAmount = Number(rpcResult.prev_amount ?? 0);
      const unitPrice = netWld / tokensOut;
      const avgPrice = Number(rpcResult.avg_price ?? unitPrice);

      console.log("[BUY] RESULT:", { tokensOut, prevAmount, avgPrice, newSupply });

      await recordPriceSnapshot(tokenId, newPrice, newPriceUsd, newSupply, amountWld * wldUsd, "buy");

      if (orderId) {
        await supabase.from("payment_orders").update({
          status: "completed", completed_at: new Date().toISOString(),
          token_symbol: token.symbol, estimated_tokens: tokensOut, spot_price: spotPrice(supply),
        }).eq("id", orderId);
      }

      try {
        await createBuyTickets({
          orderId, userId, username,
          tokenId, tokenSymbol: token.symbol,
          amountWld, fee, netWld, tokensOut, newPrice,
        });
      } catch (le) {
        console.error("[BUY] ledger error (non-fatal):", le.message);
      }

      const currentHolders = Number(token.holders ?? 0) + (prevAmount === 0 ? 1 : 0);
      if (checkGraduation(totalWldInCurve, currentHolders, newSupply)) {
        await triggerGraduation(tokenId, token.symbol, totalWldInCurve, newPrice);
      }

      const elapsed = Date.now() - t0;
      trackRequest(elapsed); trackTrade(amountWld, "buy", fee);
      if (elapsed > 500) triggerAlert("SLOW_BUY", { reqId, elapsed });
      finishTrace(trace, "ok");
      log(trace, SPANS.RESPONSE, LOG_TYPES.TRADE, "200", { tokenId, amountWld, tokensOut, fee, newPrice, elapsed });
      console.log(JSON.stringify({ op: "BUY_OK", reqId, traceId: trace.traceId, tokenId, userId, tokensOut, fee, newPrice, newSupply, elapsed_ms: elapsed }));
      supabase.from("admin_logs").insert({ category: "activity", event: "token_buy", severity: "info", user_id: userId, username, endpoint: "/api/tokenBuy", latency_ms: elapsed, details: { tokenId, tokenSymbol: token.symbol, amountWld, tokensOut, fee, newPrice, reqId, traceId: trace.traceId } }).catch(() => {});
      return res.status(200).json({
        success: true,
        tokensReceived: tokensOut, fee,
        avgPrice: unitPrice, newPrice, newPriceUsd,
        newSupply, curvePercent: cp,
        message: "Bought " + tokensOut.toLocaleString() + " " + token.symbol,
      });
    } catch (err) {
      const elapsed = Date.now() - t0;
      trackRequest(elapsed, true);
      trackFailedTrade("other");
      if (err.message?.includes("concurrent") || err.message?.includes("OCC")) trackOccConflict();
      finishTrace(trace, "error");
      log(trace, SPANS.WRITE_OPERATION, LOG_TYPES.ERROR, "500", { tokenId, attempt, error: err.message, elapsed });
      console.error(JSON.stringify({ op: "BUY_ERR", reqId, traceId: trace.traceId, tokenId, userId, attempt, error: err.message, elapsed_ms: elapsed }));
      supabase.from("admin_logs").insert({ category: "error", event: "buy_error", severity: attempt >= MAX_RETRIES - 1 ? "error" : "warning", user_id: userId, endpoint: "/api/tokenBuy", latency_ms: elapsed, details: { tokenId, attempt, error: err.message, reqId, traceId: trace.traceId } }).catch(() => {});
      if (attempt >= MAX_RETRIES - 1) {
        if (orderId) {
          await supabase.from("payment_orders").update({
            status: "failed", error_message: err.message,
          }).eq("id", orderId).catch(() => {});
        }
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}

async function triggerGraduation(tokenId, symbol, totalWld, finalPrice) {
  try {
    const toPool = totalWld * 0.70;
    const toTreasury = totalWld * 0.30;

    const { data: updated } = await supabase.from("tokens").update({
      graduated: true, graduated_at: new Date().toISOString(),
      graduation_pool_wld: toPool, graduation_treasury_wld: toTreasury,
      curve_percent: 100,
    }).eq("id", tokenId).eq("graduated", false).select("id").maybeSingle();

    if (!updated) {

      return;
    }

    await supabase.from("token_activity").insert({
      type: "graduate", user_id: "system", username: "system",
      token_id: tokenId, token_symbol: symbol,
      amount: totalWld, price: finalPrice, total: totalWld,
      timestamp: new Date().toISOString(),
    });

    try {
      await createGraduationTickets({ tokenId, tokenSymbol: symbol, totalWld, toPool, toTreasury, finalPrice });
    } catch (le) {
      console.error("[GRADUATION] ledger error:", le.message);
    }


  } catch (err) {
    console.error("[GRADUATION_TRIGGER]", err.message);
  }
}
