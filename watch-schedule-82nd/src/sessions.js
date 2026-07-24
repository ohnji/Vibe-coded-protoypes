// Agent work sessions shown in the bottom monitoring panel and opened as chat
// tabs in the main panel. `handoff` is the chain of agents that passed the task
// along, ending with the agent that currently owns it — this drives both the
// handoff trail and the workflow tree inside the session.
export const SESSIONS = [
  {
    id: 'coverage-gap',
    agent: 'Coverage agent',
    title: 'Coverage gap on the 0400–0800 watch requires your review',
    status: 'attention',
    meta: '5m ago',
    object: 'WS-0058',
    objectKind: 'COVERAGE GAP',
    handoff: ['Roster agent', 'Coverage agent'],
    proposal: 'Swap the 0400–0800 relief with the 82nd Support Wing roster to bring the block back above the minimum-manning threshold.',
    steps: {
      'Roster agent': 'Rebalanced the night watch bill',
      'Coverage agent': 'Flagged a staffing gap on 0400–0800',
    },
  },
  {
    id: 'coverage-night',
    agent: 'Coverage agent',
    title: 'Checking coverage for the night watch sections',
    status: 'working',
    meta: 'Working…',
    object: 'WS-0047',
    objectKind: 'COVERAGE CHECK',
    handoff: ['Roster agent', 'Coverage agent'],
    steps: {
      'Roster agent': 'Published the night watch bill',
      'Coverage agent': 'Verifying coverage across sections',
    },
  },
  {
    id: 'handover-turnover',
    agent: 'Handover agent',
    title: 'Drafting the 0400–0800 turnover log',
    status: 'working',
    meta: 'Working…',
    object: 'WS-0071',
    objectKind: 'TURNOVER REVIEW',
    handoff: ['Coverage agent', 'Handover agent'],
    steps: {
      'Coverage agent': 'Confirmed coverage for the block',
      'Handover agent': 'Composing the turnover draft',
    },
  },
  {
    id: 'roster-rebalance',
    agent: 'Roster agent',
    title: 'Rebalanced the night watch bill',
    status: 'completed',
    meta: 'Completed · Now',
    object: 'Watch Bill',
    objectKind: 'ROSTER',
    handoff: ['Roster agent'],
    steps: {
      'Roster agent': 'Rebalanced assignments after a callout',
    },
  },
  {
    id: 'handover-compile',
    agent: 'Handover agent',
    title: 'Compiled the 0000–0400 handover log',
    status: 'completed',
    meta: 'Completed · Now',
    object: 'WS-0082',
    objectKind: 'HANDOVER LOG',
    handoff: ['Coverage agent', 'Handover agent'],
    steps: {
      'Coverage agent': 'Confirmed coverage for the block',
      'Handover agent': 'Compiled the handover log',
    },
  },
  {
    id: 'relief-checklist',
    agent: 'Relief agent',
    title: 'Confirmed relief checklist for WS-0031',
    status: 'completed',
    meta: 'Completed · Now',
    object: 'WS-0031',
    objectKind: 'RELIEF CHECKLIST',
    handoff: ['Relief agent'],
    steps: {
      'Relief agent': 'Ran and confirmed the relief checklist',
    },
  },
  {
    id: 'log-entry',
    agent: 'Log writer',
    title: 'Logged the 2000–0000 watch entry',
    status: 'completed',
    meta: 'Completed · Now',
    object: 'WS-0082',
    objectKind: 'WATCH LOG',
    handoff: ['Coverage agent', 'Handover agent', 'Log writer'],
    steps: {
      'Coverage agent': 'Confirmed coverage for the block',
      'Handover agent': 'Compiled the handover log',
      'Log writer': 'Wrote the watch log entry',
    },
  },
  {
    id: 'coverage-next',
    agent: 'Coverage agent',
    title: 'Check coverage for the 0800–1200 watch',
    status: 'scheduled',
    meta: 'Scheduled · 0800',
    object: 'WS-0058',
    objectKind: 'COVERAGE CHECK',
    handoff: ['Roster agent', 'Coverage agent'],
    steps: {
      'Roster agent': 'Will publish the day watch bill',
      'Coverage agent': 'Will verify coverage for the block',
    },
  },
  {
    id: 'handover-next',
    agent: 'Handover agent',
    title: 'Draft the 0800–1200 turnover log',
    status: 'scheduled',
    meta: 'Scheduled · 0800',
    object: 'WS-0036',
    objectKind: 'TURNOVER REVIEW',
    handoff: ['Coverage agent', 'Handover agent'],
    steps: {
      'Coverage agent': 'Will confirm coverage for the block',
      'Handover agent': 'Will draft the turnover log',
    },
  },
]

// The agent's reasoning / tool-use trail shown inside a session, keyed by the
// agent that owns the session. Rendered as an expandable step list.
export const AGENT_REASONING = {
  'Coverage agent': [
    { icon: 'manually-entered-data', label: 'Read the night watch bill', detail: 'Pulled the current assignments across the 2000–0800 sections.' },
    { icon: 'search', label: 'Queried coverage for the block', detail: 'Checked manning against the minimum-coverage requirement.' },
    { icon: 'search', label: 'Analyzed staffing levels', detail: 'Isolated the block where coverage dropped below threshold.' },
    { icon: 'search', label: 'Cross-checked the duty roster', detail: 'Looked for relief inside the consecutive-hours limits.' },
  ],
  'Handover agent': [
    { icon: 'manually-entered-data', label: 'Read the outgoing watch log', detail: 'Reviewed the entries from the section going off watch.' },
    { icon: 'search', label: 'Queried relief checklist status', detail: 'Confirmed which relief items were signed off.' },
    { icon: 'search', label: 'Analyzed turnover items', detail: 'Collected the open items that carry to the oncoming watch.' },
    { icon: 'edit', label: 'Drafted the turnover summary', detail: 'Composed the turnover for supervisor review.' },
  ],
  'Roster agent': [
    { icon: 'manually-entered-data', label: 'Read the watch bill', detail: 'Loaded the current duty roster and assignments.' },
    { icon: 'search', label: 'Checked availability', detail: 'Screened the roster for available watch standers.' },
    { icon: 'edit', label: 'Rebalanced assignments', detail: 'Reassigned posts to absorb the late callout.' },
  ],
  'Relief agent': [
    { icon: 'manually-entered-data', label: 'Read the relief checklist', detail: 'Opened the checklist for the post being relieved.' },
    { icon: 'search', label: 'Verified post readiness', detail: 'Confirmed equipment and briefings were complete.' },
    { icon: 'tick', label: 'Confirmed the relief', detail: 'Marked the checklist complete for sign-off.' },
  ],
  'Log writer': [
    { icon: 'search', label: 'Gathered the watch activity', detail: 'Collected the confirmed events for the block.' },
    { icon: 'search', label: 'Summarized outstanding items', detail: 'Rolled up anything still open at watch end.' },
    { icon: 'edit', label: 'Wrote the watch log entry', detail: 'Drafted the entry for the record.' },
  ],
}

// Bottom-panel "By status" columns. In progress leads with anything that needs
// attention, then the actively-working sessions.
export const STATUS_SECTIONS = [
  {
    id: 'progress',
    label: 'In progress',
    filter: (s) => s.status === 'attention' || s.status === 'working',
    // attention first
    sort: (a, b) => (a.status === 'attention' ? -1 : 0) - (b.status === 'attention' ? -1 : 0),
  },
  { id: 'completed', label: 'Completed', filter: (s) => s.status === 'completed' },
  { id: 'scheduled', label: 'Scheduled', filter: (s) => s.status === 'scheduled' },
]
