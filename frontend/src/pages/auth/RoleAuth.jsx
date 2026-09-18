import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RoleAuth({ role }) {
  const isTenant = role === 'TENANT';
  const { login, registerTenant, registerOwner } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
        navigate(isTenant ? '/tenant' : '/owner');
      } else {
        const payload = { name: form.name, email: form.email, password: form.password, phone: form.phone || undefined };
        if (isTenant) await registerTenant(payload);
        else await registerOwner(payload);
        toast(`Welcome to SoulNestt, ${form.name.split(' ')[0]}!`);
        navigate(isTenant ? '/tenant' : '/owner');
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={isTenant ? 'Tenant access' : 'Owner access'}
      subtitle={isTenant ? 'Your verified home hunt starts here.' : 'List, verify and manage your spaces.'}
      footer={
        <>
          Wrong role?{' '}
          <Link className="font-semibold text-primary hover:underline" to={isTenant ? '/auth/owner' : '/auth/tenant'}>
            Switch to {isTenant ? 'Owner' : 'Tenant'}
          </Link>
        </>
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-surface-1 p-1">
        {['login', 'register'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-md py-2 text-sm font-semibold ${mode === m ? 'bg-surface text-primary shadow-card' : 'text-ink-2'}`}
          >
            {m === 'login' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {mode === 'register' && (
          <>
            <Input label="Full name" name="name" value={form.name} onChange={set('name')} placeholder="Ananya Sharma" required />
            <Input label="Phone (optional)" name="phone" value={form.phone} onChange={set('phone')} placeholder="+91 98xxxxxx00" />
          </>
        )}
        <Input label="Email" name="email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={set('password')}
          placeholder={mode === 'register' ? 'Min 8 characters' : '••••••••'}
          required
        />
        <Button type="submit" loading={busy} className="w-full">
          {mode === 'login' ? 'Sign in' : `Create ${isTenant ? 'tenant' : 'owner'} account`}
        </Button>
      </form>

      {mode === 'login' && (
        <p className="mt-4 rounded-lg bg-surface-1 px-3 py-2 text-center text-xs text-ink-2">
          Dev login: {isTenant ? 'tenant1@soulnestt.dev' : 'owner1@soulnestt.dev'} / DevPass123!
        </p>
      )}
    </AuthShell>
  );
}
