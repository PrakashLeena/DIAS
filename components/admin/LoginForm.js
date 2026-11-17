'use client';

import { useState } from 'react';
<<<<<<< HEAD

export default function LoginForm() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
      });
      if (res.ok) {
        window.location.href = '/admin';
        return;
      }
      setError(res.status === 429 ? 'Too many attempts. Try again later. / பல முறை முயற்சி; பிறகு முயலவும்.' : 'Invalid username or password. / தவறான பயனர் பெயர் அல்லது கடவுச்சொல்.');
    } catch {
      setError('Network error. / இணைப்புப் பிழை.');
    }
    setBusy(false);
  };

  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-ivory-100 p-7 shadow-3">
      <h1 className="mb-5 text-xl">🔐 நிர்வாகி உள்நுழைவு <span className="text-[13px] font-normal text-ink-500">/ Admin Login</span></h1>
      <label htmlFor="email" className="field-label">Username / பயனர் பெயர்</label>
      <input id="email" name="email" type="text" required autoComplete="username" className="field" />
      <label htmlFor="password" className="field-label mt-4">Password / கடவுச்சொல்</label>
      <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      {error && (
        <p className="mt-4 rounded-lg bg-[#FBE7EA] px-3 py-2 text-sm text-[#B3122E]" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="btn btn-primary mt-6 w-full">
        {busy ? '…' : 'Login / உள்நுழை'}
=======
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LockKeyhole } from 'lucide-react';
import { loginSchema } from '@/lib/validators';

export default function LoginForm({ t }) {
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setError('');
    const res = await fetch('/api/admin/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    if (res.ok) {
      window.location.href = '/admin';
      return;
    }
    setError(res.status === 429 ? t.login.rateLimited : t.login.invalid);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl bg-ivory-100 p-7 shadow-3" noValidate>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon-600 text-white">
          <LockKeyhole className="h-5 w-5" />
        </span>
        <h1 className="font-sans text-xl font-semibold">{t.login.title}</h1>
      </div>
      <label htmlFor="email" className="field-label">{t.login.email}</label>
      <input id="email" type="email" autoComplete="username" className="field" aria-invalid={errors.email ? 'true' : 'false'} {...register('email')} />
      <label htmlFor="password" className="field-label mt-4">{t.login.password}</label>
      <input id="password" type="password" autoComplete="current-password" className="field" aria-invalid={errors.password ? 'true' : 'false'} {...register('password')} />
      {error && (
        <p className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={isSubmitting} className="btn btn-primary mt-6 w-full">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} {t.login.submit}
>>>>>>> 6ef55310b926b8304db243483f45c8bf859d5e1b
      </button>
    </form>
  );
}
