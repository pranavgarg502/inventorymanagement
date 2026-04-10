import { useEffect, useState, useCallback } from 'react';
import { getLogs, getAssets, createLog, updateLog } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import toast from 'react-hot-toast';
import { Plus, RefreshCw } from 'lucide-react';

const INITIAL_FORM = {
  assetId: '', issue: '', cost: '', date: new Date().toISOString().slice(0, 10),
  technician: '', resolution: '', status: 'open',
};

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLog, setEditLog] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      getLogs(statusFilter ? { status: statusFilter } : {}),
      getAssets(),
    ])
      .then(([logsRes, assetsRes]) => {
        setLogs(logsRes.data.data);
        setAssets(assetsRes.data.data);
      })
      .catch((err) => toast.error(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditLog(null); setForm(INITIAL_FORM); setShowModal(true); };
  const openEdit = (log) => {
    setEditLog(log);
    setForm({
      assetId: log.asset?._id || '', issue: log.issue, cost: log.cost || '',
      date: log.date?.slice(0, 10) || '', technician: log.technician || '',
      resolution: log.resolution || '', status: log.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editLog) {
        await updateLog(editLog._id, { ...form, asset: form.assetId });
        toast.success('Log updated');
      } else {
        await createLog(form);
        toast.success('Maintenance log added');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally { setSubmitting(false); }
  };

  const totalCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Maintenance Logs</h1>
          <p className="text-slate-400 text-sm mt-1">
            {logs.length} log(s) · Total cost:{' '}
            <span className="text-amber-400 font-semibold">${totalCost.toLocaleString()}</span>
          </p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Log
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {['', 'open', 'in-progress', 'resolved'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <button className="btn-secondary ml-auto" onClick={fetchData}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-700 bg-slate-800/80">
              <tr>
                {['Asset', 'Issue', 'Technician', 'Date', 'Cost', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading…</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No maintenance logs found</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="table-row">
                    <td className="table-cell">
                      <div className="font-mono text-indigo-400 text-xs">{log.asset?.assetId}</div>
                      <div className="text-slate-400 text-xs">{log.asset?.model}</div>
                    </td>
                    <td className="table-cell max-w-xs">
                      <div className="font-medium text-slate-200">{log.issue}</div>
                      {log.resolution && <div className="text-xs text-slate-500 mt-1">✓ {log.resolution}</div>}
                    </td>
                    <td className="table-cell text-slate-400">{log.technician || '—'}</td>
                    <td className="table-cell text-slate-400">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <span className={log.cost > 0 ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                        ${(log.cost || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="table-cell"><StatusBadge status={log.status} /></td>
                    <td className="table-cell">
                      <button className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                        onClick={() => openEdit(log)}>Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editLog ? 'Edit Maintenance Log' : 'Add Maintenance Log'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Asset *</label>
              <select className="select" required value={form.assetId}
                onChange={(e) => setForm({ ...form, assetId: e.target.value })}>
                <option value="">— Select Asset —</option>
                {assets.map((a) => (
                  <option key={a._id} value={a._id}>{a.assetId} — {a.model} ({a.serialNumber})</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Issue Description *</label>
              <textarea className="input" rows={2} required value={form.issue}
                onChange={(e) => setForm({ ...form, issue: e.target.value })} />
            </div>
            <div>
              <label className="label">Date *</label>
              <input className="input" type="date" required value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="label">Cost ($)</label>
              <input className="input" type="number" min="0" value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </div>
            <div>
              <label className="label">Technician</label>
              <input className="input" value={form.technician}
                onChange={(e) => setForm({ ...form, technician: e.target.value })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Resolution Notes</label>
              <textarea className="input" rows={2} value={form.resolution}
                onChange={(e) => setForm({ ...form, resolution: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : editLog ? 'Update Log' : 'Add Log'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
