import { useCallback, useEffect, useState } from 'react';
import * as discoveryService from '../../services/discoveryService.js';
import * as tenantService from '../../services/tenantService.js';
import PropertyCard from '../../components/discovery/PropertyCard.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import { Loading, EmptyState, ErrorState } from '../../components/common/States.jsx';
import { useToast } from '../../components/common/Toast.jsx';

const AMENITIES = ['WiFi', 'Power Backup', 'Housekeeping', 'Laundry', 'Parking', 'AC'];

const initialFilters = {
  city: '', area: '', propertyType: '', roomType: '', rentMin: '', rentMax: '',
  genderPreference: '', amenities: [], page: 1,
};

export default function Discover() {
  const { toast } = useToast();
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [preview, setPreview] = useState(null);
  const [enquiry, setEnquiry] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 9, page: filters.page };
      for (const k of ['city', 'area', 'propertyType', 'roomType', 'rentMin', 'rentMax', 'genderPreference']) {
        if (filters[k]) params[k] = filters[k];
      }
      if (filters.amenities.length) params.amenities = filters.amenities.join(',');
      const res = await discoveryService.getProperties(params);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    tenantService.getSaved()
      .then((d) => setSavedIds(new Set(d.saved.map((s) => s.property.id))))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value, page: 1 }));
  const toggleAmenity = (name) =>
    setFilters((f) => ({
      ...f,
      page: 1,
      amenities: f.amenities.includes(name) ? f.amenities.filter((a) => a !== name) : [...f.amenities, name],
    }));

  const toggleSave = async (property) => {
    try {
      if (savedIds.has(property.id)) {
        await tenantService.unsaveProperty(property.id);
        setSavedIds((s) => new Set([...s].filter((id) => id !== property.id)));
        toast('Removed from saved spaces.');
      } else {
        await tenantService.saveProperty(property.id);
        setSavedIds((s) => new Set([...s, property.id]));
        toast('Saved to your shortlist ♥');
      }
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const sendEnquiry = async () => {
    if (!enquiry.trim()) return toast('Write a short message first.', 'error');
    setSending(true);
    try {
      await tenantService.createEnquiry({ propertyId: preview.id, message: enquiry });
      toast('Enquiry sent to the owner!');
      setEnquiry('');
      setPreview(null);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const pages = data?.pagination?.totalPages || 1;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">Discover spaces</h1>
          <p className="mt-1 text-sm text-ink-2">Verified PGs, flats and rooms matched to how you live.</p>
        </div>
        {data && <Badge kind="neutral">{data.pagination.total} verified spaces</Badge>}
      </div>

      <div className="mt-6 rounded-xl border border-surface-2 bg-surface p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="City" name="city" placeholder="Bengaluru" value={filters.city} onChange={set('city')} />
          <Input label="Locality" name="area" placeholder="Koramangala" value={filters.area} onChange={set('area')} />
          <Select
            label="Space type" name="propertyType" value={filters.propertyType} onChange={set('propertyType')}
            placeholder="Any type"
            options={[
              { value: 'ROOM', label: 'Room' }, { value: 'FLAT', label: 'Flat / BHK' },
              { value: 'PG', label: 'PG' }, { value: 'SHARED_SPACE', label: 'Shared space' },
            ]}
          />
          <Select
            label="Room type" name="roomType" value={filters.roomType} onChange={set('roomType')}
            placeholder="Any room type"
            options={[{ value: 'SINGLE', label: 'Single' }, { value: 'SHARED', label: 'Shared' }, { value: 'ENTIRE', label: 'Entire home' }]}
          />
          <Input label="Max budget (₹)" name="rentMax" type="number" placeholder="15000" value={filters.rentMax} onChange={set('rentMax')} />
          <Input label="Min budget (₹)" name="rentMin" type="number" placeholder="5000" value={filters.rentMin} onChange={set('rentMin')} />
          <Select
            label="Gender preference" name="genderPreference" value={filters.genderPreference} onChange={set('genderPreference')}
            placeholder="Any"
            options={[{ value: 'MALE', label: 'Male-friendly' }, { value: 'FEMALE', label: 'Female-friendly' }, { value: 'ANY', label: 'Open for all' }]}
          />
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={() => setFilters(initialFilters)}>Reset filters</Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <button
              key={a}
              onClick={() => toggleAmenity(a)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.02em] transition-colors ${
                filters.amenities.includes(a)
                  ? 'border-violet-200 bg-secondary-soft text-secondary'
                  : 'border-surface-2 bg-surface text-ink-2 hover:bg-surface-1'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <Loading label="Finding verified spaces…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : data.properties.length === 0 ? (
          <EmptyState
            icon="🔎"
            title="No spaces match yet"
            message="Try widening your budget or clearing a filter — new verified spaces land every day."
            action={<Button variant="outline" onClick={() => setFilters(initialFilters)}>Clear filters</Button>}
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.properties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  saved={savedIds.has(p.id)}
                  onSave={() => toggleSave(p)}
                  onOpen={() => setPreview(p)}
                />
              ))}
            </div>
            {pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
                  ← Previous
                </Button>
                <span className="text-sm font-semibold text-ink-2">Page {filters.page} of {pages}</span>
                <Button variant="outline" size="sm" disabled={filters.page >= pages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.title || ''} wide>
        {preview && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              {preview.images?.length ? (
                <div className="space-y-2">
                  <img src={preview.images[0].url} alt={preview.title} className="aspect-video w-full rounded-xl object-cover" />
                  {preview.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {preview.images.slice(1).map((im, i) => (
                        <img key={i} src={im.url} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="gradient-brand flex aspect-video w-full items-center justify-center rounded-xl text-4xl text-white/80" aria-hidden>⌂</div>
              )}
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge kind="pg">{preview.propertyType}</Badge>
                {preview.roomType && <Badge kind="neutral">{preview.roomType}</Badge>}
                <Badge kind="verified" icon="✓">Verified listing</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-2">{preview.description || 'No description added yet.'}</p>
              <p className="mt-3 text-xs text-ink-3">
                {preview.address}{preview.area ? `, ${preview.area}` : ''}, {preview.city} {preview.pincode || ''}
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-3">Amenities</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {preview.amenities?.length ? preview.amenities.map((a) => (
                  <Badge key={a.amenity.id} kind="neutral">{a.amenity.name}</Badge>
                )) : <span className="text-sm text-ink-3">Essentials only</span>}
              </div>
              <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.06em] text-ink-3">Listed by</h3>
              <p className="mt-1 text-sm font-semibold text-ink">{preview.ownerName}</p>
              <div className="mt-5 border-t border-surface-2 pt-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold tracking-[0.02em] text-ink-2">Send an enquiry</span>
                  <textarea
                    rows={3}
                    value={enquiry}
                    onChange={(e) => setEnquiry(e.target.value)}
                    placeholder="Hi! Is this space available from next month?"
                    className="w-full rounded-lg border-[1.5px] border-surface-2 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15"
                  />
                </label>
                <div className="mt-3 flex gap-2">
                  <Button className="flex-1" loading={sending} onClick={sendEnquiry}>Send enquiry</Button>
                  <Button variant={savedIds.has(preview.id) ? 'danger' : 'outline'} onClick={() => toggleSave(preview)}>
                    {savedIds.has(preview.id) ? 'Unsave' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
