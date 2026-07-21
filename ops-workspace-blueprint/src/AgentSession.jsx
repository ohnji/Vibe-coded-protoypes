import { useState } from 'react'
import { Icon } from '@blueprintjs/core'
import { SparkleIcon } from './icons'
import { AGENT_REASONING } from './sessions'

const GENERIC_REASONING = [
  { icon: 'manually-entered-data', label: 'Read the task instructions', detail: 'Reviewed the request and the current state of the record.' },
  { icon: 'search', label: 'Queried related records', detail: 'Pulled the records connected to this task.' },
  { icon: 'search', label: 'Analyzed the findings', detail: 'Assessed the results against the workflow criteria.' },
]

const CLOSING = {
  attention: (s) => `${s.title}. This needs your review before I can proceed — can you review and let me know how I should process?`,
  working: () => `I'm still working through this — I'll update you the moment I have a result.`,
  completed: (s) => `${s.title}. Task complete and logged for the record.`,
  scheduled: () => `This is queued — I'll start it at the scheduled time and report back.`,
}

// A single reasoning / tool-use step: a row with a leading icon, a label, and a
// chevron that expands a one-line detail — same treatment as the reference.
function ReasoningStep({ step }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="as-reason">
      <button type="button" className="as-reason-row" onClick={() => setOpen((o) => !o)}>
        <Icon icon={step.icon} size={14} className="as-reason-icon" />
        <span className="as-reason-label">{step.label}</span>
        <Icon icon="chevron-right" size={14} className={`as-reason-caret ${open ? 'flip' : ''}`} />
      </button>
      {open && <div className="as-reason-detail">{step.detail}</div>}
    </div>
  )
}

// Inline approval proposal, shown when the agent is paused for a decision.
function ProposalCard({ session, toast }) {
  return (
    <div className="as-proposal">
      <div className="as-proposal-head">
        <Icon icon="info-sign" size={14} />
        Approval needed
      </div>
      <div className="as-proposal-body">
        <div className="as-proposal-obj">
          <Icon icon="cube" size={13} />
          <span className="as-proposal-objname">{session.object}</span>
          <span className="as-proposal-objkind">{session.objectKind}</span>
        </div>
        <p>{session.proposal || session.title}</p>
      </div>
      <div className="as-proposal-actions">
        <button type="button" className="as-proposal-reject" onClick={() => toast('Rejected')}>
          <Icon icon="cross" size={13} /> Reject
        </button>
        <div className="as-proposal-approve-wrap">
          <button type="button" className="as-proposal-approve" onClick={() => toast('Approved — the agent will continue')}>
            <Icon icon="tick" size={13} /> Approve
          </button>
          <button
            type="button"
            className="as-proposal-approve-caret"
            onClick={() => toast('More approval options are not available in this prototype')}
            aria-label="More approval options"
          >
            <Icon icon="caret-down" size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AgentSession({ session, toast }) {
  const [value, setValue] = useState('')
  if (!session) return null

  // One session, one agent — the current owner of the task.
  const chain = session.handoff || [session.agent]
  const agent = chain[chain.length - 1]
  const prev = chain.length > 1 ? chain[chain.length - 2] : null
  const reasoning = AGENT_REASONING[agent] || GENERIC_REASONING
  const closing = (CLOSING[session.status] || ((s) => `${s.title}.`))(session)

  return (
    <section className="as-session">
      <div className="as-scroll">
        <div className="as-thread">
          <p className="as-narrative">
            I picked up {session.object}{prev ? `, handed over from ${prev},` : ''} and here&apos;s what I found.
          </p>

          <div className="as-reasoning">
            <div className="as-reasoning-label">
              <SparkleIcon color="#ec9a3c" size={13} />
              {agent.toUpperCase()}
            </div>
            {reasoning.map((step, i) => (
              <ReasoningStep step={step} key={i} />
            ))}
          </div>

          <p className="as-narrative">{closing}</p>

          {session.status === 'attention' && <ProposalCard session={session} toast={toast} />}
        </div>
      </div>

      <form
        className="as-input"
        onSubmit={(e) => {
          e.preventDefault()
          if (!value.trim()) return
          toast(`Sent to ${agent}: "${value.trim()}"`)
          setValue('')
        }}
      >
        <div className="as-input-box">
          <textarea
            className="as-input-textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Message ${agent}…`}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form.requestSubmit()
              }
            }}
          />
          <div className="as-input-controls">
            <div className="as-input-tools">
              <button type="button" className="as-input-tool" onClick={() => toast('Attach')} aria-label="Attach">
                <Icon icon="plus" size={15} />
              </button>
              <button type="button" className="as-input-tool" onClick={() => toast('Tools')} aria-label="Tools">
                <Icon icon="wrench" size={15} />
              </button>
            </div>
            <button type="submit" className="as-input-send" aria-label="Send">
              <Icon icon="send-message" size={16} />
            </button>
          </div>
        </div>
        <div className="as-expiry">Conversation expires after 7 days of inactivity</div>
      </form>
    </section>
  )
}
