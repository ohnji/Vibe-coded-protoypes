import SatelliteMap from './SatelliteMap'
import { DottedCircleIcon } from './icons'

export default function TouchpointPreview({ touchpoint, style }) {
  if (!touchpoint) return null
  return (
    <div className="tp-preview" style={style}>
      <div className="tp-preview-head">
        <DottedCircleIcon className="tp-preview-icon" />
        <span className="tp-preview-title">{touchpoint.title}</span>
        <span className="tp-preview-time">{touchpoint.timeAgo}</span>
      </div>
      <div className="tp-preview-sub">{touchpoint.requestedNote}</div>
      {touchpoint.map && (
        <div className="tp-preview-map">
          <SatelliteMap pins={touchpoint.map.pins} inset={touchpoint.map.inset} zoomed />
        </div>
      )}
      <p className="tp-preview-note">{touchpoint.previewNote}</p>
    </div>
  )
}
