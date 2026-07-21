// Fake data for the "touchpoint" review objects surfaced from the Inbox
// panel and the agent panel's "needs your review" list. Every item shares
// the same shape so one preview/detail view can render any of them.

const WEATHER_PINS = [
  { id: 'SD5-002', x: 38.0, y: 38.8 },
  { id: 'SD5-003', x: 37.5, y: 43.7 },
  { id: 'SD5-001', x: 29.3, y: 52.9 },
  { id: 'SD5-004', x: 30.5, y: 63.8 },
  { id: 'SD5-005', x: 62.7, y: 68.9 },
]
const WEATHER_INSET = { x: 22, y: 31, w: 27.5, h: 27.4 }

const CORRIDOR_PINS = [
  { id: 'C-01', x: 44.0, y: 30.0 },
  { id: 'C-02', x: 52.0, y: 40.0 },
  { id: 'C-03', x: 47.0, y: 49.0 },
]
const CORRIDOR_INSET = { x: 38, y: 24, w: 22, h: 30 }

const BORDER_PINS = [
  { id: 'ES-1', x: 66.0, y: 34.0 },
  { id: 'ES-2', x: 72.0, y: 46.0 },
  { id: 'ES-3', x: 78.0, y: 58.0 },
  { id: 'ES-4', x: 70.0, y: 66.0 },
]
const BORDER_INSET = { x: 60, y: 30, w: 26, h: 40 }

const MAP12_PINS = [
  { id: 'Z-12A', x: 34.0, y: 44.0 },
  { id: 'Z-12B', x: 41.0, y: 55.0 },
]
const MAP12_INSET = { x: 28, y: 38, w: 22, h: 26 }

const GENERIC_PROCESS = (automation, opts = {}) => {
  const found = opts.found || { link: '5 posts', tail: ' reporting no check-in', recordsLabel: 'Posts (1)', recordName: 'Post 4', recordKind: 'Watch Post' }
  return [
    { id: 's1', title: `New ${automation} alert created`, meta: 'Automation name · 1m ago', badge: 'START' },
    { group: '2 steps' },
    { id: 's2', title: 'Queried related checklist: SOP 25', link: 'SOP 25', meta: 'Relief agent · Agent · 1m ago' },
    {
      id: 's3',
      title: `Found ${found.link}${found.tail}`,
      link: found.link,
      meta: 'Coverage agent · Agent · 1m ago',
      detail: {
        summary: 'Following initial review of the related posts, this appears to be a recurring coverage shortfall requiring additional relief. Patterns may be connected to ongoing gaps in the night watch sections.',
        aiGenerated: true,
        recordsLabel: found.recordsLabel,
        records: [{ icon: 'globe-network', name: found.recordName, kind: found.recordKind }],
      },
    },
    { id: 's4', title: 'Generated a coverage advisory draft', meta: 'Log writer · Agent · 1m ago' },
  ]
}

