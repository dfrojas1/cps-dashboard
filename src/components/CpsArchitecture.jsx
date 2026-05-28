import { useState } from 'react'

// ── Data ──

const STATS = [
  { value: '8', label: 'Live Pages', color: '#00c8ff' },
  { value: '6', label: 'Forms Wired', color: '#00c8ff' },
  { value: '7', label: 'Security Headers', color: '#00c8ff' },
  { value: '✓', label: 'HTTPS', color: '#22c55e' },
  { value: '6', label: 'CLI Tools', color: '#00c8ff' },
  { value: '→', label: 'Phase 2', color: '#a855f7' },
]

const LIVE_PAGES = [
  { icon: '🌐', title: 'CPS Main Site', desc: 'index.html — Agency homepage. Contact form + chat widget. Formspree backend. OG tags, favicon, analytics.', status: 'live' },
  { icon: '💻', title: 'Web Services', desc: 'web.html — Pricing tiers ($1,200/$3,500/$7,500). Project intake form + chat wizard.', status: 'live' },
  { icon: '🖥️', title: 'EUC / VDI', desc: 'euc.html — IGEL OS, ControlUp, Citrix, VMware consulting. Enterprise vertical with ROI stats.', status: 'live' },
  { icon: '✈️', title: 'Travel', desc: 'travel.html — Mapbox globe, booking wizard (leisure/corporate), live pricing cards.', status: 'live' },
  { icon: '🏊', title: 'Swim Sessions', desc: 'swim.html — Clayton HOA pool, summer 2026. Registration form with Formspree.', status: 'live' },
  { icon: '🔧', title: 'Support', desc: 'support.html — Ticket system (CPS-YYMM-XXXX IDs), severity levels, SLA tiers, chat bot.', status: 'live' },
  { icon: '🏥', title: 'Medical v2', desc: 'Triangle Hand & Shoulder Center proposal. Source Serif + DM Sans design system.', status: 'demo' },
  { icon: '🧠', title: 'Nerve Map', desc: 'nerve-map-options.html — Medical nerve mapping SVG visualization. 4 design variants.', status: 'demo' },
]

const DEMO_SITES = [
  { icon: '🏥', title: 'Raleigh Hand', desc: 'Proposal for RHSC. Navy theme, physician profiles. Impeccable: 100+ → 25 issues.', status: 'demo' },
  { icon: '🦴', title: 'Shoulder/Spine 3D', desc: 'Interactive SVG anatomy viewer, 10 conditions. Impeccable: 200+ → 131 issues.', status: 'demo' },
  { icon: '🖤', title: 'AD Window Tint', desc: 'Mono/brutalist design for Clayton tint shop. Impeccable: 40 → 10 issues.', status: 'demo' },
]

const INFRA = [
  { icon: '☁️', title: 'Cloudflare Workers', desc: 'Static hosting via wrangler deploy. Free tier (100K req/day). HTTPS ON — 301 redirect, HSTS preload-ready.', status: 'secured', badges: ['HSTS 1yr', 'CSP', 'X-Frame DENY', 'No-Sniff', 'Referrer', 'Permissions', 'XSS-Protect'] },
  { icon: '📝', title: 'Formspree', desc: 'Form backend for all 6 forms. fetch() POST with mailto: fallback. Free tier: 50 submissions/mo.', status: 'needs-ids', alert: '6 placeholder IDs need replacing' },
  { icon: '🔍', title: 'SEO & Analytics', desc: 'All 8 pages have OG meta, Twitter cards, favicon, CF Analytics snippet. sitemap.xml + robots.txt deployed.', status: 'done', alert: 'Analytics token placeholder needs replacing' },
  { icon: '⚡', title: 'CLI Toolchain', desc: 'impeccable (lint), wrangler (deploy), gh (GitHub), supabase (backend), playwright (test), vercel (preview)', status: 'authed' },
  { icon: '🎬', title: 'Remotion', desc: 'React-based video/animation framework for promotional content.', status: null },
  { icon: '📊', title: 'Dashboards', desc: 'cps-architecture.html, usage-limits.html, DASHBOARD.md — project status + Phase 2 roadmap.', status: null },
]

const PHASE2 = [
  { icon: '🗄️', title: 'Supabase', desc: 'Postgres DB for leads, bookings, tickets, chat logs. Auth (magic link). Free: 500MB DB, 50K MAU.' },
  { icon: '💬', title: 'SMS (Twilio)', desc: 'Customer confirmation texts on form submit. ~$0.008/msg → ~$2/mo at 200 msgs.' },
  { icon: '🤖', title: 'AI Chatbot', desc: 'Scripted decision trees + Claude Haiku fallback via Supabase Edge Function. ~$0.003/turn → ~$2/mo.' },
  { icon: '📅', title: 'Booking System', desc: 'Calendar UI in HTML files. Supabase Postgres for availability. SMS confirmation via Twilio.' },
]

