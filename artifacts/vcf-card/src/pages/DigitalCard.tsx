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
  email?: string;
  organization?: string;
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

const socialLinks = [
  {
    href: "https://wa.me/254713046497",
    icon: "📱",
    label: "WhatsApp",
    value: "+254 713 046 497",
    full: false,
  },
  {
    href: "https://www.youtube.com/@Silentwolf906",
    icon: "▶",
    label: "YouTube",
    value: "@Silentwolf906",
    full: false,
  },
  {
    href: "https://whatsapp.com/channel/0029Vb6dn9nEQIaqEMNclK3Y",
    icon: "📡",
    label: "WA Channel",
    value: "wolfXnode Updates",
    full: false,
  },
  {
    href: "https://chat.whatsapp.com/HjFc3pud3IA0R0WGr1V2Xu",
    icon: "👥",
    label: "WA Group",
    value: "wolfXnode Community",
    full: false,
  },
  {
    href: "https://wolfxnode.replit.app",
    icon: "⚡",
    label: "Platform",
    value: "wolfXnode — WhatsApp Bot Hosting",
    full: true,
  },
];

const statsBadges = [
  { value: "24/7", label: "Uptime" },
  { value: "∞", label: "Bots Hosted" },
  { value: "KE", label: "Based In" },
];