export const TOUCHPOINTS = {
  'weather-station': {
    id: 'weather-station',
    title: 'Watch post at Site 2 reporting no check-in, review before CONFIRM COVERAGE',
    timeAgo: '10m ago',
    requestedNote: 'Agent requested approval 4m ago',
    agentName: 'Coverage agent',
    pausedAgo: '50m ago',
    triggeredBy: 'automation',
    previewNote: "On the coverage map you can see Site 2's assigned post, and 40 meters from the marker the agent is suggesting a relief position. The activity pattern below shows what triggered it — the post missed its check-in 6 hours ago, right after the shift change.",
    tabTitle: 'Post check-in review',
    map: { pins: WEATHER_PINS, inset: WEATHER_INSET },
    process: GENERIC_PROCESS('coverage'),
  },
  'equipment-report': {
    id: 'equipment-report',
    title: 'Equipment report ready for your review',
    timeAgo: '18m ago',
    requestedNote: 'Agent requested approval 12m ago',
    agentName: 'Relief agent',
    pausedAgo: '50m ago',
    triggeredBy: 'automation',
    previewNote: 'The relief agent compiled equipment status across all posts. One item — the Site 2 generator — was flagged for maintenance and needs sign-off before the relief checklist can close.',
    tabTitle: 'Equipment report',
    process: GENERIC_PROCESS('equipment check'),
  },
  'coverage-gap': {
    id: 'coverage-gap',
    title: 'Coverage gap flagged for 0400–0800 block. Ready for your review',
    timeAgo: '32m ago',
    requestedNote: 'Agent requested approval 28m ago',
    agentName: 'Coverage agent',
    pausedAgo: '50m ago',
    triggeredBy: 'automation',
    previewNote: 'Staffing on the 0400–0800 block fell below the minimum threshold after a last-minute callout. The agent is proposing a coverage swap with the 82nd Support Wing roster.',
    tabTitle: 'Coverage gap review',
    process: GENERIC_PROCESS('coverage check'),
  },
  'suspicious-activity': {
    id: 'suspicious-activity',
    title: 'Three posts on the North watch line missed check-in. Do you want to open a report?',
    timeAgo: 'Jun 1, 02:14',
    requestedNote: 'Agent flagged this 6m ago',
    agentName: 'Coverage agent',
    pausedAgo: '6m ago',
    triggeredBy: 'coverage alert',
    previewNote: 'Three posts along the North watch line missed their scheduled check-in overnight. The agent has a draft incident report ready if you want to escalate to the watch supervisor.',
    tabTitle: 'North line check-in',
    map: { pins: CORRIDOR_PINS, inset: CORRIDOR_INSET },
    process: GENERIC_PROCESS('coverage'),
  },
  'rfi-draft': {
    id: 'rfi-draft',
    title: 'Turnover log drafted for the eastern night watch.',
    timeAgo: 'Jun 1, 02:14',
    requestedNote: 'Draft ready for your review',
    agentName: 'Handover agent',
    pausedAgo: '14m ago',
    triggeredBy: 'automation',
    previewNote: 'A watch turnover log was compiled from last night’s eastern section, ready to route to the oncoming watch supervisor once you approve the wording.',
    tabTitle: 'Turnover log draft',
    map: { pins: BORDER_PINS, inset: BORDER_INSET },
    process: GENERIC_PROCESS('turnover'),
  },
  'sensor-sigint': {
    id: 'sensor-sigint',
    title: 'Watch stander WS-0047 exceeded max consecutive hours.',
    timeAgo: 'Jun 1, 02:14',
    requestedNote: 'Agent flagged this 9m ago',
    agentName: 'Roster agent',
    pausedAgo: '9m ago',
    triggeredBy: 'automation',
    previewNote: 'WS-0047 has been on post above the maximum consecutive-hours limit for the past two hours. The agent recommends rotating in a relief from the 82nd Support Wing before the next watch.',
    tabTitle: 'Consecutive-hours flag',
    process: GENERIC_PROCESS('roster'),
  },
  'security-bump-1': {
    id: 'security-bump-1',
    title: 'Requires supervisor sign-off on the Watch Bill',
    timeAgo: 'Approved June 1, 02:14',
    requestedNote: 'Approved by Jiyoung Ohn',
    agentName: 'Roster agent',
    pausedAgo: '1h ago',
    triggeredBy: 'manual review',
    previewNote: 'The watch bill was updated for the night rotation and now requires supervisor sign-off. This request has already been approved and is logged here for reference.',
    tabTitle: 'Watch Bill sign-off',
    map: { pins: MAP12_PINS, inset: MAP12_INSET },
    process: GENERIC_PROCESS('watch bill'),
  },
  'security-bump-2': {
    id: 'security-bump-2',
    title: 'Requires supervisor sign-off on the Watch Bill',
    timeAgo: 'Approved June 1, 02:14',
    requestedNote: 'Approved by Jiyoung Ohn',
    agentName: 'Roster agent',
    pausedAgo: '1h ago',
    triggeredBy: 'manual review',
    previewNote: 'A duplicate watch-bill sign-off touchpoint, already approved and logged here for reference.',
    tabTitle: 'Watch Bill sign-off',
    map: { pins: MAP12_PINS, inset: MAP12_INSET },
    process: GENERIC_PROCESS('watch bill'),
  },
}
