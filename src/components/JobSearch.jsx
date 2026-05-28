import { useState, useEffect } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const SEARCH_RESULTS = {
  runDate: 'May 28, 2026',
  jobs: [
    { id:'s1', title:'Senior Customer Success Manager', company:'Nexthink', location:'Remote', salary:'', source:'Built In', status:'saved', fit:'top', posted:'', why:'EUC/DEX platform — direct IGEL overlap. DEX workshops, renewal targets, endpoint background is a direct match.', url:'https://builtin.com/job/senior-customer-success-manager/8395440' },
    { id:'s2', title:'Senior Customer Success Manager', company:'BetterUp', location:'Hybrid – NYC', salary:'$135k–$175k', source:'edtech.com', status:'saved', fit:'strong', posted:'~1 week ago', why:'Exec stakeholder management, enterprise SaaS deployment ownership, 7+ yrs. Comp is right. NYC hybrid is the catch.', url:'https://www.edtech.com/jobs/senior-customer-success-manager-9510' },
    { id:'s3', title:'Senior Customer Success Manager', company:'Drata', location:'Remote', salary:'', source:'LinkedIn', status:'saved', fit:'strong', posted:'', why:'Exec relationships, enterprise accounts, expansion targets. Cybersecurity-adjacent fits your PAN/Zscaler background.', url:'https://www.linkedin.com/jobs/' },
    { id:'s4', title:'Senior Principal Customer Success Manager', company:'PagerDuty', location:'Remote', salary:'', source:'LinkedIn', status:'saved', fit:'strong', posted:'', why:'Strategic accounts, digital transformation motion, exec-level stakeholder management. Real CS investment.', url:'https://www.linkedin.com/jobs/' },
    { id:'s5', title:'Renewals Account Manager', company:'Palo Alto Networks', location:'Remote (US)', salary:'$120k–$145k', source:'PAN Careers', status:'saved', fit:'strong', posted:'', why:'Right entry lane — not TAM. You\'ve applied to PAN before. Renewals AM fits your motion.', url:'https://jobs.paloaltonetworks.com' },
    { id:'s6', title:'Partner Sales Manager', company:'Process Street', location:'Remote (EST/CST)', salary:'', source:'Greenhouse', status:'saved', fit:'check', posted:'', why:'Channel/partner motion, enterprise SaaS. EN/ES bilingual is a plus for GSI work. ~50% travel — flag that.', url:'https://job-boards.greenhouse.io/processstreet/jobs/8202457002' },
    { id:'s7', title:'Enterprise Account Executive', company:'Converge Technology Solutions', location:'Remote (US)', salary:'Uncapped OTE', source:'Glassdoor', status:'saved', fit:'check', posted:'', why:'Sells HPE, CrowdStrike, PAN, Zscaler, Cisco. EUC/endpoint background translates. VAR/channel AE motion.', url:'https://www.glassdoor.com/job-listing/' },
    { id:'s8', title:'Customer Success Manager (Multiple)', company:'Palo Alto Networks', location:'Remote', salary:'', source:'LinkedIn', status:'saved', fit:'strong', posted:'Active hiring', why:'89 open CSM roles across NGFW, Prisma, Cortex. High hiring velocity — go direct to careers page and filter CSM.', url:'https://www.linkedin.com/jobs/palo-alto-networks-customer-success-manager-jobs' },
  ],
  manual: [
    { company:'Omnissa', note:'careers.omnissa.com — filter CSM/AM', url:'https://careers.omnissa.com' },
    { company:'ServiceNow', note:'careers.servicenow.com — Renewal AM or Customer Success', url:'https://careers.servicenow.com' },
    { company:'HPE', note:'careers.hpe.com — Senior CSM, North Carolina', url:'https://careers.hpe.com' },
  ],
}

const STATUS_MAP = {
  saved:     { label:'Saved',     bg:'rgba(82,82,82,0.2)',  border:'rgba(82,82,82,0.4)',  text:'#a3a3a3' },
  applied:   { label:'Applied',   bg:'rgba(220,38,38,0.15)', border:'rgba(220,38,38,0.4)', text:'#ef4444' },
  interview: { label:'Interview', bg:'rgba(245,158,11,0.15)',border:'rgba(245,158,11,0.4)',text:'#f59e0b' },
  offer:     { label:'Offer',     bg:'rgba(34,197,94,0.15)', border:'rgba(34,197,94,0.4)', text:'#22c55e' },
  pass:      { label:'Pass',      bg:'rgba(82,82,82,0.1)',   border:'rgba(82,82,82,0.3)',  text:'#525252' },
}

