import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ownerService from '../../services/ownerService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Card from '../../components/common/Card.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import Stat from '../../components/common/Stat.jsx';
import { Loading, EmptyState, ErrorState } from '../../components/common/States.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { formatDate, enumLabel, rupees, statusKind } from '../../utils/format.js';

const TYPE_KIND = { ROOM: 'room', FLAT: 'flat', PG: 'pg', SHARED_SPACE: 'shared' };

export default function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState('enquiries');
  const [properties, setProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, e] = await Promise.all([ownerService.getProperties(), ownerService.getEnquiries()]);
      setProperties(p.properties);
      setEnquiries(e.enquiries);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (id, fn, successMsg) => {
    setBusyId(id);
    try {
      await fn();
      toast(successMsg);
      await load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const setStatus = (id, status) =>
    run(`e-${id}`, () => ownerService.updateEnquiry(id, { status }), `Enquiry ${status.toLowerCase()}.`);

  const published = properties.filter((p) => p.status === 'PUBLISHED').length;
  const pending = enquiries.filter((e) => e.status === 'PENDING').length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-ink-2">Track interest in your spaces and reply to tenants.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/owner/spaces')}>Manage spaces</Button>
          <Button onClick={() => navigate('/owner/spaces', { state: { add: true } })}>+ Add space</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="⌂" label="Total spaces" value={properties.length} />
        <Stat icon="✓" label="Published" value={published} tone="success" />
        <Stat icon="✉" label="Enquiries" value={enquiries.length} tone="violet" />
        <Stat icon="⏳" label="Needs reply" value={pending} tone={pending ? 'warning' : 'success'} />
      </div>

      <div className="mt-8">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { value: 'enquiries', label: 'Enquiries', count: enquiries.length },
            { value: 'spaces', label: 'Spaces', count: properties.length },
          ]}
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <Loading label="Loading your dashboard…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : tab === 'enquiries' ? (
          enquiries.length === 0 ? (
            <EmptyState
              icon="✉"
              title="No enquiries yet"
              message="Publish a space with clear photos and locality details to start receiving interest."
              action={<Button onClick={() => navigate('/owner/spaces')}>Go to my spaces</Button>}
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {enquiries.map((e) => (
                <Card key={e.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-ink">{e.tenant?.name}</h3>
                      <p className="mt-0.5 text-xs text-ink-2">
                        on {e.property?.title} · {formatDate(e.createdAt)}
                      </p>
                    </div>
                    <Badge kind={statusKind(e.status)}>{e.status.toLowerCase()}</Badge>
                  </div>
                  <p className="mt-3 rounded-lg bg-surface-1 p-3 text-sm leading-6 text-ink-2">{e.message}</p>
                  {e.status === 'PENDING' && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        loading={busyId === `e-${e.id}`}
                        onClick={() => setStatus(e.id, 'ACCEPTED')}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === `e-${e.id}`}
                        onClick={() => setStatus(e.id, 'DECLINED')}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === `e-${e.id}`}
                        onClick={() => setStatus(e.id, 'CLOSED')}
                      >
                        Close
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )
        ) : properties.length === 0 ? (
          <EmptyState
            icon="⌂"
            title="No spaces listed"
            message="Add your first PG, flat or room — it takes under two minutes."
            action={<Button onClick={() => navigate('/owner/spaces', { state: { add: true } })}>Add a space</Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {properties.map((p) => (
              <Card key={p.id} className="flex gap-4 p-4">
                {p.images?.[0]?.url ? (
                  <img src={p.images[0].url} alt={p.title} className="h-24 w-28 shrink-0 rounded-lg object-cover" loading="lazy" />
                ) : (
                  <div className="gradient-brand flex h-24 w-28 shrink-0 items-center justify-center rounded-lg text-2xl text-white/80" aria-hidden>⌂</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-ink">{p.title}</h3>
                    <Badge kind={statusKind(p.status)}>{p.status.toLowerCase()}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-2">
                    {p.area ? `${p.area} · ` : ''}{p.city}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge kind={TYPE_KIND[p.propertyType]}>{enumLabel(p.propertyType)}</Badge>
                    <span className="text-xs font-semibold text-ink-3">{rupees(p.rent)}/mo</span>
                  </div>
                  <p className="mt-2 text-xs text-ink-3">
                    {p._count?.enquiries || 0} enquiries · {p._count?.savedBy || 0} saved
                  </p>
                  <div className="mt-3 flex gap-2">
                    {p.status === 'PUBLISHED' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={busyId === p.id}
                        onClick={() => run(p.id, () => ownerService.pauseProperty(p.id), 'Space paused.')}
                      >
                        Pause
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        loading={busyId === p.id}
                        onClick={() => run(p.id, () => ownerService.publishProperty(p.id), 'Space published!')}
                      >
                        Publish
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => navigate('/owner/spaces', { state: { edit: p } })}>
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