const COMPLETED = [
  'HTTPS Redirect — Always Use HTTPS + HSTS enabled via Cloudflare API',
  'Security Headers — 7 headers via _headers file: HSTS, CSP, X-Frame, X-Content-Type, Referrer, Permissions, XSS',
  'Form Backends — 6 forms converted from mailto: to Formspree fetch() with mailto: fallback',
  'SEO — OG + Twitter Cards on all 8 pages',
  'Favicon — favicon.svg (CP icon) deployed and linked on all 8 pages',
  'sitemap.xml + robots.txt — 6 pages indexed, sitemap referenced in robots.txt',
  'Analytics Snippet — Cloudflare Web Analytics on all 8 pages',
  'Design Audits — Impeccable run on all files. Contrast, tiny text, letter-spacing fixed',
  'CLI Toolchain — impeccable, wrangler, gh, supabase, playwright, vercel installed + authed',
  'Deployed to Production — All changes live at caryparksolutions.com',
]

const REMAINING = [
  { label: '6 Formspree IDs', note: 'Create forms at formspree.io, replace placeholders in HTML files', priority: 'med' },
  { label: 'CF Analytics Token', note: 'Cloudflare Dashboard → Web Analytics → Add Site → replace token', priority: 'med' },
  { label: 'Real Photos', note: 'Gallery items are CSS placeholders. Need real images for client sites', priority: 'low' },
  { label: 'CI/CD Pipeline', note: 'Optional: GitHub Actions → auto wrangler deploy on push to main', priority: 'low' },
]

const PHASE2_TASKS = [
  { label: 'Supabase Init + Schema', note: 'Create project, run schema SQL (leads, bookings, tickets, sms_log, chat_sessions). ~10 min.', time: '10m' },
  { label: 'SMS Edge Function', note: 'Supabase Edge Function → Twilio API. Customer confirmation texts. ~30 min.', time: '30m' },
  { label: 'Booking Edge Function', note: 'Date/time validation, unique constraint check, DB insert, SMS trigger. ~30 min.', time: '30m' },
  { label: 'AI Chat Edge Function', note: 'Claude Haiku proxy, rate-limited (10 turns/session). Business context prompt. ~45 min.', time: '45m' },
  { label: 'Wire Forms → Supabase', note: 'Add supabase-js CDN to HTML files, replace Formspree with Supabase inserts + SMS. ~1 hr.', time: '1h' },
  { label: 'Booking Calendar UI', note: 'Embedded date/time picker in swim, travel, web, support pages. ~1-2 hrs.', time: '1-2h' },
  { label: 'AI Chat Integration', note: 'Add "Ask anything" to all chat widgets, wire to Edge Function. ~1 hr.', time: '1h' },
  { label: 'Admin Dashboard', note: 'admin.html — view all leads, bookings, tickets in one place. Supabase realtime. ~1-2 hrs.', time: '1-2h' },
]

const PIPELINES = {
  current: [
    ['Claude Code', '→', 'Edit .html', '→', 'impeccable lint', '→', 'wrangler deploy', '→', 'caryparksolutions.com'],
    ['gh commit/PR', '→', 'playwright test', '→', 'Form → Formspree', '→', 'Email notification'],
  ],
  phase2: [
    ['User submits form', '→', 'Supabase DB insert', '→', 'Edge Function', '→', 'Twilio SMS', '→', 'Customer gets text'],
    ['User clicks "Ask anything"', '→', 'Edge Function /api/chat', '→', 'Claude Haiku', '→', 'AI response in chat'],
    ['User picks date/time', '→', 'Edge Function /api/book', '→', 'Postgres (unique check)', '→', 'SMS confirmation'],
  ],
}

// ── Helpers ──

