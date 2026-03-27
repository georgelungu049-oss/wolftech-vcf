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

async function submitContact(data: {
  fullName: string;
  phone: string;
}): Promise<{ id: number; message: string; stats: Stats }> {
  const res = await fetch("/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to submit");
  return json;
}

function downloadVcf() {
  window.open("/api/contacts/download", "_blank");
}

const mono = "'JetBrains Mono', monospace";
const orb = "'Orbitron', sans-serif";

const green = "hsl(120 100% 50%)";
const greenDim = "hsl(120 50% 40%)";
const greenMuted = "hsl(120 20% 30%)";
const greenFaint = "hsl(120 40% 55%)";
const greenBg = "hsl(120 100% 4%)";
const greenBg2 = "hsl(120 100% 3%)";
const borderDim = "hsl(120 50% 12%)";
const borderNorm = "hsl(120 100% 20%)";

const socialLinks = [
  { href: "https://wa.me/254713046497",          icon: "📱", label: "WhatsApp",  value: "+254 713 046 497",  full: false },
  { href: "https://www.youtube.com/@Silentwolf906", icon: "▶", label: "YouTube", value: "@Silentwolf906",    full: false },
  { href: "https://whatsapp.com/channel/0029Vb6dn9nEQIaqEMNclK3Y", icon: "📡", label: "WA Channel", value: "wolfXnode Updates", full: false },
  { href: "https://chat.whatsapp.com/HjFc3pud3IA0R0WGr1V2Xu",       icon: "👥", label: "WA Group",   value: "wolfXnode Community", full: false },
  { href: "https://wolfxnode.replit.app",          icon: "⚡", label: "Platform", value: "wolfxnode.replit.app", full: true },
];

const statBadges = [
  { value: "24/7", label: "Uptime" },
  { value: "∞",    label: "Bots" },
  { value: "KE",   label: "Base" },
];

