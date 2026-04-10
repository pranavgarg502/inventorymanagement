export default function StatCard({ icon: Icon, label, value, color = 'indigo', sub }) {
  const colorMap = {
    indigo: 'from-indigo-600/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    red: 'from-red-600/20 to-red-600/5 border-red-500/20 text-red-400',
    slate: 'from-slate-600/20 to-slate-600/5 border-slate-500/20 text-slate-400',
  };
  const cls = colorMap[color] || colorMap.indigo;
  return (
    <div className={`card bg-gradient-to-br ${cls.split(' ').slice(0,2).join(' ')} border ${cls.split(' ')[3]} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}>
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${cls.split(' ').slice(0,2).join(' ')} border ${cls.split(' ')[3]} mb-3`}>
        <Icon size={22} className={cls.split(' ')[4]} />
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value ?? '—'}</div>
      <div className="text-sm font-medium text-slate-300">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}
