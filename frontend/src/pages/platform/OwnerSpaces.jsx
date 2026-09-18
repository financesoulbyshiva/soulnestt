import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as ownerService from '../../services/ownerService.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import Modal from '../../components/common/Modal.jsx';
import { Loading, EmptyState, ErrorState } from '../../components/common/States.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { formatDate, enumLabel, rupees, statusKind } from '../../utils/format.js';

const PROPERTY_TYPES = [
  { value: 'ROOM', label: 'Room' },
  { value: 'FLAT', label: 'Flat / BHK' },
  { value: 'PG', label: 'PG' },
  { value: 'SHARED_SPACE', label: 'Shared space' },
];
const ROOM_TYPES = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'SHARED', label: 'Shared' },
  { value: 'ENTIRE', label: 'Entire home' },
];
const GENDER_PREFS = [
  { value: 'ANY', label: 'Open for all' },
  { value: 'MALE', label: 'Male-friendly' },
  { value: 'FEMALE', label: 'Female-friendly' },
];

const BLANK = {
  title: '', description: '', propertyType: 'PG', roomType: '', address: '', area: '', city: '',
  state: '', pincode: '', rent: '', deposit: '', availableFrom: '', genderPreference: 'ANY',
};

const toDateInput = (v) => (v ? String(v).slice(0, 10) : '');

