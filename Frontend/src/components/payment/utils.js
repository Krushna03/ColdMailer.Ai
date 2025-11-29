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

export const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const getDaysUntil = (date) => {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  if (Number.isNaN(diff)) return null;
  return Math.ceil(diff / DAY_IN_MS);
};

export const formatDaysLabel = (days) => {
  if (days === null || typeof days === 'undefined') return '--';
  if (days <= 0) return 'Expired';
  return `${days} day${days === 1 ? '' : 's'}`;
};

