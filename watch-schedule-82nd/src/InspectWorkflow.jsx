import { Icon } from '@blueprintjs/core'
import { AgentAvatar, DottedCircleIcon } from './icons'

// The lineage graph shown in the drawer's "Inspect workflow" tab. Nodes are
// absolutely positioned on a fixed canvas so the SVG connectors underneath can
// be drawn with exact endpoint math (see CONNECTORS). The whole canvas scrolls
// inside the drawer body when it overflows.
const NODE_W = 300
const GEN_W = 340

// Per-kind lineage. Only the source label + lead step title change with the
// inspected item; the downstream agents stay constant for the prototype.
function buildGraph(target) {
  const id = target?.id || 'WS-0031'
  const kind = target?.kind || 'RELIEF CHECKLIST'
  const leadTitles = {
    'RELIEF CHECKLIST': 'Research the relief record',
    'EQUIPMENT CHECK': 'Research the equipment log',
    'HANDOVER LOG': 'Research the handover entry',
    'COVERAGE CHECK': 'Research the coverage window',
    'COVERAGE GAP': 'Research the staffing gap',
    'LOG REVIEW': 'Research the watch log',
    'SIGN-OFF PENDING': 'Research the pending sign-off',
    'TURNOVER REVIEW': 'Research the turnover',
  }
  return {
    source: { label: `${id} object`, x: 24, y: 236 },
    lead: {
      agent: 'Roster agent',
      title: leadTitles[kind] || 'Research the record',
      x: 250,
      y: 200,
      w: NODE_W,
    },
    branches: [
      {
        id: 'gen',
        agent: 'Coverage agent',
        title: 'Generate coverage plan',
        status: { icon: 'time', text: 'Finished in 2m' },
        io: '3 inputs · 1 output',
        tools: '1 tool used',
        muted: true,
        x: 810,
        y: 60,
        w: GEN_W,
      },
      {
        id: 'analysis',
        agent: 'Handover agent',
        model: 'Claude 3.7',
        title: 'Compliance analysis',
        creating: true,
        proposed: 'Proposed entry',
        io: '3 inputs · 1 output',
        tools: '1 tool used',
        active: true,
        x: 810,
        y: 288,
        w: GEN_W,
      },
    ],
  }
}

function AipBadge() {
  return (
    <span className="iw-aip">
      <span className="iw-aip-mark" />
      AIP
    </span>
  )
}

function MetaRow({ text, onClick }) {
  return (
    <button type="button" className="iw-meta-row" onClick={onClick}>
      {text}
      <Icon icon="caret-right" size={12} />
    </button>
  )
}

export default function InspectWorkflow({ target, toast }) {
  const g = buildGraph(target)

  // Connector endpoints, derived from node coords + sizes.
  const leadLeft = { x: g.lead.x, y: g.lead.y + 40 }
  const leadRight = { x: g.lead.x + g.lead.w, y: g.lead.y + 40 }
  const srcRight = { x: g.source.x + 150, y: g.source.y + 4 }
  const gen = g.branches[0]
  const analysis = g.branches[1]
  const genLeft = { x: gen.x, y: gen.y + 74 }
  const anaLeft = { x: analysis.x, y: analysis.y + 74 }

  return (
    <div className="iw-scroll">
      <div className="iw-canvas">
        <svg className="iw-edges" width="1180" height="500">
          <defs>
            <linearGradient id="iw-live" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8abbff" stopOpacity="0.35" />
              <stop offset="1" stopColor="#bdadff" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          {/* source → lead */}
          <path
            d={`M${srcRight.x},${srcRight.y} C ${srcRight.x + 40},${srcRight.y} ${leadLeft.x - 40},${leadLeft.y} ${leadLeft.x},${leadLeft.y}`}
            className="iw-edge"
          />
          {/* lead → generate (muted) */}
          <path
            d={`M${leadRight.x},${leadRight.y} C ${leadRight.x + 140},${leadRight.y} ${genLeft.x - 140},${genLeft.y} ${genLeft.x},${genLeft.y}`}
            className="iw-edge iw-edge-muted"
          />
          {/* lead → analysis (live) */}
          <path
            d={`M${leadRight.x},${leadRight.y} C ${leadRight.x + 140},${leadRight.y} ${anaLeft.x - 140},${anaLeft.y} ${anaLeft.x},${anaLeft.y}`}
            className="iw-edge iw-edge-live"
          />
        </svg>

        {/* Source object */}
        <div className="iw-source" style={{ left: g.source.x, top: g.source.y - 28 }}>
          <Icon icon="cube" size={13} />
          {g.source.label}
        </div>

        {/* Lead node */}
        <div className="iw-node" style={{ left: g.lead.x, top: g.lead.y, width: g.lead.w }}>
          <div className="iw-node-head">
            <span className="iw-node-agent">
              <AgentAvatar name={g.lead.agent} size={15} />
              {g.lead.agent}
            </span>
            <AipBadge />
          </div>
          <div className="iw-card">
            <div className="iw-card-title">{g.lead.title}</div>
            <div className="iw-card-status">
              <Icon icon="time" size={12} />
              <span>Finished in 3ms</span>
            </div>
            <MetaRow text="1 input · 1 output" onClick={() => toast('Inputs and outputs are not expandable in this prototype')} />
            <MetaRow text="3 tools used" onClick={() => toast('Tool calls are not expandable in this prototype')} />
          </div>
        </div>

        {/* Branch nodes */}
        {g.branches.map((b) => (
          <div
            key={b.id}
            className={`iw-node ${b.muted ? 'is-muted' : ''} ${b.active ? 'is-active' : ''}`}
            style={{ left: b.x, top: b.y, width: b.w }}
          >
            <div className="iw-node-head">
              <span className="iw-node-agent">
                <AgentAvatar name={b.agent} size={15} />
                {b.agent}{b.model ? ` · ${b.model}` : ''}
              </span>
              <AipBadge />
            </div>
            <div className={`iw-card ${b.active ? 'wa-skeleton-border' : ''}`}>
              <div className="iw-card-title">{b.title}</div>
              <div className="iw-card-status">
                {b.creating ? (
                  <>
                    <Icon icon="edit" size={12} className="iw-creating" />
                    <span className="iw-creating">Creating</span>
                    <span className="iw-proposed">
                      <DottedCircleIcon size={11} color="#8abbff" />
                      {b.proposed}
                    </span>
                  </>
                ) : (
                  <>
                    <Icon icon={b.status.icon} size={12} />
                    <span>{b.status.text}</span>
                  </>
                )}
              </div>
              <MetaRow text={b.io} onClick={() => toast('Inputs and outputs are not expandable in this prototype')} />
              <MetaRow text={b.tools} onClick={() => toast('Tool calls are not expandable in this prototype')} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
