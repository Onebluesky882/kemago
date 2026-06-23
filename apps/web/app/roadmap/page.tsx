import { readFileSync } from 'fs'
import { join } from 'path'
import { RoadmapClient } from './roadmap-client'

export const metadata = {
  title: 'Roadmap — Project Plan',
}

type Milestone = { id: string; name: string; goal: string; status: string }

function parseRoadmap(md: string) {
  const section = (heading: string): string => {
    const re = new RegExp(`## ${heading}[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n## |$)`)
    const match = md.match(re)
    return match ? match[1].trim() : ''
  }

  const vision = section('Project Vision')
    .replace(/^Example:\s*/m, '').replace(/^Build an AI.*$/m, '').trim() || ''

  const currentProgress = section('Current Progress')
    .replace(/<!--[\s\S]*?-->/g, '').trim()

  const nextSteps = section('Next Steps')
    .replace(/<!--[\s\S]*?-->/g, '').trim()

  // Parse milestone backlog table: | M-001 | Name | Goal | Status |
  const milestones: Milestone[] = []
  const tableSection = section('Milestone Backlog')
  const rows = tableSection.match(/^\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|$/gm) ?? []
  for (const row of rows) {
    const cols = row.split('|').map(c => c.trim()).filter(Boolean)
    if (cols.length === 4 && cols[0] !== 'ID' && !cols[0].startsWith('-')) {
      milestones.push({ id: cols[0], name: cols[1], goal: cols[2], status: cols[3] })
    }
  }

  return { vision, currentProgress, nextSteps, milestones }
}

export default function RoadmapPage() {
  // Path: apps/web → apps → goveragent-template → agentic/ROADMAP.md
  const filePath = join(process.cwd(), '..', '..', 'agentic', 'ROADMAP.md')
  let data = { vision: '', currentProgress: '', nextSteps: '', milestones: [] as Milestone[] }

  try {
    const content = readFileSync(filePath, 'utf-8')
    data = parseRoadmap(content)
  } catch {
    // File not found — show empty state
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em' }}>Project Roadmap</span>
      </div>
      <RoadmapClient data={data} />
    </div>
  )
}
