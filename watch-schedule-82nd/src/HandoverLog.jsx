import { Button, ContextMenu, Icon, Menu, MenuDivider, MenuItem, Tag } from '@blueprintjs/core'

const STATS = [
  { label: 'Handovers this week', value: '14', icon: 'exchange' },
  { label: 'Pending sign-off', value: '3', icon: 'warning-sign', tone: 'warn' },
  { label: 'Avg. handover time', value: '7m', icon: 'time' },
  { label: 'Flagged delays', value: '1', icon: 'flag', tone: 'danger' },
]

const ENTRIES = [
  {
    id: 'WS-0071',
    block: '0000–0400',
    date: 'Jun 1',
    outgoing: 'Cpl. Reyes',
    incoming: 'Sgt. Okafor',
    time: '00:04',
    status: 'Completed',
    note: 'Relief checklist signed, no incidents.',
  },
  {
    id: 'WS-0047',
    block: '0400–0800',
    date: 'Jun 1',
    outgoing: 'Sgt. Okafor',
    incoming: 'SSgt. Diallo',
    time: '04:06',
    status: 'Flagged',
    note: 'Handover exceeded the standard window by 12 minutes.',
  },
  {
    id: 'WS-0058',
    block: '0800–1200',
    date: 'Jun 1',
    outgoing: 'SSgt. Diallo',
    incoming: 'Cpl. Martinez',
    time: '08:02',
    status: 'Completed',
    note: 'Coverage gap from prior shift noted and closed.',
  },
  {
    id: 'WS-0036',
    block: '1200–1600',
    date: 'Jun 1',
    outgoing: 'Cpl. Martinez',
    incoming: 'Sgt. Whitfield',
    time: '12:05',
    status: 'Completed',
    note: 'Equipment check completed, one item flagged for maintenance.',
  },
  {
    id: 'WS-0031',
    block: '1600–2000',
    date: 'Jun 1',
    outgoing: 'Sgt. Whitfield',
    incoming: 'Cpl. Reyes',
    time: '16:03',
    status: 'Pending',
    note: 'Relief checklist complete, awaiting OOD sign-off.',
  },
  {
    id: 'WS-0082',
    block: '2000–0000',
    date: 'Jun 1',
    outgoing: 'Cpl. Reyes',
    incoming: 'Sgt. Okafor',
    time: '—',
    status: 'Scheduled',
    note: '—',
  },
]

const STATUS_STYLE = {
  Completed: { intent: 'ok', icon: 'tick-circle' },
  Flagged: { intent: 'danger', icon: 'warning-sign' },
  Pending: { intent: 'info', icon: 'time' },
  Scheduled: { intent: 'neutral', icon: 'calendar' },
}

function rowMenu(entry, toast, onInspect, onAskOpen, rowKey) {
  const target = { id: entry.id, kind: 'HANDOVER LOG', label: `Shift block ${entry.block}` }
  return (
    <Menu>
      <MenuItem text="Ask workspace agent" icon="chat" onClick={() => onAskOpen(rowKey, target)} />
      <MenuItem text="Inspect" icon="search" onClick={() => onInspect?.(target)} />
      <MenuDivider />
      <MenuItem text="Open in Gaia" icon="globe" onClick={() => toast(`Opening in Gaia ${entry.id}`)} />
      <MenuItem text="Copy link" icon="link" onClick={() => toast(`Link copied for ${entry.id}`)} />
      <MenuItem text="Share with…" icon="share" onClick={() => toast(`Sharing ${entry.id}`)} />
    </Menu>
  )
}

export default function HandoverLog({ toast, onInspect, askTarget, onAskOpen }) {
  return (
    <section className="hl-dashboard">
      <div className="hl-head">
        <div>
          <h2>Handover Log</h2>
          <span className="hl-subtitle">WATCH//82ND &middot; June 1 update</span>
        </div>
        <div className="hl-head-actions">
          <Button minimal small icon="filter" onClick={() => toast('Filters are not available in this prototype')}>Filter</Button>
          <Button minimal small icon="search" onClick={() => toast('Search is not available in this prototype')}>Search</Button>
          <Button small intent="primary" icon="plus" onClick={() => toast('New handover entry')}>New entry</Button>
        </div>
      </div>

      <div className="hl-stats">
        {STATS.map((s) => (
          <div className="hl-stat" key={s.label}>
            <Icon icon={s.icon} className={`hl-stat-icon ${s.tone || ''}`} />
            <div className="hl-stat-body">
              <span className="hl-stat-value">{s.value}</span>
              <span className="hl-stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hl-table">
        <div className="hl-row hl-row-head">
          <span className="hl-col-block">Shift block</span>
          <span className="hl-col-officer">Outgoing</span>
          <span className="hl-col-officer">Incoming</span>
          <span className="hl-col-time">Handover</span>
          <span className="hl-col-status">Status</span>
          <span className="hl-col-note">Notes</span>
        </div>
        {ENTRIES.map((e) => {
          const style = STATUS_STYLE[e.status]
          const rowKey = `hl-${e.id}`
          const isSelected = askTarget?.key === rowKey
          return (
            <ContextMenu key={e.id} content={rowMenu(e, toast, onInspect, onAskOpen, rowKey)}>
              <button
                type="button"
                className={`hl-row ${isSelected ? 'is-ask-selected' : ''}`}
                onClick={() => toast(`Opening ${e.id} handover record`)}
              >
                <span className="hl-col-block">
                  <span className="hl-block-time">{e.block}</span>
                  <span className="hl-block-date">{e.date}</span>
                </span>
                <span className="hl-col-officer">{e.outgoing}</span>
                <span className="hl-col-officer">{e.incoming}</span>
                <span className="hl-col-time">{e.time}</span>
                <span className="hl-col-status">
                  <Tag minimal round intent={style.intent === 'ok' ? 'success' : style.intent === 'danger' ? 'danger' : undefined} className={`hl-status hl-status-${style.intent}`}>
                    <Icon icon={style.icon} size={11} />
                    {e.status}
                  </Tag>
                </span>
                <span className="hl-col-note">{e.note}</span>
              </button>
            </ContextMenu>
          )
        })}
      </div>
    </section>
  )
}
