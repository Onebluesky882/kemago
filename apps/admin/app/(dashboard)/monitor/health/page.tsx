'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAgentStats } from '@/hooks/use-agent-stats'
import { StatCard } from '@/components/dashboard/stat-card'
import { TrendChart } from '@/components/monitor/trend-chart'
import { Meter } from '@/components/monitor/meter'
import { RangeToggle } from '@/components/monitor/range-toggle'
import { chrome } from '@/components/monitor/colors'

const panelStyle = {
  background: chrome.surface,
  border: `1px solid ${chrome.gridline}`,
  borderRadius: '8px',
  padding: '20px',
}

const sectionTitleStyle = { fontSize: '15px', fontWeight: 600, margin: '0 0 16px', color: chrome.ink }

export default function HealthMonitorPage() {
  const router = useRouter()
  const [days, setDays] = useState(30)
  const { daily, totals, isLoading } = useAgentStats(days)

  const latencyTrend = daily.map((d) => ({ day: d.day, value: d.avgLatencyMs }))
  const runsTrend = daily.map((d) => ({ day: d.day, value: d.totalRuns }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: chrome.inkMuted, fontSize: '14px', padding: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: chrome.ink }}>Health</h1>
        <div style={{ marginLeft: 'auto' }}>
          <RangeToggle value={days} onChange={setDays} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          label="Success rate"
          value={isLoading ? '…' : `${Math.round(totals.successRate * 100)}%`}
          status={isLoading ? undefined : totals.successRate >= 0.95 ? 'ok' : 'error'}
        />
        <StatCard label="Avg latency" value={isLoading ? '…' : `${Math.round(totals.avgLatencyMs).toLocaleString()} ms`} trend={daily.map((d) => d.avgLatencyMs)} />
        <StatCard label="Total runs" value={isLoading ? '…' : totals.totalRuns.toLocaleString()} trend={daily.map((d) => d.totalRuns)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Latency trend</h2>
          <TrendChart data={latencyTrend} formatValue={(n) => `${Math.round(n)} ms`} />
        </div>
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ ...sectionTitleStyle, alignSelf: 'flex-start' }}>Success rate</h2>
          <Meter value={totals.successRate} label={`${totals.totalRuns} runs`} />
        </div>
      </div>

      <div style={panelStyle}>
        <h2 style={sectionTitleStyle}>Runs per day</h2>
        <TrendChart data={runsTrend} formatValue={(n) => `${Math.round(n)} runs`} />
      </div>
    </div>
  )
}
