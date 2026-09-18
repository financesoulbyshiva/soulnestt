import { useState } from 'react';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import Button from '../../components/common/Button.jsx';
import { useToast } from '../../components/common/Toast.jsx';

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', topic: 'GENERAL', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast('Please fill your name, email and message.', 'error');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast('Message received. We reply within 24 hours.');
    }, 600);
  };

  return (
    <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-10">
      <div>
        <h1 className="text-4xl font-extrabold tracking-[-0.02em] text-ink">Talk to us</h1>
        <p className="mt-4 max-w-md text-base leading-7 text-ink-2">
          Questions about verification, a listing, or partnering with SoulNestt? Our team reads every message.
        </p>
        <Card className="mt-8 space-y-4 p-6">
          <p className="text-sm text-ink-2"><span className="font-semibold text-ink">Email:</span> hello@soulnestt.in</p>
          <p className="text-sm text-ink-2"><span className="font-semibold text-ink">Helpline:</span> 1800-SOUL-NEST (9am–9pm IST)</p>
          <p className="text-sm text-ink-2"><span className="font-semibold text-ink">Office:</span> Indiranagar, Bengaluru 560038</p>
        </Card>
      </div>

      <Card className="p-6 sm:p-8">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl" aria-hidden>💌</span>
            <h2 className="text-lg font-semibold text-ink">Message sent</h2>
            <p className="max-w-xs text-sm text-ink-2">Thanks for reaching out — we&apos;ll get back to you within 24 hours.</p>
            <Button variant="outline" onClick={() => { setSent(false); setForm({ name: '', email: '', topic: 'GENERAL', message: '' }); }}>
              Send another
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <Input label="Your name" name="name" value={form.name} onChange={set('name')} placeholder="Ananya Sharma" />
            <Input label="Email" name="email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
            <Select
              label="Topic"
              name="topic"
              value={form.topic}
              onChange={set('topic')}
              options={[
                { value: 'GENERAL', label: 'General question' },
                { value: 'VERIFICATION', label: 'Verification help' },
                { value: 'LISTING', label: 'Report a listing' },
                { value: 'PARTNER', label: 'Partnership' },
              ]}
            />
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold tracking-[0.02em] text-ink-2">Message</span>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={set('message')}
                placeholder="Tell us what's on your mind…"
                className="w-full rounded-lg border-[1.5px] border-surface-2 bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15"
              />
            </label>
            <Button type="submit" loading={sending} className="w-full">Send message</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
