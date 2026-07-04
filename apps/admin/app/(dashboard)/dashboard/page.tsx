'use client'
import { useState } from 'react'
import { useDashboard } from '@/hooks/use-dashboard'
import { useAgentStats } from '@/hooks/use-agent-stats'
import { useAgentLogs } from '@/hooks/use-agent-logs'
import { StatCard } from '@/components/dashboard/stat-card'
import { TrendChart } from '@/components/monitor/trend-chart'
import { SegmentedBar } from '@/components/monitor/segmented-bar'
import { Meter } from '@/components/monitor/meter'
import { ActivityList } from '@/components/monitor/activity-list'
import { RangeToggle } from '@/components/monitor/range-toggle'
import { chrome, status } from '@/components/monitor/colors'

const panelStyle = {
  background: chrome.surface,
  border: `1px solid ${chrome.gridline}`,
  borderRadius: '8px',
  padding: '20px',
}

const sectionTitleStyle = { fontSize: '15px', fontWeight: 600, margin: '0 0 16px', color: chrome.ink }

export default function DashboardPage() {
  const [days, setDays] = useState(30)
  const { apiStatus, currentUser, isLoading: dashboardLoading } = useDashboard()
  const { daily, totals, isLoading: statsLoading } = useAgentStats(days)
  const { logs, isLoading: logsLoading } = useAgentLogs()

  const costTrend = daily.map((d) => ({ day: d.day, value: d.costUsd }))

  const recentActivity = logs.slice(0, 8).map((log) => ({
    id: log.id,
    title: log.status === 'error' ? (log.error_message ?? 'Run failed') : (log.output_preview ?? 'Agent run'),
    subtitle: new Date(log.created_at).toLocaleString(),
    amount: `$${log.cost_usd.toFixed(4)}`,
    ok: log.status !== 'error',
  }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: chrome.ink }}>Dashboard</h1>
        <RangeToggle value={days} onChange={setDays} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
        <StatCard
          label="API Status"
          value={dashboardLoading ? '…' : apiStatus === 'ok' ? 'Online' : 'Offline'}
          status={dashboardLoading ? undefined : apiStatus}
        />
        <StatCard label="Logged in as" value={dashboardLoading ? '…' : (currentUser?.email ?? 'Unknown')} />
        <StatCard label="Storage" value="R2 Connected" status="ok" />
        <StatCard label="Database" value="D1 Connected" status="ok" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          label="Total cost"
          value={statsLoading ? '…' : `$${totals.costUsd.toFixed(2)}`}
          trend={daily.map((d) => d.costUsd)}
        />
        <StatCard
          label="Total runs"
          value={statsLoading ? '…' : totals.totalRuns.toLocaleString()}
          trend={daily.map((d) => d.totalRuns)}
        />
        <StatCard
          label="Success rate"
          value={statsLoading ? '…' : `${Math.round(totals.successRate * 100)}%`}
          status={statsLoading ? undefined : totals.successRate >= 0.95 ? 'ok' : 'error'}
        />
        <StatCard
          label="Avg latency"
          value={statsLoading ? '…' : `${Math.round(totals.avgLatencyMs).toLocaleString()} ms`}
          trend={daily.map((d) => d.avgLatencyMs)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Cost trend</h2>
          <TrendChart data={costTrend} formatValue={(n) => `$${n.toFixed(4)}`} />
        </div>
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ ...sectionTitleStyle, alignSelf: 'flex-start' }}>Success rate</h2>
          <Meter value={totals.successRate} label={`${totals.totalRuns} runs`} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Runs breakdown</h2>
          <SegmentedBar
            segments={[
              { label: 'Success', value: totals.totalRuns - totals.errorCount, color: status.good },
              { label: 'Error', value: totals.errorCount, color: status.critical },
            ]}
          />
        </div>
        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Recent activity</h2>
          {logsLoading ? (
            <p style={{ color: chrome.inkMuted, fontSize: '14px' }}>Loading...</p>
          ) : (
            <ActivityList items={recentActivity} />
          )}
        </div>
      </div>
    </div>
  )
}
