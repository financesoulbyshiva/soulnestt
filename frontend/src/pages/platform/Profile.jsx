import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import * as tenantService from '../../services/tenantService.js';
import * as ownerService from '../../services/ownerService.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import { Loading, ErrorState } from '../../components/common/States.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { formatDate } from '../../utils/format.js';

const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];
const ROOM_TYPES = [
  { value: 'SINGLE', label: 'Single room' },
  { value: 'SHARED', label: 'Shared room' },
  { value: 'ENTIRE', label: 'Entire home' },
];
const FOOD = [
  { value: 'VEG', label: 'Vegetarian' },
  { value: 'NON_VEG', label: 'Non-vegetarian' },
  { value: 'EGGETARIAN', label: 'Eggetarian' },
  { value: 'NO_PREFERENCE', label: 'No preference' },
];
const YES_NO = [
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
  { value: 'OCCASIONALLY', label: 'Occasionally' },
];
const SLEEP = [
  { value: 'EARLY', label: 'Early sleeper' },
  { value: 'LATE', label: 'Night owl' },
  { value: 'FLEXIBLE', label: 'Flexible' },
];
const CLEANLINESS = [
  { value: 'VERY_TIDY', label: 'Very tidy' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'RELAXED', label: 'Relaxed' },
];
const OWNER_TYPES = [
  { value: 'INDIVIDUAL', label: 'Individual owner' },
  { value: 'ORGANIZATION', label: 'Organization / operator' },
];

const toDateInput = (v) => (v ? String(v).slice(0, 10) : '');

