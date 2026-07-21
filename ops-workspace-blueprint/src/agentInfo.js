export const AGENT_INFO = {
  coverage: {
    name: 'Coverage agent',
    description: 'Monitors staffing coverage across the watch sections and flags gaps before they affect the watch.',
    tasks: {
      active: ['Checking coverage for the 0400–0800 watch', 'Scanning the roster for consecutive-hours limits'],
      attention: ['Coverage gap on 0400–0800 needs your review'],
      completed: ['Confirmed coverage for the 0000–0400 watch'],
    },
  },
  relief: {
    name: 'Relief agent',
    description: 'Runs relief checklists and shift turnovers, confirming each post is properly relieved.',
    tasks: {
      active: [],
      attention: [],
      completed: ['Relief checklist for WS-0031 completed'],
    },
  },
  handover: {
    name: 'Handover agent',
    description: 'Compiles watch handover logs and drafts turnovers for the oncoming watch.',
    tasks: {
      active: ['Drafting the 0400–0800 turnover log'],
      attention: ['0400–0800 turnover needs your approval'],
      completed: ['Compiled the 0000–0400 handover log'],
    },
  },
  roster: {
    name: 'Roster agent',
    description: 'Maintains the watch bill and duty roster, rebalancing assignments as callouts come in.',
    tasks: {
      active: [],
      attention: ['Watch Bill change needs supervisor sign-off'],
      completed: ['Rebalanced the night watch bill'],
    },
  },
  log: {
    name: 'Log writer',
    description: 'Drafts watch log entries and coverage advisories from the work completed by the other agents.',
    tasks: {
      active: [],
      attention: [],
      completed: ['Logged the 2000–0000 watch entry'],
    },
  },
}