function ProgressBar({ stats }: { stats: Stats }) {
  const pct = Math.min(stats.percentage, 100);
  return (
    <div
      className="px-9 py-6"
      style={{ borderBottom: "1px solid hsl(120 50% 12%)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[9px] tracking-widest uppercase font-bold"
          style={{ color: "hsl(120 100% 50%)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          Contact Collection Progress
        </span>
        <span
          className="text-[10px] font-bold"
          style={{ color: "hsl(120 100% 50%)", fontFamily: "'Orbitron', sans-serif" }}
        >
          {stats.count} / {stats.target}
        </span>
      </div>
      <div
        className="relative w-full h-3 rounded-full overflow-hidden"
        style={{ background: "hsl(120 30% 10%)", border: "1px solid hsl(120 50% 12%)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: stats.targetReached
              ? "linear-gradient(90deg, hsl(120 100% 40%), hsl(120 100% 60%))"
              : "linear-gradient(90deg, hsl(120 100% 30%), hsl(120 100% 50%))",
            boxShadow: "0 0 10px hsl(120 100% 50% / 0.5)",
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[9px]" style={{ color: "hsl(120 20% 30%)", fontFamily: "'JetBrains Mono', monospace" }}>
          {pct.toFixed(1)}% complete
        </span>
        {stats.targetReached ? (
          <span
            className="text-[9px] tracking-widest uppercase font-bold"
            style={{ color: "hsl(120 100% 50%)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            ✓ Target reached!
          </span>
        ) : (
          <span className="text-[9px]" style={{ color: "hsl(120 20% 30%)", fontFamily: "'JetBrains Mono', monospace" }}>
            {stats.target - stats.count} remaining
          </span>
        )}
      </div>
    </div>
  );
}

function ContactForm({ onSubmitted }: { onSubmitted: (stats: Stats) => void }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError("Name and phone are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await submitContact({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        organization: organization.trim() || undefined,
      });
      setSuccess(true);
      onSubmitted(result.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    background: "hsl(120 100% 3%)",
    border: "1px solid hsl(120 50% 12%)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "hsl(120 100% 50%)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  if (success) {
    return (
      <div
        className="px-9 py-7"
        style={{ borderBottom: "1px solid hsl(120 50% 12%)" }}
      >
        <div
          className="flex flex-col items-center gap-3 py-4 rounded-xl text-center"
          style={{
            background: "hsl(120 100% 50% / 0.05)",
            border: "1px solid hsl(120 100% 50% / 0.2)",
          }}
        >
          <div
            className="text-3xl"
            style={{ filter: "drop-shadow(0 0 8px hsl(120 100% 50%))" }}
          >
            ✓
          </div>
          <div
            className="text-sm font-bold glow-text"
            style={{ color: "hsl(120 100% 50%)", fontFamily: "'Orbitron', sans-serif" }}
          >
            Contact Saved!
          </div>
          <div
            className="text-[10px] tracking-wide"
            style={{ color: "hsl(120 40% 55%)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            Your contact has been added to the collection.
          </div>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div
        className="px-9 py-7"
        style={{ borderBottom: "1px solid hsl(120 50% 12%)" }}
      >
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary-glow flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-xs tracking-widest uppercase cursor-pointer border-none w-full"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          + Add Your Contact
        </button>
      </div>
    );
  }

  return (
    <div
      className="px-9 py-7"
      style={{ borderBottom: "1px solid hsl(120 50% 12%)" }}
    >
      <div className="mb-5">
        <div
          className="text-[10px] tracking-widest uppercase font-bold mb-1"
          style={{ color: "hsl(120 100% 50%)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          Add Your Contact
        </div>
        <div
          className="text-[9px] tracking-wide"
          style={{ color: "hsl(120 20% 30%)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          Submit your info to be included in the collection
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[9px] tracking-widest uppercase"
              style={{ color: "hsl(120 20% 30%)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "hsl(120 100% 20%)";
                e.target.style.boxShadow = "0 0 12px hsl(120 100% 50% / 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "hsl(120 50% 12%)";
                e.target.style.boxShadow = "none";
              }}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[9px] tracking-widest uppercase"
              style={{ color: "hsl(120 20% 30%)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              Phone *
            </label>
            <input
              type="tel"
              placeholder="+254..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "hsl(120 100% 20%)";
                e.target.style.boxShadow = "0 0 12px hsl(120 100% 50% / 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "hsl(120 50% 12%)";
                e.target.style.boxShadow = "none";
              }}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[9px] tracking-widest uppercase"
              style={{ color: "hsl(120 20% 30%)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              Email (optional)
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "hsl(120 100% 20%)";
                e.target.style.boxShadow = "0 0 12px hsl(120 100% 50% / 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "hsl(120 50% 12%)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[9px] tracking-widest uppercase"
              style={{ color: "hsl(120 20% 30%)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              Organization (optional)
            </label>
            <input
              type="text"
              placeholder="Company / Group"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "hsl(120 100% 20%)";
                e.target.style.boxShadow = "0 0 12px hsl(120 100% 50% / 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "hsl(120 50% 12%)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {error && (
          <div
            className="text-[10px] px-3 py-2 rounded-lg"
            style={{
              color: "hsl(0 84% 70%)",
              background: "hsl(0 84% 60% / 0.1)",
              border: "1px solid hsl(0 84% 60% / 0.3)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ⚠ {error}
          </div>
        )}

        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="btn-secondary-glow flex items-center justify-center py-3 px-5 rounded-xl font-bold text-xs tracking-widest uppercase cursor-pointer"
            style={{ fontFamily: "'JetBrains Mono', monospace", flex: "0 0 auto" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary-glow flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs tracking-widest uppercase cursor-pointer border-none"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              flex: 1,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : "⬇ Save Contact"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DigitalCard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div
      className="relative z-10 min-h-screen flex flex-col items-center px-4 py-6 pb-16"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Top nav */}
      <nav
        className="w-full max-w-[700px] flex items-center justify-between px-5 py-4 mb-8 rounded-xl backdrop-blur-md"
        style={{
          background: "hsl(120 100% 3% / 0.8)",
          border: "1px solid hsl(120 50% 12%)",
        }}
      >
        <div
          className="font-black tracking-wide glow-text"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "16px",
            color: "hsl(120 100% 50%)",
          }}
        >
          wolf<span style={{ color: "hsl(120 100% 80%)" }}>X</span>node
        </div>
        <div
          className="text-[10px] tracking-widest px-3 py-1 rounded-full"
          style={{
            color: "hsl(120 20% 30%)",
            border: "1px solid hsl(120 50% 12%)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          DIGITAL CARD v1.0
        </div>
      </nav>

      {/* Main card */}
      <div
        className="w-full max-w-[700px] rounded-[20px] overflow-hidden card-animate glow-box-lg"
        style={{
          background: "hsl(120 100% 4%)",
          border: "1px solid hsl(120 100% 20%)",
        }}
      >
        {/* Top accent strip */}
        <div
          className="h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(120 100% 50%), hsl(120 100% 40%), transparent)",
          }}
        />

        {/* Header */}
        <div
          className="flex items-center gap-7 px-9 py-9 pb-7 relative"
          style={{ borderBottom: "1px solid hsl(120 50% 12%)" }}
        >
          <div
            className="relative flex-shrink-0 w-[88px] h-[88px] rounded-full flex items-center justify-center glow-box"
            style={{
              background: "hsl(120 30% 10%)",
              border: "2px solid hsl(120 100% 20%)",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "28px",
              fontWeight: 900,
              color: "hsl(120 100% 50%)",
            }}
          >
            W
            <div className="avatar-ring" />
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="font-black tracking-wide leading-tight glow-text"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(20px, 4vw, 28px)",
                color: "hsl(120 100% 50%)",
              }}
            >
              Silentwolf
            </div>
            <div
              className="text-[11px] mt-1.5 tracking-widest uppercase"
              style={{ color: "hsl(120 40% 55%)" }}
            >
              Bot Developer &amp; System Explorer
            </div>
            <div
              className="text-[11px] mt-1"
              style={{
                color: "hsl(120 20% 30%)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <span style={{ color: "hsl(120 50% 40%)" }}>@</span>Silentwolf906
            </div>
            <div
              className="inline-flex items-center gap-1.5 text-[9px] tracking-widest uppercase mt-2.5 px-2.5 py-1 rounded-full"
              style={{
                color: "hsl(120 100% 50%)",
                border: "1px solid hsl(120 100% 50% / 0.3)",
                background: "hsl(120 100% 50% / 0.05)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <div className="status-dot" />
              Available
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {stats && <ProgressBar stats={stats} />}

        {/* Contact form */}
        <ContactForm onSubmitted={setStats} />

        {/* Social Links */}
        <div
          className="px-9 py-7 grid grid-cols-2 gap-3"
          style={{ borderBottom: "1px solid hsl(120 50% 12%)" }}
        >
          {socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`link-card${link.full ? " col-span-2" : ""}`}
            >
              <div className="link-icon-box">{link.icon}</div>
              <div className="min-w-0 flex-1">
                <div
                  className="text-[9px] tracking-widest uppercase mb-0.5"
                  style={{ color: "hsl(120 20% 30%)" }}
                >
                  {link.label}
                </div>
                <div
                  className="text-[11px] truncate"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {link.value}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Stats */}
        <div
          className="px-9 py-5 grid grid-cols-3 gap-3"
          style={{ borderBottom: "1px solid hsl(120 50% 12%)" }}
        >
          {statsBadges.map((stat) => (
            <div
              key={stat.label}
              className="text-center py-4 px-2 rounded-xl"
              style={{
                background: "hsl(120 100% 3%)",
                border: "1px solid hsl(120 50% 12%)",
              }}
            >
              <div
                className="font-black leading-none glow-text"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "hsl(120 100% 50%)",
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-[9px] tracking-widest uppercase mt-1.5"
                style={{ color: "hsl(120 20% 30%)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="px-9 py-7 flex flex-col gap-3">
          {stats?.targetReached ? (
            <button
              onClick={downloadVcf}
              className="btn-primary-glow flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-xs tracking-widest uppercase cursor-pointer border-none w-full"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              ⬇ Download All Contacts (.vcf)
            </button>
          ) : (
            <div
              className="flex items-center justify-center py-4 px-6 rounded-xl text-[11px] tracking-wide"
              style={{
                background: "hsl(120 100% 3%)",
                border: "1px solid hsl(120 50% 12%)",
                color: "hsl(120 20% 30%)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              🔒 VCF download unlocks at{" "}
              <span style={{ color: "hsl(120 100% 50%)", marginLeft: 4 }}>
                {stats?.target ?? 50} contacts
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://wa.me/254713046497"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-glow flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-xs tracking-widest uppercase text-center"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              💬 Message Me
            </a>
            <a
              href="https://wolfxnode.replit.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-glow flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-xs tracking-widest uppercase text-center"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              🚀 Visit Platform
            </a>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-9 py-4"
          style={{
            background: "hsl(120 100% 2% / 0.6)",
            borderTop: "1px solid hsl(120 50% 12%)",
          }}
        >
          <div
            className="text-[10px]"
            style={{
              color: "hsl(120 20% 30%)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            powered by{" "}
            <span style={{ color: "hsl(120 100% 50%)" }}>wolfXnode</span>
            <span className="cursor-blink" />
          </div>
          <div
            className="text-[9px] tracking-widest"
            style={{
              color: "hsl(120 20% 30%)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ID: WOLF-906-VCF
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <p
        className="mt-7 text-center text-[10px] tracking-widest uppercase"
        style={{
          color: "hsl(120 20% 30%)",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        I am just an explorer &nbsp;·&nbsp;{" "}
        <a
          href="https://wolfxnode.replit.app"
          style={{
            color: "hsl(120 50% 40%)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "hsl(120 100% 50%)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "hsl(120 50% 40%)")
          }
        >
          wolfxnode.replit.app
        </a>
      </p>
    </div>
  );
}
