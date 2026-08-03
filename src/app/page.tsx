'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { ContainerCard } from '@/components/ContainerCard';
import type { ContainerSummary } from '@/lib/docker';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const { data, error, isLoading, mutate } = useSWR('/api/containers', fetcher, {
    refreshInterval: 30_000,
  });
  const [updatingAll, setUpdatingAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'running' | 'updates'>('all');

  const containers: ContainerSummary[] = data?.containers || [];
  const running = containers.filter((c) => c.state === 'running').length;
  const updatable = containers.filter((c) => c.updateAvailable).length;

  const visible = containers.filter((c) => {
    if (filter === 'running') return c.state === 'running';
    if (filter === 'updates') return c.updateAvailable;
    return true;
  });

  async function handleUpdateAll() {
    setUpdatingAll(true);
    try {
      await fetch('/api/update-all', { method: 'POST' });
      setTimeout(() => mutate(), 3000);
    } finally {
      setUpdatingAll(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <header className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-buoy font-mono text-xs uppercase tracking-widest mb-1">
            <span>⚓</span>
            <span>Penutx</span>
          </div>
          <h1 className="text-2xl font-semibold text-hull-200">Harbor overview</h1>
          <p className="text-sm text-hull-500 mt-1">
            {containers.length} container{containers.length !== 1 ? 's' : ''} · {running} running
            {updatable > 0 && (
              <span className="text-buoy"> · {updatable} update{updatable !== 1 ? 's' : ''} available</span>
            )}
          </p>
        </div>
        <button
          onClick={handleUpdateAll}
          disabled={updatingAll}
          className="focus-ring text-sm font-medium rounded-md px-4 py-2 bg-hull-800 text-hull-300 border border-hull-700 hover:border-hull-600 disabled:opacity-40 transition-colors flex-shrink-0"
        >
          {updatingAll ? 'Triggering…' : 'Update all'}
        </button>
      </header>

      <nav className="flex items-center gap-1 mb-6 border-b border-hull-800">
        {(['all', 'running', 'updates'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`focus-ring px-3 py-2 text-sm font-mono capitalize border-b-2 -mb-px transition-colors ${
              filter === f
                ? 'border-buoy text-hull-200'
                : 'border-transparent text-hull-500 hover:text-hull-400'
            }`}
          >
            {f}
          </button>
        ))}
      </nav>

      {isLoading && <p className="text-hull-500 text-sm font-mono">Reading the dock log…</p>}

      {error && (
        <div className="border border-signal-red/30 bg-signal-red/5 rounded-lg p-4 text-sm text-signal-red">
          Could not load containers. Check that the Docker socket is mounted.
        </div>
      )}

      {data?.error && (
        <div className="border border-signal-red/30 bg-signal-red/5 rounded-lg p-4 text-sm text-signal-red">
          {data.error}
        </div>
      )}

      {!isLoading && !error && visible.length === 0 && (
        <div className="border border-hull-800 rounded-lg p-8 text-center text-hull-500 text-sm">
          No containers match this view.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((c) => (
          <ContainerCard key={c.id} container={c} />
        ))}
      </div>
    </main>
  );
}
