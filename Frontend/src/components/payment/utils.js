export const formatPrice = (amount = 0) =>
  (amount / 100).toLocaleString('en-IN');

export const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '--';

