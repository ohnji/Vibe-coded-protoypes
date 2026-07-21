import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Card,
  ContextMenu,
  Icon,
  Menu,
  MenuDivider,
  MenuItem,
  OverlayToaster,
  Popover,
  Tab,
  Tabs,
  Tag,
  TextArea,
} from '@blueprintjs/core'
import { AgentAvatar, DottedCircleIcon, SparkleIcon } from './icons'
import HandoverLog from './HandoverLog'
import InboxPanel from './InboxPanel'
import ActivityPanel from './ActivityPanel'
import ActivityDrawer from './ActivityDrawer'
import WorkspaceContextPanel from './WorkspaceContextPanel'
import WorkspaceSettingsPanel from './WorkspaceSettingsPanel'
import TouchpointPreview from './TouchpointPreview'
import TouchpointView from './TouchpointView'
import AgentSession from './AgentSession'
import AgentPopover from './AgentPopover'
import { TOUCHPOINTS } from './touchpoints'
import { AGENT_INFO } from './agentInfo'
import './App.css'

const COLUMNS = [
  {
    id: 'reported',
    title: 'REPORTED',
    diamond: 'diamond-purple',
    count: 3,
    groups: [
      {
        name: 'Category Name',
        count: 2,
        cards: [
          { id: 'WS-0031', kind: 'RELIEF CHECKLIST' },
          { id: 'WS-0036', kind: 'EQUIPMENT CHECK' },
        ],
      },
      {
        name: 'Category Name',
        count: 1,
        cards: [{ id: 'WS-0036', kind: 'EQUIPMENT CHECK' }],
      },
    ],
  },
  {
    id: 'triaged',
    title: 'TRIAGED',
    diamond: 'diamond-orange',
    count: 5,
    groups: [
      {
        name: 'Category Name',
        count: 2,
        cards: [
          { id: 'WS-0041', kind: 'HANDOVER LOG' },
          { id: 'WS-0047', kind: 'COVERAGE CHECK' },
        ],
      },
      {
        name: 'Category Name',
        count: 3,
        cards: [
          { id: 'WS-0052', kind: 'RELIEF CHECKLIST' },
          {
            id: 'WS-0058',
            kind: 'COVERAGE GAP',
            work: {
              agent: 'coverage',
              statuses: [
                'Scanning the 0400–0800 staffing levels…',
                'Cross-checking the duty roster for the block…',
                'Drafting a coverage recommendation…',
              ],
            },
          },
          { id: 'WS-0052', kind: 'RELIEF CHECKLIST' },
        ],
      },
    ],
  },
  {
    id: 'inprogress',
    title: 'IN PROGRESS',
    diamond: 'diamond-red',
    count: 4,
    groups: [
      {
        name: 'Category Name',
        count: 4,
        cards: [
          { id: 'WS-0031', kind: 'RELIEF CHECKLIST' },
          {
            id: 'WS-0063',
            kind: 'LOG REVIEW',
            work: {
              agent: 'log',
              statuses: [
                'Pulling the 0000–0400 watch entries…',
                'Summarizing outstanding items…',
                'Preparing the log review draft…',
              ],
            },
          },
          { id: 'WS-0067', kind: 'SIGN-OFF PENDING' },
          {
            id: 'WS-0071',
            kind: 'TURNOVER REVIEW',
            work: {
              agent: 'handover',
              statuses: [
                'Reviewing the outgoing watch turnover…',
                'Checking relief checklist completion…',
                'Compiling the turnover summary…',
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'pending',
    title: 'PENDING SIGN-OFF',
    diamond: 'diamond-darkred',
    count: 2,
    groups: [
      {
        name: 'Category Name',
        count: 2,
        cards: [
          { id: 'WS-0031', kind: 'RELIEF CHECKLIST' },
          { id: 'WS-0063', kind: 'LOG REVIEW' },
        ],
      },
    ],
  },
]

const REVIEW_ITEMS = [
  {
    id: 'weather-station',
    title: 'Watch post at Site 2 reporting no check-in, review before CONFIRM COVERAGE',
    meta: 'Coverage Check Workflow · Paused 50m ago · Triggered by…',
  },
  {
    id: 'equipment-report',
    title: 'Equipment report ready for your review',
    meta: 'Relief Checklist Workflow · Paused 50m ago · Triggered by…',
  },
  {
    id: 'coverage-gap',
    title: 'Coverage gap flagged for 0400–0800 block. Ready for your review',
    meta: 'Coverage Check Workflow · Paused 50m ago · Triggered by…',
  },
]

const DEFAULT_TABS = [
  { id: 'handover', kind: 'handover', title: 'Handover Log', icon: 'home' },
  { id: 'board', kind: 'board', title: 'Watch Board', icon: 'list-columns' },
  { id: 'bill', kind: 'board', title: 'Watch Bill', icon: 'archive' },
]

const SAMPLE_QUESTIONS = {
  'RELIEF CHECKLIST': 'Can you find all events that are relevant to this one?',
  'EQUIPMENT CHECK': 'What flagged this equipment check, and is it still open?',
  'HANDOVER LOG': 'Summarize what changed in this handover log.',
  'COVERAGE CHECK': 'Why was this coverage check flagged?',
  'COVERAGE GAP': 'Who is responsible for closing this coverage gap?',
  'LOG REVIEW': 'What is outstanding before this log review can close?',
  'SIGN-OFF PENDING': 'Can you find all events that are relevant to this one?',
  'TURNOVER REVIEW': 'What changed since the last turnover review?',
}

const RAIL_ITEMS = [
  { id: 'agent', icon: null, label: 'Agent panel' },
  { id: 'inbox', icon: 'inbox', label: 'Inbox' },
  { id: 'activity', icon: 'pulse', label: 'Activity' },
  { id: 'files', icon: 'folder-close', label: 'Files' },
  { id: 'settings', icon: 'cog', label: 'Settings' },
]

const RAIL_TITLES = {
  agent: 'June 1 update',
  inbox: 'Inbox (3)',
  activity: 'Activity',
  files: 'Workspace Context',
  settings: 'Workspace settings',
}

let toasterPromise
function getToaster() {
  if (!toasterPromise) {
    toasterPromise = OverlayToaster.createAsync({ position: 'top' })
  }
  return toasterPromise
}

function useToast() {
  return async (message) => {
    const toaster = await getToaster()
    toaster.show({ message, timeout: 2600 })
  }
}

function KanbanCard({ card, askOpenKey, onAskOpen, onAskClose, onAction, onInspect, onWorkHoverStart, onWorkHoverEnd, cardKey }) {
  const isWorking = !!card.work
  const isOpen = askOpenKey === cardKey

  const menu = (
    <Menu>
      <MenuItem
        text="Ask workspace agent"
        icon="chat"
        onClick={() => onAskOpen(cardKey)}
      />
      <MenuItem text="Inspect" icon="search" onClick={() => onInspect(card)} />
      <MenuDivider />
      <MenuItem text="Open in Gaia" icon="globe" onClick={() => onAction('Opening in Gaia', card)} />
      <MenuItem text="Copy link" icon="link" onClick={() => onAction('Link copied for', card)} />
      <MenuItem text="Share with…" icon="share" onClick={() => onAction('Sharing', card)} />
    </Menu>
  )

  return (
    <Popover
      isOpen={isOpen}
      onClose={onAskClose}
      placement="right-start"
      content={
        <AskPanel
          card={card}
          onSend={() => onAskClose()}
        />
      }
    >
      <ContextMenu content={menu}>
        <Card
          interactive
          className={`wa-card ${isWorking ? 'is-working' : ''}`}
          onClick={() => (isWorking ? onInspect(card) : onAskOpen(cardKey, true))}
          onMouseEnter={isWorking ? (e) => onWorkHoverStart(cardKey, card, e.currentTarget) : undefined}
          onMouseLeave={isWorking ? onWorkHoverEnd : undefined}
        >
          <Icon icon="cube" className="wa-card-icon" />
          <div className="wa-card-body">
            <span className="wa-card-title">
              {card.id} / <strong>{card.kind}</strong>
            </span>
            <span className="wa-card-meta">
              {isWorking ? `${AGENT_INFO[card.work.agent]?.name || 'Agent'} working…` : 'Last updated 6 min ago'}
            </span>
          </div>
          <div className="wa-card-progress">
            <span className="filled" />
            <span className={isWorking ? 'filled' : ''} />
            <span />
          </div>
          <span className="wa-card-tag">WATCH//82ND</span>
        </Card>
      </ContextMenu>
    </Popover>
  )
}

function AskPanel({ card, onSend }) {
  const [value, setValue] = useState(SAMPLE_QUESTIONS[card.kind] || 'Can you find all events that are relevant to this one?')
  const toast = useToast()
  return (
    <div className="wa-ask-panel">
      <div className="wa-ask-head">
        <SparkleIcon color="#ec9a3c" />
        <span>{card.id} Agent</span>
      </div>
      <TextArea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        fill
        autoResize
        autoFocus
      />
      <button
        type="button"
        className="wa-ask-send"
        onClick={() => {
          toast(`Asked: "${value}"`)
          onSend()
        }}
        aria-label="Send"
      >
        <Icon icon="send-message" size={12} />
      </button>
    </div>
  )
}

// Hover card for a "working" board card — shows the agent and streams its
// current status line with a typewriter effect, cycling through the steps as
// if the agent were reporting progress live.
function WorkingPopover({ work, style }) {
  const agent = AGENT_INFO[work.agent]
  const statuses = work.statuses
  const [stepIdx, setStepIdx] = useState(0)
  const [text, setText] = useState('')

  useEffect(() => {
    const full = statuses[stepIdx]
    let char = 0
    let holdTimer
    const typeTimer = setInterval(() => {
      char += 1
      setText(full.slice(0, char))
      if (char >= full.length) {
        clearInterval(typeTimer)
        holdTimer = setTimeout(() => {
          setStepIdx((i) => (i + 1) % statuses.length)
        }, 1400)
      }
    }, 28)
    return () => {
      clearInterval(typeTimer)
      clearTimeout(holdTimer)
    }
  }, [stepIdx, statuses])

  return (
    <div className="wa-work-popover" style={style}>
      <div className="wa-work-head">
        <AgentAvatar name={agent?.name} size={20} />
        <span className="wa-work-name">{agent?.name || 'Agent'}</span>
        <span className="wa-work-live">
          <span className="wa-work-live-dot" />
          Working
        </span>
      </div>
      <div className="wa-work-status">
        <span className="wa-work-status-text">{text}</span>
        <span className="wa-work-caret" />
      </div>
      <div className="wa-work-steps">
        {statuses.map((_, i) => (
          <span key={i} className={`wa-work-step ${i === stepIdx ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`} />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [rail, setRail] = useState('agent')
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [tabs, setTabs] = useState(DEFAULT_TABS)
  const [tab, setTab] = useState('board')
  const [pill, setPill] = useState('coverage')
  const [askOpenKey, setAskOpenKey] = useState(null)
  const [activityOpen, setActivityOpen] = useState(false)
  const [activityView, setActivityView] = useState('status')
  const [drawerTab, setDrawerTab] = useState('monitoring')
  const [inspectTarget, setInspectTarget] = useState(null)
  const [drawerHeight, setDrawerHeight] = useState(360)
  const [hoverTP, setHoverTP] = useState(null)
  const hoverTimer = useRef(null)
  const [hoverAgent, setHoverAgent] = useState(null)
  const agentHoverTimer = useRef(null)
  const [hoverWork, setHoverWork] = useState(null)
  const workHoverTimer = useRef(null)
  const toast = useToast()

  const handleAskOpen = (key, fromCardClick) => {
    setAskOpenKey(key)
  }
  const handleAskClose = () => setAskOpenKey(null)
  const handleCardAction = (label, card) => toast(`${label} ${card.id}`)
  const handleInspect = (target) => {
    setAskOpenKey(null)
    setInspectTarget(target)
    setDrawerTab('inspect')
    setActivityOpen(true)
    setDrawerHeight((h) => Math.max(h, 460))
  }

  const handleTPHoverStart = (id, target) => {
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => {
      setHoverTP({ id, rect: target.getBoundingClientRect() })
    }, 300)
  }
  const handleTPHoverEnd = () => {
    clearTimeout(hoverTimer.current)
    setHoverTP(null)
  }
  const handleOpenTouchpoint = (id) => {
    clearTimeout(hoverTimer.current)
    setHoverTP(null)
    const tpTabId = `tp-${id}`
    setTabs((prev) => (
      prev.some((t) => t.id === tpTabId)
        ? prev
        : [...prev, { id: tpTabId, kind: 'touchpoint', title: TOUCHPOINTS[id].tabTitle, touchpointId: id, closable: true }]
    ))
    setTab(tpTabId)
  }
  const handleCloseTab = (e, tabId) => {
    e.stopPropagation()
    setTabs((prev) => prev.filter((t) => t.id !== tabId))
    setTab((current) => (current === tabId ? 'board' : current))
  }
  const handleOpenSession = (session) => {
    const sessTabId = `session-${session.id}`
    setTabs((prev) => (
      prev.some((t) => t.id === sessTabId)
        ? prev
        : [...prev, { id: sessTabId, kind: 'session', title: session.title, session, closable: true }]
    ))
    setTab(sessTabId)
  }

  const handleAgentHoverStart = (id, target) => {
    clearTimeout(agentHoverTimer.current)
    agentHoverTimer.current = setTimeout(() => {
      setHoverAgent({ id, rect: target.getBoundingClientRect() })
    }, 250)
  }
  const handleAgentHoverEnd = () => {
    clearTimeout(agentHoverTimer.current)
    setHoverAgent(null)
  }

  const handleWorkHoverStart = (key, card, target) => {
    clearTimeout(workHoverTimer.current)
    workHoverTimer.current = setTimeout(() => {
      setHoverWork({ work: card.work, rect: target.getBoundingClientRect() })
    }, 180)
  }
  const handleWorkHoverEnd = () => {
    clearTimeout(workHoverTimer.current)
    setHoverWork(null)
  }

  return (
    <div className="bp6-dark wa-app">
      <div className="wa-titlebar">
        <div className="wa-titlebar-left">
          <span className="wa-dot wa-dot-red" />
          <span className="wa-dot wa-dot-yellow" />
          <span className="wa-dot wa-dot-green" />
          <Button minimal small icon="panel-stats" onClick={() => toast('Toggle panel')} />
          <Button minimal small icon="chevron-left" onClick={() => toast('No back history')} />
          <Button minimal small icon="chevron-right" onClick={() => toast('No forward history')} />
        </div>
        <Button minimal className="wa-title" rightIcon="chevron-down" onClick={() => toast('Workspace switcher is not available in this prototype')}>
          Watch Schedule - 82nd
        </Button>
        <div className="wa-titlebar-right">
          <div className="wa-avatar-stack">
            <span className="wa-avatar-chip wa-avatar-purple">TK</span>
            <span className="wa-avatar-chip wa-avatar-gold">IE</span>
            <span className="wa-avatar-chip wa-avatar-red">JD</span>
          </div>
          <Button minimal small icon="notifications" onClick={() => toast('No new notifications')} />
        </div>
      </div>

      <div className="wa-body">
        <aside className="wa-rail">
          {RAIL_ITEMS.map((item) => (
            <Button
              key={item.id}
              minimal
              icon={item.icon || undefined}
              aria-label={item.label}
              className={`wa-rail-btn ${rail === item.id ? 'active' : ''}`}
              onClick={() => setRail(item.id)}
            >
              {item.id === 'agent' ? <SparkleIcon color={rail === 'agent' ? '#ec9a3c' : '#ABB3BF'} /> : null}
            </Button>
          ))}
        </aside>

        <div className="wa-main-col">
          <div className="wa-tab-bar">
            <div className="wa-tab-bar-left">
              <Button
                minimal
                className="wa-branch-select"
                icon={rail === 'agent' ? <SparkleIcon color="#ec9a3c" /> : undefined}
                rightIcon={rail === 'agent' ? 'chevron-down' : undefined}
                onClick={() => toast(
                  rail === 'agent'
                    ? 'Branch switcher is not available in this prototype'
                    : `${RAIL_TITLES[rail]} is not available in this prototype`
                )}
              >
                {RAIL_TITLES[rail]}
              </Button>
              <div className="wa-tab-bar-left-actions">
                <Button minimal small icon="plus" onClick={() => toast('New tab')} />
                <Button
                  minimal
                  small
                  icon={panelCollapsed ? 'menu-open' : 'menu-closed'}
                  aria-label={panelCollapsed ? 'Expand panel' : 'Collapse panel'}
                  title={panelCollapsed ? 'Expand panel' : 'Collapse panel'}
                  onClick={() => setPanelCollapsed((c) => !c)}
                />
              </div>
            </div>
            <div className="wa-tabs">
              <Tabs id="ws-tabs" selectedTabId={tab} onChange={(id) => setTab(id)}>
                {tabs.map((t) => (
                  <Tab
                    key={t.id}
                    id={t.id}
                    title={
                      <span className="wa-tab-title">
                        {t.kind === 'touchpoint' ? (
                          <DottedCircleIcon size={13} />
                        ) : t.kind === 'session' ? (
                          <SparkleIcon size={13} color="#ec9a3c" />
                        ) : (
                          <Icon icon={t.icon} />
                        )}
                        <span className="wa-tab-label">{t.title}</span>
                        {t.closable && (
                          <Icon
                            icon="small-cross"
                            className="wa-tab-close"
                            onClick={(e) => handleCloseTab(e, t.id)}
                          />
                        )}
                      </span>
                    }
                  />
                ))}
              </Tabs>
              <Button minimal small icon="plus" className="wa-tab-add" onClick={() => toast('New tab')} />
            </div>
          </div>

          <div className="wa-content-row">
            {!panelCollapsed && !tab.startsWith('session-') && (
            <section className="wa-panel">
              {rail === 'agent' && (
                <>
                  <div className="wa-welcome">
                    <div className="wa-welcome-inner">
                      <div className="wa-agent-name">
                        <SparkleIcon color="#ec9a3c" />
                        Watch Schedule - 82nd Agent
                      </div>
                      <p className="wa-msg">Welcome back Alex, here&apos;s what happened while you were away.</p>
                      <ul className="wa-list">
                        <li>
                          <a href="#" onClick={(e) => { e.preventDefault(); toast('Opening WS-0031') }}>WS-0031</a>{' '}
                          completed the relief checklist and is the leading item awaiting OOD sign-off.
                        </li>
                        <li>
                          <a href="#" onClick={(e) => { e.preventDefault(); toast('Opening WS-0047') }}>WS-0047</a>{' '}
                          underperformed against the standard handover window — the agent logged a note flagging the delay.
                        </li>
                        <li>The Coverage Agent auto-flagged the 0400–0800 block after staffing fell below the minimum threshold.</li>
                      </ul>
                      <p className="wa-msg">The following items needs your review</p>
                      <div className="wa-review-items">
                        {REVIEW_ITEMS.map((item) => (
                          <Card
                            key={item.id}
                            interactive
                            className="wa-review-item"
                            onMouseEnter={(e) => handleTPHoverStart(item.id, e.currentTarget)}
                            onMouseLeave={handleTPHoverEnd}
                            onClick={() => handleOpenTouchpoint(item.id)}
                          >
                            <DottedCircleIcon className="wa-review-icon" />
                            <div className="wa-review-body">
                              <span className="wa-review-title">{item.title}</span>
                              <span className="wa-review-meta">{item.meta}</span>
                            </div>
                            <span className="wa-review-dot" />
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>

                  <ChatInput toast={toast} />
                </>
              )}
              {rail === 'inbox' && (
                <InboxPanel
                  toast={toast}
                  onHover={handleTPHoverStart}
                  onHoverEnd={handleTPHoverEnd}
                  onOpen={handleOpenTouchpoint}
                />
              )}
              {rail === 'activity' && <ActivityPanel toast={toast} />}
              {rail === 'files' && <WorkspaceContextPanel toast={toast} />}
              {rail === 'settings' && <WorkspaceSettingsPanel toast={toast} />}
            </section>
            )}

            {tab === 'handover' ? (
              <HandoverLog toast={toast} onInspect={handleInspect} />
            ) : tab.startsWith('tp-') ? (
              <TouchpointView touchpoint={TOUCHPOINTS[tabs.find((t) => t.id === tab)?.touchpointId]} onOpenSession={handleOpenSession} toast={toast} />
            ) : tab.startsWith('session-') ? (
              <AgentSession key={tab} session={tabs.find((t) => t.id === tab)?.session} toast={toast} />
            ) : (
              <section className="wa-board">
                {COLUMNS.map((col) => (
                  <div className="wa-col" key={col.id}>
                    <div className="wa-col-head">
                      <span className={`wa-diamond ${col.diamond}`} />
                      <span className="wa-col-title">{col.title}</span>
                      <Tag minimal round>{col.count}</Tag>
                      <Button minimal small icon="collapse-all" className="wa-push-right" onClick={() => toast('Collapse column')} />
                    </div>
                    {col.groups.map((group, gi) => (
                      <div key={gi} className="wa-group">
                        <div className="wa-cat-head">
                          <Icon icon="chevron-down" />
                          <span>{group.name}</span>
                          <Tag minimal round className="wa-push-right">{group.count}</Tag>
                        </div>
                        {group.cards.map((card, ci) => {
                          const cardKey = `${col.id}-${gi}-${ci}`
                          return (
                            <KanbanCard
                              key={cardKey}
                              cardKey={cardKey}
                              card={card}
                              askOpenKey={askOpenKey}
                              onAskOpen={handleAskOpen}
                              onAskClose={handleAskClose}
                              onAction={handleCardAction}
                              onInspect={handleInspect}
                              onWorkHoverStart={handleWorkHoverStart}
                              onWorkHoverEnd={handleWorkHoverEnd}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            )}
          </div>

          <ActivityDrawer
            open={activityOpen}
            view={activityView}
            onViewChange={setActivityView}
            tab={drawerTab}
            onTabChange={setDrawerTab}
            inspectTarget={inspectTarget}
            height={drawerHeight}
            onResize={setDrawerHeight}
            onOpenSession={handleOpenSession}
            onClose={() => setActivityOpen(false)}
            toast={toast}
          />

          <div className="wa-status-bar">
            <Button
              minimal
              small
              icon="pulse"
              className={`wa-activities-btn ${activityOpen ? 'active' : ''}`}
              onClick={() => setActivityOpen((open) => !open)}
            >
              Agents
            </Button>
            <div className="wa-pills">
              {['Coverage agent', 'Relief agent', 'Handover agent', 'Roster agent', 'Log writer'].map((name) => {
                const id = name.toLowerCase().split(' ')[0]
                const isRunning = id === 'coverage' || id === 'handover'
                return (
                  <Button
                    key={name}
                    minimal
                    small
                    className={`wa-pill ${pill === id ? 'active' : ''} ${isRunning ? 'wa-skeleton-border' : ''}`}
                    onClick={() => setPill(id)}
                    onMouseEnter={(e) => handleAgentHoverStart(id, e.currentTarget)}
                    onMouseLeave={handleAgentHoverEnd}
                  >
                    <AgentAvatar name={name} size={12} />
                    {name}
                  </Button>
                )
              })}
            </div>
            <div className="wa-status-right">
              <Tag minimal round className="wa-count warn">0</Tag>
              <Tag minimal round className="wa-count info">1</Tag>
              <Tag minimal round className="wa-count ok">0</Tag>
              <Button
                minimal
                small
                className="wa-agent-manager-btn"
                onClick={() => setActivityOpen((open) => !open)}
              >
                Open agent manager
                <Icon icon="chevron-up" size={11} className={`wa-activities-caret ${activityOpen ? 'flipped' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {hoverTP && (
        <TouchpointPreview
          touchpoint={TOUCHPOINTS[hoverTP.id]}
          style={{
            position: 'fixed',
            left: Math.min(hoverTP.rect.right + 12, window.innerWidth - 380),
            top: Math.min(Math.max(hoverTP.rect.top - 20, 12), window.innerHeight - 520),
            zIndex: 400,
          }}
        />
      )}

      {hoverAgent && (
        <AgentPopover
          agent={AGENT_INFO[hoverAgent.id]}
          style={{
            position: 'fixed',
            left: Math.min(hoverAgent.rect.left, window.innerWidth - 320),
            bottom: window.innerHeight - hoverAgent.rect.top + 10,
            zIndex: 400,
          }}
        />
      )}

      {hoverWork && (
        <WorkingPopover
          work={hoverWork.work}
          style={{
            position: 'fixed',
            left: Math.min(hoverWork.rect.right + 12, window.innerWidth - 312),
            top: Math.min(hoverWork.rect.top, window.innerHeight - 150),
            zIndex: 400,
          }}
        />
      )}
    </div>
  )
}

// Custom chat input — matches the Figma mock exactly rather than default
// Blueprint Button/TextArea styling (bordered icon squares, pill model
// selector, solid-white send button).
function ChatInput({ toast }) {
  const [value, setValue] = useState('')
  const taRef = useRef(null)

  const autosize = () => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <form
      className="wa-chat-input"
      onSubmit={(e) => {
        e.preventDefault()
        if (!value.trim()) return
        toast('Asking the workspace agent…')
        setValue('')
        requestAnimationFrame(autosize)
      }}
    >
      <div className="wa-chat-box">
        <textarea
          ref={taRef}
          className="wa-chat-textarea"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            autosize()
          }}
          placeholder="Ask the workspace agent…"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              e.currentTarget.form.requestSubmit()
            }
          }}
        />
        <div className="wa-chat-controls">
          <div className="wa-chat-tools">
            <button type="button" className="wa-chat-icon-btn" onClick={() => toast('Attach')} aria-label="Attach">
              <Icon icon="plus" size={14} />
            </button>
            <button type="button" className="wa-chat-icon-btn" onClick={() => toast('Tools')} aria-label="Tools">
              <Icon icon="wrench" size={14} />
            </button>
          </div>
          <div className="wa-chat-right">
            <button
              type="button"
              className="wa-chat-model"
              onClick={() => toast('Model switcher is not available in this prototype')}
            >
              Claude 3.7 Sonnet
              <Icon icon="chevron-up" size={12} />
            </button>
            <button type="submit" className="wa-chat-send" aria-label="Send">
              <Icon icon="send-message" size={13} />
            </button>
          </div>
        </div>
      </div>
      <div className="wa-input-hint">
        <span><kbd>&#8629;</kbd> send.</span>
        <span><kbd>&#8679;&#8629;</kbd> new line.</span>
      </div>
    </form>
  )
}
