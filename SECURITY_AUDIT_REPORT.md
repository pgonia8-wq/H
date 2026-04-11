# HUMANS MINI APP — SECURITY AUDIT REPORT (Final v4)

**Date:** 2026-04-11
**Target:** https://github.com/pgonia8-wq/Humans
**Architecture:** Social app embedded in World App (Worldcoin) via iframe
**Verification model:** Device-level for social layer; ORB-level for token layer
**Backend:** Vercel serverless functions + Supabase (PostgreSQL + RLS)
**Methodology:** Line-by-line manual code review against actual source files

---

## EXECUTIVE SUMMARY

| Severity | Count |
|----------|-------|
| **CRITICAL** | 6 |
| **HIGH** | 6 |
| **MEDIUM** | 5 |
| **LOW / INFO** | 4 |

The codebase shows strong engineering in many areas (OCC on token trading, atomic claim in confirmBuy, SIWE + nonce in withdraw, centralized orbGuard). However, critical bugs were found in payment verification, dead-code authentication checks, and a schema mismatch between `credit_balance` and `deduct_balance` RPCs that could cause financial inconsistencies.

---

## CRITICAL FINDINGS

### C-01: `confirmBuy.mjs` — No On-Chain Payment Verification
- **File:** `token/api/confirmBuy.mjs`
- **Lines:** Full handler (L9–224)
- **Issue:** Unlike `tokenBuy.mjs` which verifies the transaction with Worldcoin Developer Portal (L30–44), `confirmBuy.mjs` trusts the client-supplied `transactionId` without any on-chain verification. It only checks for duplicate `transactionId` in `payment_orders`, then proceeds to mint tokens.
- **Impact:** An attacker can submit a fabricated or pending `transactionId` to receive tokens without paying.
- **Evidence:** `tokenBuy.mjs` L30–44 has:
  ```js
  if (RP_KEY) {
    const txVerify = await fetch(`https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${APP_ID}`, ...);
  }
  ```
  No equivalent exists in `confirmBuy.mjs`.
- **Fix:** Add Worldcoin transaction verification before the order claim at L31, identical to `tokenBuy.mjs`.

### C-02: `tokens/[id]/buy.mjs` — No Payment Verification at All
- **File:** `token/api/tokens/[id]/buy.mjs`
- **Lines:** L10–189
- **Issue:** This buy endpoint does not require a `transactionId` parameter (L16: only `amountWld` and `userId`), has no Worldcoin payment check, and no `payment_orders` flow. It mints tokens directly from the bonding curve with zero payment validation.
- **Impact:** Free token minting. Any ORB-verified user can acquire unlimited tokens without paying.
- **Fix:** Either remove this endpoint (it duplicates `tokenBuy.mjs`) or add full payment verification + anti-replay.

### C-03: `verifyPayment.mjs` — Device Verification is Dead Code
- **File:** `api/verifyPayment.mjs`
- **Lines:** L73–85
- **Issue:** The device verification logic (profile lookup + `verification_level` check) is placed *inside* the `return` block for `!userId`. Code structure:
  ```js
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId es requerido" });
    // ← Everything below is UNREACHABLE
    const { data: _profile } = await supabase...
    if (!_profile || !_profile.verification_level) {
      return res.status(403).json({ error: "Device verification required" });
    }
  }
  ```
  The closing brace `}` at L85 ends the `if (!userId)` block, meaning the profile check only executes when `userId` is falsy — which is when `return` has already fired.
- **Impact:** Any request with a valid userId string bypasses device verification entirely. Financial actions (tips, boosts, subscriptions, campaign budgets) can be performed by unverified users.
- **Fix:** Move the profile/verification check OUTSIDE the `!userId` block, after validating `userId` is present.

### C-04: `subscribePremiumChat.mjs` — Device Verification is Dead Code
- **File:** `api/subscribePremiumChat.mjs`
- **Lines:** L77–87
- **Issue:** Identical dead-code pattern as C-03. Device verification code is inside the `return` block for `!userId`:
  ```js
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    return res.status(400).json({ error: "userId es requerido" });
    // UNREACHABLE ↓
    const { data: _profile } = await supabase...
  }
  ```
