import { useState, useEffect, useRef, useMemo } from "react";
import PhoneInput, { isValidPhoneNumber, getCountries, getCountryCallingCode } from "react-phone-number-input";
import type { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";

/* Use the browser Intl API to get country display names */
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
function getCountryName(code: string): string {
  try { return regionNames.of(code) ?? code; } catch { return code; }
}

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

/* ─── Colour tokens ─── */
const mono = "'JetBrains Mono', monospace";
const orb  = "'Orbitron', sans-serif";
const C = {
  green:   "hsl(120 65% 44%)",
  greenHi: "hsl(120 55% 56%)",
  dim:     "hsl(120 30% 38%)",
  muted:   "hsl(120 15% 26%)",
  faint:   "hsl(120 20% 18%)",
  bg:      "hsl(120 55% 3.5%)",
  bg2:     "hsl(120 50% 3%)",
  border:  "hsl(120 30% 10%)",
  border2: "hsl(120 40% 16%)",
};

/* Convert 2-letter country code to flag emoji */
function flagEmoji(code: string) {
  return code.toUpperCase().split("").map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join("");
}

const socialLinks = [
  { href: "https://wa.me/254713046497",                                icon: "📱", label: "WhatsApp",  value: "+254 713 046 497" },
  { href: "https://www.youtube.com/@Silentwolf906",                    icon: "▶",  label: "YouTube",   value: "@Silentwolf906" },
  { href: "https://whatsapp.com/channel/0029Vb6dn9nEQIaqEMNclK3Y",    icon: "📡", label: "WA Channel", value: "wolfXnode Updates" },
  { href: "https://chat.whatsapp.com/HjFc3pud3IA0R0WGr1V2Xu",         icon: "👥", label: "WA Group",   value: "wolfXnode Community" },
];

const statBadges = [
  { value: "24/7", label: "Uptime" },
  { value: "∞",    label: "Bots" },
  { value: "KE",   label: "Base" },
];

/* ─── Searchable country select modal ─── */
interface CountrySelectProps {
  value?: Country;
  onChange: (country: Country) => void;
}

function CountrySelectModal({ value, onChange }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const allCountries = useMemo(() => getCountries(), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allCountries;
    return allCountries.filter(code => {
      const name = getCountryName(code);
      return name.toLowerCase().includes(q) || code.toLowerCase().includes(q);
    });
  }, [search, allCountries]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const selected = value ?? "KE";
  const selectedName = getCountryName(selected);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen(true); setSearch(""); }}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "0 10px", height: "100%", minHeight: 38,
          background: "hsl(120 20% 5%)",
          borderRight: `1px solid ${C.border}`,
          border: "none", cursor: "pointer",
          flexShrink: 0, borderRadius: 0,
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "hsl(120 20% 7%)")}
        onMouseLeave={e => (e.currentTarget.style.background = "hsl(120 20% 5%)")}
        title={selectedName}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{flagEmoji(selected)}</span>
        <span style={{ fontFamily: mono, fontSize: 10, color: C.dim }}>+{getCountryCallingCode(selected)}</span>
        <span style={{ fontFamily: mono, fontSize: 8, color: C.muted, marginLeft: 1 }}>▾</span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 360, maxHeight: "80vh",
              background: "hsl(120 50% 3%)", border: `1px solid ${C.border2}`,
              borderRadius: 14, overflow: "hidden",
              display: "flex", flexDirection: "column",
              boxShadow: "0 0 40px hsl(120 60% 40% / 0.15), 0 24px 48px rgba(0,0,0,0.6)",
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: "12px 14px", borderBottom: `1px solid ${C.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: C.green }}>
                Select Country
              </span>
              <button
                type="button" onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, lineHeight: 1, padding: "2px 6px" }}
              >✕</button>
            </div>

            {/* Search box */}
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search country or code…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", fontFamily: mono, fontSize: 11,
                  background: "hsl(120 20% 5%)", border: `1px solid ${C.border2}`,
                  borderRadius: 7, padding: "8px 11px", color: C.green, outline: "none",
                }}
              />
            </div>

            {/* Country list */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filtered.length === 0 && (
                <div style={{ padding: "18px", textAlign: "center", fontFamily: mono, fontSize: 10, color: C.muted }}>
                  No countries found
                </div>
              )}
              {filtered.map(code => {
                const name = getCountryName(code);
                const isSel = code === selected;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => { onChange(code); setOpen(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 14px", border: "none", cursor: "pointer", textAlign: "left",
                      background: isSel ? "hsl(120 60% 40% / 0.08)" : "transparent",
                      borderBottom: `1px solid ${C.border}`,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "hsl(120 60% 40% / 0.04)"; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: "center" }}>{flagEmoji(code)}</span>
                    <span style={{ flex: 1, fontFamily: mono, fontSize: 11, color: isSel ? C.green : C.dim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                    <span style={{ fontFamily: mono, fontSize: 10, color: C.muted, flexShrink: 0 }}>+{getCountryCallingCode(code)}</span>
                    {isSel && <span style={{ color: C.green, fontSize: 11, marginLeft: 4 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Success popup modal ─── */
function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 360,
          background: "hsl(120 50% 3%)", border: `1px solid hsl(120 60% 40% / 0.3)`,
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 0 60px hsl(120 60% 40% / 0.2), 0 24px 48px rgba(0,0,0,0.7)",
        }}
      >
        {/* Top glow strip */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, hsl(120 60% 44%), transparent)" }} />

        <div style={{ padding: "28px 22px 22px", textAlign: "center" }}>
          {/* Checkmark */}
          <div style={{
            width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
            background: "hsl(120 60% 40% / 0.1)", border: "2px solid hsl(120 60% 40% / 0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, boxShadow: "0 0 20px hsl(120 60% 40% / 0.2)",
          }}>✓</div>

          <div className="glow-text" style={{ fontFamily: orb, fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8, letterSpacing: "0.04em" }}>
            Contact Uploaded!
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.dim, lineHeight: 1.6, marginBottom: 20 }}>
            Your contact was saved successfully.<br />
            The VCF file will be shared exclusively on our<br />
            <span style={{ color: C.green, fontWeight: 700 }}>WhatsApp Channel &amp; Group</span> once the target is reached.
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <a
              href="https://whatsapp.com/channel/0029Vb6dn9nEQIaqEMNclK3Y"
              target="_blank" rel="noopener noreferrer"
              className="btn-primary-glow"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "11px 16px", borderRadius: 9, textDecoration: "none",
                fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              }}
            >
              📡 Follow wolfXnode Channel
            </a>
            <a
              href="https://chat.whatsapp.com/HjFc3pud3IA0R0WGr1V2Xu"
              target="_blank" rel="noopener noreferrer"
              className="btn-secondary-glow"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "11px 16px", borderRadius: 9, textDecoration: "none",
                fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              }}
            >
              👥 Join wolfXnode Group
            </a>
            <button
              type="button" onClick={onClose}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: mono, fontSize: 9, color: C.muted, marginTop: 2,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
          height: "100%", borderRadius: 99, width: `${pct}%`,
          background: "linear-gradient(90deg, hsl(120 55% 30%), hsl(120 65% 44%))",
          boxShadow: "0 0 6px hsl(120 60% 40% / 0.4)", transition: "width 0.7s ease",
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
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState<string | undefined>(undefined);
  const [country, setCountry]   = useState<Country>("KE");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [open, setOpen]         = useState(false);

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
    if (!name.trim()) { setError("Name is required"); return; }
    if (!phone)       { setError("Phone number is required"); return; }
    if (!isValidPhoneNumber(phone)) { setError("Please enter a valid international phone number"); return; }
    setLoading(true); setError("");
    try {
      const r = await submitContact({ fullName: name.trim(), phone });
      setShowSuccess(true);
      onSubmitted(r.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {showSuccess && (
        <SuccessModal onClose={() => { setShowSuccess(false); setOpen(false); }} />
      )}

      {!open ? (
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
      ) : (
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>
            Submit your contact
          </div>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputBase}
              onFocus={onFocus}
              onBlur={onBlur}
              required
            />
            <PhoneInput
              international
              countryCallingCodeEditable={false}
              defaultCountry="KE"
              country={country}
              onCountryChange={(c) => c && setCountry(c)}
              placeholder="Phone / WhatsApp number"
              value={phone}
              onChange={setPhone}
              countrySelectComponent={({ value, onChange }) => (
                <CountrySelectModal
                  value={value as Country | undefined}
                  onChange={onChange as (c: Country) => void}
                />
              )}
            />
            {phone && isValidPhoneNumber(phone) && (
              <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: -4, paddingLeft: 2 }}>
                ✓ Valid — saves as: <span style={{ color: C.green }}>{phone}</span>
              </div>
            )}
            {error && (
              <div style={{ fontFamily: mono, fontSize: 10, padding: "6px 10px", borderRadius: 6, color: "hsl(0 55% 55%)", background: "hsl(0 55% 50% / 0.08)", border: "1px solid hsl(0 55% 50% / 0.22)" }}>
                ⚠ {error}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => { setOpen(false); setError(""); setPhone(undefined); }}
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
      )}
    </>
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
            <div className="glow-text" style={{ fontFamily: orb, fontSize: "clamp(15px, 4vw, 20px)", fontWeight: 900, color: C.green, letterSpacing: "0.04em", lineHeight: 1.2 }}>WOLF TECH</div>
            <div style={{ fontSize: 9, color: C.dim, marginTop: 4, letterSpacing: "0.09em", textTransform: "uppercase" }}>I Explore Systems</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}><span style={{ color: C.dim }}>@</span>Silentwolf906</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: C.green, border: "1px solid hsl(120 60% 40% / 0.22)", background: "hsl(120 60% 40% / 0.05)", padding: "3px 8px", borderRadius: 99, marginTop: 6 }}>
              <div className="status-dot" /> Available
            </div>
          </div>
        </div>

        {stats && <ProgressBar stats={stats} />}
        <ContactForm onSubmitted={setStats} />

        {/* Social links — 4 links, no platform */}
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {socialLinks.slice(2, 4).map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link-card" style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", gap: 4, padding: "9px 6px", textAlign: "center" }}>
                <span style={{ fontSize: 17 }}>{l.icon}</span>
                <span style={{ fontSize: 8, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{l.label}</span>
                <span style={{ fontSize: 10, color: C.dim }}>Join →</span>
              </a>
            ))}
          </div>
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

        {/* Actions — message only, no platform */}
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
          <a href="https://wa.me/254713046497" target="_blank" rel="noopener noreferrer"
            className="btn-secondary-glow"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 6px", borderRadius: 9, fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none" }}>
            💬 Message
          </a>
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
        I am just an explorer &nbsp;·&nbsp; wolfXnode
      </p>
    </div>
  );
}
