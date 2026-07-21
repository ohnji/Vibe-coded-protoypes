import { useState } from 'react'
import { Icon } from '@blueprintjs/core'

const TABS = ['Overview', 'Workflows', 'Applications']

function RadioCard({ icon, label, selected, onClick }) {
  return (
    <button type="button" className={`wa-radio-card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <Icon icon={icon} size={14} />
      <span>{label}</span>
      <span className="wa-radio-dot" />
    </button>
  )
}

export default function WorkspaceSettingsPanel({ toast }) {
  const [subtab, setSubtab] = useState('Overview')
  const [name, setName] = useState('Watch Schedule - 82nd')
  const [description, setDescription] = useState('Watch coverage and turnover for the 82nd')
  const [visibility, setVisibility] = useState('promoted')
  const [agentMode, setAgentMode] = useState('default')

  return (
    <div className="wa-side-panel">
      <div className="wa-subtabs wa-subtabs-top">
        {TABS.map((t) => (
          <button
            type="button"
            key={t}
            className={`wa-subtab ${subtab === t ? 'active' : ''}`}
            onClick={() => setSubtab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {subtab !== 'Overview' ? (
        <div className="wa-settings-empty">{subtab} is not available in this prototype.</div>
      ) : (
        <div className="wa-settings-form">
          <label className="wa-field">
            <span className="wa-field-label">Name</span>
            <input className="wa-field-input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="wa-field">
            <span className="wa-field-label">Description <Icon icon="info-sign" size={11} /></span>
            <input className="wa-field-input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>

          <div className="wa-field-divider" />

          <div className="wa-field">
            <span className="wa-field-label">Workspace visibility</span>
            <p className="wa-field-hint">
              Visible to all users who open Workspaces and have view permissions on this
              workspace file. Configure visibility of workspace for Organization
            </p>
            <button type="button" className="wa-field-select" onClick={() => toast('Organization switcher is not available in this prototype')}>
              Palantir
              <Icon icon="chevron-down" size={12} />
            </button>
            <div className="wa-radio-row">
              <RadioCard icon="endorsed" label="Promoted" selected={visibility === 'promoted'} onClick={() => setVisibility('promoted')} />
              <RadioCard icon="link" label="Link only" selected={visibility === 'link'} onClick={() => setVisibility('link')} />
            </div>
          </div>

          <div className="wa-field">
            <span className="wa-field-label">Default Workspace</span>
            <p className="wa-field-hint">
              Default workspaces will be loaded first when users have access to multiple
              workspaces. Default are set per user group
            </p>
            <div className="wa-tag-input">
              <span className="wa-input-tag">
                <Icon icon="people" size={11} />
                watch-82nd
                <Icon icon="small-cross" size={11} className="wa-input-tag-remove" onClick={() => toast('Removed watch-82nd')} />
              </span>
            </div>
          </div>

          <div className="wa-field">
            <span className="wa-field-label">Workspace agent</span>
            <p className="wa-field-hint">
              The default workspace agent has access to all files and modules available to the
              workspace.
            </p>
            <div className="wa-radio-row">
              <RadioCard icon="endorsed" label="Default" selected={agentMode === 'default'} onClick={() => setAgentMode('default')} />
              <RadioCard icon="link" label="Custom" selected={agentMode === 'custom'} onClick={() => setAgentMode('custom')} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
