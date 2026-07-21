// A fake satellite-map background (no real imagery available) built from
// layered CSS gradients, plus positioned pin markers and an optional inset
// "zoomed detail" box — matching the terrain-map touchpoint mock.

function Pin({ label, small }) {
  return (
    <span className={`sm-pin ${small ? 'small' : ''}`}>
      <svg viewBox="0 0 24 30" width={small ? 14 : 20} height={small ? 17 : 25}>
        <path
          d="M12 0C5.9 0 1 4.9 1 11c0 7.8 11 19 11 19s11-11.2 11-19c0-6.1-4.9-11-11-11z"
          fill="#8abbff"
          stroke="#14171c"
          strokeWidth="1"
        />
        <circle cx="12" cy="11" r="4" fill="#14171c" />
      </svg>
      {label && !small && <span className="sm-pin-label">{label}</span>}
    </span>
  )
}

// zoomed=true crops the view down to just the `inset` rectangle (in percent
// coordinates of the full map), remapping any pins that fall inside it.
export default function SatelliteMap({ pins = [], inset, zoomed = false, className = '' }) {
  const visiblePins = zoomed && inset
    ? pins
        .filter((p) => p.x >= inset.x && p.x <= inset.x + inset.w && p.y >= inset.y && p.y <= inset.y + inset.h)
        .map((p) => ({ ...p, x: ((p.x - inset.x) / inset.w) * 100, y: ((p.y - inset.y) / inset.h) * 100 }))
    : pins

  return (
    <div className={`sm-root ${zoomed ? 'zoomed' : ''} ${className}`}>
      <div
        className="sm-terrain"
        style={
          zoomed && inset
            ? {
                width: `${(100 / inset.w) * 100}%`,
                height: `${(100 / inset.h) * 100}%`,
                left: `${-(inset.x / inset.w) * 100}%`,
                top: `${-(inset.y / inset.h) * 100}%`,
              }
            : undefined
        }
      />
      {!zoomed && inset && (
        <span
          className="sm-inset"
          style={{ left: `${inset.x}%`, top: `${inset.y}%`, width: `${inset.w}%`, height: `${inset.h}%` }}
        />
      )}
      {visiblePins.map((p) => (
        <span key={p.id} className="sm-pin-wrap" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <Pin label={p.id} small={zoomed} />
        </span>
      ))}
      {!zoomed && (
        <span className="sm-compass">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#f6f7f9" strokeWidth="1.4" />
            <path d="M12 4 L14.5 12 L12 20 L9.5 12 Z" fill="#e76a6e" />
          </svg>
        </span>
      )}
    </div>
  )
}
