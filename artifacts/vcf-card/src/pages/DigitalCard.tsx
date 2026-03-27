import { useState } from "react";

function downloadVCF() {
  const vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:Silentwolf',
    'N:Silentwolf;;;',
    'NICKNAME:Wolf906',
    'ORG:wolfXnode',
    'TITLE:Bot Developer & System Explorer',
    'TEL;TYPE=CELL,VOICE:+254713046497',
    'URL:https://wolfxnode.replit.app',
    'X-SOCIALPROFILE;TYPE=youtube:https://www.youtube.com/@Silentwolf906',
    'X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/254713046497',
    'NOTE:wolfXnode — WhatsApp Bot Hosting Platform. I am just an explorer.',
    'END:VCARD'
  ].join('\r\n');

  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'silentwolf-wolfxnode.vcf';
  a.click();
  URL.revokeObjectURL(url);
}

const links = [
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

const stats = [
  { value: "24/7", label: "Uptime" },
  { value: "∞", label: "Bots Hosted" },
  { value: "KE", label: "Based In" },
];

export default function DigitalCard() {
  const [downloaded, setDownloaded] = useState(false);

  function handleDownload() {
    downloadVCF();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

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
          background: 'hsl(120 100% 3% / 0.8)',
          border: '1px solid hsl(120 50% 12%)',
        }}
      >
        <div
          className="font-orb text-base font-black tracking-wide glow-text"
          style={{ color: 'hsl(120 100% 50%)', fontFamily: "'Orbitron', sans-serif" }}
        >
          wolf<span style={{ color: 'hsl(120 100% 80%)' }}>X</span>node
        </div>
        <div
          className="text-[10px] tracking-widest px-3 py-1 rounded-full"
          style={{
            color: 'hsl(120 20% 30%)',
            border: '1px solid hsl(120 50% 12%)',
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
          background: 'hsl(120 100% 4%)',
          border: '1px solid hsl(120 100% 20%)',
        }}
      >
        {/* Top accent strip */}
        <div
          className="h-[3px]"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(120 100% 50%), hsl(120 100% 40%), transparent)',
          }}
        />

        {/* Header */}
        <div
          className="flex items-center gap-7 px-9 py-9 pb-7 relative"
          style={{ borderBottom: '1px solid hsl(120 50% 12%)' }}
        >
          {/* Avatar */}
          <div
            className="relative flex-shrink-0 w-[88px] h-[88px] rounded-full flex items-center justify-center glow-box"
            style={{
              background: 'hsl(120 30% 10%)',
              border: '2px solid hsl(120 100% 20%)',
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '28px',
              fontWeight: 900,
              color: 'hsl(120 100% 50%)',
            }}
          >
            W
            <div className="avatar-ring" />
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div
              className="font-black tracking-wide leading-tight glow-text"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 'clamp(20px, 4vw, 28px)',
                color: 'hsl(120 100% 50%)',
              }}
            >
              Silentwolf
            </div>
            <div
              className="text-[11px] mt-1.5 tracking-widest uppercase"
              style={{ color: 'hsl(120 40% 55%)' }}
            >
              Bot Developer &amp; System Explorer
            </div>
            <div
              className="text-[11px] mt-1"
              style={{ color: 'hsl(120 20% 30%)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span style={{ color: 'hsl(120 50% 40%)' }}>@</span>Silentwolf906
            </div>
            <div
              className="inline-flex items-center gap-1.5 text-[9px] tracking-widest uppercase mt-2.5 px-2.5 py-1 rounded-full"
              style={{
                color: 'hsl(120 100% 50%)',
                border: '1px solid hsl(120 100% 50% / 0.3)',
                background: 'hsl(120 100% 50% / 0.05)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <div className="status-dot" />
              Available
            </div>
          </div>
        </div>

        {/* Contact Links Grid */}
        <div
          className="px-9 py-7 grid grid-cols-2 gap-3"
          style={{ borderBottom: '1px solid hsl(120 50% 12%)' }}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`link-card${link.full ? ' col-span-2' : ''}`}
            >
              <div className="link-icon-box">{link.icon}</div>
              <div className="min-w-0 flex-1">
                <div
                  className="text-[9px] tracking-widest uppercase mb-0.5"
                  style={{ color: 'hsl(120 20% 30%)' }}
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

        {/* Stats Row */}
        <div
          className="px-9 py-5 grid grid-cols-3 gap-3"
          style={{ borderBottom: '1px solid hsl(120 50% 12%)' }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center py-4 px-2 rounded-xl"
              style={{
                background: 'hsl(120 100% 3%)',
                border: '1px solid hsl(120 50% 12%)',
              }}
            >
              <div
                className="font-black leading-none glow-text"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'hsl(120 100% 50%)',
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-[9px] tracking-widest uppercase mt-1.5"
                style={{ color: 'hsl(120 20% 30%)' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="px-9 py-7 flex flex-col gap-3">
          <button
            onClick={handleDownload}
            className="btn-primary-glow flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-xs tracking-widest uppercase cursor-pointer border-none w-full"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {downloaded ? '✓ Downloaded!' : '⬇ Download Contact (.vcf)'}
          </button>
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
            background: 'hsl(120 100% 2% / 0.6)',
            borderTop: '1px solid hsl(120 50% 12%)',
          }}
        >
          <div
            className="text-[10px]"
            style={{ color: 'hsl(120 20% 30%)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            powered by <span style={{ color: 'hsl(120 100% 50%)' }}>wolfXnode</span>
            <span className="cursor-blink" />
          </div>
          <div
            className="text-[9px] tracking-widest"
            style={{ color: 'hsl(120 20% 30%)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            ID: WOLF-906-VCF
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <p
        className="mt-7 text-center text-[10px] tracking-widest uppercase"
        style={{ color: 'hsl(120 20% 30%)', fontFamily: "'JetBrains Mono', monospace" }}
      >
        I am just an explorer &nbsp;·&nbsp;{' '}
        <a
          href="https://wolfxnode.replit.app"
          style={{ color: 'hsl(120 50% 40%)', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'hsl(120 100% 50%)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'hsl(120 50% 40%)')}
        >
          wolfxnode.replit.app
        </a>
      </p>
    </div>
  );
}
