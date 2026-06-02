export const formatTZS = (amount) => {
  if (!amount && amount !== 0) return '—'
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000
    return `TSh ${m % 1 === 0 ? m : m.toFixed(1)}M`
  }
  if (amount >= 1_000) return `TSh ${Math.round(amount / 1_000)}K`
  return `TSh ${amount.toLocaleString()}`
}

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-TZ', { year: 'numeric', month: 'short', day: 'numeric' })
