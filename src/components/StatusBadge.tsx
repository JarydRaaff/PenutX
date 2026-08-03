export function StatusBadge({ state }: { state: string }) {
  const config: Record<string, { color: string; label: string; pulse?: boolean }> = {
    running: { color: 'bg-signal-green', label: 'Running' },
    exited: { color: 'bg-signal-red', label: 'Stopped' },
    paused: { color: 'bg-signal-amber', label: 'Paused' },
    restarting: { color: 'bg-signal-amber', label: 'Restarting', pulse: true },
    dead: { color: 'bg-signal-red', label: 'Dead' },
    created: { color: 'bg-signal-blue', label: 'Created' },
  };

  const c = config[state] || { color: 'bg-hull-500', label: state };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-hull-400">
      <span className={`h-2 w-2 rounded-full ${c.color} ${c.pulse ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
}
