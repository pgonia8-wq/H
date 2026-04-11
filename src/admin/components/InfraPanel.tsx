import React, { useState, useEffect, useCallback } from "react";

const STATE_COLORS: Record<string, string> = {
  NORMAL: "#10f090",
  STRESS: "#f7a606",
  CRITICAL: "#f05050",
  LOCKDOWN: "#ff2020",
};

const STATE_ICONS: Record<string, string> = {
  NORMAL: "🟢",
  STRESS: "🟡",
  CRITICAL: "🔴",
  LOCKDOWN: "🚨",
};

const STATE_LABELS: Record<string, string> = {
  NORMAL: "Normal — Full functionality",
  STRESS: "Stress — Aggressive caching, batch writes, reduced realtime",
  CRITICAL: "Critical — Queue social writes, disable realtime, prioritize trading",
  LOCKDOWN: "Lockdown — Read-only feed, trading disabled, drain queue",
};

interface InfraPanelProps {
  apiCall: (endpoint: string, body?: any) => Promise<any>;
}

export default function InfraPanel({ apiCall }: InfraPanelProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [logFilter, setLogFilter] = useState<any>({ type: "", limit: 30 });
  const [showLogs, setShowLogs] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const d = await apiCall("infra");
      setData(d);
    } catch {}
    setLoading(false);
  }, [apiCall]);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 5000);
    return () => clearInterval(iv);
  }, [refresh]);

  const doAction = async (action: string, params: any = {}) => {
    try {
      await apiCall("infra", { action, ...params });
      setConfirming(null);
      setActionReason("");
      await refresh();
    } catch {}
  };

  const queryLogs = async () => {
    try {
      const result = await apiCall("infra", { action: "query_logs", ...logFilter });
      setLogs(result.logs || []);
    } catch {}
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading infrastructure state...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "#f05050" }}>Failed to load infrastructure data</div>;

  const { system, metrics, queue, tracing, rateLimit: rl } = data;
  const stateColor = STATE_COLORS[system.state] || "#666";

  const cardStyle: React.CSSProperties = { background: "#12121a", border: "1px solid #1e1e2e", borderRadius: 12, padding: 16, marginBottom: 12 };
  const labelStyle: React.CSSProperties = { fontSize: 11, color: "#666", fontWeight: 500, marginBottom: 4 };
  const valueStyle: React.CSSProperties = { fontSize: 20, fontWeight: 700 };
  const btnStyle = (color: string): React.CSSProperties => ({ background: color + "18", border: "1px solid " + color + "40", color, padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" });

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        🏗️ Infrastructure Control
        <span style={{ fontSize: 12, background: stateColor + "20", color: stateColor, padding: "3px 10px", borderRadius: 6, fontWeight: 700 }}>
          {STATE_ICONS[system.state]} {system.state}
        </span>
        {system.auto && <span style={{ fontSize: 10, background: "#10f09015", color: "#10f090", padding: "2px 8px", borderRadius: 6 }}>AUTO</span>}
      </h2>

      {/* System State Banner */}
      <div style={{ ...cardStyle, borderColor: stateColor + "40", background: stateColor + "08" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: stateColor }}>{STATE_ICONS[system.state]} System State: {system.state}</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{STATE_LABELS[system.state]}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>Since: {system.since} ({system.uptimeInState}s ago)</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          {["NORMAL", "STRESS", "CRITICAL", "LOCKDOWN"].map(s => (
            <button key={s} onClick={() => setConfirming(s)} disabled={system.state === s}
              style={{ ...btnStyle(STATE_COLORS[s]), opacity: system.state === s ? 0.3 : 1, cursor: system.state === s ? "default" : "pointer" }}>
              {STATE_ICONS[s]} {s}
            </button>
          ))}
          <button onClick={() => doAction("enable_auto")} style={btnStyle("#10f090")}>
            🔄 Enable Auto
          </button>
        </div>

        {confirming && (
          <div style={{ marginTop: 12, padding: 12, background: "#0a0a0f", borderRadius: 8, border: "1px solid #2a2a3e" }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: STATE_COLORS[confirming] }}>
              Force transition to {confirming}?
            </div>
            <input type="text" placeholder="Reason (required)" value={actionReason} onChange={e => setActionReason(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", background: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: 6, color: "#e0e0e0", fontSize: 12, marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => actionReason && doAction("force_state", { state: confirming, reason: actionReason })}
                disabled={!actionReason} style={{ ...btnStyle(STATE_COLORS[confirming]), opacity: actionReason ? 1 : 0.4 }}>Confirm</button>
              <button onClick={() => { setConfirming(null); setActionReason(""); }} style={btnStyle("#666")}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* State Effects */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div style={cardStyle}>
          <div style={labelStyle}>Cache</div>
          <div style={{ ...valueStyle, fontSize: 14, color: system.cache.enabled ? "#10f090" : "#666" }}>{system.cache.enabled ? "ENABLED" : "OFF"}</div>
          {system.cache.enabled && <div style={{ fontSize: 10, color: "#555" }}>Feed: {system.cache.feedTTL}ms | Token: {system.cache.tokenTTL}ms</div>}
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Batch Writes</div>
          <div style={{ ...valueStyle, fontSize: 14, color: system.batchEnabled ? "#f7a606" : "#666" }}>{system.batchEnabled ? "ENABLED" : "OFF"}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Realtime</div>
          <div style={{ ...valueStyle, fontSize: 14, color: system.realtimeEnabled ? "#10f090" : "#f05050" }}>{system.realtimeEnabled ? "ON" : "OFF"}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Social Writes</div>
          <div style={{ ...valueStyle, fontSize: 14, color: system.socialWritesAllowed ? "#10f090" : "#f05050" }}>{system.socialWritesAllowed ? "ON" : "BLOCKED"}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Trading</div>
          <div style={{ ...valueStyle, fontSize: 14, color: system.tradingAllowed ? "#10f090" : "#f05050" }}>{system.tradingAllowed ? "ON" : "BLOCKED"}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Queue Social</div>
          <div style={{ ...valueStyle, fontSize: 14, color: system.queueSocialWrites ? "#f7a606" : "#666" }}>{system.queueSocialWrites ? "QUEUING" : "DIRECT"}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Feed Refresh</div>
          <div style={{ ...valueStyle, fontSize: 14 }}>{(system.feedRefreshMs / 1000).toFixed(0)}s</div>
        </div>
      </div>

      {/* Metrics + Queue + Rate Limit */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={cardStyle}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#aaa" }}>📊 Live Metrics</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
            <div><span style={{ color: "#666" }}>RPS:</span> <span style={{ fontWeight: 600 }}>{metrics.rps}</span></div>
            <div><span style={{ color: "#666" }}>TPS:</span> <span style={{ fontWeight: 600 }}>{metrics.tps}</span></div>
            <div><span style={{ color: "#666" }}>P95:</span> <span style={{ fontWeight: 600, color: metrics.p95 > 200 ? "#f7a606" : "#10f090" }}>{metrics.p95}ms</span></div>
            <div><span style={{ color: "#666" }}>P99:</span> <span style={{ fontWeight: 600, color: metrics.p99 > 500 ? "#f05050" : "#e0e0e0" }}>{metrics.p99}ms</span></div>
            <div><span style={{ color: "#666" }}>Error Rate:</span> <span style={{ fontWeight: 600, color: metrics.errorRateNum > 3 ? "#f05050" : "#10f090" }}>{metrics.errorRate}</span></div>
            <div><span style={{ color: "#666" }}>Failed/min:</span> <span style={{ fontWeight: 600, color: metrics.failedTrades1m > 50 ? "#f05050" : "#e0e0e0" }}>{metrics.failedTrades1m}</span></div>
          </div>
        </div>
        <div style={cardStyle}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#aaa" }}>📦 Queue</h3>
          {queue?.worker && (
            <div style={{ fontSize: 12 }}>
              <div><span style={{ color: "#666" }}>Worker:</span> <span style={{ color: queue.worker.running ? "#10f090" : "#f05050", fontWeight: 600 }}>{queue.worker.running ? "RUNNING" : "STOPPED"}</span></div>
              <div><span style={{ color: "#666" }}>Processed:</span> {queue.worker.processed} | <span style={{ color: "#666" }}>Failed:</span> {queue.worker.failed}</div>
              <div style={{ marginTop: 4 }}><span style={{ color: "#666" }}>DB Pending:</span> {queue.db?.pending || 0} | <span style={{ color: "#666" }}>Memory:</span> {queue.memory?.pending || 0}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button onClick={() => doAction("start_worker")} style={btnStyle("#10f090")} disabled={queue.worker.running}>Start</button>
                <button onClick={() => doAction("stop_worker")} style={btnStyle("#f05050")} disabled={!queue.worker.running}>Stop</button>
                <button onClick={() => doAction("drain_queue")} style={btnStyle("#f7a606")}>Drain</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rate Limit + Tracing */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={cardStyle}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#aaa" }}>🛡️ Rate Limiting</h3>
          <div style={{ fontSize: 12 }}>
            <div><span style={{ color: "#666" }}>Active Users:</span> {rl?.activeUsers || 0}</div>
            <div><span style={{ color: "#666" }}>Payload Tracking:</span> {rl?.trackedPayloads || 0}</div>
            <div><span style={{ color: "#666" }}>Burst Tracking:</span> {rl?.burstTracking || 0}</div>
            <div><span style={{ color: "#666" }}>Trading Loops:</span> {rl?.tradingLoops || 0}</div>
          </div>
        </div>
        <div style={cardStyle}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#aaa" }}>🔍 Tracing</h3>
          <div style={{ fontSize: 12 }}>
            <div><span style={{ color: "#666" }}>Buffer:</span> {tracing?.buffered || 0} / {tracing?.bufferSize || 50}</div>
            <div><span style={{ color: "#666" }}>Flush Interval:</span> {((tracing?.flushInterval || 10000) / 1000).toFixed(0)}s</div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => doAction("flush_traces")} style={btnStyle("#6060ff")}>Flush Now</button>
            </div>
          </div>
        </div>
      </div>

      {/* System Logs Search */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#aaa" }}>📋 System Logs (Traces)</h3>
          <button onClick={() => setShowLogs(!showLogs)} style={btnStyle("#6060ff")}>{showLogs ? "Hide" : "Search Logs"}</button>
        </div>
        {showLogs && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <select value={logFilter.type} onChange={e => setLogFilter({ ...logFilter, type: e.target.value })}
                style={{ background: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: 6, color: "#e0e0e0", padding: "4px 8px", fontSize: 11 }}>
                <option value="">All Types</option>
                <option value="TRADE">Trade</option>
                <option value="SOCIAL">Social</option>
                <option value="ERROR">Error</option>
                <option value="SYSTEM">System</option>
                <option value="RATE_LIMIT">Rate Limit</option>
                <option value="INFRA">Infra</option>
              </select>
              <input type="text" placeholder="User ID" value={logFilter.userId || ""} onChange={e => setLogFilter({ ...logFilter, userId: e.target.value || undefined })}
                style={{ background: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: 6, color: "#e0e0e0", padding: "4px 8px", fontSize: 11, width: 160 }} />
              <input type="text" placeholder="Trace ID" value={logFilter.traceId || ""} onChange={e => setLogFilter({ ...logFilter, traceId: e.target.value || undefined })}
                style={{ background: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: 6, color: "#e0e0e0", padding: "4px 8px", fontSize: 11, width: 160 }} />
              <button onClick={queryLogs} style={btnStyle("#6060ff")}>Search</button>
            </div>
            {logs.length > 0 ? (
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e1e2e" }}>
                      <th style={{ padding: "4px 6px", textAlign: "left", color: "#666" }}>Time</th>
                      <th style={{ padding: "4px 6px", textAlign: "left", color: "#666" }}>Trace</th>
                      <th style={{ padding: "4px 6px", textAlign: "left", color: "#666" }}>Type</th>
                      <th style={{ padding: "4px 6px", textAlign: "left", color: "#666" }}>Span</th>
                      <th style={{ padding: "4px 6px", textAlign: "left", color: "#666" }}>Status</th>
                      <th style={{ padding: "4px 6px", textAlign: "right", color: "#666" }}>Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l: any, i: number) => (
                      <tr key={i} style={{ borderBottom: "1px solid #1a1a2a" }}>
                        <td style={{ padding: "3px 6px", color: "#888" }}>{new Date(l.created_at).toLocaleTimeString()}</td>
                        <td style={{ padding: "3px 6px", color: "#6060ff", fontFamily: "monospace", fontSize: 10 }}>{l.trace_id?.slice(0, 16)}</td>
                        <td style={{ padding: "3px 6px" }}>
                          <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 600,
                            background: l.type === "ERROR" ? "#f0505020" : l.type === "TRADE" ? "#10f09020" : l.type === "RATE_LIMIT" ? "#f7a60620" : "#6060ff20",
                            color: l.type === "ERROR" ? "#f05050" : l.type === "TRADE" ? "#10f090" : l.type === "RATE_LIMIT" ? "#f7a606" : "#6060ff",
                          }}>{l.type}</span>
                        </td>
                        <td style={{ padding: "3px 6px", color: "#aaa", fontSize: 10 }}>{l.span}</td>
                        <td style={{ padding: "3px 6px", color: l.status?.startsWith("2") ? "#10f090" : l.status?.startsWith("4") ? "#f7a606" : "#f05050" }}>{l.status}</td>
                        <td style={{ padding: "3px 6px", textAlign: "right", color: "#888" }}>{l.latency}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "#555", textAlign: "center", padding: 10 }}>No logs found. Run a search above.</div>
            )}
          </div>
        )}
      </div>

      {/* State Transition History */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#aaa" }}>📜 State Transition History</h3>
        <div style={{ maxHeight: 200, overflowY: "auto" }}>
          {(data.stateTransitions || []).slice().reverse().map((t: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid #1a1a2a", fontSize: 11 }}>
              <span style={{ color: "#555", minWidth: 70 }}>{new Date(t.ts).toLocaleTimeString()}</span>
              <span style={{ color: STATE_COLORS[t.from] || "#666", fontWeight: 600 }}>{t.from}</span>
              <span style={{ color: "#444" }}>→</span>
              <span style={{ color: STATE_COLORS[t.to] || "#666", fontWeight: 600 }}>{t.to}</span>
              <span style={{ color: "#555", flex: 1, textAlign: "right", fontSize: 10 }}>{t.reason}</span>
            </div>
          ))}
          {(!data.stateTransitions || data.stateTransitions.length === 0) && (
            <div style={{ fontSize: 11, color: "#555", textAlign: "center", padding: 10 }}>No transitions yet</div>
          )}
        </div>
      </div>

      {/* Config Editor */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#aaa" }}>⚙️ Auto-Scaling Thresholds</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
          <div><span style={{ color: "#666" }}>Stress P95 Trigger:</span> <span style={{ fontWeight: 600 }}>{system.config.stressLatencyP95}ms</span></div>
          <div><span style={{ color: "#666" }}>Stress Error Rate:</span> <span style={{ fontWeight: 600 }}>{system.config.stressErrorRate}%</span></div>
          <div><span style={{ color: "#666" }}>Critical DB Usage:</span> <span style={{ fontWeight: 600 }}>{system.config.criticalDbUsage}%</span></div>
          <div><span style={{ color: "#666" }}>Critical Error Rate:</span> <span style={{ fontWeight: 600 }}>{system.config.criticalErrorRate}%</span></div>
          <div><span style={{ color: "#666" }}>Auto-Lockdown After:</span> <span style={{ fontWeight: 600 }}>{system.config.lockdownAutoSec}s critical</span></div>
        </div>
      </div>

      {/* Priority Legend */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#aaa" }}>🏆 Priority Order</h3>
        <div style={{ display: "flex", gap: 12, fontSize: 12, flexWrap: "wrap" }}>
          {["1. Trading (BUY/SELL)", "2. Financial Integrity", "3. Token State", "4. Social Features", "5. UI Realtime"].map((p, i) => (
            <span key={i} style={{ background: "#1a1a2e", padding: "3px 10px", borderRadius: 6, color: i === 0 ? "#10f090" : i < 3 ? "#f7a606" : "#666", fontWeight: i === 0 ? 700 : 400 }}>{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