- **Impact:** Unverified users can subscribe to premium chat.
- **Fix:** Same as C-03 — move check after `userId` validation.

### C-05: Schema Mismatch — `credit_balance` vs `deduct_balance` Use Different Tables
- **File:** `sql/security_migration_4_rls_lockdown.sql` L215–243
- **Issue:** Two RPC functions operate on different tables:
  - `credit_balance` → writes to `user_balances.balance` (L220–225)
  - `deduct_balance` → reads/writes `balances.available` (L237–241)
  These are TWO SEPARATE TABLES with DIFFERENT column names. Credits from sell operations go to `user_balances.balance`. Deductions for withdrawals come from `balances.available`. Users can accumulate sell credits that never become withdrawable, or withdrawal checks reference a table that sell operations never populate.
- **Impact:** Financial ledger inconsistency. Users may not be able to withdraw funds, or balance checks may reference empty records.
- **Fix:** Unify both functions to use a single table (either `user_balances` or `balances`) with consistent column names.

### C-06: RLS Policies — Base Schema is Fully Permissive
- **File:** `supabase-schema.sql` L743–1020
- **Issue:** The base schema creates `USING (true)` / `WITH CHECK (true)` policies for ALL tables including financial ones (holdings, tokens, payment_orders, user_balances, balances, withdrawals). A corrective migration exists (`security_migration_4_rls_lockdown.sql`) that drops permissive policies and replaces them with restrictive ones.
- **Risk:** If migration 4 has NOT been applied (or is re-run after the base schema), all tables are wide open. Any client with the Supabase `anon` key can:
  - INSERT/UPDATE/DELETE holdings (mint tokens)
  - UPDATE balances (give themselves money)
  - UPDATE payment_orders (mark fake orders as completed)
  - UPDATE profiles.verification_level (bypass ORB requirement)
- **Fix:** 
  1. Verify migration 4 has been applied in production
  2. Remove permissive policies from the base schema
  3. Merge migration 4 into the main schema so future deployments are safe by default

---

## HIGH FINDINGS

### H-01: `withdraw.mjs` — userId vs wallet Address Mismatch in SIWE Check
- **File:** `api/withdraw.mjs`
- **Line:** L101
- **Issue:** The SIWE ownership check compares `payload.address` (Ethereum wallet address, 42 chars `0x` + 40 hex) with `userId` (World ID nullifier_hash, 66 chars `0x` + 64 hex). In the standard World ID architecture, these are fundamentally different identifiers and will never match.
  ```js
  if (payload.address.toLowerCase() !== userId.toLowerCase()) {
    return res.status(403).json({ error: "userId no coincide con la firma SIWE" });
  }
  ```
- **Impact:** If `userId` is the nullifier_hash (as used everywhere else in the app), ALL withdrawal requests fail. This effectively locks user funds.
- **Fix:** Validate `userId` against the profile's stored `wallet_address` (set during wallet verification), not against the SIWE payload directly. Or restructure so the check is `payload.address === wallet` (which L105 already does).

### H-02: `createProfile.mjs` — requireOrb Called Before userId Validation
- **File:** `api/createProfile.mjs`
- **Lines:** L53–60
- **Issue:** `requireOrb(userId, res)` is called at L55 BEFORE validating that `userId` exists (L58). If `userId` is `undefined` (e.g., body has no `userId` field), `requireOrb` receives `undefined`, queries Supabase with `undefined`, and returns a 403 "User not found" instead of a 400 "No userId provided".
- **Impact:** Misleading error messages that confuse the frontend; potential for unexpected behavior in `requireOrb` if Supabase query with undefined returns unexpected results.
- **Fix:** Move the `userId` validation (L58–64) BEFORE the `requireOrb` call.

### H-03: `tokenBurn.mjs` — Holdings Update Without OCC
- **File:** `token/api/tokenBurn.mjs`
- **Lines:** L69–71
- **Issue:** When `newHeld > 0` (partial burn), the holdings update lacks OCC:
  ```js
  await supabase.from("holdings").update({ amount: newHeld, ... })
    .eq("user_id", userId).eq("token_id", tokenId);
  // Missing: .eq("amount", heldAmount)
  ```
  The `delete` path at L73–78 correctly uses `.eq("amount", heldAmount)`.
