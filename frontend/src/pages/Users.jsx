import { useEffect, useState, useCallback } from 'react';
import { getUsers, createUser, updateUser } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import toast from 'react-hot-toast';
import { Plus, RefreshCw } from 'lucide-react';

const INITIAL_FORM = { name: '', email: '', department: '', status: 'active' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getUsers({ search })
      .then((res) => setUsers(res.data.data))
      .catch((err) => toast.error(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAdd = () => { setEditUser(null); setForm(INITIAL_FORM); setShowModal(true); };
  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, department: user.department, status: user.status });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editUser) {
        await updateUser(editUser._id, form);
        toast.success('User updated');
      } else {
        await createUser(form);
        toast.success('User added');
      }
      setShowModal(false);
      fetchUsers();
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
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} total employees</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="flex items-center gap-3">
        <SearchBar placeholder="Search name, email, dept…" onSearch={setSearch} />
        <button className="btn-secondary ml-auto" onClick={fetchUsers}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-700 bg-slate-800/80">
              <tr>
                {['User ID', 'Name', 'Email', 'Department', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No employees found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="table-row">
                    <td className="table-cell font-mono text-indigo-400 font-semibold">{user.userId}</td>
                    <td className="table-cell font-medium text-slate-200">{user.name}</td>
                    <td className="table-cell text-slate-400">{user.email}</td>
                    <td className="table-cell">
                      <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-md">{user.department}</span>
                    </td>
                    <td className="table-cell"><StatusBadge status={user.status} /></td>
                    <td className="table-cell text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <button className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                        onClick={() => openEdit(user)}>Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editUser ? 'Edit Employee' : 'Add New Employee'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input className="input" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Email *</label>
              <input className="input" type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Department *</label>
              <input className="input" required value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : editUser ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
