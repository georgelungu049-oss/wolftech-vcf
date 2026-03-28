import { useState, useEffect, useCallback } from "react";

const mono = "'JetBrains Mono', monospace";
const orb = "'Orbitron', sans-serif";
const g = {
  green:   "hsl(120 65% 44%)",
  greenHi: "hsl(120 55% 56%)",
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
interface SiteSettings { whatsapp: string; youtube: string; wa_channel: string; wa_group: string; }

const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp:   "https://wa.me/254713046497",
  youtube:    "https://www.youtube.com/@Silentwolf906",
  wa_channel: "https://whatsapp.com/channel/0029Vb6dn9nEQIaqEMNclK3Y",
  wa_group:   "https://chat.whatsapp.com/HjFc3pud3IA0R0WGr1V2Xu",
};

function api(path: string, options?: RequestInit, pin?: string) {
  return fetch(`/api/admin${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", "x-admin-pin": pin ?? "", ...options?.headers },
  });
}

/* ─── Section wrapper ─── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: g.bg, border: `1px solid ${g.border}`, borderRadius: 10, padding: "14px" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: g.green, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

/* ─── Feedback message ─── */
function Msg({ text }: { text: string }) {
  if (!text) return null;
  const ok = text.startsWith("✓");
  return (
    <div style={{
      marginTop: 8, fontSize: 10, padding: "6px 10px", borderRadius: 6,
      color: ok ? g.green : g.red,
      background: ok ? "hsl(120 60% 40% / 0.08)" : g.redBg,
      border: `1px solid ${ok ? "hsl(120 60% 40% / 0.2)" : g.redBdr}`,
    }}>{text}</div>
  );
}

export default function Admin() {
  const [pin, setPin]               = useState("");
  const [authed, setAuthed]         = useState(false);
  const [authErr, setAuthErr]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [contacts, setContacts]     = useState<Contact[]>([]);
  const [target, setTarget]         = useState("");
  const [targetMsg, setTargetMsg]   = useState("");
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [clearing, setClearing]     = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearMsg, setClearMsg]     = useState("");

  /* Password change */
  const [newPin, setNewPin]         = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pwMsg, setPwMsg]           = useState("");
  const [pwLoading, setPwLoading]   = useState(false);

  /* Site settings / URLs */
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [settingsMsg, setSettingsMsg]   = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    background: g.bg2, border: `1px solid ${g.border}`, borderRadius: 8,
    padding: "9px 12px", color: g.green, fontFamily: mono, fontSize: 12,
    outline: "none", width: "100%", transition: "border-color 0.2s",
  };
  function onFocus(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = g.border2; }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = g.border; }

  const load = useCallback(async (p: string) => {
    const [s, c, sets] = await Promise.all([
      api("/stats", undefined, p).then(r => r.json()),
      api("/contacts", undefined, p).then(r => r.json()),
      api("/site-settings", undefined, p).then(r => r.json()),
    ]);
    setStats(s);
    setContacts(c.contacts ?? []);
    setTarget(String(s.target ?? 50));
    if (sets.settings) setSiteSettings({ ...DEFAULT_SETTINGS, ...sets.settings });
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setAuthErr("");
    const res = await api("/stats", undefined, pin);
    if (res.ok) {
      setAuthed(true);
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

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    if (newPin.trim().length < 4) { setPwMsg("New password must be at least 4 characters"); return; }
    if (newPin !== confirmPin) { setPwMsg("Passwords don't match"); return; }
    setPwLoading(true);
    const res = await api("/password", { method: "PUT", body: JSON.stringify({ newPin: newPin.trim() }) }, pin);
    const j = await res.json();
    if (res.ok) {
      setPwMsg("✓ Password updated — you'll need to use your new password next time you log in");
      setPin(newPin.trim());
      setNewPin(""); setConfirmPin("");
    } else {
      setPwMsg(j.error ?? "Error updating password");
    }
    setPwLoading(false);
  }

  async function saveSiteSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsMsg("");
    setSettingsLoading(true);
    const res = await api("/site-settings", {
      method: "PUT",
      body: JSON.stringify({ settings: siteSettings }),
    }, pin);
    const j = await res.json();
    if (res.ok) { setSettingsMsg("✓ Links updated — changes are live on the public card"); }
    else setSettingsMsg(j.error ?? "Error saving settings");
    setSettingsLoading(false);
  }

  async function deleteContact(id: number) {
    setDeleting(id);
    await api(`/contacts?id=${id}`, { method: "DELETE" }, pin);
    setContacts(prev => prev.filter(c => c.id !== id));
    setStats(prev => prev ? {
      ...prev, count: prev.count - 1,
      percentage: Math.min(((prev.count - 1) / prev.target) * 100, 100),
      targetReached: (prev.count - 1) >= prev.target,
    } : prev);
    setDeleting(null);
  }

  function downloadVcf() { window.open(`/api/admin/download?pin=${encodeURIComponent(pin)}`, "_blank"); }

  async function clearAll() {
    setClearing(true); setClearMsg("");
    const res = await api("/contacts", { method: "DELETE" }, pin);
    if (res.ok) {
      setClearMsg("✓ Database cleared — new count starts now");
      setConfirmClear(false);
      await load(pin);
    } else {
      setClearMsg("⚠ Failed to clear. Try again.");
    }
    setClearing(false);
  }

  useEffect(() => { if (authed) load(pin); }, [authed, load, pin]);

  /* ─── Login ─── */
  if (!authed) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, fontFamily: mono, background: g.bg, position: "relative", zIndex: 1,
      }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="card-animate glow-box-lg" style={{ width: "100%", maxWidth: 360, background: g.bg, border: `1px solid hsl(120 40% 16%)`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ height: 2, background: "linear-gradient(90deg, transparent, hsl(120 65% 40%), transparent)" }} />
          <div style={{ padding: "24px 20px" }}>
            <div style={{ fontFamily: orb, fontSize: 14, fontWeight: 900, color: g.green, marginBottom: 4 }} className="glow-text">
              WOLFTECH <span style={{ color: g.greenHi }}>ADMIN</span>
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
                <div style={{ fontSize: 10, color: g.red, background: g.redBg, border: `1px solid ${g.redBdr}`, borderRadius: 6, padding: "6px 10px" }}>⚠ {authErr}</div>
              )}
              <button
                type="submit" disabled={loading}
                className="btn-primary-glow"
                style={{ padding: "11px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: loading ? 0.7 : 1 }}
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
          WOLF<span style={{ color: g.greenHi }}>TECH</span>{" "}
          <span style={{ color: g.dim, fontSize: 10 }}>ADMIN</span>
        </div>
        <a href="/" style={{ fontSize: 9, color: g.muted, textDecoration: "none", letterSpacing: "0.08em", border: `1px solid ${g.border}`, padding: "3px 9px", borderRadius: 99 }}>
          ← Public Card
        </a>
      </nav>

      <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Stats */}
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
        <Section title="Set Target">
          <form onSubmit={saveTarget} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
            <input
              type="number" min="1" max="100000" placeholder="e.g. 100"
              value={target} onChange={e => setTarget(e.target.value)}
              style={{ ...inputStyle, flex: 1, minWidth: 80 }}
              onFocus={onFocus} onBlur={onBlur}
            />
            <button type="submit" className="btn-primary-glow" style={{ padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>Update</button>
          </form>
          <Msg text={targetMsg} />
        </Section>

        {/* ─── Social Link Settings ─── */}
        <Section title="Social Links / URLs">
          <div style={{ fontSize: 9, color: g.muted, marginBottom: 12, lineHeight: 1.6 }}>
            These links appear on the public card. Changes take effect immediately.
          </div>
          <form onSubmit={saveSiteSettings} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {([ 
              { key: "whatsapp",   label: "📱 WhatsApp URL",         placeholder: "https://wa.me/254713046497" },
              { key: "youtube",    label: "▶ YouTube URL",            placeholder: "https://www.youtube.com/@Handle" },
              { key: "wa_channel", label: "📡 WhatsApp Channel URL",  placeholder: "https://whatsapp.com/channel/..." },
              { key: "wa_group",   label: "👥 WhatsApp Group URL",    placeholder: "https://chat.whatsapp.com/..." },
            ] as const).map(({ key, label, placeholder }) => (
              <div key={key}>
                <div style={{ fontSize: 9, color: g.dim, letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
                <input
                  type="url"
                  placeholder={placeholder}
                  value={siteSettings[key]}
                  onChange={e => setSiteSettings(prev => ({ ...prev, [key]: e.target.value }))}
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>
            ))}
            <button
              type="submit" disabled={settingsLoading}
              className="btn-primary-glow"
              style={{ padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: settingsLoading ? 0.7 : 1, marginTop: 2 }}
            >{settingsLoading ? "Saving…" : "Save Links"}</button>
          </form>
          <Msg text={settingsMsg} />
        </Section>

        {/* ─── Change Password ─── */}
        <Section title="Change Password">
          <div style={{ fontSize: 9, color: g.muted, marginBottom: 12, lineHeight: 1.6 }}>
            Update your admin PIN. You will continue to use your current session after changing.
          </div>
          <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="password" placeholder="New password (min 4 chars)"
              value={newPin} onChange={e => setNewPin(e.target.value)}
              style={inputStyle} onFocus={onFocus} onBlur={onBlur}
            />
            <input
              type="password" placeholder="Confirm new password"
              value={confirmPin} onChange={e => setConfirmPin(e.target.value)}
              style={inputStyle} onFocus={onFocus} onBlur={onBlur}
            />
            <button
              type="submit" disabled={pwLoading}
              className="btn-primary-glow"
              style={{ padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: pwLoading ? 0.7 : 1 }}
            >{pwLoading ? "Saving…" : "Update Password"}</button>
          </form>
          <Msg text={pwMsg} />
        </Section>

        {/* Export & Reset */}
        <Section title="Export & Reset">
          <button
            onClick={downloadVcf}
            className="btn-primary-glow"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
          >⬇ Download All Contacts (.vcf)</button>
          <div style={{ fontSize: 9, color: g.muted, marginTop: 6, marginBottom: 14 }}>Admin download bypasses the target requirement.</div>

          {!confirmClear ? (
            <button
              onClick={() => { setClearMsg(""); setConfirmClear(true); }}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: g.redBg, border: `1px solid ${g.redBdr}`, color: g.red }}
            >⟳ Clear Database &amp; Restart Count</button>
          ) : (
            <div style={{ background: "hsl(0 60% 10% / 0.5)", border: `1px solid ${g.redBdr}`, borderRadius: 8, padding: "12px" }}>
              <div style={{ fontSize: 10, color: g.red, fontWeight: 700, marginBottom: 6 }}>⚠ This will delete ALL contacts permanently.</div>
              <div style={{ fontSize: 9, color: g.muted, marginBottom: 10 }}>Make sure you have downloaded the VCF file first. This cannot be undone.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={clearAll} disabled={clearing} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: g.red, color: "#000", opacity: clearing ? 0.6 : 1 }}>{clearing ? "Clearing…" : "Yes, Clear All"}</button>
                <button onClick={() => { setConfirmClear(false); setClearMsg(""); }} style={{ flex: 1, padding: "9px", borderRadius: 7, cursor: "pointer", fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "none", border: `1px solid ${g.border}`, color: g.muted }}>Cancel</button>
              </div>
            </div>
          )}
          <Msg text={clearMsg} />
        </Section>

        {/* Contacts table */}
        <Section title={`All Contacts (${contacts.length})`}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10, marginTop: -4 }}>
            <button onClick={() => load(pin)} style={{ fontSize: 9, color: g.muted, background: "none", border: `1px solid ${g.border}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontFamily: mono, letterSpacing: "0.06em" }}>↻ Refresh</button>
          </div>
          {contacts.length === 0 ? (
            <div style={{ fontSize: 10, color: g.muted, textAlign: "center", padding: "20px 0" }}>No contacts yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 360, overflowY: "auto" }}>
              {contacts.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 10px", borderRadius: 8, background: g.bg2, border: `1px solid ${g.border}` }}>
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
                    onClick={() => deleteContact(c.id)} disabled={deleting === c.id}
                    style={{ background: g.redBg, border: `1px solid ${g.redBdr}`, borderRadius: 6, color: g.red, fontFamily: mono, fontSize: 9, padding: "4px 8px", cursor: "pointer", flexShrink: 0, opacity: deleting === c.id ? 0.5 : 1 }}
                  >{deleting === c.id ? "…" : "✕"}</button>
                </div>
              ))}
            </div>
          )}
        </Section>

      </div>
    </div>
  );
}
