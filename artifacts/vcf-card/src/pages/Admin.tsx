import { useState, useEffect, useCallback } from "react";

const mono = "'JetBrains Mono', monospace";
const orb = "'Orbitron', sans-serif";
const g = {
  green:   "hsl(120 65% 44%)",
  dim:     "hsl(120 30% 38%)",
  muted:   "hsl(120 15% 26%)",
  faint:   "hsl(120 20% 18%)",
  bg:      "hsl(120 55% 3.5%)",
  bg2:     "hsl(120 50% 3%)",
  border:  "hsl(120 30% 10%)",
  border2: "hsl(120 40% 16%)",
  red:     "hsl(0 60% 50%)",
  redBg:   "hsl(0 60% 50% / 0.08)",
  redBdr:  "hsl(0 60% 50% / 0.25)",
};

interface Contact { id: number; fullName: string; phone: string; email: string | null; organization: string | null; createdAt: string; }
interface Stats { count: number; target: number; percentage: number; targetReached: boolean; }

function api(path: string, options?: RequestInit, pin?: string) {
  return fetch(`/api/admin${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", "x-admin-pin": pin ?? "", ...options?.headers },
  });
}

export default function Admin() {
  const [pin, setPin]             = useState("");
  const [authed, setAuthed]       = useState(false);
  const [authErr, setAuthErr]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [contacts, setContacts]   = useState<Contact[]>([]);
  const [target, setTarget]       = useState("");
  const [targetMsg, setTargetMsg] = useState("");
  const [deleting, setDeleting]   = useState<number | null>(null);

  const load = useCallback(async (p: string) => {
    const [s, c] = await Promise.all([
      api("/stats", undefined, p).then(r => r.json()),
      api("/contacts", undefined, p).then(r => r.json()),
    ]);
    setStats(s);
    setContacts(c.contacts ?? []);
    setTarget(String(s.target ?? 50));
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setAuthErr("");
    const res = await api("/stats", undefined, pin);
    if (res.ok) {
      setAuthed(true);
      const s = await res.json();
      setStats(s);
      setTarget(String(s.target));
      await load(pin);
    } else {
      setAuthErr("Wrong PIN. Try again.");
    }
    setLoading(false);
  }

  async function saveTarget(e: React.FormEvent) {
    e.preventDefault();
    setTargetMsg("");
    const t = Number(target);
    if (!t || t < 1) { setTargetMsg("Enter a valid number"); return; }
    const res = await api("/target", { method: "PUT", body: JSON.stringify({ target: t }) }, pin);
    const j = await res.json();
    if (res.ok) { setTargetMsg("✓ Target updated"); await load(pin); }
    else setTargetMsg(j.error ?? "Error");
  }

  async function deleteContact(id: number) {
    setDeleting(id);
    await api(`/contacts/${id}`, { method: "DELETE" }, pin);
    setContacts(prev => prev.filter(c => c.id !== id));
    setStats(prev => prev ? { ...prev, count: prev.count - 1, percentage: Math.min(((prev.count - 1) / prev.target) * 100, 100), targetReached: (prev.count - 1) >= prev.target } : prev);
    setDeleting(null);
  }

  function downloadVcf() { window.open(`/api/admin/download?pin=${encodeURIComponent(pin)}`, "_blank"); }

  useEffect(() => { if (authed) load(pin); }, [authed, load, pin]);

  const inputStyle: React.CSSProperties = {
    background: g.bg2, border: `1px solid ${g.border}`, borderRadius: 8,
    padding: "9px 12px", color: g.green, fontFamily: mono, fontSize: 12,
    outline: "none", width: "100%", transition: "border-color 0.2s",
  };

  function onFocus(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = g.border2; }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = g.border; }

  /* ─── Login ─── */
  if (!authed) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, fontFamily: mono, background: g.bg,
        position: "relative", zIndex: 1,
      }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div
          className="card-animate glow-box-lg"
          style={{ width: "100%", maxWidth: 360, background: g.bg, border: `1px solid hsl(120 40% 16%)`, borderRadius: 14, overflow: "hidden" }}
        >
          <div style={{ height: 2, background: "linear-gradient(90deg, transparent, hsl(120 65% 40%), transparent)" }} />
          <div style={{ padding: "24px 20px" }}>
            <div style={{ fontFamily: orb, fontSize: 14, fontWeight: 900, color: g.green, marginBottom: 4 }} className="glow-text">
              WOLFTECH <span style={{ color: "hsl(120 55% 55%)" }}>ADMIN</span>
            </div>
            <div style={{ fontSize: 10, color: g.muted, letterSpacing: "0.08em", marginBottom: 20 }}>Enter your admin PIN to continue</div>
            <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="password" placeholder="Admin PIN"
                value={pin} onChange={e => setPin(e.target.value)}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                required autoFocus
              />
              {authErr && (
                <div style={{ fontSize: 10, color: g.red, background: g.redBg, border: `1px solid ${g.redBdr}`, borderRadius: 6, padding: "6px 10px" }}>
                  ⚠ {authErr}
                </div>
              )}
              <button
                type="submit" disabled={loading}
                className="btn-primary-glow"
                style={{
                  padding: "11px 16px", borderRadius: 9, border: "none", cursor: "pointer",
                  fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", opacity: loading ? 0.7 : 1,
                }}
              >{loading ? "Checking…" : "→ Enter"}</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Dashboard ─── */
  return (
    <div style={{
      minHeight: "100vh", fontFamily: mono, background: g.bg,
      padding: "12px 12px 48px", display: "flex", flexDirection: "column",
      alignItems: "center", position: "relative", zIndex: 1,
    }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Nav */}
      <nav style={{
        width: "100%", maxWidth: 560, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", marginBottom: 14, borderRadius: 10,
        background: "hsl(120 50% 3% / 0.9)", border: `1px solid ${g.border}`,
      }}>
        <div style={{ fontFamily: orb, fontSize: 13, fontWeight: 900, color: g.green }} className="glow-text">
          WOLF<span style={{ color: "hsl(120 55% 55%)" }}>TECH</span>{" "}
          <span style={{ color: g.dim, fontSize: 10 }}>ADMIN</span>
        </div>
        <a href="/" style={{ fontSize: 9, color: g.muted, textDecoration: "none", letterSpacing: "0.08em", border: `1px solid ${g.border}`, padding: "3px 9px", borderRadius: 99 }}>
          ← Public Card
        </a>
      </nav>

      <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Stats cards */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              { label: "Collected", value: stats.count },
              { label: "Target", value: stats.target },
              { label: "Progress", value: `${stats.percentage.toFixed(0)}%` },
            ].map(s => (
              <div key={s.label} style={{ background: g.bg, border: `1px solid ${g.border}`, borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontFamily: orb, fontSize: 20, fontWeight: 700, color: g.green }} className="glow-text">{s.value}</div>
                <div style={{ fontSize: 8, color: g.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {stats && (
          <div style={{ background: g.bg, border: `1px solid ${g.border}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: g.green }}>Progress</span>
              {stats.targetReached && <span style={{ fontSize: 9, color: g.green, fontWeight: 700 }}>✓ TARGET REACHED</span>}
            </div>
            <div style={{ width: "100%", height: 7, borderRadius: 99, background: g.faint, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99, transition: "width 0.6s ease",
                width: `${Math.min(stats.percentage, 100)}%`,
                background: "linear-gradient(90deg, hsl(120 55% 30%), hsl(120 65% 44%))",
                boxShadow: "0 0 6px hsl(120 60% 40% / 0.4)",
              }} />
            </div>
          </div>
        )}

        {/* Set target */}
        <div style={{ background: g.bg, border: `1px solid ${g.border}`, borderRadius: 10, padding: "14px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: g.green, marginBottom: 10 }}>Set Target</div>
          <form onSubmit={saveTarget} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
            <input
              type="number" min="1" max="100000"
              placeholder="e.g. 100"
              value={target} onChange={e => setTarget(e.target.value)}
              style={{ ...inputStyle, flex: 1, minWidth: 80 }}
              onFocus={onFocus} onBlur={onBlur}
            />
            <button
              type="submit"
              className="btn-primary-glow"
              style={{
                padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                flexShrink: 0,
              }}
            >Update</button>
          </form>
          {targetMsg && (
            <div style={{
              marginTop: 8, fontSize: 10, padding: "6px 10px", borderRadius: 6,
              color: targetMsg.startsWith("✓") ? g.green : g.red,
              background: targetMsg.startsWith("✓") ? "hsl(120 60% 40% / 0.08)" : g.redBg,
              border: `1px solid ${targetMsg.startsWith("✓") ? "hsl(120 60% 40% / 0.2)" : g.redBdr}`,
            }}>{targetMsg}</div>
          )}
        </div>

        {/* Download */}
        <div style={{ background: g.bg, border: `1px solid ${g.border}`, borderRadius: 10, padding: "14px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: g.green, marginBottom: 10 }}>Export</div>
          <button
            onClick={downloadVcf}
            className="btn-primary-glow"
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            }}
          >⬇ Download All Contacts (.vcf)</button>
          <div style={{ fontSize: 9, color: g.muted, marginTop: 6 }}>Admin download bypasses the target requirement.</div>
        </div>

        {/* Contacts table */}
        <div style={{ background: g.bg, border: `1px solid ${g.border}`, borderRadius: 10, padding: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: g.green }}>
              All Contacts ({contacts.length})
            </div>
            <button
              onClick={() => load(pin)}
              style={{ fontSize: 9, color: g.muted, background: "none", border: `1px solid ${g.border}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontFamily: mono, letterSpacing: "0.06em" }}
            >↻ Refresh</button>
          </div>
          {contacts.length === 0 ? (
            <div style={{ fontSize: 10, color: g.muted, textAlign: "center", padding: "20px 0" }}>No contacts yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 360, overflowY: "auto" }}>
              {contacts.map(c => (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 10, padding: "9px 10px", borderRadius: 8,
                  background: g.bg2, border: `1px solid ${g.border}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: g.green, fontWeight: 700, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.fullName}</div>
                    <div style={{ fontSize: 10, color: g.dim }}>{c.phone}</div>
                    {c.email && <div style={{ fontSize: 9, color: g.muted }}>{c.email}</div>}
                  </div>
                  <div style={{ fontSize: 9, color: g.muted, flexShrink: 0, textAlign: "right" }}>
                    <div>#{c.id}</div>
                    <div>{new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                  <button
                    onClick={() => deleteContact(c.id)}
                    disabled={deleting === c.id}
                    style={{
                      background: g.redBg, border: `1px solid ${g.redBdr}`, borderRadius: 6,
                      color: g.red, fontFamily: mono, fontSize: 9, padding: "4px 8px",
                      cursor: "pointer", flexShrink: 0, opacity: deleting === c.id ? 0.5 : 1,
                    }}
                  >{deleting === c.id ? "…" : "✕"}</button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