const FIT_MAP = {
  top:    { label:'TOP PICK',  bg:'rgba(34,197,94,0.15)',  border:'rgba(34,197,94,0.3)',  text:'#22c55e', icon:'🔥' },
  strong: { label:'STRONG',    bg:'rgba(59,130,246,0.15)', border:'rgba(59,130,246,0.3)', text:'#3b82f6', icon:'✅' },
  check:  { label:'CHECK',     bg:'rgba(245,158,11,0.15)', border:'rgba(245,158,11,0.3)', text:'#f59e0b', icon:'⚠️' },
}

function JobCard({ job, searchStatuses, setSearchStatus, expanded, setExpanded, addToPipeline, addedIds }) {
  const status = searchStatuses[job.id] || job.status
  const st = STATUS_MAP[status] || STATUS_MAP.saved
  const fit = FIT_MAP[job.fit] || FIT_MAP.check
  const isExp = expanded === job.id
  const alreadyAdded = addedIds.has(job.id)

  return (
    <div className="bg-cc-well/50 rounded-lg border border-cc-border/50 hover:border-cc-red/20 transition-all">
      <div className="flex items-start gap-3 p-3">
        <div className="w-8 h-8 rounded-lg bg-cc-red/10 border border-cc-red/20 flex items-center justify-center text-cc-red text-xs font-bold font-mono shrink-0">
          {job.company[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-cc-text">{job.title}</span>
            <span
              className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: fit.bg, border: `1px solid ${fit.border}`, color: fit.text }}
            >
              {fit.icon} {fit.label}
            </span>
          </div>
          <p className="text-[10px] text-cc-text-muted mt-0.5 truncate font-mono">
            {[job.company, job.location, job.salary, job.posted].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={status}
            onChange={(e) => setSearchStatus(job.id, e.target.value)}
            className="text-[9px] font-mono px-2 py-1 rounded-full cursor-pointer border bg-transparent outline-none"
            style={{ background: st.bg, borderColor: st.border, color: st.text }}
          >
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k} style={{ background: '#111', color: '#e5e5e5' }}>{v.label}</option>
            ))}
          </select>
          <button
            onClick={() => setExpanded(isExp ? null : job.id)}
            className="text-cc-text-muted hover:text-cc-text text-xs transition-colors"
          >
            {isExp ? '▲' : '▼'}
          </button>
        </div>
      </div>
      {isExp && (
        <div className="px-3 pb-3 pt-0">
          <div className="border-t border-cc-border/30 pt-3">
            <p className="text-[11px] text-cc-text-dim leading-relaxed mb-3">{job.why}</p>
            <div className="flex gap-2">
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono px-3 py-1.5 rounded-lg border border-cc-red/30 bg-cc-red/10 text-cc-red hover:bg-cc-red/20 transition-colors"
                >
                  Apply ↗
                </a>
              )}
              <button
                onClick={() => addToPipeline(job)}
                disabled={alreadyAdded}
                className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition-colors ${
                  alreadyAdded
                    ? 'border-cc-green/30 bg-cc-green/10 text-cc-green cursor-default'
                    : 'border-cc-border bg-cc-surface hover:border-cc-red/30 text-cc-text-dim cursor-pointer'
                }`}
              >
                {alreadyAdded ? '✓ In pipeline' : '+ Add to pipeline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PipelineCard({ job, expanded, setExpanded, setPipelineStatus, removeFromPipeline }) {
  const st = STATUS_MAP[job.status] || STATUS_MAP.saved
  const isExp = expanded === job.id
  const days = job.addedDate ? Math.floor((Date.now() - new Date(job.addedDate)) / 86400000) : null

  return (
    <div className="bg-cc-well/50 rounded-lg border border-cc-border/50 hover:border-cc-red/20 transition-all">
      <div className="flex items-start gap-3 p-3">
        <div className="w-8 h-8 rounded-lg bg-cc-surface border border-cc-border flex items-center justify-center text-cc-text-dim text-xs font-bold font-mono shrink-0">
          {job.company[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-cc-text">{job.title}</p>
          <p className="text-[10px] text-cc-text-muted mt-0.5 font-mono">
            {[job.company, job.salary, days !== null ? `${days}d ago` : null, job.source].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={job.status}
            onChange={(e) => setPipelineStatus(job.id, e.target.value)}
            className="text-[9px] font-mono px-2 py-1 rounded-full cursor-pointer border bg-transparent outline-none"
            style={{ background: st.bg, borderColor: st.border, color: st.text }}
          >
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k} style={{ background: '#111', color: '#e5e5e5' }}>{v.label}</option>
            ))}
          </select>
          {job.url && (
            <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-cc-text-muted hover:text-cc-text text-xs">↗</a>
          )}
          <button
            onClick={() => setExpanded(isExp ? null : job.id)}
            className="text-cc-text-muted hover:text-cc-text text-xs transition-colors"
          >
            {isExp ? '▲' : '▼'}
          </button>
        </div>
      </div>
      {isExp && (
        <div className="px-3 pb-3 pt-0">
          <div className="border-t border-cc-border/30 pt-3">
            {job.notes && <p className="text-[11px] text-cc-text-dim leading-relaxed mb-3">{job.notes}</p>}
            <button
              onClick={() => { if (confirm('Remove from pipeline?')) removeFromPipeline(job.id) }}
              className="text-[10px] font-mono px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function JobSearch() {
  const [tab, setTab] = useState('search')
  const [data, setData] = useLocalStorage('job_search_v3', { pipeline: [], searchStatuses: {}, addedIds: [] })
  const [expanded, setExpanded] = useState(null)
  const [pFilter, setPFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', company: '', url: '', salary: '', source: 'LinkedIn', notes: '' })

  const pipeline = data.pipeline || []
  const searchStatuses = data.searchStatuses || {}
  const addedIds = new Set(data.addedIds || [])

  const persist = (p, ss, ai) => {
    setData({ pipeline: p, searchStatuses: ss, addedIds: [...ai] })
  }

  const setSearchStatus = (id, s) => persist(pipeline, { ...searchStatuses, [id]: s }, addedIds)

  const addToPipeline = (job) => {
    if (addedIds.has(job.id)) return
    const newJob = {
      id: Date.now().toString(), title: job.title, company: job.company, url: job.url,
      salary: job.salary, source: job.source, notes: job.why, status: 'applied',
      addedDate: new Date().toISOString(),
    }
    persist([newJob, ...pipeline], searchStatuses, new Set([...addedIds, job.id]))
  }

  const setPipelineStatus = (id, s) => persist(pipeline.map((j) => (j.id === id ? { ...j, status: s } : j)), searchStatuses, addedIds)
  const removeFromPipeline = (id) => persist(pipeline.filter((j) => j.id !== id), searchStatuses, addedIds)

  const addManual = () => {
    if (!form.title || !form.company) return
    const job = { id: Date.now().toString(), ...form, status: 'saved', addedDate: new Date().toISOString() }
    persist([job, ...pipeline], searchStatuses, addedIds)
    setForm({ title: '', company: '', url: '', salary: '', source: 'LinkedIn', notes: '' })
    setShowAdd(false)
  }

  const filtered = pFilter === 'all' ? pipeline : pipeline.filter((j) => j.status === pFilter)
  const counts = ['all', 'saved', 'applied', 'interview', 'offer', 'pass'].reduce(
    (a, s) => ({ ...a, [s]: s === 'all' ? pipeline.length : pipeline.filter((j) => j.status === s).length }), {}
  )

  return (
    <div className="bg-cc-panel rounded-lg border border-cc-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cc-red/[0.02] via-transparent to-cc-red/[0.01] pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-5 pb-0 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em]">Job Search Command</h2>
            <div className="w-1.5 h-1.5 rounded-full bg-cc-red shadow-[0_0_6px_rgba(220,38,38,0.6)] animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-cc-text-muted font-mono">Last scan: {SEARCH_RESULTS.runDate}</span>
            {tab === 'pipeline' && (
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="text-[9px] font-mono px-2.5 py-1 rounded border border-cc-red/30 bg-cc-red/10 text-cc-red hover:bg-cc-red/20 transition-colors"
              >
                + Add Role
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cc-border/50 px-5 relative">
        {[
          { key: 'search', label: 'Latest Search', count: SEARCH_RESULTS.jobs.length, icon: '🔍' },
          { key: 'pipeline', label: 'My Pipeline', count: pipeline.length, icon: '📋' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2.5 text-[9px] font-mono uppercase tracking-wider transition-all relative flex items-center gap-1.5 ${
              tab === t.key ? 'text-cc-red' : 'text-cc-text-muted hover:text-cc-text-dim'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
              tab === t.key ? 'bg-cc-red/20 text-cc-red' : 'bg-cc-surface text-cc-text-muted'
            }`}>{t.count}</span>
            {tab === t.key && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cc-red shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5 relative">
        {/* SEARCH TAB */}
        {tab === 'search' && (
          <div>
            <p className="text-[10px] text-cc-text-muted font-mono mb-3">
              Expand a card to apply or add to pipeline. Ask Claude to refresh search every 2-3 days.
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {SEARCH_RESULTS.jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  searchStatuses={searchStatuses}
                  setSearchStatus={setSearchStatus}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  addToPipeline={addToPipeline}
                  addedIds={addedIds}
                />
              ))}
            </div>

            {/* Manual Check */}
            <div className="bg-cc-well/50 rounded-lg border border-cc-border/30 p-4">
              <p className="text-[9px] font-mono font-bold text-cc-text-dim uppercase tracking-wider mb-3">Check Manually This Week</p>
              {SEARCH_RESULTS.manual.map((m, i) => (
                <div key={i} className={`flex items-center justify-between py-2 ${i > 0 ? 'border-t border-cc-border/20' : ''}`}>
                  <span className="text-[11px] text-cc-text-dim">
                    <span className="font-semibold text-cc-text">{m.company}</span> — {m.note}
                  </span>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-cc-text-muted hover:text-cc-red font-mono transition-colors"
                  >
                    Go ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PIPELINE TAB */}
        {tab === 'pipeline' && (
          <div>
            {/* Add Form */}
            {showAdd && (
              <div className="bg-cc-well/50 rounded-lg border border-cc-border/50 p-4 mb-4">
                <p className="text-[10px] font-mono font-bold text-cc-text-dim uppercase tracking-wider mb-3">Add a Role</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {[
                    { k: 'title', l: 'Title *', p: 'Senior CSM' },
                    { k: 'company', l: 'Company *', p: 'Databricks' },
                    { k: 'url', l: 'URL', p: 'https://' },
                    { k: 'salary', l: 'Salary', p: '$130k' },
                  ].map(({ k, l, p }) => (
                    <div key={k}>
                      <label className="text-[9px] font-mono text-cc-text-muted block mb-1">{l}</label>
                      <input
                        value={form[k]}
                        onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                        placeholder={p}
                        className="w-full text-[11px] font-mono bg-cc-black border border-cc-border rounded px-2 py-1.5 text-cc-text placeholder:text-cc-text-muted/50 outline-none focus:border-cc-red/40"
                      />
                    </div>
                  ))}
                </div>
                <div className="mb-3">
                  <label className="text-[9px] font-mono text-cc-text-muted block mb-1">Source</label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                    className="text-[11px] font-mono bg-cc-black border border-cc-border rounded px-2 py-1.5 text-cc-text outline-none"
                  >
                    {['LinkedIn', 'Indeed', 'Greenhouse', 'Repvue', 'Ashby', 'Company site', 'Other'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="text-[9px] font-mono text-cc-text-muted block mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="w-full text-[11px] font-mono bg-cc-black border border-cc-border rounded px-2 py-1.5 text-cc-text placeholder:text-cc-text-muted/50 outline-none focus:border-cc-red/40 resize-vertical"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addManual}
                    disabled={!form.title || !form.company}
                    className="text-[10px] font-mono px-3 py-1.5 rounded-lg border border-cc-red/30 bg-cc-red/10 text-cc-red hover:bg-cc-red/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Add to Pipeline
                  </button>
                  <button
                    onClick={() => setShowAdd(false)}
                    className="text-[10px] font-mono px-3 py-1.5 rounded-lg border border-cc-border text-cc-text-muted hover:text-cc-text transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {['all', 'saved', 'applied', 'interview', 'offer', 'pass'].map((f) => (
                <button
                  key={f}
                  onClick={() => setPFilter(f)}
                  className={`text-[9px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider transition-all ${
                    pFilter === f
                      ? 'bg-cc-red/15 text-cc-red border border-cc-red/30'
                      : 'text-cc-text-muted border border-cc-border/50 hover:border-cc-border'
                  }`}
                >
                  {f} ({counts[f]})
                </button>
              ))}
            </div>

            {/* Pipeline list */}
            {pipeline.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[11px] text-cc-text-muted font-mono">No roles yet. Add from Latest Search or manually.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((job) => (
                  <PipelineCard
                    key={job.id}
                    job={job}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    setPipelineStatus={setPipelineStatus}
                    removeFromPipeline={removeFromPipeline}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
