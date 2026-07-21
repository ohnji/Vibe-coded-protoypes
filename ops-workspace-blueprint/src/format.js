// Timestamp formats for review decisions.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (n) => String(n).padStart(2, '0')

// Compact form used in the touchpoint list — "Jun 1, 02:14".
export function formatListTime(date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Longer form used in the touchpoint header — "5pm, 05/05/2026".
export function formatHeaderTime(date) {
  const h = date.getHours()
  const suffix = h < 12 ? 'am' : 'pm'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const mins = date.getMinutes()
  const clock = mins ? `${hour12}:${pad(mins)}${suffix}` : `${hour12}${suffix}`
  return `${clock}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}
