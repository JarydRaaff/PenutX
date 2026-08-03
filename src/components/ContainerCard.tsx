'use client';

import { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import type { ContainerSummary } from '@/lib/docker';

export function ContainerCard({ container }: { container: ContainerSummary }) {
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleUpdate() {
    setUpdating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/containers/${container.id}/update`, { method: 'POST' });
      const data = await res.json();
      setMessage(data.ok ? data.message || 'Update check triggered' : data.error);
    } catch (err) {
      setMessage('Request failed');
    } finally {
      setUpdating(false);
    }
  }

  const composeFile = container.labels['com.docker.compose.project.config_files'];
  const composeService = container.labels['com.docker.compose.service'];
  const snippet = '    labels:\n      - com.centurylinklabs.watchtower.enable=false';

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail without HTTPS/permissions; snippet is still
      // visible on screen to copy manually.
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
                : 'Excluded'}
        </button>
      </div>

      {updating && <ProgressBar />}
      {message && <p className="mt-2 text-xs text-hull-400 font-mono">{message}</p>}

      {!container.watchtowerEnabled && (
        <div className="mt-3 border-t border-hull-800 pt-3">
          <p className="text-xs text-hull-500 mb-2">
            This container is labeled to skip automatic updates. To include it again, remove this
            line{composeFile ? (
              <>
                {' '}from <span className="font-mono text-hull-400">{composeService}</span> in{' '}
                <span className="font-mono text-hull-400 break-all">{composeFile}</span>, then{' '}
                <span className="font-mono text-hull-400">docker compose up -d</span> from that folder:
              </>
            ) : (
              <> from the container&apos;s labels and recreate it:</>
            )}
          </p>
          <div className="relative">
            <pre className="text-xs font-mono text-hull-400 bg-hull-950 border border-hull-800 rounded-md p-2 overflow-x-auto whitespace-pre">
              {snippet}
            </pre>
            <button
              onClick={handleCopy}
              className="focus-ring absolute top-1.5 right-1.5 text-xs px-2 py-0.5 rounded bg-hull-800 text-hull-400 hover:text-hull-300 border border-hull-700"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
