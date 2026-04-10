import { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { Monitor, Users, CheckCircle, Wrench, XCircle, DollarSign, ArrowLeftRight } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading dashboard…</div>;
  if (error) return <div className="text-red-400 p-6">Error: {error}</div>;
  if (!data) return null;

  const { assets, users, maintenanceCost, recentAssignments } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of your IT asset inventory</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Monitor} label="Total Assets" value={assets.total} color="indigo" />
        <StatCard icon={CheckCircle} label="Available" value={assets.available} color="emerald" sub={`${Math.round((assets.available / Math.max(assets.total, 1)) * 100)}% free`} />
        <StatCard icon={ArrowLeftRight} label="Assigned" value={assets.assigned} color="blue" />
        <StatCard icon={Wrench} label="In Repair" value={assets.repair} color="amber" />
        <StatCard icon={XCircle} label="Retired" value={assets.retired} color="slate" />
        <StatCard icon={Users} label="Total Employees" value={users.total} color="indigo" sub={`${users.active} active`} />
        <StatCard icon={DollarSign} label="Maintenance Cost" value={`$${maintenanceCost.toLocaleString()}`} color="red" />
      </div>

      {/* Recent Assignments */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Active Assignments</h2>
        {recentAssignments.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">No active assignments</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700">
                <tr>
                  {['Asset', 'Model', 'Assigned To', 'Department', 'Date', 'Status'].map((h) => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentAssignments.map((a) => (
                  <tr key={a._id} className="table-row">
                    <td className="table-cell font-mono text-indigo-400">{a.asset?.assetId}</td>
                    <td className="table-cell">{a.asset?.model}</td>
                    <td className="table-cell font-medium">{a.user?.name}</td>
                    <td className="table-cell text-slate-400">{a.user?.department}</td>
                    <td className="table-cell text-slate-400">{new Date(a.assignedAt).toLocaleDateString()}</td>
                    <td className="table-cell"><StatusBadge status="assigned" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
