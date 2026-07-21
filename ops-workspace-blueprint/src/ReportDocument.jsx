import { Icon } from '@blueprintjs/core'

// The document the workspace agent pulls up when asked to find a related
// report. Rendered in its own tab with a light document-editor chrome.
export const SITE2_REPORT = {
  id: 'site2-weather-outage',
  tabTitle: 'Site 2-Weather Station…',
  title: 'Site 2 - Weather Station Outage Report',
  fields: [
    { label: 'Site', value: 'Site 2' },
    { label: 'Status', value: 'Offline — Unconfirmed Coverage' },
    { label: 'Reported', value: '0347Z, June 1' },
    { label: 'Triggered by', value: 'Coverage Check Workflow' },
    { label: 'Reviewed by', value: '(pending OOD sign-off)' },
  ],
  sections: [
    {
      heading: 'Summary',
      body: 'The Site 2 weather station went offline at 0347Z. The Coverage Check Workflow flagged the outage automatically and paused pending manual review before coverage can be confirmed.',
    },
    {
      heading: 'Details',
      bullets: [
        'Last known good reading: 0341Z',
        'Sensor status: No data received for 6+ minutes, exceeding the 5-minute alert threshold',
        'Backup feed: Not available at this site',
        'Related flags: This outage falls within the same window as the 0400–0800 coverage gap flagged separately by the Coverage Agent',
      ],
    },
    {
      heading: 'Impact',
      body: 'Without the weather station online, Site 2 has no automated environmental data feed for the current watch block. Manual weather logging may be required until the station is restored.',
    },
    {
      heading: 'Actions Taken',
      bullets: [
        'Coverage Check Workflow auto-paused and routed for review',
        'On-site equipment report generated for cross-reference',
      ],
    },
    {
      heading: 'Next Steps',
      bullets: [
        'OOD to confirm whether manual coverage is required for the affected window',
        'Maintenance ticket to be filed if station does not self-recover by next check cycle',
      ],
    },
  ],
}

const MENUS = ['File', 'Edit', 'View', 'Insert', 'Map', 'Tools', 'Help']

const TOOLS = [
  { icon: 'undo', label: 'Undo' },
  { icon: 'redo', label: 'Redo' },
  { divider: true },
  { icon: 'header-one', label: 'Large header', text: 'Large header', caret: true },
  { divider: true },
  { icon: 'bold', label: 'Bold' },
  { icon: 'italic', label: 'Italic' },
  { icon: 'underline', label: 'Underline' },
  { icon: 'strikethrough', label: 'Strikethrough' },
  { icon: 'font', label: 'Text colour' },
  { icon: 'highlight', label: 'Highlight' },
  { icon: 'more', label: 'More formatting' },
  { divider: true },
  { icon: 'align-left', label: 'Align' },
  { icon: 'link', label: 'Link' },
  { icon: 'translate', label: 'Spelling' },
  { icon: 'th', label: 'Table' },
]

export default function ReportDocument({ report = SITE2_REPORT, toast }) {
  return (
    <section className="rd-doc">
      <div className="rd-chrome">
        <div className="rd-titlerow">
          <Icon icon="document" size={13} className="rd-titlerow-icon" />
          <span className="rd-titlerow-name">RFF</span>
          <button type="button" className="rd-icon-btn" onClick={() => toast?.('Favourite')} aria-label="Favourite">
            <Icon icon="star-empty" size={13} />
          </button>
          <button type="button" className="rd-icon-btn" onClick={() => toast?.('Document options')} aria-label="Document options">
            <Icon icon="caret-down" size={13} />
          </button>
          <span className="rd-titlerow-sep" />
          <span className="rd-badge rd-badge-ok"><Icon icon="tick" size={11} /></span>
          <span className="rd-badge rd-badge-info">1</span>
          <span className="rd-badge rd-badge-warn">1</span>
          <nav className="rd-menus">
            {MENUS.map((m) => (
              <button type="button" key={m} className="rd-menu" onClick={() => toast?.(`${m} menu is not available in this prototype`)}>
                {m}
              </button>
            ))}
          </nav>
        </div>

        <div className="rd-toolbar">
          {TOOLS.map((t, i) =>
            t.divider ? (
              <span className="rd-tool-sep" key={`sep-${i}`} />
            ) : (
              <button
                type="button"
                key={t.label}
                className={`rd-tool ${t.text ? 'rd-tool-wide' : ''}`}
                onClick={() => toast?.(`${t.label} is not available in this prototype`)}
                aria-label={t.label}
              >
                <Icon icon={t.icon} size={14} />
                {t.text && <span className="rd-tool-text">{t.text}</span>}
                {t.caret && <Icon icon="caret-down" size={12} />}
              </button>
            )
          )}
          <div className="rd-toolbar-right">
            <button type="button" className="rd-tool rd-tool-wide" onClick={() => toast?.('Translate is not available in this prototype')}>
              <Icon icon="translate" size={14} />
              <span className="rd-tool-text">Translate</span>
              <Icon icon="caret-down" size={12} />
            </button>
            <button type="button" className="rd-tool rd-tool-wide" onClick={() => toast?.('References are not available in this prototype')}>
              <Icon icon="link" size={14} />
              <span className="rd-tool-text">References</span>
            </button>
          </div>
        </div>
      </div>

      <div className="rd-scroll">
        <article className="rd-page">
          <h1 className="rd-title">{report.title}</h1>

          <ul className="rd-fields">
            {report.fields.map((f) => (
              <li key={f.label}>
                <strong>{f.label}:</strong> {f.value}
              </li>
            ))}
          </ul>

          {report.sections.map((s) => (
            <div className="rd-section" key={s.heading}>
              <h2 className="rd-heading">{s.heading}</h2>
              {s.body && <p className="rd-body">{s.body}</p>}
              {s.bullets && (
                <ul className="rd-bullets">
                  {s.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </article>
      </div>
    </section>
  )
}
