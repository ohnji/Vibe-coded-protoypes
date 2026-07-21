import { useState } from 'react'
import { Button, Icon, Tag } from '@blueprintjs/core'
import SatelliteMap from './SatelliteMap'
import { DottedCircleIcon } from './icons'

// The embedded-app menu bar that sits on top of the map, matching the mock:
// document name + favorite + status pills, then a File/Edit/View… menu row.
function MapControlBar({ toast }) {
  return (
    <div className="tp-mapbar">
      <div className="tp-mapbar-file">
        <Icon icon="document" size={14} className="tp-mapbar-doc" />
        <span className="tp-mapbar-name">Map 1</span>
        <button type="button" className="tp-mapbar-icon" onClick={() => toast('Favorited Map 1')} aria-label="Favorite">
          <Icon icon="star-empty" size={13} />
        </button>
        <button type="button" className="tp-mapbar-icon" onClick={() => toast('Map options')} aria-label="Options">
          <Icon icon="caret-down" size={13} />
        </button>
      </div>
      <span className="tp-mapbar-divider" />
      <div className="tp-mapbar-status">
        <button type="button" className="tp-mapbar-icon" onClick={() => toast('Permissions')} aria-label="Permissions">
          <Icon icon="shield" size={13} />
        </button>
        <Icon icon="small-tick" size={13} className="tp-mapbar-check" />
        <span className="tp-mapbar-pill">
          <span className="tp-mapbar-dot ok" />1
          <Icon icon="warning-sign" size={11} className="tp-mapbar-warn" />1
        </span>
      </div>
      <span className="tp-mapbar-divider" />
      <div className="tp-mapbar-menu">
        {['File', 'Edit', 'View', 'Insert', 'Map', 'Tools', 'Help'].map((m) => (
          <button type="button" key={m} className="tp-mapbar-menu-item" onClick={() => toast(`${m} menu is not available in this prototype`)}>
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepMeta({ meta }) {
  // "Checklist agent · Agent · 1m ago" → label + [Agent pill] + time
  const parts = meta.split(' · ')
  return (
    <span className="tp-process-meta">
      {parts.map((p, i) =>
        p === 'Agent' ? (
          <span className="tp-agent-pill" key={i}>Agent</span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  )
}

// Build a chat-session object from a process step: walk the agent-driven steps
// up to (and including) the one being opened, so the session's handoff chain /
// workflow tree mirrors how the task moved between agents inside this touchpoint.
function buildStepSession(touchpoint, step) {
  const agentSteps = touchpoint.process.filter((s) => s.meta && s.meta.includes(' · Agent · '))
  const idx = agentSteps.findIndex((s) => s.id === step.id)
  const chainSteps = idx >= 0 ? agentSteps.slice(0, idx + 1) : [step]
  const agentOf = (s) => s.meta.split(' · ')[0]
  const steps = {}
  chainSteps.forEach((s) => { steps[agentOf(s)] = s.title })
  return {
    id: `${touchpoint.id}-${step.id}`,
    agent: agentOf(step),
    title: step.title,
    status: 'attention',
    meta: step.meta.split(' · ').pop(),
    object: touchpoint.tabTitle,
    objectKind: 'TOUCHPOINT',
    handoff: chainSteps.map(agentOf),
    steps,
  }
}

function ProcessStep({ step, touchpoint, onOpenSession, toast }) {
  const [open, setOpen] = useState(!!step.defaultOpen)
  const hasDetail = !!step.detail

  return (
    <div className={`tp-process-step ${open && hasDetail ? 'expanded' : ''}`}>
      {step.badge && <span className="tp-process-badge">{step.badge}</span>}
      <button
        type="button"
        className="tp-process-card"
        onClick={() => (hasDetail ? setOpen((o) => !o) : toast(`Opening "${step.title}"`))}
      >
        <div className="tp-process-head">
          <span className="tp-process-title">
            {step.link ? (
              <>
                {step.title.split(step.link)[0]}
                <span className="tp-process-link">{step.link}</span>
                {step.title.split(step.link)[1]}
              </>
            ) : (
              step.title
            )}
          </span>
          <StepMeta meta={step.meta} />
        </div>
        <Icon icon="chevron-down" size={15} className={`tp-process-caret ${open && hasDetail ? 'flip' : ''}`} />
      </button>

      {hasDetail && open && (
        <div className="tp-detail">
          <p className="tp-detail-summary">{step.detail.summary}</p>
          {step.detail.aiGenerated && <span className="tp-detail-ai">This summary was AI generated</span>}

          <div className="tp-detail-records">
            <div className="tp-detail-records-head">{step.detail.recordsLabel}</div>
            {step.detail.records.map((r, i) => (
              <button type="button" className="tp-detail-record" key={i} onClick={() => toast(`Opening ${r.name}`)}>
                <Icon icon={r.icon} size={14} className="tp-detail-record-icon" />
                <span className="tp-detail-record-name">{r.name}</span>
                <span className="tp-detail-record-kind">{r.kind}</span>
              </button>
            ))}
          </div>

          <div className="tp-detail-feedback">
            <span>Was this accurate?</span>
            <button type="button" onClick={() => toast('Thanks for the feedback')} aria-label="Accurate">
              <Icon icon="thumbs-up" size={13} />
            </button>
            <button type="button" onClick={() => toast('Thanks for the feedback')} aria-label="Not accurate">
              <Icon icon="thumbs-down" size={13} />
            </button>
          </div>

          <div className="tp-detail-actions">
            <Button minimal small icon="chat" onClick={() => onOpenSession?.(buildStepSession(touchpoint, step))}>Open agent session</Button>
            <Button minimal small onClick={() => toast('Viewing sources')}>View sources</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TouchpointView({ touchpoint, onOpenSession, toast, isApproved, onApprove }) {
  const [processTab, setProcessTab] = useState('process')
  if (!touchpoint) return null

  return (
    <section className="tp-view">
      <div className="tp-view-head">
        <div className="tp-view-title-row">
          <DottedCircleIcon size={18} />
          <h2>{touchpoint.title}</h2>
          {isApproved && (
            <Tag intent="success" icon="tick" minimal style={{ marginLeft: '12px' }}>
              Approved by Chris 1m ago
            </Tag>
          )}
        </div>
        <div className="tp-view-actions">
          <Button minimal small icon="more" onClick={() => toast('More actions')} aria-label="More" />
          <Button small onClick={() => toast('Rejected')}>Reject</Button>
          <Button
            small
            intent="success"
            icon="tick"
            disabled={isApproved}
            onClick={() => {
              if (!isApproved) {
                onApprove?.(touchpoint.id)
              }
            }}
          >
            {isApproved ? 'Approved' : 'Approve'}
          </Button>
        </div>
      </div>
      <div className="tp-view-meta">
        {touchpoint.agentName} · Paused {touchpoint.pausedAgo} · Triggered by {touchpoint.triggeredBy}
      </div>

      <div className="tp-view-body">
        <div className="tp-view-main">
          {touchpoint.map ? (
            <>
              <MapControlBar toast={toast} />
              <div className="tp-view-map">
                <SatelliteMap pins={touchpoint.map.pins} inset={touchpoint.map.inset} />
              </div>
            </>
          ) : touchpoint.content?.type === 'log' ? (
            <div className="tp-view-log">
              <div className="tp-log-header">
                <h3>Turnover Log Entries</h3>
              </div>
              <table className="tp-log-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Post/Area</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {touchpoint.content.entries.map((entry, i) => (
                    <tr key={i} className={`tp-log-entry tp-log-${entry.type.toLowerCase()}`}>
                      <td className="tp-log-time">{entry.time}</td>
                      <td className="tp-log-type">
                        <span className="tp-log-badge">{entry.type}</span>
                      </td>
                      <td className="tp-log-post">{entry.post}</td>
                      <td className="tp-log-note">{entry.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="tp-view-placeholder">
              <p>{touchpoint.previewNote}</p>
            </div>
          )}
        </div>

        <div className="tp-view-side">
          <div className="tp-side-tabs">
            <button
              type="button"
              className={`tp-side-tab ${processTab === 'process' ? 'active' : ''}`}
              onClick={() => setProcessTab('process')}
            >
              Process
            </button>
            <button
              type="button"
              className={`tp-side-tab ${processTab === 'files' ? 'active' : ''}`}
              onClick={() => setProcessTab('files')}
            >
              Files referenced
            </button>
            <button type="button" className="tp-icon-btn wa-push-right" onClick={() => toast('Collapse process panel')} aria-label="Collapse">
              <Icon icon="menu" size={13} />
            </button>
          </div>

          {processTab === 'process' ? (
            <div className="tp-process">
              {touchpoint.process.map((step, i) =>
                step.group ? (
                  <div className="tp-process-group" key={i}>
                    <span className="tp-process-group-tag">{step.group} <Icon icon="small-cross" size={11} /></span>
                  </div>
                ) : (
                  <ProcessStep step={step} touchpoint={touchpoint} onOpenSession={onOpenSession} key={step.id || i} toast={toast} />
                )
              )}
            </div>
          ) : (
            <div className="tp-process-empty">No files referenced yet.</div>
          )}
        </div>
      </div>
    </section>
  )
}
