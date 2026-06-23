'use client'
import { useRouter } from 'next/navigation'
import { useAgent } from '@/hooks/use-agent'
import { RepoSetup } from '@/components/agent/repo-setup'
import { ChatWindow } from '@/components/agent/chat-window'
import { DeployResult } from '@/components/agent/deploy-result'

export default function AgentPage() {
  const router = useRouter()
  const {
    isSetup,
    isSettingUp,
    isRestoring,
    sessionId,
    messages,
    isStreaming,
    currentTool,
    error,
    deployStatus,
    siteUrl,
    setupAgent,
    sendMessage,
    clearSession,
  } = useAgent()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            fontSize: '14px',
            padding: '4px 0',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
          AI Agent
        </h1>
      </div>

      {/* Content */}
      {isRestoring ? (
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Restoring session...</p>
      ) : !isSetup ? (
        <RepoSetup
          onSetup={setupAgent}
          isLoading={isSettingUp}
          error={error}
        />
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            overflow: 'hidden',
          }}
        >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button
              onClick={clearSession}
              disabled={isStreaming}
              style={{
                fontSize: '12px',
                color: '#94a3b8',
                background: 'none',
                border: 'none',
                cursor: isStreaming ? 'not-allowed' : 'pointer',
                padding: 0,
              }}
            >
              Change repository
            </button>
          </div>
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            currentTool={currentTool}
            error={error}
            sessionId={sessionId ?? ''}
            onSend={sendMessage}
          />
          <DeployResult status={deployStatus} siteUrl={siteUrl} />
        </div>
      )}
    </div>
  )
}
