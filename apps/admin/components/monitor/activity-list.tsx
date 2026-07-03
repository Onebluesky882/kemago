import { chrome, status } from './colors'

type ActivityItem = {
  id: string
  title: string
  subtitle: string
  amount: string
  ok: boolean
}

type ActivityListProps = {
  items: ActivityItem[]
}

export function ActivityList({ items }: ActivityListProps) {
  if (items.length === 0) {
    return <div style={{ color: chrome.inkMuted, fontSize: '14px' }}>No runs yet.</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 0',
            borderBottom: `1px solid ${chrome.gridline}`,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: item.ok ? status.good : status.critical,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', color: chrome.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
            </div>
            <div style={{ fontSize: '12px', color: chrome.inkMuted }}>{item.subtitle}</div>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: chrome.ink, whiteSpace: 'nowrap' }}>{item.amount}</div>
        </div>
      ))}
    </div>
  )
}
