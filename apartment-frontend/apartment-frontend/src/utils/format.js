export function formatPrice(value) {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-LK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-LK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Turns a <input type="datetime-local"> value into an ISO string the API expects. */
export function toIsoString(localDateTimeValue) {
  if (!localDateTimeValue) return null
  return new Date(localDateTimeValue).toISOString()
}
