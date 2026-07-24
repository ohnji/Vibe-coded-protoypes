import { useState } from 'react'
import { Icon, Tag } from '@blueprintjs/core'
import { DottedCircleIcon } from './icons'
import { INBOX_ITEMS } from './inbox'
import { formatListTime } from './format'

// Meta line under a review item's title. Once the item has been approved or
// rejected in its touchpoint tab, the workflow/timestamp line is replaced by
// the decision and when it was made.
export function ReviewMeta({ item, review, className = 'wa-inbox-meta' }) {
  if (!review) return <span className={className}>{item.meta}</span>
  const approved = review.decision === 'approved'
  return (
    <span className={`${className} wa-review-decision ${review.decision}`}>
      <Icon icon={approved ? 'tick' : 'cross'} size={12} />
      <span className="wa-review-decision-label">{approved ? 'Approved' : 'Rejected'}</span>
      {' · '}
      {formatListTime(review.at)}
    </span>
  )
}

<<<<<<< HEAD
export default function InboxPanel({ toast, onHover, onHoverEnd, onOpen, approvedTouchpoints }) {
  const [filter, setFilter] = useState('all')

  const ITEMS_WITH_APPROVAL = ITEMS.map((item) => {
    if (approvedTouchpoints?.has(item.id)) {
      return {
        ...item,
        unread: false,
        meta: item.meta.replace(/·.*/, '').trim() + ' · Approved ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }
    }
    return item
  })

  const visible = filter === 'unread' ? ITEMS_WITH_APPROVAL.filter((i) => i.unread) : ITEMS_WITH_APPROVAL
=======
export default function InboxPanel({ toast, onHover, onHoverEnd, onOpen, reviews }) {
  const [filter, setFilter] = useState('all')
  const visible = filter === 'unread' ? INBOX_ITEMS.filter((i) => i.unread) : INBOX_ITEMS
>>>>>>> e94f82a4d2d7f396c0ed9fa9a5ec491a54829662

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
        {visible.map((item) => {
<<<<<<< HEAD
          const isApproved = approvedTouchpoints?.has(item.id)
=======
          const review = reviews?.[item.id]
>>>>>>> e94f82a4d2d7f396c0ed9fa9a5ec491a54829662
          return (
            <button
              type="button"
              key={item.id}
<<<<<<< HEAD
              className={`wa-inbox-item ${item.unread ? 'unread' : ''}`}
=======
              className={`wa-inbox-item ${item.unread ? 'unread' : ''} ${review ? `is-${review.decision}` : ''}`}
>>>>>>> e94f82a4d2d7f396c0ed9fa9a5ec491a54829662
              onMouseEnter={(e) => onHover?.(item.id, e.currentTarget)}
              onMouseLeave={() => onHoverEnd?.()}
              onClick={() => onOpen?.(item.id)}
            >
              <DottedCircleIcon className="wa-inbox-icon" />
              <span className="wa-inbox-body">
                <span className="wa-inbox-title">{item.title}</span>
<<<<<<< HEAD
                <span className="wa-inbox-meta">
                  {isApproved ? (
                    <Tag intent="success" icon="tick" minimal>
                      Approved by Chris 1m ago
                    </Tag>
                  ) : (
                    item.meta
                  )}
                </span>
=======
                <ReviewMeta item={item} review={review} />
>>>>>>> e94f82a4d2d7f396c0ed9fa9a5ec491a54829662
              </span>
              {item.unread && <span className="wa-inbox-dot" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
