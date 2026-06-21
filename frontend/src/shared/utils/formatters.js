const currencyFormatter = new Intl.NumberFormat('vi-VN')

export function formatPrice(value) {
  return `${currencyFormatter.format(Math.round(Number(value || 0)))}đ`
}

export function truncateText(value, maxLength = 100) {
  if (!value) {
    return ''
  }

  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength).trim()}...`
}

export function formatPercent(value) {
  return `${Math.round(Number(value || 0))}%`
}