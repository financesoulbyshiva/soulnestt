export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const enumLabel = (value) =>
  value ? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ') : '—';

export const rupees = (value) =>
  value === null || value === undefined ? '—' : `₹${Number(value).toLocaleString('en-IN')}`;

export const STATUS_KIND = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  APPROVED: 'accepted',
  RESOLVED: 'accepted',
  PUBLISHED: 'published',
  DECLINED: 'declined',
  REJECTED: 'declined',
  CLOSED: 'closed',
  DISMISSED: 'closed',
  PAUSED: 'paused',
  DRAFT: 'draft',
  RENTED: 'rented',
  ARCHIVED: 'archived',
};

export const statusKind = (status) => STATUS_KIND[status] || 'neutral';
