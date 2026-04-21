import { useEffect, useState } from "react";

interface ContractInfo {
  id: string;
  name: string;
  role: string;
  status: "WIRED" | "DRAFT";
  envVar: string | null;
  mirror: string | null;
  deployed: boolean;
  address: string | null;
  note?: string;
}

interface ContractsResponse {
  protocolVersion: string;
  total:  number;
  wired:  number;
  draft:  number;
  contracts: ContractInfo[];
}

interface Props {
  apiCall: (path: string, opts?: any) => Promise<any>;
}

export default function ContractsPanel({ apiCall }: Props) {
  const [data, setData] = useState<ContractsResponse | null>(null);
  const [err,  setErr]  = useState<string | null>(null);

  useEffect(() => {
    apiCall("contracts")
      .then(setData)
      .catch(e => setErr(e?.message ?? "Error"));
  }, [apiCall]);

  if (err)  return <div style={{ color: "#f05050", padding: 20 }}>Error: {err}</div>;
  if (!data) return <div style={{ color: "#888", padding: 20 }}>Cargando contratos…</div>;

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "baseline" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e0e0e0", margin: 0 }}>Contratos del Protocolo</h2>
        <span style={{ fontSize: 11, color: "#888" }}>v{data.protocolVersion}</span>
        <span style={{ fontSize: 11, color: "#22c55e" }}>{data.wired} wired</span>
        {data.draft > 0 && <span style={{ fontSize: 11, color: "#f7a606" }}>{data.draft} draft</span>}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {data.contracts.map(c => (
          <div key={c.id}
            style={{
              background: c.status === "DRAFT" ? "#2a1f12" : "#12121a",
              border: `1px solid ${c.status === "DRAFT" ? "#f7a606" : c.deployed ? "#1e1e2e" : "#3a2222"}`,
              borderRadius: 10, padding: 12,
            }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "#666", fontFamily: "monospace" }}>{c.id}</span>
                <span style={{ fontSize: 14, color: "#e0e0e0", fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: 10, color: "#888" }}>· {c.role}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 700,
                  background: c.status === "DRAFT" ? "#f7a60622" : "#22c55e22",
                  color:      c.status === "DRAFT" ? "#f7a606"   : "#22c55e",
                }}>{c.status}</span>
                {c.status === "WIRED" && (
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 700,
                    background: c.deployed ? "#22c55e22" : "#f0505022",
                    color:      c.deployed ? "#22c55e"   : "#f05050",
                  }}>{c.deployed ? "DEPLOYED" : "NO ADDR"}</span>
                )}
              </div>
            </div>
            <div style={{ display: "grid", gap: 3, fontSize: 11, color: "#888" }}>
              {c.envVar && <div>ENV: <code style={{ color: "#a78bfa" }}>{c.envVar}</code></div>}
              {c.address && <div>Addr: <code style={{ color: "#e0e0e0", fontFamily: "monospace" }}>{c.address}</code></div>}
              {c.mirror && <div>Mirror: <code style={{ color: "#60a5fa" }}>{c.mirror}</code></div>}
              {c.note && <div style={{ color: "#f7a606" }}>⚠ {c.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
