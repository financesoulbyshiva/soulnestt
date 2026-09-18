import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLogin() {
  const { loginAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await loginAdmin(form);
      navigate('/admin');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Admin console"
      subtitle="Trust & safety operations. Authorized personnel only."
      footer={<Link to="/auth" className="font-semibold text-primary hover:underline">← Choose a different role</Link>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input label="Admin email" name="email" type="email" value={form.email} onChange={set('email')} placeholder="admin@soulnestt.dev" required />
        <Input label="Password" name="password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
        <Button type="submit" loading={busy} className="w-full">Sign in to console</Button>
      </form>
      <p className="mt-4 rounded-lg bg-surface-1 px-3 py-2 text-center text-xs text-ink-2">
        Dev login: admin@soulnestt.dev / DevPass123!
      </p>
    </AuthShell>
  );
}
