// Inbox items, shared by the Inbox panel and the agent panel's "needs your
// review" list — the agent panel shows the first three, so both stay in sync.
// Every id matches a key in TOUCHPOINTS so either list can open the detail view.

export const INBOX_ITEMS = [
  {
    id: 'suspicious-activity',
    title: 'Abnormal activity detected on the North watch line — 3 posts missed check-in, agents are flagging for review',
    meta: 'Coverage workflow · Jun 1, 02:14',
    unread: true,
  },
  {
    id: 'rfi-draft',
    title: 'Turnover log drafted for the eastern night watch.',
    meta: 'Handover workflow · Jun 1, 02:14',
    unread: true,
  },
  {
    id: 'sensor-sigint',
    title: 'Watch stander WS-0047 exceeded max consecutive hours.',
    meta: 'Roster workflow · Jun 1, 02:14',
    unread: true,
  },
  {
    id: 'security-bump-1',
    title: 'Requires supervisor sign-off on the Watch Bill',
    meta: 'Watch Bill workflow · Approved June 1, 02:14',
    unread: false,
  },
  {
    id: 'security-bump-2',
    title: 'Requires supervisor sign-off on the Watch Bill',
    meta: 'Watch Bill workflow · Approved June 1, 02:14',
    unread: false,
  },
]

// The agent panel surfaces the first three as "needs your review".
export const REVIEW_ITEMS = INBOX_ITEMS.slice(0, 3)
