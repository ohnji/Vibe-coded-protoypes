import { AgentAvatar } from './icons'

const SECTIONS = [
  { key: 'active', label: 'Active', dotClass: 'active' },
  { key: 'attention', label: 'Needs attention', dotClass: 'attention' },
  { key: 'completed', label: 'Completed', dotClass: 'completed' },
]

export default function AgentPopover({ agent, style }) {
  if (!agent) return null
  return (
    <div className="agent-popover" style={style}>
      <div className="agent-popover-head">
        <AgentAvatar name={agent.name} size={22} />
        <span className="agent-popover-name">{agent.name}</span>
      </div>
      <p className="agent-popover-desc">{agent.description}</p>
      <div className="agent-popover-sections">
        {SECTIONS.map(({ key, label, dotClass }) => {
          const items = agent.tasks[key] || []
          return (
            <div className="agent-popover-section" key={key}>
              <div className="agent-popover-section-head">
                <span className={`agent-popover-dot ${dotClass}`} />
                <span className="agent-popover-section-label">{label}</span>
                <span className="agent-popover-section-count">{items.length}</span>
              </div>
              {items.length > 0 ? (
                <ul className="agent-popover-list">
                  {items.slice(0, 3).map((title, i) => (
                    <li key={i}>{title}</li>
                  ))}
                </ul>
              ) : (
                <p className="agent-popover-empty">Nothing here right now</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
