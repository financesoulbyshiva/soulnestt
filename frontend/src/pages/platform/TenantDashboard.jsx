import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as tenantService from '../../services/tenantService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PropertyCard from '../../components/discovery/PropertyCard.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Card from '../../components/common/Card.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import Stat from '../../components/common/Stat.jsx';
import { Loading, EmptyState, ErrorState } from '../../components/common/States.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { formatDate, statusKind } from '../../utils/format.js';

export default function TenantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState('saved');
  const [saved, setSaved] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, e] = await Promise.all([tenantService.getSaved(), tenantService.getEnquiries()]);
      setSaved(s.saved);
      setEnquiries(e.enquiries);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const unsave = async (propertyId) => {
    setBusyId(propertyId);
    try {
      await tenantService.unsaveProperty(propertyId);
      setSaved((list) => list.filter((s) => s.propertyId !== propertyId));
      toast('Removed from your shortlist.');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const pending = enquiries.filter((e) => e.status === 'PENDING').length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">Namaste, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-sm text-ink-2">Your shortlist and owner conversations, all in one nest.</p>
        </div>
        <Button onClick={() => navigate('/discover')}>Explore spaces</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon="♥" label="Saved spaces" value={saved.length} />
        <Stat icon="✉" label="Enquiries sent" value={enquiries.length} tone="violet" />
        <Stat icon="⏳" label="Awaiting owner reply" value={pending} tone={pending ? 'warning' : 'success'} />
      </div>

      <div className="mt-8">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { value: 'saved', label: 'Saved spaces', count: saved.length },
            { value: 'enquiries', label: 'My enquiries', count: enquiries.length },
          ]}
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <Loading label="Loading your dashboard…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : tab === 'saved' ? (
          saved.length === 0 ? (
            <EmptyState
              icon="🪺"
              title="Nothing shortlisted yet"
              message="Tap the heart on any verified space to keep it here while you compare."
              action={<Button onClick={() => navigate('/discover')}>Start exploring</Button>}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map((s) => (
                <PropertyCard
                  key={s.id}
                  property={s.property}
                  saved
                  onSave={() => unsave(s.propertyId)}
                  onOpen={() => navigate('/discover')}
                />
              ))}
            </div>
          )
        ) : enquiries.length === 0 ? (
          <EmptyState
            icon="✉"
            title="No enquiries yet"
            message="Send a message from any space and the owner replies right here."
            action={<Button variant="outline" onClick={() => navigate('/discover')}>Find a space</Button>}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {enquiries.map((e) => (
              <Card key={e.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-ink">{e.property?.title}</h3>
                    <p className="mt-0.5 text-xs text-ink-2">
                      {e.property?.area ? `${e.property.area} · ` : ''}{e.property?.city} · to {e.owner?.name}
                    </p>
                  </div>
                  <Badge kind={statusKind(e.status)}>{e.status.toLowerCase()}</Badge>
                </div>
                <p className="mt-3 rounded-lg bg-surface-1 p-3 text-sm leading-6 text-ink-2">{e.message}</p>
                <p className="mt-3 text-xs text-ink-3">Sent {formatDate(e.createdAt)}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
