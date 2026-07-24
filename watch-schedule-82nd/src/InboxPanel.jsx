import { useState } from 'react'
import { Icon } from '@blueprintjs/core'
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
      <span className="wa-review-decision-label">{approved ? 'Approved' : 'Rejected'} by Alex</span>
      {' · '}
      {formatListTime(review.at)}
    </span>
  )
}

export default function InboxPanel({ toast, onHover, onHoverEnd, onOpen, reviews, readIds }) {
  const [filter, setFilter] = useState('all')
  const visible = filter === 'unread' ? INBOX_ITEMS.filter((i) => i.unread) : INBOX_ITEMS

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
          const review = reviews?.[item.id]
          const unread = item.unread && !readIds?.has(item.id)
          return (
            <button
              type="button"
              key={item.id}
              className={`wa-inbox-item ${unread ? 'unread' : ''} ${review ? `is-${review.decision}` : ''}`}
              onMouseEnter={(e) => onHover?.(item.id, e.currentTarget)}
              onMouseLeave={() => onHoverEnd?.()}
              onClick={() => onOpen?.(item.id)}
            >
              {review?.decision === 'approved' ? (
                <Icon icon="tick-circle" size={16} className="wa-inbox-icon wa-inbox-icon-approved" />
              ) : (
                <DottedCircleIcon className="wa-inbox-icon" />
              )}
              <span className="wa-inbox-body">
                <span className="wa-inbox-title">{item.title}</span>
                <ReviewMeta item={item} review={review} />
              </span>
              {unread && <span className="wa-inbox-dot" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