export default function OwnerSpaces() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { properties } = await ownerService.getProperties();
      setProperties(properties);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(BLANK);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((p) => {
    setEditing(p);
    setForm({
      title: p.title || '',
      description: p.description || '',
      propertyType: p.propertyType || 'PG',
      roomType: p.roomType || '',
      address: p.address || '',
      area: p.area || '',
      city: p.city || '',
      state: p.state || '',
      pincode: p.pincode || '',
      rent: p.rent ?? '',
      deposit: p.deposit ?? '',
      availableFrom: toDateInput(p.availableFrom),
      genderPreference: p.genderPreference || 'ANY',
    });
    setFormOpen(true);
  }, []);

  useEffect(() => {
    const state = location.state;
    if (!state) return;
    if (state.add) openAdd();
    else if (state.edit) openEdit(state.edit);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate, openAdd, openEdit]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      propertyType: form.propertyType,
      roomType: form.roomType || null,
      address: form.address.trim(),
      area: form.area.trim() || null,
      city: form.city.trim(),
      state: form.state.trim() || null,
      pincode: form.pincode.trim() || null,
      rent: Number(form.rent),
      deposit: form.deposit === '' ? null : Number(form.deposit),
      availableFrom: form.availableFrom || null,
      genderPreference: form.genderPreference || 'ANY',
    };
    try {
      if (editing) {
        await ownerService.updateProperty(editing.id, payload);
        toast('Space updated.');
      } else {
        await ownerService.createProperty(payload);
        toast('Space created as a draft. Publish it when ready.');
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const run = async (id, fn, msg) => {
    setBusyId(id);
    try {
      await fn();
      toast(msg);
      await load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    const id = confirmDelete.id;
    setConfirmDelete(null);
    await run(id, () => ownerService.deleteProperty(id), 'Space deleted.');
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">My spaces</h1>
          <p className="mt-1 text-sm text-ink-2">Create, publish and pause your listings. New spaces start as drafts.</p>
        </div>
        <Button onClick={openAdd}>+ Add space</Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <Loading label="Loading your spaces…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : properties.length === 0 ? (
          <EmptyState
            icon="⌂"
            title="No spaces yet"
            message="Add your PG, flat or room with locality details so verified tenants can find it."
            action={<Button onClick={openAdd}>Add your first space</Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {properties.map((p) => (
              <Card key={p.id} className="flex flex-col overflow-hidden">
                <div className="flex gap-4 p-4">
                  {p.images?.[0]?.url ? (
                    <img src={p.images[0].url} alt={p.title} className="h-28 w-32 shrink-0 rounded-lg object-cover" loading="lazy" />
                  ) : (
                    <div className="gradient-brand flex h-28 w-32 shrink-0 items-center justify-center rounded-lg text-2xl text-white/80" aria-hidden>⌂</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="truncate text-base font-semibold text-ink">{p.title}</h2>
                      <Badge kind={statusKind(p.status)}>{p.status.toLowerCase()}</Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-ink-2">
                      {p.address}{p.area ? `, ${p.area}` : ''}, {p.city} {p.pincode || ''}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge kind="pg">{enumLabel(p.propertyType)}</Badge>
                      {p.roomType && <Badge kind="neutral">{enumLabel(p.roomType)}</Badge>}
                      <Badge kind="neutral">{enumLabel(p.genderPreference)}</Badge>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-ink-3">
                      {rupees(p.rent)}/mo{p.deposit ? ` · deposit ${rupees(p.deposit)}` : ''}
                      {p.availableFrom ? ` · from ${formatDate(p.availableFrom)}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-ink-3">
                      {p._count?.enquiries || 0} enquiries · {p._count?.savedBy || 0} saved · added {formatDate(p.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 border-t border-surface-2 bg-surface-1/50 p-3">
                  {p.status === 'PUBLISHED' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={busyId === p.id}
                      onClick={() => run(p.id, () => ownerService.pauseProperty(p.id), 'Space paused — hidden from discovery.')}
                    >
                      Pause
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      loading={busyId === p.id}
                      onClick={() => run(p.id, () => ownerService.publishProperty(p.id), 'Space is live in discovery!')}
                    >
                      Publish
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" disabled={busyId === p.id} onClick={() => openEdit(p)}>Edit</Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="ml-auto"
                    disabled={busyId === p.id}
                    onClick={() => setConfirmDelete(p)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${editing.title}` : 'Add a new space'}
        wide
      >
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Input label="Title" name="title" className="sm:col-span-2" value={form.title} onChange={set('title')} placeholder="Sunlit 2BHK near Koramangala" required />
          <Select label="Space type" name="propertyType" value={form.propertyType} onChange={set('propertyType')} options={PROPERTY_TYPES} />
          <Select label="Room type" name="roomType" value={form.roomType} onChange={set('roomType')} placeholder="Not specified" options={ROOM_TYPES} />
          <Input label="Address" name="address" className="sm:col-span-2" value={form.address} onChange={set('address')} placeholder="5th Block, 80 Feet Road" required />
          <Input label="Locality" name="area" value={form.area} onChange={set('area')} placeholder="Koramangala" />
          <Input label="City" name="city" value={form.city} onChange={set('city')} placeholder="Bengaluru" required />
          <Input label="State" name="state" value={form.state} onChange={set('state')} placeholder="Karnataka" />
          <Input label="Pincode" name="pincode" value={form.pincode} onChange={set('pincode')} placeholder="560095" />
          <Input label="Monthly rent (₹)" name="rent" type="number" min="1" value={form.rent} onChange={set('rent')} required />
          <Input label="Deposit (₹)" name="deposit" type="number" min="0" value={form.deposit} onChange={set('deposit')} />
          <Input label="Available from" name="availableFrom" type="date" value={form.availableFrom} onChange={set('availableFrom')} />
          <Select label="Gender preference" name="genderPreference" value={form.genderPreference} onChange={set('genderPreference')} options={GENDER_PREFS} />
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold tracking-[0.02em] text-ink-2">Description</span>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={set('description')}
              placeholder="House rules, what is included, walking distance to metro or campus…"
              className="w-full rounded-lg border-[1.5px] border-surface-2 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15"
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Create space'}</Button>
            <Button type="button" variant="ghost" disabled={saving} onClick={() => setFormOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete this space?">
        {confirmDelete && (
          <div>
            <p className="text-sm leading-6 text-ink-2">
              <strong className="text-ink">{confirmDelete.title}</strong> and its saved entries and enquiries will be
              permanently removed. This cannot be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="danger" loading={busyId === confirmDelete.id} onClick={remove}>Yes, delete</Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Keep it</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
