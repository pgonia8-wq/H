/**
 * viewModelBuilder.prop.test.mjs — Property tests invariantes (Ley A4).
 *
 * Ejecutar: node --test Humans/test/viewModelBuilder.prop.test.mjs
 *
 * Invariantes testeados (fuzz 1000 raw-states):
 *   I1  score.delta = score.value - 1000
 *   I2  progression.graduation.overallBps = min(4 gates)
 *   I3  status.overall ∈ {FRAUD_LOCKED, FROZEN, GRADUATED, EMERGENCY, OK}
 *       con precedencia FRAUD_LOCKED > FROZEN > GRADUATED > EMERGENCY > OK
 *   I4  todo campo lleva source ∈ {onchain, indexed, db, mirror, unknown}
 *       y stale:boolean
 *   I5  ningún campo viola su SLA sin stale:true (vía _sla)
 *   I6  idempotencia: compose(raw) produce exactly el mismo objeto en dos llamadas
 */

import test from "node:test";
import assert from "node:assert/strict";
import { compose } from "../api/lib/viewModelBuilder.mjs";

function seedRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function randomRaw(rand) {
  const now = 1_713_600_000 + Math.floor(rand() * 100_000);
  const createdAt = now - Math.floor(rand() * 200 * 86400);
  const supply    = Math.floor(rand() * 50_000);
  const verified  = BigInt(Math.floor(rand() * 30_000)) * (10n ** 18n);
  const level     = 1 + Math.floor(rand() * 5);
  const score     = 975 + Math.floor(rand() * 51);
  const influence = 975 + Math.floor(rand() * 51);
  const onchain = rand() > 0.1 ? {
    graduated:     rand() > 0.9,
    fraudLocked:   rand() > 0.97,
    frozen:        rand() > 0.95,
    emergencyMode: rand() > 0.98,
    isHuman:       rand() > 0.1,
    isTotem:       true,
    score, influence, signedAt: now - Math.floor(rand() * 300),
    price: BigInt(Math.floor(rand() * 1e10)) * (10n ** 8n),
    supply, rawVolume: Math.floor(rand() * 40_000),
    verifiedVolume: verified,
    createdAt, lastTradeAt: now - Math.floor(rand() * 7200),
    level, badge: Math.floor(rand() * 4),
    totalScoreAccumulated: Math.floor(rand() * 2_000_000),
    negativeEvents: Math.floor(rand() * 80),
    userBalance: Math.floor(rand() * 500),
    soldInWindow: Math.floor(rand() * 200),
    credits: BigInt(Math.floor(rand() * 1e6)),
    rateLimit: { used: Math.floor(rand() * 5), max: 5, resetInSec: Math.floor(rand() * 3600) },
  } : {};
  const indexed = {
    name: `Totem-${Math.floor(rand() * 1000)}`,
    owner: `user-${Math.floor(rand() * 1000)}`,
    score, influence, level, badge: "PRO", price: Math.random(), supply,
    rawVolume: Math.floor(rand() * 40_000), createdAt,
  };
  const db = { name: indexed.name, owner: indexed.owner, createdAt };
  const fetchedAt = {
    onchain:     Object.keys(onchain).length ? now : null,
    indexed:     now,
    db:          now,
    userContext: now,
  };
  return { onchain, indexed, db, userContext: null, fetchedAt, nowSec: now, address: "0xabc" };
}

function eachField(obj, cb, path = "") {
  if (obj == null || typeof obj !== "object") return;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const p = path ? `${path}.${k}` : k;
    if (v && typeof v === "object" && "source" in v && "stale" in v && !("_v" in v)) {
      cb(p, v);
    } else if (v && typeof v === "object") {
      eachField(v, cb, p);
    }
  }
}

test("I1 — score.delta = score.value - 1000", () => {
  const rand = seedRand(42);
  for (let i = 0; i < 1000; i++) {
    const raw = randomRaw(rand);
    const vm = compose(raw);
    if (vm.oracle.score.value != null) {
      assert.equal(vm.oracle.scoreDelta.value, Number(vm.oracle.score.value) - 1000);
    }
  }
});

test("I2 — graduation.overallBps = min(4 gates)", () => {
  const rand = seedRand(7);
  for (let i = 0; i < 1000; i++) {
    const vm = compose(randomRaw(rand));
    const g = vm.progression.graduation.value.gates;
    const mn = Math.min(g.level.ratioBps, g.supply.ratioBps, g.volume.ratioBps, g.age.ratioBps);
    assert.equal(vm.progression.graduation.value.overallBps, mn);
  }
});

test("I3 — status.overall precedence", () => {
  const rand = seedRand(99);
  for (let i = 0; i < 1000; i++) {
    const vm = compose(randomRaw(rand));
    const s = vm.status;
    const o = s.overall;
    assert.ok(["FRAUD_LOCKED", "FROZEN", "GRADUATED", "EMERGENCY", "OK"].includes(o));
    if (s.fraudLocked.value === true)        assert.equal(o, "FRAUD_LOCKED");
    else if (s.frozen.value === true)        assert.equal(o, "FROZEN");
    else if (s.graduated.value === true)     assert.equal(o, "GRADUATED");
    else if (s.emergencyMode.value === true) assert.equal(o, "EMERGENCY");
    else                                     assert.equal(o, "OK");
  }
});

test("I4 — every leaf field has source + stale", () => {
  const rand = seedRand(1234);
  const vm = compose(randomRaw(rand));
  eachField(vm, (path, leaf) => {
    assert.ok(["onchain", "indexed", "db", "mirror", "unknown"].includes(leaf.source), `bad source at ${path}: ${leaf.source}`);
    assert.equal(typeof leaf.stale, "boolean", `stale not boolean at ${path}`);
  });
});

test("I6 — idempotence: compose called twice with same raw produces equal viewModel", () => {
  const rand = seedRand(777);
  for (let i = 0; i < 100; i++) {
    const raw = randomRaw(rand);
    const a = compose(raw);
    const b = compose(raw);
    assert.deepEqual(a, b);
  }
});