export default function Profile() {
  const { user, role, refresh } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [meta, setMeta] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (role === 'TENANT') {
        const { profile } = await tenantService.getProfile();
        const p = profile || {};
        setMeta({ verificationStatus: 'USER', joined: p.createdAt });
        setForm((f) => ({
          ...f,
          phone: p.user?.phone || f.phone,
          gender: p.gender || '',
          age: p.age ?? '',
          occupation: p.occupation || '',
          collegeOrCompany: p.collegeOrCompany || '',
          budgetMin: p.budgetMin ?? '',
          budgetMax: p.budgetMax ?? '',
          preferredLocations: (p.preferredLocations || []).join(', '),
          roomType: p.roomType || '',
          moveInDate: toDateInput(p.moveInDate),
          foodPreference: p.foodPreference || '',
          smokingPreference: p.smokingPreference || '',
          sleepSchedule: p.sleepSchedule || '',
          cleanlinessPreference: p.cleanlinessPreference || '',
          bio: p.bio || '',
        }));
      } else if (role === 'OWNER') {
        const { profile } = await ownerService.getProfile();
        const p = profile || {};
        setMeta({ verificationStatus: p.verificationStatus || 'PENDING', joined: p.createdAt });
        setForm((f) => ({
          ...f,
          ownerType: p.ownerType || 'INDIVIDUAL',
          organizationName: p.organizationName || '',
          ownerPhone: p.phone || '',
        }));
      } else {
        setMeta({ verificationStatus: 'ADMIN', joined: user?.createdAt });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [role, user?.createdAt]);

  useEffect(() => { load(); }, [load]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (role === 'TENANT') {
        const payload = {
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          gender: form.gender || null,
          age: form.age === '' ? null : Number(form.age),
          occupation: form.occupation || null,
          collegeOrCompany: form.collegeOrCompany || null,
          budgetMin: form.budgetMin === '' ? null : Number(form.budgetMin),
          budgetMax: form.budgetMax === '' ? null : Number(form.budgetMax),
          preferredLocations: form.preferredLocations
            ? form.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          roomType: form.roomType || null,
          moveInDate: form.moveInDate || null,
          foodPreference: form.foodPreference || null,
          smokingPreference: form.smokingPreference || null,
          sleepSchedule: form.sleepSchedule || null,
          cleanlinessPreference: form.cleanlinessPreference || null,
          bio: form.bio || null,
        };
        await tenantService.updateProfile(payload);
      } else if (role === 'OWNER') {
        await ownerService.updateProfile({
          name: form.name.trim(),
          ownerType: form.ownerType,
          organizationName: form.organizationName || null,
          phone: form.ownerPhone || null,
        });
      }
      await refresh();
      toast('Profile saved.');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading your profile…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">Profile &amp; settings</h1>
      <p className="mt-1 text-sm text-ink-2">
        {role === 'TENANT'
          ? 'Your lifestyle preferences power better flatmate and space matches.'
          : role === 'OWNER'
            ? 'Keep your owner identity current so tenants can trust your listings.'
            : 'Your moderation account details.'}
      </p>

      <Card className="mt-6 flex flex-wrap items-center gap-4 p-5">
        <span className="gradient-brand flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white">
          {user?.name?.charAt(0)?.toUpperCase()}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-ink">{user?.name}</h2>
          <p className="truncate text-sm text-ink-2">{user?.email}</p>
          <p className="mt-1 text-xs text-ink-3">Member since {formatDate(meta?.joined)}</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          <Badge kind={role?.toLowerCase()}>{role}</Badge>
          {role === 'OWNER' ? (
            <Badge kind={meta?.verificationStatus === 'APPROVED' ? 'verified' : 'pending'} icon={meta?.verificationStatus === 'APPROVED' ? '✓' : '⏳'}>
              {meta?.verificationStatus === 'APPROVED' ? 'Owner verified' : 'Verification pending'}
            </Badge>
          ) : (
            <Badge kind={user?.isVerified ? 'verified' : 'pending'} icon={user?.isVerified ? '✓' : '⏳'}>
              {user?.isVerified ? 'Verified' : 'Not verified'}
            </Badge>
          )}
        </div>
      </Card>

      {role === 'ADMIN' ? (
        <Card className="mt-6 p-6">
          <h2 className="text-base font-semibold text-ink">Admin account</h2>
          <p className="mt-2 text-sm leading-6 text-ink-2">
            Admin accounts are managed by the SoulNestt team. Use the control centre to review verifications,
            reports, users and listings.
          </p>
        </Card>
      ) : (
        <form onSubmit={submit} className="mt-6 grid gap-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink">Account</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input label="Full name" name="name" value={form.name} onChange={set('name')} required />
              {role === 'TENANT' ? (
                <Input label="Phone" name="phone" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
              ) : (
                <Input label="Email" name="email" value={user?.email || ''} disabled hint="Email cannot be changed." />
              )}
            </div>
            {role === 'OWNER' && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Select label="Owner type" name="ownerType" value={form.ownerType} onChange={set('ownerType')} options={OWNER_TYPES} />
                <Input label="Contact phone" name="ownerPhone" value={form.ownerPhone} onChange={set('ownerPhone')} placeholder="+91 98765 43210" />
                <Input
                  label="Organization name"
                  name="organizationName"
                  className="sm:col-span-2"
                  value={form.organizationName}
                  onChange={set('organizationName')}
                  placeholder="Optional — for co-living operators"
                />
              </div>
            )}
          </Card>

          {role === 'TENANT' && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-ink">Living preferences</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Select label="Gender" name="gender" value={form.gender} onChange={set('gender')} placeholder="Prefer not to say" options={GENDERS} />
                <Input label="Age" name="age" type="number" min="16" max="99" value={form.age} onChange={set('age')} />
                <Input label="Occupation" name="occupation" value={form.occupation} onChange={set('occupation')} placeholder="Student / Engineer" />
                <Input label="College or company" name="collegeOrCompany" value={form.collegeOrCompany} onChange={set('collegeOrCompany')} placeholder="Christ University" />
                <Input label="Budget min (₹)" name="budgetMin" type="number" value={form.budgetMin} onChange={set('budgetMin')} />
                <Input label="Budget max (₹)" name="budgetMax" type="number" value={form.budgetMax} onChange={set('budgetMax')} />
                <Select label="Room type" name="roomType" value={form.roomType} onChange={set('roomType')} placeholder="Any" options={ROOM_TYPES} />
                <Input label="Move-in date" name="moveInDate" type="date" value={form.moveInDate} onChange={set('moveInDate')} />
                <Input
                  label="Preferred locations"
                  name="preferredLocations"
                  value={form.preferredLocations}
                  onChange={set('preferredLocations')}
                  hint="Comma separated, e.g. Koramangala, HSR Layout"
                />
                <Select label="Food preference" name="foodPreference" value={form.foodPreference} onChange={set('foodPreference')} placeholder="Any" options={FOOD} />
                <Select label="Smoking" name="smokingPreference" value={form.smokingPreference} onChange={set('smokingPreference')} placeholder="Not specified" options={YES_NO} />
                <Select label="Sleep schedule" name="sleepSchedule" value={form.sleepSchedule} onChange={set('sleepSchedule')} placeholder="Not specified" options={SLEEP} />
                <Select label="Cleanliness" name="cleanlinessPreference" value={form.cleanlinessPreference} onChange={set('cleanlinessPreference')} placeholder="Not specified" options={CLEANLINESS} />
                <label className="block sm:col-span-2 lg:col-span-3">
                  <span className="mb-1.5 block text-xs font-semibold tracking-[0.02em] text-ink-2">About you</span>
                  <textarea
                    name="bio"
                    rows={4}
                    value={form.bio}
                    onChange={set('bio')}
                    placeholder="A line about your routine, what you need in a flatmate…"
                    className="w-full rounded-lg border-[1.5px] border-surface-2 bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15"
                  />
                </label>
              </div>
            </Card>
          )}

          <div className="flex gap-2">
            <Button type="submit" loading={saving}>Save changes</Button>
            <Button type="button" variant="ghost" disabled={saving} onClick={load}>Reset</Button>
          </div>
        </form>
      )}
    </div>
  );
}
