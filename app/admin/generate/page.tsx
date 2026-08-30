'use client';

import { useState } from 'react';
import { PublishToggleButton } from '@/components/PublishToggleButton';
import { LogoutButton } from '@/components/LogoutButton';
import { CopyChallengeLinkButton } from '@/components/CopyChallengeLinkButton';

const FORMATS = [
  { value: 'open_judgment', label: 'Open-Judgment' },
  { value: 'trade_off', label: 'Trade-Off' },
  { value: 'what_went_wrong', label: 'What-Went-Wrong' },
  { value: 'crowd_sourced', label: 'Crowd-Sourced' },
];

export default function AdminGeneratePage() {
  const [format, setFormat] = useState('open_judgment');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/challenges/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, category: category || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <span className="spec-label block mb-2">Admin</span>
            <h1 className="font-display font-semibold text-3xl text-navy">
              Generate New Challenge
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/admin/challenges"
              className="border border-navy text-navy font-display font-medium tracking-wide px-4 py-2 text-xs uppercase hover:bg-navy hover:text-white transition-colors"
            >
              All Challenges
            </a>
            <LogoutButton />
          </div>
        </div>

        <div className="spec-plate mb-6">
          <span className="corner-tl" aria-hidden="true" />
          <span className="corner-br" aria-hidden="true" />

          <label className="spec-label block mb-2">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full border border-cable-grey/40 p-3 mb-4 font-body text-sm"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <label className="spec-label block mb-2">Category (optional)</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. ground conditions, wind, rigging"
            className="w-full border border-cable-grey/40 p-3 mb-4 font-body text-sm"
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-navy text-white font-display font-medium tracking-wide px-6 py-3 text-sm uppercase disabled:opacity-50"
          >
            {loading ? 'Generating…' : 'Generate Draft'}
          </button>
        </div>

        {error && <p className="text-warning-orange text-sm mb-4">{error}</p>}

        {result && (
          <div className="spec-plate">
            <span className="corner-tl" aria-hidden="true" />
            <span className="corner-br" aria-hidden="true" />
            <div className="flex items-start justify-between gap-4 mb-4">
              <p className="text-xs font-mono text-cable-grey">
                Status: {result.challenge.status}. Review before publishing; this route never
                auto-publishes.
              </p>
              <PublishToggleButton
                challengeId={result.challenge.id}
                status={result.challenge.status}
                onToggled={(updated) =>
                  setResult((prev: any) => ({ ...prev, challenge: updated }))
                }
              />
            </div>
            <h2 className="font-display font-semibold text-2xl text-navy mb-2">
              {result.challenge.title}
            </h2>
            <p className="font-body text-sm text-navy mb-4">{result.challenge.scenario}</p>
            <p className="font-display font-medium text-lg text-navy mb-4">
              {result.challenge.question}
            </p>

            <span className="spec-label block mb-2">Quick Takes</span>
            <ul className="mb-4 space-y-1">
              {result.quick_takes?.map((qt: string, i: number) => (
                <li key={i} className="font-body text-sm text-navy">
                  • {qt}
                </li>
              ))}
            </ul>

            <span className="spec-label block mb-2">LinkedIn Post Draft</span>
            <pre className="whitespace-pre-wrap font-body text-sm bg-paper p-4 border border-cable-grey/30">
              {result.challenge.linkedin_post_draft}
            </pre>
            <p className="text-xs text-cable-grey font-body mt-2">
              This draft leaves the link out on purpose — LinkedIn suppresses reach on posts with
              outbound links. Post the text as-is, then drop the challenge link below as the{' '}
              <strong>first comment</strong>.
            </p>

            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-cable-grey font-body">Slug: {result.challenge.slug}</p>
              <CopyChallengeLinkButton slug={result.challenge.slug} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