- **Impact:** A concurrent buy/sell could change the holdings between read (L37) and update (L70), leading to incorrect final amounts. The token's `circulating_supply` has already been decremented at this point (L51–61), so the system ends up in an inconsistent state.
- **Fix:** Add `.eq("amount", heldAmount)` to the update at L70, and add rollback/retry logic on failure.

### H-04: `tokenBuy.mjs` — Payment Verification Silently Skipped
- **File:** `token/api/tokenBuy.mjs`
- **Lines:** L30
- **Issue:** Payment verification is gated on `if (RP_KEY)`. If `RP_SIGNING_KEY` is not configured in environment variables, the entire Worldcoin payment check is silently skipped, and tokens are minted based on the client's claimed `amountWld`.
  ```js
  const RP_KEY = process.env.RP_SIGNING_KEY ?? "";
  if (RP_KEY) { /* verify payment */ }
  // If RP_KEY is empty → no verification, tokens minted anyway
  ```
- **Impact:** In a misconfigured deployment, all buys are unverified → free token minting.
- **Fix:** Either require `RP_SIGNING_KEY` (fail if not set) or log a critical warning and reject transactions when the key is missing.

### H-05: `airdropRedeem.mjs` — one_time Race Condition
- **File:** `token/api/airdropRedeem.mjs`
- **Lines:** L33–43
- **Issue:** The `one_time` check looks for ANY previous claim on the link (L34–38). However, the UNIQUE constraint is on `(airdrop_link_id, user_id)`, meaning different users have different keys. Two users can simultaneously pass the `one_time` check (both see zero claims), both insert successfully (different `user_id`s), and both receive tokens.
- **Impact:** A one_time airdrop link can be claimed by multiple users in a race condition, distributing more tokens than intended.
- **Fix:** Use an atomic `UPDATE airdrop_links SET is_active = false WHERE id = ? AND is_active = true AND mode = 'one_time' RETURNING *` as the primary gate. Only proceed if a row is returned.

### H-06: `airdropRedeem.mjs` — Fallback Holdings Update Without OCC
- **File:** `token/api/airdropRedeem.mjs`
- **Lines:** L78–82
- **Issue:** When the `add_holding` RPC fails (L69), the fallback path updates holdings without OCC:
  ```js
  await supabase.from("holdings")
    .update({ amount: existingHolding.amount + claimAmount })
    .eq("user_id", userId).eq("token_id", link.token_id);
  // Missing: .eq("amount", existingHolding.amount)
  ```
