const STATUS_STYLES = {
  // Asset statuses
  available:   'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  assigned:    'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  repair:      'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  retired:     'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  // User statuses
  active:      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  inactive:    'bg-red-500/20 text-red-400 border border-red-500/30',
  // Condition
  good:        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  damaged:     'bg-red-500/20 text-red-400 border border-red-500/30',
  // Maintenance
  open:        'bg-red-500/20 text-red-400 border border-red-500/30',
  'in-progress': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  resolved:    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-700 text-slate-300';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${style}`}>
      {status}
    </span>
  );
}
