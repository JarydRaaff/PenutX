'use client';

import { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import type { ContainerSummary } from '@/lib/docker';

export function ContainerCard({ container }: { container: ContainerSummary }) {
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleUpdate() {
    setUpdating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/containers/${container.id}/update`, { method: 'POST' });
      const data = await res.json();
      setMessage(data.ok ? 'Update triggered' : data.error);
    } catch (err) {
      setMessage('Request failed');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="group relative border border-hull-800 bg-hull-900/60 rounded-lg p-4 hover:border-hull-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-hull-300 truncate">{container.name}</h3>
            {container.updateAvailable && (
              <span
                className="h-1.5 w-1.5 rounded-full bg-buoy flex-shrink-0"
                title="Update available"
              />
            )}
          </div>
          <p className="text-xs font-mono text-hull-500 truncate mt-0.5">{container.image}</p>
        </div>
        <StatusBadge state={container.state} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-hull-500">
        <span className="font-mono truncate">{container.status}</span>
        {container.ports.length > 0 && (
          <span className="font-mono flex-shrink-0 ml-2">
            {container.ports
              .filter((p) => p.public)
              .map((p) => p.public)
              .join(', ') || '—'}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleUpdate}
          disabled={updating || !container.watchtowerEnabled}
          className="focus-ring flex-1 text-sm font-medium rounded-md px-3 py-1.5 bg-buoy/10 text-buoy border border-buoy/30 hover:bg-buoy/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {updating
            ? 'Updating…'
            : container.updateAvailable
              ? 'Update available'
              : container.watchtowerEnabled
                ? 'Check & update'
                : 'Watchtower disabled'}
        </button>
      </div>

      {message && <p className="mt-2 text-xs text-hull-400 font-mono">{message}</p>}
    </div>
  );
}
