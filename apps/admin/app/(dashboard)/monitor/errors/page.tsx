'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAgentStats } from '@/hooks/use-agent-stats'
import { useAgentLogs } from '@/hooks/use-agent-logs'
import { StatCard } from '@/components/dashboard/stat-card'
import { TrendChart } from '@/components/monitor/trend-chart'
import { Meter } from '@/components/monitor/meter'
import { RangeToggle } from '@/components/monitor/range-toggle'
import { chrome, status } from '@/components/monitor/colors'

const panelStyle = {
  background: chrome.surface,
  border: `1px solid ${chrome.gridline}`,
  borderRadius: '8px',
  padding: '20px',
}

const sectionTitleStyle = { fontSize: '15px', fontWeight: 600, margin: '0 0 16px', color: chrome.ink }

export default function ErrorsMonitorPage() {
  const router = useRouter()
  const [days, setDays] = useState(30)
  const { daily, totals, isLoading } = useAgentStats(days)
  const { logs, isLoading: logsLoading } = useAgentLogs()

  const errorTrend = daily.map((d) => ({ day: d.day, value: d.errorCount }))
  const errorRate = totals.totalRuns > 0 ? totals.errorCount / totals.totalRuns : 0
  const recentErrors = logs.filter((l) => l.status === 'error').slice(0, 15)

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
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: chrome.ink }}>Errors</h1>
        <div style={{ marginLeft: 'auto' }}>
          <RangeToggle value={days} onChange={setDays} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          label="Total errors"
          value={isLoading ? '…' : totals.errorCount.toLocaleString()}
          status={isLoading ? undefined : totals.errorCount === 0 ? 'ok' : 'error'}
          trend={daily.map((d) => d.errorCount)}
        />
        <StatCard label="Error rate" value={isLoading ? '…' : `${(errorRate * 100).toFixed(1)}%`} />
        <StatCard label="Total runs" value={isLoading ? '…' : totals.totalRuns.toLocaleString()} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Errors per day</h2>
          <TrendChart data={errorTrend} formatValue={(n) => `${Math.round(n)} errors`} />
        </div>
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ ...sectionTitleStyle, alignSelf: 'flex-start' }}>Success rate</h2>
          <Meter value={1 - errorRate} label={`${totals.totalRuns} runs`} />
        </div>
      </div>

      <div style={panelStyle}>
        <h2 style={sectionTitleStyle}>Recent errors</h2>
        {logsLoading ? (
          <p style={{ color: chrome.inkMuted, fontSize: '14px' }}>Loading...</p>
        ) : recentErrors.length === 0 ? (
          <p style={{ color: chrome.inkMuted, fontSize: '14px' }}>No errors recorded.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  {['Time', 'Latency', 'Error'].map((h) => (
                    <th key={h} style={{ padding: '8px 10px', fontWeight: 600, color: chrome.inkMuted, borderBottom: `1px solid ${chrome.gridline}`, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentErrors.map((log) => (
                  <tr key={log.id} style={{ borderBottom: `1px solid ${chrome.gridline}` }}>
                    <td style={{ padding: '8px 10px', color: chrome.inkSecondary, whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '8px 10px', color: chrome.ink, whiteSpace: 'nowrap' }}>{log.latency_ms.toLocaleString()} ms</td>
                    <td style={{ padding: '8px 10px', color: status.critical }}>{log.error_message ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
