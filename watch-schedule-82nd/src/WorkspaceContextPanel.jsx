import { useState } from 'react'
import { Icon } from '@blueprintjs/core'
import { SparkleIcon } from './icons'

const FILTERS = ['All', 'Ontology', 'Workflows', 'Files']

const WORKSPACE_DEFAULT = [
  { label: 'Watch COP', icon: 'globe-network', color: '#8abbff' },
  { label: 'Coverage dashboard', icon: 'dashboard', color: '#b9a7f7' },
  { label: 'Coverage board', icon: 'locate', color: '#e76a6e' },
  { label: 'Watch standers', icon: 'person', color: '#8abbff' },
  { label: 'Watch reports', icon: 'document', color: '#8abbff' },
  { label: 'Watch section org chart', icon: 'diagram-tree', color: '#e76a6e' },
  { label: 'Generate Report', icon: 'media', color: '#8abbff' },
  { label: 'Generate Report', icon: 'media', color: '#8abbff' },
]

export default function WorkspaceContextPanel({ toast }) {
  const [filter, setFilter] = useState('All')

  return (
    <div className="wa-side-panel">
      <p className="wa-panel-desc wa-panel-desc-top">
        By default, the workspace agent has access to the application and ontology contexts in
        this workspace below. You can manually add domain knowledge to the agent
      </p>

      <div className="wa-filter-row">
        <div className="wa-filter-pills">
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f}
              className={`wa-filter-pill ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button type="button" className="wa-panel-collapse" onClick={() => toast('Sort is not available in this prototype')} aria-label="Sort">
          <Icon icon="sort-desc" size={14} />
        </button>
      </div>

      <div className="wa-context-list">
        <div className="wa-context-section">
          <div className="wa-context-label">Workspace default</div>
          {WORKSPACE_DEFAULT.map((item, i) => (
            <button type="button" className="wa-context-item" key={i} onClick={() => toast(`Opening "${item.label}"`)}>
              <Icon icon={item.icon} size={14} style={{ color: item.color }} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="wa-context-section">
          <div className="wa-context-label">Created by agents</div>
          <button type="button" className="wa-context-item wa-context-item-agent" onClick={() => toast('Opening "Coverage plan 1"')}>
            <SparkleIcon color="#a3dcbe" size={14} />
            <span>Coverage plan 1</span>
            <SparkleIcon color="#b9a7f7" size={14} className="wa-push-right" />
          </button>
        </div>

        <div className="wa-context-section">
          <div className="wa-context-label">Added by user</div>
          <button type="button" className="wa-context-item" onClick={() => toast('Opening "Coverage dashboard"')}>
            <Icon icon="dashboard" size={14} style={{ color: '#b9a7f7' }} />
            <span>Coverage dashboard</span>
          </button>
        </div>
      </div>
    </div>
  )
}
