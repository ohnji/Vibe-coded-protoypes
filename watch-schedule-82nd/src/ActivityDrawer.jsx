import { useState } from 'react'
import { Icon } from '@blueprintjs/core'
import { AgentAvatar } from './icons'
import InspectWorkflow from './InspectWorkflow'
import { SESSIONS, STATUS_SECTIONS } from './sessions'

const TAG_FOR_STATUS = {
  attention: { text: 'Needs review', tagClass: 'warn' },
  completed: { text: 'Completed', tagClass: 'ok' },
  scheduled: { text: 'Scheduled', tagClass: 'neutral' },
}

export default function ActivityDrawer({ open, view, onViewChange, tab = 'monitoring', onTabChange, inspectTarget, height = 360, onResize, onOpenSession, onClose, toast }) {
  const isInspect = tab === 'inspect'
  const [resizing, setResizing] = useState(false)

  const startResize = (e) => {
    e.preventDefault()
    const startY = e.clientY
    const startH = height
    setResizing(true)
    const onMove = (ev) => {
      const next = startH + (startY - ev.clientY)
      onResize?.(Math.max(180, Math.min(next, window.innerHeight * 0.85)))
    }
    const onUp = () => {
      setResizing(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      className={`wa-activity-drawer ${open ? 'is-open' : ''} ${isInspect ? 'is-inspect' : ''} ${resizing ? 'is-resizing' : ''}`}
      style={{ height: open ? height : 0 }}
    >
      {open && (
        <div
          className="wa-drawer-resize"
          onMouseDown={startResize}
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize panel"
        />
      )}
      <div className="wa-activity-drawer-tabs">
        <div className="wa-activity-drawer-tabs-left">
          <button
            type="button"
            className={`wa-activity-drawer-tab ${!isInspect ? 'active' : ''}`}
            onClick={() => onTabChange?.('monitoring')}
          >
            Monitoring
            {!isInspect && <span className="wa-activity-drawer-tab-indicator" />}
          </button>
          <button
            type="button"
            className={`wa-activity-drawer-tab ${isInspect ? 'active' : ''}`}
            onClick={() => onTabChange?.('inspect')}
          >
            Inspect workflow
            {isInspect && <span className="wa-activity-drawer-tab-indicator" />}
          </button>
        </div>
        <div className="wa-activity-drawer-tools">
          <button type="button" className="wa-activity-drawer-icon-btn" aria-label="Select" onClick={() => toast('Select mode')}>
            <Icon icon="select" size={14} />
          </button>
          <button type="button" className="wa-activity-drawer-icon-btn" aria-label="Add" onClick={() => toast('New activity')}>
            <Icon icon="plus" size={14} />
          </button>
          <span className="wa-activity-drawer-divider" />
          <button
            type="button"
            className="wa-activity-drawer-icon-btn"
            aria-label="Expand"
            onClick={() => toast('Full screen is not available in this prototype')}
          >
            <Icon icon="maximize" size={14} />
          </button>
          <button type="button" className="wa-activity-drawer-icon-btn" aria-label="Close" onClick={onClose}>
            <Icon icon="cross" size={14} />
          </button>
        </div>
      </div>

      {isInspect ? (
        <div className="wa-activity-drawer-filters">
          <div className="wa-inspect-breadcrumb">
            <Icon icon="cube" size={12} />
            <span>{inspectTarget?.id || 'WS-0031'}</span>
            <Icon icon="chevron-right" size={12} className="wa-inspect-crumb-sep" />
            <span className="wa-inspect-crumb-kind">{inspectTarget?.kind || 'RELIEF CHECKLIST'}</span>
            <span className="wa-inspect-crumb-tag">Lineage</span>
          </div>
          <button
            type="button"
            className="wa-activity-drawer-icon-btn"
            aria-label="Fit to view"
            onClick={() => toast('Zoom controls are not available in this prototype')}
          >
            <Icon icon="zoom-to-fit" size={14} />
          </button>
        </div>
      ) : (
      <div className="wa-activity-drawer-filters">
        <div className="wa-activity-drawer-pills">
          <button
            type="button"
            className={`wa-activity-drawer-pill ${view === 'status' ? 'active' : ''}`}
            onClick={() => onViewChange('status')}
          >
            By status
          </button>
          <button
            type="button"
            className={`wa-activity-drawer-pill ${view === 'agent' ? 'active' : ''}`}
            onClick={() => onViewChange('agent')}
          >
            By agent
          </button>
        </div>
        <button
          type="button"
          className="wa-activity-drawer-icon-btn"
          aria-label="Filter"
          onClick={() => toast('Filters are not available in this prototype')}
        >
          <Icon icon="filter" size={14} />
        </button>
      </div>
      )}

      <div className="wa-activity-drawer-body">
        {isInspect ? (
          <InspectWorkflow target={inspectTarget} toast={toast} />
        ) : view === 'status' ? (
          <div className="wa-activity-columns">
            {STATUS_SECTIONS.map((col) => {
              let items = SESSIONS.filter(col.filter)
              if (col.sort) items = [...items].sort(col.sort)
              return (
                <div className="wa-activity-col" key={col.id}>
                  <div className="wa-activity-col-head">{col.label.toUpperCase()}</div>
                  {items.map((s) => {
                    const tag = TAG_FOR_STATUS[s.status]
                    return (
                      <button
                        type="button"
                        key={s.id}
                        className={`wa-activity-card ${s.status === 'working' ? 'is-live wa-skeleton-border' : ''} ${s.status === 'attention' ? 'is-attention' : ''} ${s.status === 'scheduled' ? 'is-scheduled' : ''}`}
                        onClick={() => onOpenSession?.(s)}
                      >
                        <span className="wa-activity-card-icon">
                          <AgentAvatar name={s.agent} size={18} />
                        </span>
                        <span className="wa-activity-card-body">
                          <span className="wa-activity-card-title">{s.title}</span>
                          <span className="wa-activity-card-meta">{s.meta}</span>
                        </span>
                        {tag && <span className={`wa-activity-card-tag ${tag.tagClass}`}>{tag.text}</span>}
                        <Icon icon="caret-right" size={14} className="wa-activity-card-caret" />
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="wa-activity-rows">
            {SESSIONS.map((s) => {
              const pending = s.status === 'attention'
              return (
                <div className={`wa-activity-row ${pending ? 'is-pending' : ''}`} key={s.id}>
                  <span className={`wa-activity-row-dot ${s.status === 'working' || pending ? 'is-pulsing' : ''}`} />
                  <span className="wa-activity-row-main">
                    <span className="wa-activity-row-agent">
                      <AgentAvatar name={s.agent} size={13} />
                      {s.agent}
                    </span>
                    <span className="wa-activity-row-text">{s.title}</span>
                    <span className="wa-activity-row-meta">{s.meta}</span>
                  </span>
                  <span className="wa-activity-row-actions">
                    {pending && (
                      <button type="button" className="wa-activity-approve" onClick={() => toast('Approved')}>
                        Approve
                      </button>
                    )}
                    <button type="button" className="wa-activity-view" onClick={() => onOpenSession?.(s)}>
                      View
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