const STATUS_BADGE = {
  live:       { label: 'LIVE',      cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  demo:       { label: 'DEMO',      cls: 'bg-cyan-500/12 text-cyan-400 border-cyan-500/25' },
  secured:    { label: 'SECURED',   cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  done:       { label: 'DONE',      cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  authed:     { label: 'AUTHED',    cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  'needs-ids':{ label: 'NEEDS IDS', cls: 'bg-orange-500/12 text-orange-400 border-orange-500/25' },
  planned:    { label: 'PHASE 2',   cls: 'bg-purple-500/12 text-purple-400 border-purple-500/25' },
}

function Badge({ status }) {
  const s = STATUS_BADGE[status]
  if (!s) return null
  return <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${s.cls}`}>{s.label}</span>
}

function SectionTitle({ children, purple }) {
  return (
    <h3 className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-3 mt-6 first:mt-0 ${purple ? 'text-purple-400' : 'text-cyan-400'}`}>
      {children}
    </h3>
  )
}

function Card({ icon, title, desc, status, badges, alert, children }) {
  return (
    <div className="bg-cc-well/50 rounded-lg border border-cc-border/50 p-3.5 hover:border-cyan-500/20 transition-all relative group">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-sm shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-cc-text">{title}</span>
            {status && <Badge status={status} />}
          </div>
          <p className="text-[10px] text-cc-text-muted mt-1 leading-relaxed">{desc}</p>
          {alert && <p className="text-[9px] text-orange-400 mt-1.5 font-mono">⚠ {alert}</p>}
          {badges && (
            <div className="flex flex-wrap gap-1 mt-2">
              {badges.map((b) => (
                <span key={b} className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded bg-green-500/8 border border-green-500/20 text-green-400 uppercase tracking-wider">{b}</span>
              ))}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

function FlowRow({ steps, purple }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap mb-2 last:mb-0">
      {steps.map((s, i) =>
        s === '→' ? (
          <span key={i} className="text-cc-text-muted text-xs">→</span>
        ) : (
          <span
            key={i}
            className={`text-[9px] font-mono font-semibold px-2 py-1 rounded border whitespace-nowrap ${
              purple ? 'bg-purple-500/8 border-purple-500/20 text-purple-300' : 'bg-cyan-500/8 border-cyan-500/20 text-cyan-300'
            }`}
          >
            {s}
          </span>
        )
      )}
    </div>
  )
}

// ── Component ──

export default function CpsArchitecture() {
  const [section, setSection] = useState('overview')

  const sections = [
    { key: 'overview',  label: 'Overview' },
    { key: 'pages',     label: 'Pages' },
    { key: 'infra',     label: 'Infra' },
    { key: 'phase2',    label: 'Phase 2' },
    { key: 'checklist', label: 'Checklist' },
  ]

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="bg-cc-panel rounded-lg border border-cc-border p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-purple-500/[0.02] pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-cc-text">
                Cary Park <span className="text-cyan-400">Solutions</span> — Architecture
              </h2>
              <p className="text-[10px] text-cc-text-muted font-mono mt-0.5">Full system map — updated May 28, 2026</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse" />
              <span className="text-[9px] font-mono text-green-400">ALL SYSTEMS LIVE</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-6 gap-2">
            {STATS.map((s) => (
              <div key={s.label} className="text-center py-2 bg-cc-well/50 rounded-lg border border-cc-border/30">
                <div className="text-lg font-bold font-mono" style={{ color: s.color, textShadow: `0 0 10px ${s.color}30` }}>{s.value}</div>
                <div className="text-[7px] text-cc-text-muted uppercase tracking-widest font-mono mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`px-3 py-1.5 rounded text-[9px] font-mono uppercase tracking-wider transition-all ${
              section === s.key
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(0,200,255,0.15)]'
                : 'text-cc-text-muted hover:text-cc-text-dim border border-cc-border/50 hover:border-cc-border'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {section === 'overview' && (
        <div className="space-y-4">
          {/* Business */}
          <div className="bg-cc-panel rounded-lg border border-cyan-500/20 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] to-transparent pointer-events-none" />
            <div className="relative flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-base shrink-0">🏢</div>
              <div>
                <h3 className="text-xs font-bold text-cc-text mb-1">Cary Park Solutions — Web Design & Technology Consulting</h3>
                <div className="text-[10px] text-cc-text-dim leading-relaxed space-y-1">
                  <p><span className="text-cc-text font-semibold">What:</span> Demo-first websites for local NC businesses.</p>
                  <p><span className="text-cc-text font-semibold">Verticals:</span> Web design, managed IT/EUC, travel planning, community services (swim).</p>
                  <p><span className="text-cc-text font-semibold">Revenue:</span> Project-based ($1,200-$7,500) + monthly retainers.</p>
                  <p><span className="text-cc-text font-semibold">Market:</span> Triangle area (Clayton → Raleigh → Cary).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pipelines */}
          <div className="bg-cc-panel rounded-lg border border-cc-border p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-400 mb-3">Development Pipeline (Current)</h3>
            {PIPELINES.current.map((row, i) => <FlowRow key={i} steps={row} />)}
          </div>
          <div className="bg-cc-panel rounded-lg border border-purple-500/20 p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-purple-400 mb-3">Phase 2 Pipeline (Coming)</h3>
            {PIPELINES.phase2.map((row, i) => <FlowRow key={i} steps={row} purple />)}
          </div>

          {/* Cost */}
          <div className="bg-cc-panel rounded-lg border border-purple-500/20 p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-purple-400 mb-3">Phase 2 Monthly Cost</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {['Cloudflare: $0', 'Supabase: $0', 'Formspree: $0', 'Twilio SMS: ~$2', 'Claude Haiku: ~$2'].map((c) => (
                <span key={c} className={`text-[9px] font-mono px-2 py-1 rounded border ${
                  c.includes('$0') ? 'bg-green-500/8 border-green-500/20 text-green-400' : 'bg-purple-500/8 border-purple-500/20 text-purple-300'
                }`}>{c}</span>
              ))}
            </div>
            <p className="text-[10px] text-cyan-400 font-semibold font-mono">Total: ~$4/month at scale</p>
          </div>

          {/* Philosophy */}
          <div className="bg-cc-panel rounded-lg border border-cyan-500/15 p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-400 mb-3">Architecture Philosophy</h3>
            <p className="text-[10px] text-cyan-300 font-semibold mb-2">Single-file HTML, zero build step.</p>
            <div className="text-[10px] text-cc-text-dim leading-relaxed space-y-1">
              <p>✓ Works from file:// — email it, demo offline in a coffee shop</p>
              <p>✓ Zero infrastructure to fail — no Node server, no CDN edge cases</p>
              <p>✓ Deploy in 10 seconds — npx wrangler deploy</p>
              <p>✓ Claude Code native — AI can read/audit/fix the entire site in one pass</p>
              <p>✓ Impeccable lintable — design quality checked directly on the output</p>
            </div>
          </div>
        </div>
      )}

      {/* PAGES */}
      {section === 'pages' && (
        <div className="space-y-4">
          <SectionTitle>Live Pages (caryparksolutions.com)</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {LIVE_PAGES.map((p) => <Card key={p.title} {...p} />)}
          </div>
          <SectionTitle>Client Demo Sites</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_SITES.map((p) => <Card key={p.title} {...p} />)}
          </div>
        </div>
      )}

      {/* INFRA */}
      {section === 'infra' && (
        <div className="space-y-4">
          <SectionTitle>Infrastructure (Current)</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {INFRA.map((p) => <Card key={p.title} {...p} />)}
          </div>
          {/* HTTPS Fix */}
          <div className="bg-green-500/6 rounded-lg border border-green-500/20 p-4 flex items-start gap-3">
            <span className="text-lg">✅</span>
            <div>
              <h4 className="text-xs font-bold text-green-400 mb-1">HTTPS Issue — FIXED (May 27, 2026)</h4>
              <div className="text-[10px] text-cc-text-dim leading-relaxed">
                <p>Always Use HTTPS: ON — HTTP returns 301 → HTTPS.</p>
                <p>Automatic HTTPS Rewrites: ON — mixed content auto-fixed.</p>
                <p>HSTS: max-age=31536000, includeSubDomains, preload-ready.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2 */}
      {section === 'phase2' && (
        <div className="space-y-4">
          <SectionTitle purple>Phase 2 — Dynamic Features (~6-8 hrs)</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {PHASE2.map((p) => <Card key={p.title} {...p} status="planned" />)}
          </div>
          <SectionTitle purple>Phase 2 Implementation Tasks</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {PHASE2_TASKS.map((t) => (
              <div key={t.label} className="bg-cc-well/50 rounded-lg border border-purple-500/15 p-3 flex items-start gap-2.5">
                <span className="text-xs mt-0.5">🟣</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-cc-text">{t.label}</span>
                    <span className="text-[8px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">{t.time}</span>
                  </div>
                  <p className="text-[9px] text-cc-text-muted mt-0.5 leading-relaxed">{t.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHECKLIST */}
      {section === 'checklist' && (
        <div className="space-y-4">
          {/* Completed */}
          <div className="bg-cc-panel rounded-lg border border-cc-border p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-green-400 mb-3">Completed — Session May 27</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {COMPLETED.map((item) => (
                <div key={item} className="flex items-start gap-2 p-2 rounded bg-cc-well/30 border-l-2 border-green-500/40">
                  <span className="text-[10px] mt-0.5 shrink-0">✅</span>
                  <span className="text-[10px] text-cc-text-dim leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Remaining */}
          <div className="bg-cc-panel rounded-lg border border-cc-border p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-orange-400 mb-3">Remaining — Quick Wins</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {REMAINING.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-start gap-2 p-2 rounded bg-cc-well/30 ${
                    item.priority === 'med' ? 'border-l-2 border-yellow-500/40' : 'border-l-2 border-cc-text-muted/20'
                  }`}
                >
                  <span className="text-[10px] mt-0.5 shrink-0">{item.priority === 'med' ? '🟡' : '⚪'}</span>
                  <div>
                    <span className="text-[10px] font-semibold text-cc-text block">{item.label}</span>
                    <span className="text-[9px] text-cc-text-muted">{item.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
