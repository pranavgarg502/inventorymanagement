import { useEffect, useState, useCallback } from 'react';
import {
  getAssignments, getAssets, getUsers,
  assignAsset, returnAsset, transferAsset
} from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, RotateCcw, ArrowLeftRight, History } from 'lucide-react';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [assignForm, setAssignForm] = useState({ assetId: '', userId: '', notes: '' });
  const [returnForm, setReturnForm] = useState({ assetId: '', notes: '' });
  const [transferForm, setTransferForm] = useState({ assetId: '', toUserId: '', notes: '' });

  // Available assets for assigning
  const [availableAssets, setAvailableAssets] = useState([]);
  // Assigned assets for returning/transferring
  const [assignedAssets, setAssignedAssets] = useState([]);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      getAssignments(activeOnly ? { active: 'true' } : {}),
      getAssets({ status: 'available' }),
      getAssets({ status: 'assigned' }),
      getUsers({ status: 'active' }),
    ])
      .then(([assignRes, availRes, assignedRes, usersRes]) => {
        setAssignments(assignRes.data.data);
        setAvailableAssets(availRes.data.data);
        setAssignedAssets(assignedRes.data.data);
        setAllUsers(usersRes.data.data);
      })
      .catch((err) => toast.error(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [activeOnly]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await assignAsset(assignForm);
      toast.success('Asset assigned successfully');
      setShowAssignModal(false);
      setAssignForm({ assetId: '', userId: '', notes: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally { setSubmitting(false); }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await returnAsset(returnForm);
      toast.success('Asset returned successfully');
      setShowReturnModal(false);
      setReturnForm({ assetId: '', notes: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally { setSubmitting(false); }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await transferAsset(transferForm);
      toast.success('Asset transferred successfully');
      setShowTransferModal(false);
      setTransferForm({ assetId: '', toUserId: '', notes: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assignments</h1>
          <p className="text-slate-400 text-sm mt-1">{assignments.length} record(s) shown</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={() => setShowReturnModal(true)}>
            <RotateCcw size={16} /> Return Asset
          </button>
          <button className="btn-secondary" onClick={() => setShowTransferModal(true)}>
            <ArrowLeftRight size={16} /> Transfer
          </button>
          <button className="btn-primary" onClick={() => setShowAssignModal(true)}>
            <Plus size={16} /> Assign Asset
          </button>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-3">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeOnly ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          onClick={() => setActiveOnly(true)}
        >
          Active
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${!activeOnly ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          onClick={() => setActiveOnly(false)}
        >
          <History size={14} /> Full History
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-700 bg-slate-800/80">
              <tr>
                {['Asset', 'Model', 'Assigned To', 'Department', 'Assigned Date', 'Returned', 'Transfer', 'Status'].map((h) => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">Loading…</td></tr>
              ) : assignments.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">No assignments found</td></tr>
              ) : (
                assignments.map((a) => (
                  <tr key={a._id} className="table-row">
                    <td className="table-cell font-mono text-indigo-400">{a.asset?.assetId || '—'}</td>
                    <td className="table-cell">{a.asset?.model || '—'}</td>
                    <td className="table-cell font-medium">{a.user?.name || '—'}</td>
                    <td className="table-cell text-slate-400">{a.user?.department || '—'}</td>
                    <td className="table-cell text-slate-400">{new Date(a.assignedAt).toLocaleDateString()}</td>
                    <td className="table-cell text-slate-400">{a.returnedAt ? new Date(a.returnedAt).toLocaleDateString() : '—'}</td>
                    <td className="table-cell text-xs text-slate-400">
                      {a.transferredFrom ? `From: ${a.transferredFrom.name}` : '—'}
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={a.isActive ? 'assigned' : 'available'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Asset">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="label">Select Available Asset *</label>
            <select className="select" required value={assignForm.assetId}
              onChange={(e) => setAssignForm({ ...assignForm, assetId: e.target.value })}>
              <option value="">— Choose an asset —</option>
              {availableAssets.map((a) => (
                <option key={a._id} value={a._id}>{a.assetId} — {a.model} ({a.serialNumber})</option>
              ))}
            </select>
            {availableAssets.length === 0 && <p className="text-amber-400 text-xs mt-1">No available assets at this time</p>}
          </div>
          <div>
            <label className="label">Select Employee *</label>
            <select className="select" required value={assignForm.userId}
              onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}>
              <option value="">— Choose an employee —</option>
              {allUsers.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.department})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={assignForm.notes}
              onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting || availableAssets.length === 0}>
              {submitting ? 'Assigning…' : 'Assign Asset'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Modal */}
      <Modal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} title="Return Asset">
        <form onSubmit={handleReturn} className="space-y-4">
          <div>
            <label className="label">Select Assigned Asset *</label>
            <select className="select" required value={returnForm.assetId}
              onChange={(e) => setReturnForm({ ...returnForm, assetId: e.target.value })}>
              <option value="">— Choose an asset —</option>
              {assignedAssets.map((a) => (
                <option key={a._id} value={a._id}>{a.assetId} — {a.model} ({a.serialNumber})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Return Notes</label>
            <textarea className="input" rows={2} value={returnForm.notes}
              onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowReturnModal(false)}>Cancel</button>
            <button type="submit" className="btn-danger" disabled={submitting}>
              {submitting ? 'Returning…' : 'Confirm Return'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Transfer Modal */}
      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Transfer Asset">
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="label">Asset to Transfer *</label>
            <select className="select" required value={transferForm.assetId}
              onChange={(e) => setTransferForm({ ...transferForm, assetId: e.target.value })}>
              <option value="">— Choose an assigned asset —</option>
              {assignedAssets.map((a) => (
                <option key={a._id} value={a._id}>{a.assetId} — {a.model} ({a.serialNumber})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Transfer To (Employee) *</label>
            <select className="select" required value={transferForm.toUserId}
              onChange={(e) => setTransferForm({ ...transferForm, toUserId: e.target.value })}>
              <option value="">— Choose target employee —</option>
              {allUsers.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.department})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Transfer Notes</label>
            <textarea className="input" rows={2} value={transferForm.notes}
              onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowTransferModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Transferring…' : 'Confirm Transfer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
