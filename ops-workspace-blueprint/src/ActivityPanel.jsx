import { Icon } from '@blueprintjs/core'
import { DottedCircleIcon, SparkleIcon } from './icons'

const GROUPS = [
  {
    label: 'New',
    items: [
      {
        avatar: <Icon icon="person" size={13} />,
        avatarClass: 'blue',
        text: <><strong>Jiyoung Ohn</strong> created <a href="#">a new workflow</a></>,
        meta: '30 day ago',
      },
      {
        avatar: <SparkleIcon color="#8abbff" size={13} />,
        avatarClass: 'blue',
        text: <><strong>Watch agent</strong> created a new session</>,
        meta: '1 hour ago',
      },
      {
        avatar: <Icon icon="graph" size={13} />,
        avatarClass: 'blue',
        text: <><strong>5 Notepads</strong> created from <Icon icon="media" size={11} /> <a href="#">Night Watch section</a></>,
        meta: '1 hour ago',
      },
      {
        avatar: <SparkleIcon color="#b9a7f7" size={13} />,
        avatarClass: 'purple',
        text: <><strong>Log writer</strong> created new <Icon icon="document" size={11} /> <a href="#">Watch report 1</a></>,
        meta: '1 hour ago',
      },
    ],
  },
  {
    label: 'Jun 11',
    items: [
      {
        avatar: <DottedCircleIcon size={13} />,
        avatarClass: 'orange',
        text: <><strong>Jiyoung Ohn</strong> approved <a href="#">Touchpoint: Watch Bill sign-off</a></>,
        meta: '30 day ago',
      },
      {
        avatar: <DottedCircleIcon size={13} />,
        avatarClass: 'orange',
        text: <><strong>Jiyoung Ohn</strong> approved <a href="#">Touchpoint: Watch Bill sign-off</a></>,
        meta: '30 day ago',
      },
      {
        avatar: <Icon icon="person" size={13} />,
        avatarClass: 'blue',
        text: <><strong>Jiyoung Ohn</strong> created the workspace</>,
        meta: '30 day ago',
      },
    ],
  },
]

export default function ActivityPanel({ toast }) {
  return (
    <div className="wa-side-panel">
      <div className="wa-activity-list wa-activity-list-top">
        {GROUPS.map((group) => (
          <div key={group.label} className="wa-activity-group">
            <div className="wa-activity-group-label">{group.label}</div>
            {group.items.map((item, i) => (
              <button
                type="button"
                className="wa-activity-item"
                key={i}
                onClick={() => toast('Opening activity item')}
              >
                <span className={`wa-activity-avatar ${item.avatarClass}`}>{item.avatar}</span>
                <span className="wa-activity-body">
                  <span className="wa-activity-text">{item.text}</span>
                  <span className="wa-activity-meta">{item.meta}</span>
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
