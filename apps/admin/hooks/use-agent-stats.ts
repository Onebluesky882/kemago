'use client'
import { useEffect, useState } from 'react'
import { useApi } from './use-api'

export type DailyStat = {
  day: string
  costUsd: number
  tokensInput: number
  tokensOutput: number
  totalRuns: number
  errorCount: number
  avgLatencyMs: number
}

export type StatsTotals = {
  costUsd: number
  tokensInput: number
  tokensOutput: number
  totalRuns: number
  errorCount: number
  successRate: number
  avgLatencyMs: number
}

const EMPTY_TOTALS: StatsTotals = {
  costUsd: 0,
  tokensInput: 0,
  tokensOutput: 0,
  totalRuns: 0,
  errorCount: 0,
  successRate: 1,
  avgLatencyMs: 0,
}

export function useAgentStats(days: number) {
  const { apiFetch } = useApi()
  const [daily, setDaily] = useState<DailyStat[]>([])
  const [totals, setTotals] = useState<StatsTotals>(EMPTY_TOTALS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    apiFetch(`/api/agent/stats?days=${days}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        setDaily(data.daily ?? [])
        setTotals(data.totals ?? EMPTY_TOTALS)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  return { daily, totals, isLoading }
}