/* ─── Progress bar ───────────────────────────────────── */
function ProgressBar({ stats }: { stats: Stats }) {
  const pct = Math.min(stats.percentage, 100);
  return (
    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${borderDim}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: green }}>
          Contact Progress
        </span>
        <span style={{ fontFamily: orb, fontSize: 11, fontWeight: 700, color: green }}>
          {stats.count} / {stats.target}
        </span>
      </div>
      <div style={{ width: "100%", height: 8, borderRadius: 99, overflow: "hidden", background: "hsl(120 30% 10%)", border: `1px solid ${borderDim}` }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${pct}%`,
          background: stats.targetReached
            ? "linear-gradient(90deg, hsl(120 100% 40%), hsl(120 100% 60%))"
            : "linear-gradient(90deg, hsl(120 100% 30%), hsl(120 100% 50%))",
          boxShadow: "0 0 8px hsl(120 100% 50% / 0.45)",
          transition: "width 0.7s ease",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ fontFamily: mono, fontSize: 9, color: greenMuted }}>{pct.toFixed(0)}% complete</span>
        {stats.targetReached
          ? <span style={{ fontFamily: mono, fontSize: 9, color: green, fontWeight: 700 }}>✓ Target reached!</span>
          : <span style={{ fontFamily: mono, fontSize: 9, color: greenMuted }}>{stats.target - stats.count} left</span>
        }
      </div>
    </div>
  );
}

/* ─── Contact form ───────────────────────────────────── */
function ContactForm({ onSubmitted }: { onSubmitted: (s: Stats) => void }) {
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);
  const [open, setOpen]       = useState(false);

  const inputBase: React.CSSProperties = {
    width: "100%", fontFamily: mono, fontSize: 12,
    background: greenBg2, border: `1px solid ${borderDim}`,
    borderRadius: 8, padding: "9px 12px",
    color: green, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  };

  function focus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = borderNorm;
    e.target.style.boxShadow   = "0 0 10px hsl(120 100% 50% / 0.12)";
  }
  function blur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = borderDim;
    e.target.style.boxShadow   = "none";
  }

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
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${borderDim}` }}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 8, padding: "14px 12px", borderRadius: 10, textAlign: "center",
          background: "hsl(120 100% 50% / 0.05)", border: "1px solid hsl(120 100% 50% / 0.2)",
        }}>
          <span style={{ fontSize: 22, filter: "drop-shadow(0 0 6px hsl(120 100% 50%))" }}>✓</span>
          <span style={{ fontFamily: orb, fontSize: 11, color: green }} className="glow-text">Contact Saved!</span>
          <span style={{ fontFamily: mono, fontSize: 10, color: greenFaint }}>You've been added to the collection.</span>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${borderDim}` }}>
        <button
          onClick={() => setOpen(true)}
          className="btn-primary-glow"
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, padding: "12px 20px", borderRadius: 10,
            border: "none", cursor: "pointer", fontFamily: mono,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          }}
        >
          + Add Your Contact
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${borderDim}` }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: greenMuted }}>
          Submit your contact
        </div>
      </div>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          type="text" placeholder="Your name"
          value={name} onChange={e => setName(e.target.value)}
          style={inputBase} onFocus={focus} onBlur={blur} required
        />
        <input
          type="tel" placeholder="Phone / WhatsApp number"
          value={phone} onChange={e => setPhone(e.target.value)}
          style={inputBase} onFocus={focus} onBlur={blur} required
        />
        {error && (
          <div style={{
            fontFamily: mono, fontSize: 10, padding: "7px 10px", borderRadius: 7,
            color: "hsl(0 84% 70%)", background: "hsl(0 84% 60% / 0.1)",
            border: "1px solid hsl(0 84% 60% / 0.3)",
          }}>⚠ {error}</div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button" onClick={() => { setOpen(false); setError(""); }}
            className="btn-secondary-glow"
            style={{
              flexShrink: 0, padding: "10px 14px", borderRadius: 8,
              cursor: "pointer", fontFamily: mono, fontSize: 10,
              fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            }}
          >Cancel</button>
          <button
            type="submit" disabled={loading}
            className="btn-primary-glow"
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 8,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: mono, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              opacity: loading ? 0.7 : 1,
            }}
          >{loading ? "Saving…" : "⬇ Save Contact"}</button>
        </div>
      </form>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────── */
export default function DigitalCard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => { fetchStats().then(setStats).catch(() => {}); }, []);

  return (
    <div style={{
      position: "relative", zIndex: 1,
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "12px 12px 48px",
      fontFamily: mono,
    }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Top nav */}
      <nav style={{
        width: "100%", maxWidth: 480,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", marginBottom: 14, borderRadius: 10,
        background: "hsl(120 100% 3% / 0.85)", border: `1px solid ${borderDim}`,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ fontFamily: orb, fontSize: 13, fontWeight: 900, letterSpacing: "0.05em", color: green }} className="glow-text">
          WOLF<span style={{ color: "hsl(120 100% 78%)" }}>TECH</span>{" "}
          <span style={{ color: greenDim }}>VCF</span>
        </div>
        <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.1em", color: greenMuted, border: `1px solid ${borderDim}`, padding: "2px 8px", borderRadius: 99 }}>
          v1.0
        </div>
      </nav>

      {/* Card */}
      <div
        className="card-animate glow-box-lg"
        style={{
          width: "100%", maxWidth: 480,
          background: greenBg, border: `1px solid ${borderNorm}`,
          borderRadius: 16, overflow: "hidden",
        }}
      >
        {/* Accent strip */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, hsl(120 100% 50%), hsl(120 100% 40%), transparent)" }} />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "16px 16px 14px", borderBottom: `1px solid ${borderDim}`,
        }}>
          {/* Avatar */}
          <div
            className="glow-box"
            style={{
              position: "relative", flexShrink: 0,
              width: 60, height: 60, borderRadius: "50%",
              background: "hsl(120 30% 10%)", border: `2px solid ${borderNorm}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: orb, fontSize: 20, fontWeight: 900, color: green,
            }}
          >
            W
            <div className="avatar-ring" />
          </div>

          {/* Identity */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="glow-text" style={{ fontFamily: orb, fontSize: "clamp(15px, 4vw, 20px)", fontWeight: 900, color: green, letterSpacing: "0.04em", lineHeight: 1.2 }}>
              Silentwolf
            </div>
            <div style={{ fontSize: 9, color: greenFaint, marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Bot Dev &amp; System Explorer
            </div>
            <div style={{ fontSize: 10, color: greenMuted, marginTop: 2 }}>
              <span style={{ color: greenDim }}>@</span>Silentwolf906
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase",
              color: green, border: "1px solid hsl(120 100% 50% / 0.3)",
              background: "hsl(120 100% 50% / 0.05)", padding: "3px 8px",
              borderRadius: 99, marginTop: 6,
            }}>
              <div className="status-dot" />
              Available
            </div>
          </div>
        </div>

        {/* Progress */}
        {stats && <ProgressBar stats={stats} />}

        {/* Form */}
        <ContactForm onSubmitted={setStats} />

        {/* Social links */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${borderDim}` }}>
          {/* Row 1: WhatsApp + YouTube */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            {socialLinks.slice(0, 2).map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link-card">
                <div className="link-icon-box">{l.icon}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 8, color: greenMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{l.label}</div>
                  <div style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.value}</div>
                </div>
              </a>
            ))}
          </div>
          {/* Row 2: WA Channel + WA Group (short) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            {socialLinks.slice(2, 4).map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link-card" style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 8px", textAlign: "center" }}>
                <span style={{ fontSize: 18 }}>{l.icon}</span>
                <span style={{ fontSize: 9, color: greenMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{l.label}</span>
                <span style={{ fontSize: 10, color: greenFaint }}>Join →</span>
              </a>
            ))}
          </div>
          {/* Platform full-width */}
          <a href={socialLinks[4].href} target="_blank" rel="noopener noreferrer" className="link-card">
            <div className="link-icon-box">{socialLinks[4].icon}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 8, color: greenMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Platform</div>
              <div style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>wolfxnode.replit.app</div>
            </div>
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: "12px 16px", borderBottom: `1px solid ${borderDim}` }}>
          {statBadges.map(s => (
            <div key={s.label} style={{
              textAlign: "center", padding: "12px 6px", borderRadius: 10,
              background: greenBg2, border: `1px solid ${borderDim}`,
            }}>
              <div className="glow-text" style={{ fontFamily: orb, fontSize: 17, fontWeight: 700, color: green }}>{s.value}</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: greenMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Download / locked */}
        <div style={{ padding: "12px 16px" }}>
          {stats?.targetReached ? (
            <button
              onClick={downloadVcf}
              className="btn-primary-glow"
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, padding: "12px 20px", borderRadius: 10,
                border: "none", cursor: "pointer", fontFamily: mono,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              ⬇ Download All Contacts (.vcf)
            </button>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "10px 14px", borderRadius: 10, marginBottom: 8,
              background: greenBg2, border: `1px solid ${borderDim}`,
              fontFamily: mono, fontSize: 10, color: greenMuted,
            }}>
              🔒 VCF unlocks at{" "}
              <span style={{ color: green, marginLeft: 4, fontWeight: 700 }}>
                {stats?.target ?? 50} contacts
              </span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <a
              href="https://wa.me/254713046497"
              target="_blank" rel="noopener noreferrer"
              className="btn-secondary-glow"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 6, padding: "10px 8px", borderRadius: 10,
                fontFamily: mono, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                textDecoration: "none", textAlign: "center",
              }}
            >💬 Message</a>
            <a
              href="https://wolfxnode.replit.app"
              target="_blank" rel="noopener noreferrer"
              className="btn-secondary-glow"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 6, padding: "10px 8px", borderRadius: 10,
                fontFamily: mono, fontSize: 10, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                textDecoration: "none", textAlign: "center",
              }}
            >🚀 Platform</a>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px",
          background: "hsl(120 100% 2% / 0.6)", borderTop: `1px solid ${borderDim}`,
        }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: greenMuted }}>
            powered by <span style={{ color: green }}>WOLFTECH</span><span className="cursor-blink" />
          </div>
          <div style={{ fontFamily: mono, fontSize: 8, color: greenMuted, letterSpacing: "0.1em" }}>
            ID: WOLF-906-VCF
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p style={{ marginTop: 16, textAlign: "center", fontFamily: mono, fontSize: 9, color: greenMuted, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        I am just an explorer &nbsp;·&nbsp;{" "}
        <a
          href="https://wolfxnode.replit.app"
          style={{ color: greenDim, textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = green)}
          onMouseLeave={e => (e.currentTarget.style.color = greenDim)}
        >wolfxnode.replit.app</a>
      </p>
    </div>
  );
}
