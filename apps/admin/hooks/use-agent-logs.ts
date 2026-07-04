'use client'
import { useEffect, useState } from 'react'
import { useApi } from './use-api'

export type AgentLog = {
  id: string
  correlation_id: string
  session_id: string | null
  agent_id: string | null
  output_preview: string | null
  tool_calls: string[]
  tokens_input: number
  tokens_output: number
  cost_usd: number
  latency_ms: number
  status: string
  error_message: string | null
  created_at: number
}

export function useAgentLogs() {
  const { apiFetch } = useApi()
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    apiFetch('/api/agent/logs')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return
        setLogs(data?.logs ?? [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { logs, isLoading }
}
