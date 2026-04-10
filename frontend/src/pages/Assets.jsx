import { useEffect, useState, useCallback } from 'react';
import { getAssets, createAsset, updateAsset } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import toast from 'react-hot-toast';
import { Plus, Filter, RefreshCw } from 'lucide-react';

const INITIAL_FORM = {
  serialNumber: '', model: '', brand: '', purchaseDate: '', purchaseCost: '', condition: 'good', notes: ''
};

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssets = useCallback(() => {
    setLoading(true);
    getAssets({ search, status: statusFilter })
      .then((res) => setAssets(res.data.data))
      .catch((err) => toast.error(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const openAdd = () => { setEditAsset(null); setForm(INITIAL_FORM); setShowModal(true); };
  const openEdit = (asset) => {
    setEditAsset(asset);
    setForm({
      serialNumber: asset.serialNumber, model: asset.model, brand: asset.brand || '',
      purchaseDate: asset.purchaseDate?.slice(0, 10) || '', purchaseCost: asset.purchaseCost || '',
      condition: asset.condition, notes: asset.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editAsset) {
        await updateAsset(editAsset._id, form);
        toast.success('Asset updated');
      } else {
        await createAsset(form);
        toast.success('Asset added');
      }
      setShowModal(false);
      fetchAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assets</h1>
          <p className="text-slate-400 text-sm mt-1">{assets.length} total assets</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar placeholder="Search serial, model…" onSearch={setSearch} />
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          {['', 'available', 'assigned', 'repair', 'retired'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn-secondary ml-auto" onClick={fetchAssets}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-700 bg-slate-800/80">
              <tr>
                {['Asset ID', 'Serial Number', 'Model / Brand', 'Purchase Date', 'Condition', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading…</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No assets found</td></tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset._id} className="table-row">
                    <td className="table-cell font-mono text-indigo-400 font-semibold">{asset.assetId}</td>
                    <td className="table-cell font-mono text-slate-300">{asset.serialNumber}</td>
                    <td className="table-cell">
                      <div className="font-medium text-slate-200">{asset.model}</div>
                      {asset.brand && <div className="text-xs text-slate-500">{asset.brand}</div>}
                    </td>
                    <td className="table-cell text-slate-400">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '—'}</td>
                    <td className="table-cell"><StatusBadge status={asset.condition} /></td>
                    <td className="table-cell"><StatusBadge status={asset.status} /></td>
                    <td className="table-cell">
                      <button
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                        onClick={() => openEdit(asset)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editAsset ? 'Edit Asset' : 'Add New Asset'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Serial Number *</label>
              <input className="input" required value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
            </div>
            <div>
              <label className="label">Model *</label>
              <input className="input" required value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
            <div>
              <label className="label">Brand</label>
              <input className="input" value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div>
              <label className="label">Purchase Date *</label>
              <input className="input" type="date" required value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Purchase Cost ($)</label>
              <input className="input" type="number" min="0" value={form.purchaseCost}
                onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })} />
            </div>
            <div>
              <label className="label">Condition</label>
              <select className="select" value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                <option value="good">Good</option>
                <option value="damaged">Damaged</option>
                <option value="repair">Repair</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={3} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : editAsset ? 'Update Asset' : 'Add Asset'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
