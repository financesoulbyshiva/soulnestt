import { useCallback, useEffect, useState } from 'react';
import * as adminService from '../../services/adminService.js';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import Stat from '../../components/common/Stat.jsx';
import { Loading, EmptyState, ErrorState } from '../../components/common/States.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { formatDate, enumLabel, rupees, statusKind } from '../../utils/format.js';

const LOADERS = {
  users: (params) => adminService.getUsers(params).then((d) => ({ rows: d.users, pagination: d.pagination })),
  properties: (params) => adminService.getProperties(params).then((d) => ({ rows: d.properties, pagination: d.pagination })),
  enquiries: (params) => adminService.getEnquiries(params).then((d) => ({ rows: d.enquiries, pagination: d.pagination })),
  reports: (params) => adminService.getReports(params).then((d) => ({ rows: d.reports, pagination: d.pagination })),
  verifications: (params) => adminService.getVerifications(params).then((d) => ({ rows: d.verifications, pagination: d.pagination })),
};

const EMPTY = {
  users: ['👥', 'No users match this view.'],
  properties: ['⌂', 'No properties listed yet.'],
  enquiries: ['✉', 'No enquiries recorded.'],
  reports: ['🚩', 'No reports — the community is behaving.'],
  verifications: ['🛡', 'No verification requests pending.'],
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [tab, setTab] = useState('users');
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadStats = useCallback(() => adminService.getDashboard().then(setStats).catch(() => {}), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LOADERS[tab]({ page, limit: 10 });
      setRows(data.rows);
      setPagination(data.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { load(); }, [load]);

  const act = async (id, fn, msg) => {
    setBusyId(id);
    try {
      await fn();
      toast(msg);
      await Promise.all([load(), loadStats()]);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const renderRow = (row) => {
    switch (tab) {
      case 'users':
        return (
          <>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-ink">{row.name}</h3>
              <p className="truncate text-xs text-ink-2">{row.email}</p>
            </div>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
              <Badge kind={row.role.toLowerCase()}>{row.role}</Badge>
              <Badge kind={row.isVerified ? 'verified' : 'pending'} icon={row.isVerified ? '✓' : '⏳'}>
                {row.isVerified ? 'verified' : 'unverified'}
              </Badge>
              {!row.isActive && <Badge kind="declined">inactive</Badge>}
              <span className="text-xs text-ink-3">joined {formatDate(row.createdAt)}</span>
            </div>
          </>
        );
      case 'properties':
        return (
          <>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-ink">{row.title}</h3>
              <p className="truncate text-xs text-ink-2">
                {row.area ? `${row.area} · ` : ''}{row.city} · owner {row.owner?.name}
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
              <Badge kind="neutral">{enumLabel(row.propertyType)}</Badge>
              <Badge kind={statusKind(row.status)}>{row.status.toLowerCase()}</Badge>
              <span className="text-xs font-semibold text-ink-3">{rupees(row.rent)}/mo</span>
            </div>
          </>
        );
      case 'enquiries':
        return (
          <>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-ink">{row.property?.title}</h3>
              <p className="truncate text-xs text-ink-2">
                {row.tenant?.name} → {row.owner?.name} · {formatDate(row.createdAt)}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-ink-3">{row.message}</p>
            </div>
            <div className="ml-auto"><Badge kind={statusKind(row.status)}>{row.status.toLowerCase()}</Badge></div>
          </>
        );
      case 'reports':
        return (
          <>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-ink">
                {row.reportedUser?.name || 'User'} <span className="font-normal text-ink-3">· {enumLabel(row.reason)}</span>
              </h3>
              <p className="mt-1 text-xs text-ink-2">{row.description || 'No description provided.'}</p>
              <p className="mt-1 text-xs text-ink-3">
                reported by {row.reporter?.name} · {formatDate(row.createdAt)}
                {row.property ? ` · ${row.property.title}` : ''}
              </p>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Badge kind={statusKind(row.status)}>{row.status.toLowerCase()}</Badge>
              {row.status === 'PENDING' && (
                <>
                  <Button
                    size="sm"
                    loading={busyId === row.id}
                    onClick={() => act(row.id, () => adminService.updateReport(row.id, { status: 'RESOLVED' }), 'Report resolved.')}
                  >
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === row.id}
                    onClick={() => act(row.id, () => adminService.updateReport(row.id, { status: 'DISMISSED' }), 'Report dismissed.')}
                  >
                    Dismiss
                  </Button>
                </>
              )}
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-ink">
                {enumLabel(row.type)} check · {row.user?.name}
              </h3>
              <p className="truncate text-xs text-ink-2">
                {row.user?.email}
                {row.property ? ` · ${row.property.title}` : ''} · submitted {formatDate(row.createdAt)}
              </p>
              {row.documentUrl && <p className="truncate text-xs text-ink-3">doc: {row.documentUrl}</p>}
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Badge kind={statusKind(row.status)}>{row.status.toLowerCase()}</Badge>
              {row.status === 'PENDING' && (
                <>
                  <Button
                    size="sm"
                    loading={busyId === row.id}
                    onClick={() => act(row.id, () => adminService.updateVerification(row.id, { status: 'APPROVED' }), 'Verification approved.')}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busyId === row.id}
                    onClick={() => act(row.id, () => adminService.updateVerification(row.id, { status: 'REJECTED' }), 'Verification rejected.')}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </>
        );
    }
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">Admin control centre</h1>
        <p className="mt-1 text-sm text-ink-2">Moderate verifications, reports and the listing ecosystem.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="👥" label={`Users (${stats?.users.tenants || 0} tenants · ${stats?.users.owners || 0} owners)`} value={stats?.users.total ?? '—'} />
        <Stat icon="⌂" label={`Spaces (${stats?.properties.published || 0} published)`} value={stats?.properties.total ?? '—'} tone="violet" />
        <Stat icon="⏳" label="Pending verifications" value={stats?.pending.verifications ?? '—'} tone="warning" />
        <Stat icon="🚩" label="Pending reports" value={stats?.pending.reports ?? '—'} tone={stats?.pending.reports ? 'danger' : 'success'} />
      </div>

      <div className="mt-8">
        <Tabs
          active={tab}
          onChange={(t) => { setTab(t); setPage(1); setRows([]); }}
          tabs={[
            { value: 'users', label: 'Users' },
            { value: 'properties', label: 'Properties' },
            { value: 'enquiries', label: 'Enquiries' },
            { value: 'verifications', label: 'Verifications', count: stats?.pending.verifications },
            { value: 'reports', label: 'Reports', count: stats?.pending.reports },
          ]}
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <Loading label={`Loading ${tab}…`} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : rows.length === 0 ? (
          <EmptyState icon={EMPTY[tab][0]} title={EMPTY[tab][1]} />
        ) : (
          <>
            <div className="grid gap-3">
              {rows.map((row) => (
                <Card key={row.id} className="flex flex-wrap items-start gap-3 p-4">
                  {renderRow(row)}
                </Card>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Previous</Button>
                <span className="text-sm font-semibold text-ink-2">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
