'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAgentStats } from '@/hooks/use-agent-stats'
import { StatCard } from '@/components/dashboard/stat-card'
import { TrendChart } from '@/components/monitor/trend-chart'
import { SegmentedBar } from '@/components/monitor/segmented-bar'
import { RangeToggle } from '@/components/monitor/range-toggle'
import { chrome, sequential } from '@/components/monitor/colors'

const panelStyle = {
  background: chrome.surface,
  border: `1px solid ${chrome.gridline}`,
  borderRadius: '8px',
  padding: '20px',
}

const sectionTitleStyle = { fontSize: '15px', fontWeight: 600, margin: '0 0 16px', color: chrome.ink }

export default function CostMonitorPage() {
  const router = useRouter()
  const [days, setDays] = useState(30)
  const { daily, totals, isLoading } = useAgentStats(days)

  const costTrend = daily.map((d) => ({ day: d.day, value: d.costUsd }))
  const avgCostPerRun = totals.totalRuns > 0 ? totals.costUsd / totals.totalRuns : 0

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
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: chrome.ink }}>Cost</h1>
        <div style={{ marginLeft: 'auto' }}>
          <RangeToggle value={days} onChange={setDays} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total cost" value={isLoading ? '…' : `$${totals.costUsd.toFixed(4)}`} trend={daily.map((d) => d.costUsd)} />
        <StatCard label="Avg cost / run" value={isLoading ? '…' : `$${avgCostPerRun.toFixed(4)}`} />
        <StatCard label="Total runs" value={isLoading ? '…' : totals.totalRuns.toLocaleString()} />
      </div>

      <div style={{ ...panelStyle, marginBottom: '24px' }}>
        <h2 style={sectionTitleStyle}>Cost trend</h2>
        <TrendChart data={costTrend} formatValue={(n) => `$${n.toFixed(4)}`} height={260} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Token usage</h2>
          <SegmentedBar
            segments={[
              { label: 'Input tokens', value: totals.tokensInput, color: sequential[400] },
              { label: 'Output tokens', value: totals.tokensOutput, color: chrome.accent },
            ]}
          />
        </div>
        <div style={{ ...panelStyle, overflowX: 'auto' }}>
          <h2 style={sectionTitleStyle}>Daily breakdown</h2>
          {isLoading ? (
            <p style={{ color: chrome.inkMuted, fontSize: '14px' }}>Loading...</p>
          ) : daily.length === 0 ? (
            <p style={{ color: chrome.inkMuted, fontSize: '14px' }}>No data in this range yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  {['Day', 'Runs', 'Cost'].map((h) => (
                    <th key={h} style={{ padding: '8px 10px', fontWeight: 600, color: chrome.inkMuted, borderBottom: `1px solid ${chrome.gridline}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...daily].reverse().map((d) => (
                  <tr key={d.day} style={{ borderBottom: `1px solid ${chrome.gridline}` }}>
                    <td style={{ padding: '8px 10px', color: chrome.inkSecondary }}>{d.day}</td>
                    <td style={{ padding: '8px 10px', color: chrome.ink }}>{d.totalRuns}</td>
                    <td style={{ padding: '8px 10px', color: chrome.ink }}>${d.costUsd.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