- **Impact:** Concurrent claims or trades could cause incorrect balance calculation (overwrite a concurrent trade's update).
- **Fix:** Add `.eq("amount", existingHolding.amount)` and handle the conflict case.

---

## MEDIUM FINDINGS

### M-01: `airdropRedeem.mjs` — Stale `claimed_amount` in Link Update
- **File:** `token/api/airdropRedeem.mjs`
- **Line:** L95
- **Issue:** The link update uses the original `link.claimed_amount` (read at L16) to calculate the new value, but the OCC guard at L100 also checks against this value. If the claimed_amount was changed by another user between L16 and L92, the OCC correctly rejects the update — but the claim was already recorded (L48) and tokens already credited (L63). The link's totals are now out of sync.
- **Impact:** `airdrop_links.claimed_amount` underreports actual claims under concurrency.
- **Fix:** Wrap the claim insert + link update in a transaction, or use a Supabase RPC that atomically increments `claimed_amount` and returns the updated value.

### M-02: In-Memory Rate Limiting Resets on Cold Start
- **Files:** `api/trackAd.mjs` L11, `token/api/_supabase.mjs` L115–156
- **Issue:** Rate limiting uses `Map()` objects in module scope. In a Vercel serverless environment, these reset on every cold start and are not shared across instances.
- **Impact:** Rate limits are ineffective under high concurrency (multiple instances) or after cold starts. An attacker can bypass rate limits by triggering new cold starts.
- **Mitigation:** The app has DB-level dedup (UNIQUE constraints) that prevents the worst exploitation. For production-grade rate limiting, use a persistent store (Redis, Supabase RPC with sliding window, or Vercel KV).

### M-03: `airdrops/[id]/claim.mjs` — OCC Failure Silently Ignored
- **File:** `token/api/airdrops/[id]/claim.mjs`
- **Lines:** L76–78
- **Issue:** When the airdrop update has an OCC conflict (another concurrent claim changed `claimed_amount`), the endpoint logs a warning but returns success to the user:
  ```js
  if (!updatedAirdrop) {
    console.warn("[AIRDROP_CLAIM] OCC conflict on airdrop update");
  }
  // ← Continues to return 200 success
  ```
  The individual claim IS recorded, but the airdrop's totals aren't updated.
- **Impact:** `airdrops.claimed_amount` and `participants` counts drift from reality under concurrency.
- **Fix:** Retry the airdrop update, or use an atomic RPC to increment counters.

### M-04: Mixed CORS Strategy
- **Files:** `token/api/_supabase.mjs` L15–24 vs `api/*.mjs`
- **Issue:** Token API uses restricted CORS (only `ALLOWED_ORIGINS` get the header), while social API endpoints (`verifyPayment.mjs`, `subscribePremiumChat.mjs`, `withdraw.mjs`, `createProfile.mjs`, `trackAd.mjs`) use `Access-Control-Allow-Origin: *`.
- **Note:** Wildcard CORS for a World App iframe is common and not inherently dangerous since auth is token-based, not cookie-based. However, the token API's restricted CORS silently fails — if the origin doesn't match, the `Access-Control-Allow-Origin` header is simply not set (no `*` fallback), which blocks legitimate requests from misconfigured origins but doesn't prevent server-side exploitation via non-browser clients.
- **Fix:** Standardize the CORS approach. For the token API, either set `*` (matching social API) or ensure `ALLOWED_ORIGINS` env var is correctly configured in all environments.

### M-05: `tokenLock.mjs` — No Token Rollback on Holdings OCC Failure
- **File:** `token/api/tokenLock.mjs`
- **Lines:** L74–76
- **Issue:** If the holdings OCC check fails at L74, the function returns `409` but does NOT roll back the token update (locked_supply/circulating_supply change at L52–62). The token state is modified but the user's holdings are not.
- **Impact:** `tokens.locked_supply` is incremented and `circulating_supply` decremented, but the user's holdings remain unchanged — permanent supply inconsistency.
- **Fix:** Add a rollback of the token update when holdings OCC fails, similar to the pattern used in `sell.mjs`.

---

## LOW / INFORMATIONAL

### L-01: `createProfile.mjs` Requires ORB for Profile Creation
- **File:** `api/createProfile.mjs` L55
- **Issue:** `requireOrb` is called during profile creation. But the stated verification model is "Device for social layer, ORB for tokens." Profile creation is a social action. New users who only have Device verification cannot create a profile, which blocks them from the entire app.
- **Note:** If this is intentional (ORB required for any interaction), it contradicts the documented verification model. If it's a bug, replace with a Device-level check.

### L-02: `trackAd.mjs` — CORS Wildcard
- **File:** `api/trackAd.mjs` L27
- **Issue:** Uses `Access-Control-Allow-Origin: *` which is standard for World App WebView but worth noting for audit completeness.

### L-03: Subscriptions Schema Mismatch
- **Files:** `subscribePremiumChat.mjs` uses `onConflict: "user_id,product"` but `supabase-schema.sql` defines `subscriptions` without a UNIQUE constraint on `(user_id, product)`. The upsert may fail if the constraint doesn't exist.
- **Fix:** Add `UNIQUE(user_id, product)` to the subscriptions table.

### L-04: `verifyPayment.mjs` — Anti-Replay Not Blocking on Error
- **File:** `api/verifyPayment.mjs` L94–106
- **Issue:** If the anti-replay INSERT fails for a reason OTHER than duplicate (e.g., DB connection error), the error is logged but execution continues. The transaction verification proceeds without anti-replay protection.
- **Fix:** Return 500 on unexpected insert errors.

---

## CONFIRMED FALSE POSITIVES

The following items from previous audits were verified as NOT bugs:

| ID | Claim | Actual Code | Verdict |
|----|-------|-------------|---------|
| FP-01 | sell.mjs / tokenSell.mjs / [id]/sell.mjs lack OCC on holdings | All have `.eq("amount", heldAmount)` + rollback on failure | **Correct** |
| FP-02 | confirmBuy.mjs claim is not atomic (TOCTOU) | `UPDATE WHERE status="pending"` is atomic — only one request wins | **Correct** |
| FP-03 | confirmBuy / tokenBuy holdings update lacks OCC | Both have `.eq("amount", prevAmount)` | **Correct** |
| FP-04 | tokenSell.mjs doesn't call credit_balance | L161–171 calls `credit_balance` RPC with retry | **Correct** |
| FP-05 | tokenLock.mjs lacks OCC on holdings | L69–73 has `.eq("amount", heldAmount)` | **Correct** |
| FP-06 | createPost.mjs has no auth | Has `verification_level` check | **Correct** |
| FP-07 | createPost.mjs is vulnerable to XSS | Has `sanitizeContent()` function | **Correct** |
| FP-08 | verifyOrbStatus bypass via catch | Catch returns 502, not worldcoinVerified=true; fail-closed | **Correct** |
| FP-09 | upgrade.mjs uses wrong chain (Optimism) | Intentional — token creation fees are verified on Optimism chain | **Correct** |

---

## GOOD PRACTICES OBSERVED

- **OCC on tokens table**: All trading endpoints use `.eq("circulating_supply", supply)` for optimistic concurrency control, with retry loops
- **Atomic claim in confirmBuy**: `UPDATE WHERE status="pending"` prevents double-claiming payment orders
- **Nonce-based anti-replay in withdraw**: Atomic `UPDATE nonces SET used=true WHERE nonce=? AND used=false` prevents nonce reuse
- **Centralized ORB guard**: `requireOrb()` consistently checks `profiles.verification_level === "orb"` for all token operations
- **Creator lock in sell**: Creators cannot dump tokens within `CREATOR_LOCK_HOURS` of creation
- **Anti-replay in verifyPayment**: UNIQUE constraint on `processed_transactions.transaction_id` prevents transaction replay
- **Fail-closed ORB verification**: `verifyOrbStatus.mjs` returns 502 on API failure, never grants verification on error
- **Content sanitization**: `createPost.mjs` uses `sanitizeContent()` to prevent XSS
- **Audit logging**: Multiple endpoints call `log_audit` RPC for financial operations
- **Holdings rollback on sell OCC failure**: When holdings OCC fails in sell endpoints, the token update is rolled back before retrying
- **Max withdrawal limit**: `withdraw.mjs` caps withdrawals at `MAX_WITHDRAW_WLD` (500 WLD)
- **Reserve check**: Payout wallet maintains `MIN_RESERVE_WLD` (100 WLD) minimum balance

---

## PRIORITIZED REMEDIATION PLAN

### Immediate (Deploy Blocker)
1. **C-01/C-02**: Add Worldcoin payment verification to `confirmBuy.mjs` and remove or secure `tokens/[id]/buy.mjs`
2. **C-03/C-04**: Fix dead-code device verification in `verifyPayment.mjs` and `subscribePremiumChat.mjs` — move checks outside the `return` block
3. **C-05**: Unify `credit_balance` and `deduct_balance` to use the same table/column
4. **C-06**: Verify migration 4 is applied; merge into base schema

### This Sprint
5. **H-01**: Fix withdraw SIWE check to compare wallet addresses, not nullifier_hash
6. **H-02**: Reorder `createProfile.mjs` to validate userId before requireOrb
7. **H-03**: Add OCC to tokenBurn holdings update
8. **H-04**: Fail-closed when RP_SIGNING_KEY is missing
9. **H-05**: Atomic one_time airdrop claim
10. **H-06**: Add OCC to airdropRedeem fallback holdings update

### Next Sprint
11. **M-01 through M-05**: Fix stale amounts, silent OCC failures, CORS standardization, tokenLock rollback
12. **L-01 through L-04**: Clarify verification model, add missing constraints

---

*Report generated by exhaustive line-by-line code review. Each finding verified against actual source files.*
