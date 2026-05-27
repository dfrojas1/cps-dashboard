#!/usr/bin/env node

/**
 * Obsidian <-> CPS Dashboard Sync
 *
 * Reads from:
 *   - Obsidian vault (Claude LTM files, daily notes)
 *   - Claude memory files (project_memory.md, task_queue.md)
 *
 * Writes to:
 *   - public/data/obsidian.json  (dashboard reads this on load)
 *   - Obsidian vault daily note  (dashboard state snapshot)
 *
 * Run:  node scripts/obsidian-sync.mjs
 * Or:   npm run sync  (add to package.json)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH
  || join(process.env.HOME || process.env.USERPROFILE, 'Documents', 'Obsidian Vault', "David's Vault")

const PROJECT_ROOT = resolve(import.meta.dirname, '..')
const MEMORY_ROOT = resolve(PROJECT_ROOT, '..', 'memory')
const CLAUDE_MEMORY = resolve(PROJECT_ROOT, '..', 'claude-v5-final', 'global', 'memory')
const OUTPUT_DIR = join(PROJECT_ROOT, 'public', 'data')

console.log('--- CPS Dashboard ← → Obsidian Sync ---')
console.log(`Vault: ${VAULT_PATH}`)
console.log(`Output: ${OUTPUT_DIR}`)

// ── Helpers ──

function safeRead(path) {
  try { return readFileSync(path, 'utf-8') } catch { return '' }
}

function parseSessionDates(md) {
  const re = /## Session opened: (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/g
  const sessions = []
  let match
  while ((match = re.exec(md)) !== null) {
    sessions.push({ date: match[1], time: match[2] })
  }
  return sessions
}

function parseMdTable(md, sectionTitle) {
  const lines = md.split('\n')
  let inSection = false
  const rows = []
  let headers = []
  let pastSeparator = false

  for (const line of lines) {
    if (line.includes(sectionTitle)) { inSection = true; pastSeparator = false; headers = []; continue }
    if (!inSection) continue
    if (line.startsWith('|') && line.includes('---')) { pastSeparator = true; continue }
    if (line.startsWith('|') && !pastSeparator) {
      // This is the header row
      headers = line.split('|').map(c => c.trim()).filter(Boolean)
      continue
    }
    if (pastSeparator && line.startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean)
      // Skip rows where all cells are empty
      if (cells.every(c => c === '' || c === ' ')) continue
      const row = {}
      headers.forEach((h, i) => { row[h] = cells[i] || '' })
      rows.push(row)
    }
    // Stop at next section
    if (inSection && pastSeparator && (line.startsWith('---') || (line.startsWith('#') && !line.startsWith('|')))) break
  }
  return rows
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Read Sources ──

// 1. Claude session history
const projectMemory = safeRead(join(MEMORY_ROOT, 'project_memory.md'))
  || safeRead(join(CLAUDE_MEMORY, '..', '..', 'memory', 'project_memory.md'))
const sessions = parseSessionDates(projectMemory)

// 2. LTM files from Obsidian
const persistentIndex = safeRead(join(VAULT_PATH, 'Claude LTM', 'persistent_index.md'))
const decisionHistory = safeRead(join(VAULT_PATH, 'Claude LTM', 'decision_history.md'))
const workflowSummaries = safeRead(join(VAULT_PATH, 'Claude LTM', 'workflow_summaries.md'))
const researchNotes = safeRead(join(VAULT_PATH, 'Claude LTM', 'research_notes.md'))

// 3. Task queue
const taskQueue = safeRead(join(CLAUDE_MEMORY, 'task_queue.md'))
const activeTasks = parseMdTable(taskQueue, 'Active Tasks')
const queuedTasks = parseMdTable(taskQueue, 'Queued Tasks')
const completedTasks = parseMdTable(taskQueue, 'Completed Tasks')

// 4. Session stats
const today = todayStr()
const todaySessions = sessions.filter(s => s.date === today).length
const thisWeekSessions = sessions.filter(s => {
  const d = new Date(s.date)
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(now.getDate() - 7)
  return d >= weekAgo
}).length
const totalSessions = sessions.length

// 5. Count unique session dates (active days)
const uniqueDays = [...new Set(sessions.map(s => s.date))]

// ── Build output ──

const output = {
  syncedAt: new Date().toISOString(),
  vault: VAULT_PATH,

  claudeSessions: {
    today: todaySessions,
    thisWeek: thisWeekSessions,
    total: totalSessions,
    activeDays: uniqueDays.length,
    recentSessions: sessions.slice(-20).reverse(),
  },

  taskQueue: {
    active: activeTasks,
    queued: queuedTasks,
    completed: completedTasks,
    activeCount: activeTasks.length,
    queuedCount: queuedTasks.length,
  },

  ltm: {
    hasDecisions: decisionHistory.includes('###'),
    hasWorkflows: workflowSummaries.includes('###'),
    hasResearch: researchNotes.includes('###'),
    decisionCount: (decisionHistory.match(/^### /gm) || []).length,
    workflowCount: (workflowSummaries.match(/^### /gm) || []).length,
    researchCount: (researchNotes.match(/^### /gm) || []).length,
  },

  sessionHistory: uniqueDays.map(date => ({
    date,
    count: sessions.filter(s => s.date === date).length,
  })).reverse().slice(0, 30),
}

// ── Write dashboard data ──

mkdirSync(OUTPUT_DIR, { recursive: true })
writeFileSync(join(OUTPUT_DIR, 'obsidian.json'), JSON.stringify(output, null, 2))
console.log(`\nWrote: ${join(OUTPUT_DIR, 'obsidian.json')}`)
console.log(`  Sessions: ${totalSessions} total, ${todaySessions} today, ${thisWeekSessions} this week`)
console.log(`  Tasks: ${activeTasks.length} active, ${queuedTasks.length} queued`)
console.log(`  LTM: ${output.ltm.decisionCount} decisions, ${output.ltm.workflowCount} workflows`)

// ── Write back to Obsidian daily note ──

const dailyNotePath = join(VAULT_PATH, `${today}.md`)
const existingDaily = safeRead(dailyNotePath)
const dashboardBlock = `
## Dashboard Snapshot (auto-synced)

| Metric | Value |
|--------|-------|
| Claude Sessions Today | ${todaySessions} |
| Sessions This Week | ${thisWeekSessions} |
| Total Sessions | ${totalSessions} |
| Active Tasks | ${activeTasks.length} |
| Queued Tasks | ${queuedTasks.length} |
| Synced | ${new Date().toLocaleString()} |
`

if (existingDaily.includes('## Dashboard Snapshot')) {
  // Replace existing block
  const updated = existingDaily.replace(
    /## Dashboard Snapshot[\s\S]*?(?=\n## |\n---|\Z$)/m,
    dashboardBlock.trim()
  )
  writeFileSync(dailyNotePath, updated)
} else {
  // Append
  writeFileSync(dailyNotePath, existingDaily + '\n' + dashboardBlock)
}
console.log(`  Updated Obsidian daily note: ${dailyNotePath}`)

console.log('\n--- Sync complete ---')
