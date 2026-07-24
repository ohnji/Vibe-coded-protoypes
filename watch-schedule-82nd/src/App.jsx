import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Button,
  Card,
  ContextMenu,
  Icon,
  Menu,
  MenuDivider,
  MenuItem,
  OverlayToaster,
  Tab,
  Tabs,
  Tag,
} from '@blueprintjs/core'
import { AgentAvatar, DottedCircleIcon, SparkleIcon } from './icons'
import { SAMPLE_QUESTIONS } from './askQuestions'
import HandoverLog from './HandoverLog'
import InboxPanel, { ReviewMeta } from './InboxPanel'
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
import { REVIEW_ITEMS } from './inbox'
import ReportDocument, { SITE2_REPORT } from './ReportDocument'
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


const DEFAULT_TABS = [
  { id: 'handover', kind: 'handover', title: 'Handover Log', icon: 'home' },
  { id: 'board', kind: 'board', title: 'Watch Board', icon: 'list-columns' },
  { id: 'bill', kind: 'board', title: 'Watch Bill', icon: 'archive' },
]

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

function KanbanCard({ card, askTarget, onAskOpen, onAction, onInspect, onWorkHoverStart, onWorkHoverEnd, cardKey }) {
  const isWorking = !!card.work
  const isSelected = askTarget?.key === cardKey

  const menu = (
    <Menu>
      <MenuItem
        text="Ask workspace agent"
        icon="chat"
        onClick={() => onAskOpen(cardKey, card)}
      />
      <MenuItem text="Inspect" icon="search" onClick={() => onInspect(card)} />
      <MenuDivider />
      <MenuItem text="Open in Gaia" icon="globe" onClick={() => onAction('Opening in Gaia', card)} />
      <MenuItem text="Copy link" icon="link" onClick={() => onAction('Link copied for', card)} />
      <MenuItem text="Share with…" icon="share" onClick={() => onAction('Sharing', card)} />
    </Menu>
  )

  return (
    <ContextMenu content={menu}>
      <Card
        interactive
        className={`wa-card ${isWorking ? 'is-working' : ''} ${isSelected ? 'is-ask-selected' : ''}`}
        onClick={() => (isWorking ? onInspect(card) : onAskOpen(cardKey, card))}
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

// Types a plain string out character by character, then reports back so the
// caller can advance to the next block.
function Typewriter({ text, speed = 16, onDone }) {
  const [shown, setShown] = useState('')
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    let char = 0
    setShown('')
    const timer = setInterval(() => {
      char += 1
      setShown(text.slice(0, char))
      if (char >= text.length) {
        clearInterval(timer)
        doneRef.current?.()
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  return <>{shown}</>
}

const WELCOME_GREETING = "Welcome back Alex, here's what happened while you were away."
const WELCOME_REVIEW_LINE = 'The following items needs your review'

// The workspace agent's opening report. Streams in the first time the
// workspace is opened: each paragraph types out, and the bullets / review
// items fade in on a stagger once the paragraph above them has finished.
//
// `streamed` records whether that intro has already played. The panel
// unmounts whenever the user switches to another tab or rail section, so
// without it the animation would replay on every return; when it's set the
// content mounts fully rendered instead.
function AgentWelcome({ toast, onHoverStart, onHoverEnd, onOpen, streamed, onStreamed, reviews, children }) {
  // 0 typing greeting · 1 bullets · 2 typing review line · 3 review items
  const [step, setStep] = useState(streamed ? 3 : 0)
  const animate = !streamed

  useEffect(() => {
    if (step !== 1) return
    const timer = setTimeout(() => setStep(2), 1100)
    return () => clearTimeout(timer)
  }, [step])

  // Remember that the intro finished, so later mounts skip straight to the end.
  useEffect(() => {
    if (step >= 3) onStreamed?.()
  }, [step, onStreamed])

  return (
    <div className="wa-welcome">
      <div className="wa-welcome-inner">
        <div className="wa-agent-name">
          <SparkleIcon color="#ec9a3c" />
          Watch Schedule - 82nd Agent
        </div>

        <p className="wa-msg">
          {animate ? (
            <Typewriter
              text={WELCOME_GREETING}
              onDone={() => setStep((s) => (s === 0 ? 1 : s))}
            />
          ) : (
            WELCOME_GREETING
          )}
          {step === 0 && <span className="wa-stream-caret" />}
        </p>

        {step >= 1 && (
          <ul className="wa-list">
            <li className={animate ? 'wa-stream-in' : undefined} style={animate ? { animationDelay: '0ms' } : undefined}>
              <a href="#" onClick={(e) => { e.preventDefault(); toast('Opening WS-0031') }}>WS-0031</a>{' '}
              completed the relief checklist and is the leading item awaiting OOD sign-off.
            </li>
            <li className={animate ? 'wa-stream-in' : undefined} style={animate ? { animationDelay: '300ms' } : undefined}>
              <a href="#" onClick={(e) => { e.preventDefault(); toast('Opening WS-0047') }}>WS-0047</a>{' '}
              underperformed against the standard handover window — the agent logged a note flagging the delay.
            </li>
            <li className={animate ? 'wa-stream-in' : undefined} style={animate ? { animationDelay: '600ms' } : undefined}>
              The Coverage Agent auto-flagged the 0400–0800 block after staffing fell below the minimum threshold.
            </li>
          </ul>
        )}

        {step >= 2 && (
          <p className="wa-msg">
            {animate ? (
              <Typewriter
                text={WELCOME_REVIEW_LINE}
                onDone={() => setStep((s) => (s === 2 ? 3 : s))}
              />
            ) : (
              WELCOME_REVIEW_LINE
            )}
            {step === 2 && <span className="wa-stream-caret" />}
          </p>
        )}

        {step >= 3 && (
          <div className="wa-review-items">
            {REVIEW_ITEMS.map((item, i) => {
              const review = reviews?.[item.id]
              return (
                <Card
                  key={item.id}
                  interactive
                  className={`wa-review-item ${animate ? 'wa-stream-in' : ''} ${review ? `is-${review.decision}` : ''}`}
                  style={animate ? { animationDelay: `${i * 220}ms` } : undefined}
                  onMouseEnter={(e) => onHoverStart(item.id, e.currentTarget)}
                  onMouseLeave={onHoverEnd}
                  onClick={() => onOpen(item.id)}
                >
                  <DottedCircleIcon className="wa-review-icon" />
                  <div className="wa-review-body">
                    <span className="wa-review-title">{item.title}</span>
                    <ReviewMeta item={item} review={review} className="wa-review-meta" />
                  </div>
                  <span className="wa-review-dot" />
                </Card>
              )
            })}
          </div>
        )}

        {children}
      </div>
    </div>
  )
}

// The agent's reply to an "ask" — a short line, then its tool-use steps
// revealed one at a time, and finally the report it found opens in a new tab.
const ASK_STEPS = [
  { icon: 'search', label: 'Searching relevant reports', detail: 'Matched the record against reports filed in the last 24 hours.' },
  { icon: 'document-open', label: 'Opening up the reports', detail: 'Site 2 - Weather Station Outage Report is the closest match.' },
]

function AskReply({ message, onOpenReport }) {
  const [revealed, setRevealed] = useState(message.done ? ASK_STEPS.length : 0)
  const openedRef = useRef(message.done)

  useEffect(() => {
    if (revealed >= ASK_STEPS.length) return
    const timer = setTimeout(() => setRevealed((n) => n + 1), revealed === 0 ? 700 : 900)
    return () => clearTimeout(timer)
  }, [revealed])

  // Once the last step lands, pull the report up in its own tab.
  useEffect(() => {
    if (revealed < ASK_STEPS.length || openedRef.current) return
    openedRef.current = true
    const timer = setTimeout(() => onOpenReport(), 500)
    return () => clearTimeout(timer)
  }, [revealed, onOpenReport])

  return (
    <div className="wa-chat-agent">
      <div className="wa-agent-name">
        <SparkleIcon color="#ec9a3c" />
        Watch Schedule - 82nd Agent
      </div>
      <p className="wa-msg">Sure, opening up the recent reports..</p>
      {ASK_STEPS.slice(0, revealed).map((step) => (
        <AskReplyStep step={step} key={step.label} />
      ))}
    </div>
  )
}

function AskReplyStep({ step }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="wa-chat-step wa-stream-in">
      <button type="button" className="wa-chat-step-row" onClick={() => setOpen((o) => !o)}>
        <Icon icon={step.icon} size={14} className="wa-chat-step-icon" />
        <span className="wa-chat-step-label">{step.label}</span>
        <Icon icon="chevron-right" size={14} className={`wa-chat-step-caret ${open ? 'flip' : ''}`} />
      </button>
      {open && <div className="wa-chat-step-detail">{step.detail}</div>}
    </div>
  )
}

// The conversation that builds up under the agent's opening report.
function ChatThread({ messages, onOpenReport }) {
  if (!messages.length) return null
  return (
    <div className="wa-chat-thread">
      {messages.map((m) =>
        m.role === 'user' ? (
          <div className="wa-chat-user" key={m.id}>
            {m.context && <span className="wa-chat-user-context">{m.context.label}</span>}
            {m.text}
          </div>
        ) : (
          <AskReply message={m} key={m.id} onOpenReport={onOpenReport} />
        )
      )}
    </div>
  )
}

export default function App() {
  const [rail, setRail] = useState('agent')
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [tabs, setTabs] = useState(DEFAULT_TABS)
  const [tab, setTab] = useState('handover')
  const [pill, setPill] = useState('coverage')
  // The row/card currently selected for "Ask workspace agent" — { key, id, kind } | null.
  // Selecting one highlights it and routes the question through the main chat
  // input instead of an inline popover (inline positioning wasn't reliable).
  const [askTarget, setAskTarget] = useState(null)
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
  // Review decisions by touchpoint id — { decision: 'approved' | 'rejected', at: Date }.
  // Lives here so the Inbox and "needs your review" lists reflect what was
  // approved inside a touchpoint tab.
  const [reviews, setReviews] = useState({})
  const handleDecide = useCallback((id, decision) => {
    setReviews((prev) => {
      if (!decision) {
        const { [id]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [id]: { decision, at: new Date() } }
    })
  }, [])
  // Survives the agent panel unmounting, so the intro only streams once.
  const welcomeStreamedRef = useRef(false)
  const markWelcomeStreamed = useCallback(() => {
    welcomeStreamedRef.current = true
  }, [])
  // Workspace agent conversation, started by "Ask workspace agent".
  const [chat, setChat] = useState([])
  const chatSeq = useRef(0)
  const toast = useToast()

  // Selects a row/card as the ask target and jumps to the main chat so the
  // user can type their question there, with the selection shown as context.
  // `label` is the human-readable name shown in the chip/chat (e.g. a shift
  // block); callers that don't have one fall back to the card's kind or id.
  const handleAskOpen = (key, card) => {
    setAskTarget({ key, id: card.id, kind: card.kind, label: card.label || card.kind || card.id })
    setRail('agent')
    setPanelCollapsed(false)
  }
  const handleAskClose = () => setAskTarget(null)

  // Sending from the main chat input → drop the question (tagged with
  // whatever row/card was selected, if any) into the side-panel chat.
  const handleAskSend = (question) => {
    const context = askTarget
    setAskTarget(null)
    setRail('agent')
    setPanelCollapsed(false)
    const n = chatSeq.current
    chatSeq.current += 2
    setChat((prev) => [
      ...prev.map((m) => (m.role === 'agent' ? { ...m, done: true } : m)),
      { id: `u${n}`, role: 'user', text: question, context },
      { id: `a${n}`, role: 'agent' },
    ])
  }

  // The agent's last step: open the report it found in its own tab.
  const handleOpenReport = useCallback(() => {
    const reportTabId = `report-${SITE2_REPORT.id}`
    setTabs((prev) => (
      prev.some((t) => t.id === reportTabId)
        ? prev
        : [...prev, { id: reportTabId, kind: 'report', title: SITE2_REPORT.tabTitle, closable: true }]
    ))
    setTab(reportTabId)
  }, [])

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

  // The side panel's header (in the tab bar) and its body collapse together —
  // hiding one without the other leaves an orphaned 400px header strip.
  const panelHidden = panelCollapsed

  // The deployed site sits the landing page beside this app
  // (…/blueprint/ -> …/agent/), mirroring WATCH_SCHEDULE_URL on the landing
  // side. Only that layout has an /agent/ route, so guard the dev server.
  const goToLanding = () => {
    if (window.location.pathname.includes('/blueprint/')) {
      window.location.href = '../agent/'
    } else {
      toast('The landing page is only available in the deployed build')
    }
  }

  return (
    <div className="bp6-dark wa-app">
      <div className="wa-titlebar">
        <div className="wa-titlebar-left">
          <span className="wa-dot wa-dot-red" />
          <span className="wa-dot wa-dot-yellow" />
          <span className="wa-dot wa-dot-green" />
          <Button
            minimal
            small
            icon="panel-stats"
            className={`wa-panel-toggle ${panelHidden ? '' : 'active'}`}
            aria-label={panelCollapsed ? 'Show side panel' : 'Hide side panel'}
            title={panelCollapsed ? 'Show side panel' : 'Hide side panel'}
            onClick={() => setPanelCollapsed((c) => !c)}
          />
          <Button
            minimal
            small
            icon="chevron-left"
            aria-label="Back to landing"
            title="Back to landing"
            onClick={goToLanding}
          />
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
            {!panelHidden && (
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
            )}
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
                        ) : t.kind === 'report' ? (
                          <Icon icon="document" />
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
            {!panelHidden && (
            <section className="wa-panel">
              {rail === 'agent' && (
                <>
                  <AgentWelcome
                    toast={toast}
                    onHoverStart={handleTPHoverStart}
                    onHoverEnd={handleTPHoverEnd}
                    onOpen={handleOpenTouchpoint}
                    streamed={welcomeStreamedRef.current}
                    onStreamed={markWelcomeStreamed}
                    reviews={reviews}
                  >
                    <ChatThread messages={chat} onOpenReport={handleOpenReport} />
                  </AgentWelcome>

                  <ChatInput toast={toast} askTarget={askTarget} onAskClear={handleAskClose} onSend={handleAskSend} />
                </>
              )}
              {rail === 'inbox' && (
                <InboxPanel
                  toast={toast}
                  onHover={handleTPHoverStart}
                  onHoverEnd={handleTPHoverEnd}
                  onOpen={handleOpenTouchpoint}
                  reviews={reviews}
                />
              )}
              {rail === 'activity' && <ActivityPanel toast={toast} />}
              {rail === 'files' && <WorkspaceContextPanel toast={toast} />}
              {rail === 'settings' && <WorkspaceSettingsPanel toast={toast} />}
            </section>
            )}

            {tab === 'handover' ? (
              <HandoverLog
                toast={toast}
                onInspect={handleInspect}
                askTarget={askTarget}
                onAskOpen={handleAskOpen}
              />
            ) : tab.startsWith('tp-') ? (
              <TouchpointView
                touchpoint={TOUCHPOINTS[tabs.find((t) => t.id === tab)?.touchpointId]}
                onOpenSession={handleOpenSession}
                toast={toast}
                review={reviews[tabs.find((t) => t.id === tab)?.touchpointId]}
                onDecide={handleDecide}
              />
            ) : tab.startsWith('session-') ? (
              <AgentSession key={tab} session={tabs.find((t) => t.id === tab)?.session} toast={toast} />
            ) : tab.startsWith('report-') ? (
              <ReportDocument toast={toast} />
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
                              askTarget={askTarget}
                              onAskOpen={handleAskOpen}
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
              <span className="wa-count warn" title="Needs attention">
                <Icon icon="error" size={14} />0
              </span>
              <span className="wa-count info" title="In progress">
                <Icon icon="refresh" size={14} />1
              </span>
              <span className="wa-count done" title="Completed">
                <Icon icon="tick-circle" size={14} />0
              </span>
              <Button
                minimal
                small
                className="wa-agent-manager-btn"
                onClick={() => setActivityOpen((open) => !open)}
              >
                Open agent manager
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
function ChatInput({ toast, askTarget, onAskClear, onSend }) {
  const [value, setValue] = useState('')
  const taRef = useRef(null)

  const autosize = () => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  // Jumping here from "Ask workspace agent" on a row/card — put the cursor
  // straight in the box so the user can start typing.
  useEffect(() => {
    if (askTarget) taRef.current?.focus()
  }, [askTarget])

  return (
    <form
      className="wa-chat-input"
      onSubmit={(e) => {
        e.preventDefault()
        if (!value.trim()) return
        onSend(value.trim())
        setValue('')
        requestAnimationFrame(autosize)
      }}
    >
      {askTarget && (
        <div className="wa-chat-ask-context">
          <Icon icon="cube" size={12} />
          <span>{askTarget.label}</span>
          <button type="button" className="wa-chat-ask-context-clear" onClick={onAskClear} aria-label="Clear selection">
            <Icon icon="cross" size={12} />
          </button>
        </div>
      )}
      <div className="wa-chat-box">
        <textarea
          ref={taRef}
          className="wa-chat-textarea"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            autosize()
          }}
          placeholder={askTarget ? SAMPLE_QUESTIONS[askTarget.kind] || 'Ask the workspace agent…' : 'Ask the workspace agent…'}
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
