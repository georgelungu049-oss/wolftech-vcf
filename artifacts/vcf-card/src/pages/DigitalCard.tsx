import { useState, useEffect } from "react";

interface Stats {
  count: number;
  target: number;
  percentage: number;
  targetReached: boolean;
}

async function fetchStats(): Promise<Stats> {
  const res = await fetch("/api/contacts/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

async function submitContact(data: { fullName: string; phone: string }): Promise<{ id: number; message: string; stats: Stats }> {
  const res = await fetch("/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to submit");
  return json;
}

function downloadVcf() { window.open("/api/contacts/download", "_blank"); }

/* ─── Colour tokens (dimmed, not blinding) ─── */
const mono = "'JetBrains Mono', monospace";
const orb  = "'Orbitron', sans-serif";
const C = {
  green:   "hsl(120 65% 44%)",   // primary accent
  greenHi: "hsl(120 55% 56%)",   // lighter accent (logo X)
  dim:     "hsl(120 30% 38%)",   // secondary text
  muted:   "hsl(120 15% 26%)",   // very dim
  faint:   "hsl(120 20% 18%)",   // progress track
  bg:      "hsl(120 55% 3.5%)",  // card bg
  bg2:     "hsl(120 50% 3%)",    // inner bg
  border:  "hsl(120 30% 10%)",   // subtle border
  border2: "hsl(120 40% 16%)",   // brighter border on hover/focus
};

const socialLinks = [
  { href: "https://wa.me/254713046497",           icon: "📱", label: "WhatsApp",  value: "+254 713 046 497", full: false },
  { href: "https://www.youtube.com/@Silentwolf906", icon: "▶", label: "YouTube",  value: "@Silentwolf906",   full: false },
  { href: "https://whatsapp.com/channel/0029Vb6dn9nEQIaqEMNclK3Y", icon: "📡", label: "WA Channel", value: "wolfXnode Updates",   full: false },
  { href: "https://chat.whatsapp.com/HjFc3pud3IA0R0WGr1V2Xu",      icon: "👥", label: "WA Group",   value: "wolfXnode Community", full: false },
  { href: "https://wolfxnode.replit.app",          icon: "⚡", label: "Platform",  value: "wolfxnode.replit.app", full: true },
];

const statBadges = [
  { value: "24/7", label: "Uptime" },
  { value: "∞",    label: "Bots" },
  { value: "KE",   label: "Base" },
];

/* ─── Progress bar ─── */
function ProgressBar({ stats }: { stats: Stats }) {
  const pct = Math.min(stats.percentage, 100);
  return (
    <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
        <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: C.green }}>
          Contact Progress
        </span>
        <span style={{ fontFamily: orb, fontSize: 11, fontWeight: 700, color: C.green }}>
          {stats.count} / {stats.target}
        </span>
      </div>
      <div style={{ width: "100%", height: 7, borderRadius: 99, overflow: "hidden", background: C.faint, border: `1px solid ${C.border}` }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${pct}%`,
          background: "linear-gradient(90deg, hsl(120 55% 30%), hsl(120 65% 44%))",
          boxShadow: "0 0 6px hsl(120 60% 40% / 0.4)",
          transition: "width 0.7s ease",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ fontFamily: mono, fontSize: 9, color: C.muted }}>{pct.toFixed(0)}% complete</span>
        {stats.targetReached
          ? <span style={{ fontFamily: mono, fontSize: 9, color: C.green, fontWeight: 700 }}>✓ Target reached!</span>
          : <span style={{ fontFamily: mono, fontSize: 9, color: C.muted }}>{stats.target - stats.count} left</span>}
      </div>
    </div>
  );
}

/* ─── Contact form ─── */
function ContactForm({ onSubmitted }: { onSubmitted: (s: Stats) => void }) {
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);
  const [open, setOpen]       = useState(false);

  const inputBase: React.CSSProperties = {
    width: "100%", fontFamily: mono, fontSize: 12,
    background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "9px 12px", color: C.green, outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = C.border2; e.target.style.boxShadow = "0 0 8px hsl(120 60% 40% / 0.1)"; };
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = C.border;  e.target.style.boxShadow = "none"; };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { setError("Name and contact are required"); return; }
    setLoading(true); setError("");
    try {
      const r = await submitContact({ fullName: name.trim(), phone: phone.trim() });
      setDone(true);
      onSubmitted(r.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 8, padding: "14px", borderRadius: 10, textAlign: "center",
          background: "hsl(120 60% 40% / 0.06)", border: "1px solid hsl(120 60% 40% / 0.15)",
        }}>
          <span style={{ fontSize: 20 }}>✓</span>
          <span style={{ fontFamily: orb, fontSize: 11, color: C.green }} className="glow-text">Contact Saved!</span>
          <span style={{ fontFamily: mono, fontSize: 10, color: C.dim }}>You've been added to the collection.</span>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
        <button
          onClick={() => setOpen(true)}
          className="btn-primary-glow"
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, padding: "11px 18px", borderRadius: 9, border: "none", cursor: "pointer",
            fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          }}
        >+ Add Your Contact</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>
        Submit your contact
      </div>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input type="text"    placeholder="Your name"               value={name}  onChange={e => setName(e.target.value)}  style={inputBase} onFocus={onFocus} onBlur={onBlur} required />
        <input type="tel"     placeholder="Phone / WhatsApp number" value={phone} onChange={e => setPhone(e.target.value)} style={inputBase} onFocus={onFocus} onBlur={onBlur} required />
        {error && (
          <div style={{ fontFamily: mono, fontSize: 10, padding: "6px 10px", borderRadius: 6, color: "hsl(0 55% 55%)", background: "hsl(0 55% 50% / 0.08)", border: "1px solid hsl(0 55% 50% / 0.22)" }}>
            ⚠ {error}
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => { setOpen(false); setError(""); }}
            className="btn-secondary-glow"
            style={{ flexShrink: 0, padding: "9px 13px", borderRadius: 8, cursor: "pointer", fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="btn-primary-glow"
            style={{ flex: 1, padding: "9px 14px", borderRadius: 8, border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Saving…" : "⬇ Save Contact"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Main page ─── */
export default function DigitalCard() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { fetchStats().then(setStats).catch(() => {}); }, []);

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 12px 48px", fontFamily: mono }}>
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      {/* Nav */}
      <nav style={{
        width: "100%", maxWidth: 480, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", marginBottom: 14, borderRadius: 10,
        background: "hsl(120 50% 3% / 0.9)", border: `1px solid ${C.border}`, backdropFilter: "blur(12px)",
      }}>
        <div style={{ fontFamily: orb, fontSize: 13, fontWeight: 900, letterSpacing: "0.05em", color: C.green }} className="glow-text">
          WOLF<span style={{ color: C.greenHi }}>TECH</span> <span style={{ color: C.dim }}>VCF</span>
        </div>
        <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.1em", color: C.muted, border: `1px solid ${C.border}`, padding: "2px 8px", borderRadius: 99 }}>v1.0</div>
      </nav>

      {/* Card */}
      <div className="card-animate glow-box-lg" style={{ width: "100%", maxWidth: 480, background: C.bg, border: `1px solid ${C.border2}`, borderRadius: 16, overflow: "hidden" }}>

        {/* Strip */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, hsl(120 60% 40%), hsl(120 55% 35%), transparent)" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 14px 12px", borderBottom: `1px solid ${C.border}` }}>
          <div className="glow-box" style={{ position: "relative", flexShrink: 0, width: 58, height: 58, borderRadius: "50%", background: "hsl(120 20% 7%)", border: `2px solid ${C.border2}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: orb, fontSize: 19, fontWeight: 900, color: C.green }}>
            W<div className="avatar-ring" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="glow-text" style={{ fontFamily: orb, fontSize: "clamp(15px, 4vw, 20px)", fontWeight: 900, color: C.green, letterSpacing: "0.04em", lineHeight: 1.2 }}>Silentwolf</div>
            <div style={{ fontSize: 9, color: C.dim, marginTop: 4, letterSpacing: "0.09em", textTransform: "uppercase" }}>Bot Dev &amp; System Explorer</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}><span style={{ color: C.dim }}>@</span>Silentwolf906</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: C.green, border: "1px solid hsl(120 60% 40% / 0.22)", background: "hsl(120 60% 40% / 0.05)", padding: "3px 8px", borderRadius: 99, marginTop: 6 }}>
              <div className="status-dot" /> Available
            </div>
          </div>
        </div>

        {stats && <ProgressBar stats={stats} />}
        <ContactForm onSubmitted={setStats} />

        {/* Social links */}
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 7 }}>
            {socialLinks.slice(0, 2).map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link-card">
                <div className="link-icon-box">{l.icon}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 8, color: C.muted, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 2 }}>{l.label}</div>
                  <div style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.value}</div>
                </div>
              </a>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 7 }}>
            {socialLinks.slice(2, 4).map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link-card" style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", gap: 4, padding: "9px 6px", textAlign: "center" }}>
                <span style={{ fontSize: 17 }}>{l.icon}</span>
                <span style={{ fontSize: 8, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{l.label}</span>
                <span style={{ fontSize: 10, color: C.dim }}>Join →</span>
              </a>
            ))}
          </div>
          <a href={socialLinks[4].href} target="_blank" rel="noopener noreferrer" className="link-card">
            <div className="link-icon-box">{socialLinks[4].icon}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 8, color: C.muted, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 2 }}>Platform</div>
              <div style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>wolfxnode.replit.app</div>
            </div>
          </a>
        </div>

        {/* Stats badges */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
          {statBadges.map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "10px 4px", borderRadius: 9, background: C.bg2, border: `1px solid ${C.border}` }}>
              <div className="glow-text" style={{ fontFamily: orb, fontSize: 16, fontWeight: 700, color: C.green }}>{s.value}</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: C.muted, letterSpacing: "0.09em", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: "10px 14px" }}>
          {stats?.targetReached ? (
            <button onClick={downloadVcf} className="btn-primary-glow" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              ⬇ Download All Contacts (.vcf)
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "9px 14px", borderRadius: 9, marginBottom: 8, background: C.bg2, border: `1px solid ${C.border}`, fontFamily: mono, fontSize: 10, color: C.muted }}>
              🔒 VCF unlocks at <span style={{ color: C.green, marginLeft: 4, fontWeight: 700 }}>{stats?.target ?? 50} contacts</span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            <a href="https://wa.me/254713046497" target="_blank" rel="noopener noreferrer" className="btn-secondary-glow" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 6px", borderRadius: 9, fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none" }}>
              💬 Message
            </a>
            <a href="https://wolfxnode.replit.app" target="_blank" rel="noopener noreferrer" className="btn-secondary-glow" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 6px", borderRadius: 9, fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none" }}>
              🚀 Platform
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", background: "hsl(120 50% 2.5% / 0.7)", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.muted }}>
            powered by <span style={{ color: C.green }}>WOLFTECH</span><span className="cursor-blink" />
          </div>
          <div style={{ fontFamily: mono, fontSize: 8, color: C.muted, letterSpacing: "0.1em" }}>ID: WOLF-906-VCF</div>
        </div>
      </div>

      {/* Tagline */}
      <p style={{ marginTop: 14, textAlign: "center", fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        I am just an explorer &nbsp;·&nbsp;{" "}
        <a href="https://wolfxnode.replit.app" style={{ color: C.dim, textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = C.green)}
          onMouseLeave={e => (e.currentTarget.style.color = C.dim)}>
          wolfxnode.replit.app
        </a>
      </p>
    </div>
  );
}
