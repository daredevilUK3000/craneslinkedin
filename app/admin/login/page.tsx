'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [nextPath, setNextPath] = useState('/admin/generate');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Read ?next= via window.location instead of useSearchParams() so this
  // page doesn't need a Suspense boundary for static generation.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get('next') || '/admin/generate');
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Login failed');
      router.push(nextPath);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <span className="spec-label block mb-2 text-center">Admin</span>
        <h1 className="font-display font-semibold text-2xl text-navy mb-8 text-center">
          Sign In
        </h1>

        <form onSubmit={handleSubmit} className="spec-plate">
          <span className="corner-tl" aria-hidden="true" />
          <span className="corner-br" aria-hidden="true" />

          <label className="spec-label block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full border border-cable-grey/40 p-3 mb-4 font-body text-sm"
          />

          {error && <p className="text-warning-orange text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-white font-display font-medium tracking-wide px-6 py-3 text-sm uppercase disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
