import { useState } from 'react'
import { Icon } from '@blueprintjs/core'
import { DottedCircleIcon } from './icons'

const ITEMS = [
  {
    id: 'suspicious-activity',
    title: 'Three posts on the North watch line missed check-in. Do you want to open a report?',
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

export default function InboxPanel({ toast, onHover, onHoverEnd, onOpen }) {
  const [filter, setFilter] = useState('all')
  const visible = filter === 'unread' ? ITEMS.filter((i) => i.unread) : ITEMS

  return (
    <div className="wa-side-panel">
      <div className="wa-filter-row wa-filter-row-top">
        <div className="wa-filter-pills">
          <button
            type="button"
            className={`wa-filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`wa-filter-pill ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
        </div>
        <button type="button" className="wa-panel-collapse" onClick={() => toast('Sort is not available in this prototype')} aria-label="Sort">
          <Icon icon="sort-desc" size={14} />
        </button>
      </div>

      <div className="wa-inbox-list">
        {visible.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`wa-inbox-item ${item.unread ? 'unread' : ''}`}
            onMouseEnter={(e) => onHover?.(item.id, e.currentTarget)}
            onMouseLeave={() => onHoverEnd?.()}
            onClick={() => onOpen?.(item.id)}
          >
            <DottedCircleIcon className="wa-inbox-icon" />
            <span className="wa-inbox-body">
              <span className="wa-inbox-title">{item.title}</span>
              <span className="wa-inbox-meta">{item.meta}</span>
            </span>
            {item.unread && <span className="wa-inbox-dot" />}
          </button>
        ))}
      </div>
    </div>
  )
}
