
import React, { useState, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';
import API from '../services/api';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'LOGISTICS_OFFICER',
    baseId: ''
  });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await API.get('/auth/users');
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', role: 'LOGISTICS_OFFICER', baseId: '' });
    setStatusMsg({ type: '', text: '' });
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        baseId: formData.baseId ? parseInt(formData.baseId, 10) : null
      };
      await API.post('/auth/register', payload);
      setStatusMsg({ type: 'success', text: 'User registered successfully!' });
      await loadUsers();
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 800);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'User registration failed.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const roleBadgeStyle = (role) => {
    if (role === 'ADMIN') return 'bg-purple-950 text-purple-400 border-purple-800';
    if (role === 'BASE_COMMANDER') return 'bg-blue-950 text-blue-400 border-blue-800';
    return 'bg-emerald-950 text-emerald-400 border-emerald-800';
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-xs text-slate-400 mt-1">Register new personnel accounts and manage portal access</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <UserPlus className="w-4 h-4" />
          Register User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="font-bold text-white text-base">Registered Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Base</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-3 font-mono text-xs">#{item.id}</td>
                  <td className="px-6 py-3 font-medium text-white">{item.username}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs border ${roleBadgeStyle(item.role)}`}>
                      {item.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">{item.base_name || 'All Bases'}</td>
                  <td className="px-6 py-3 text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Register New User</h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {statusMsg.text && (
              <div
                className={`mb-4 p-3 rounded-lg text-xs border ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5"
                  placeholder="e.g. logistics_officer_2"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="BASE_COMMANDER">BASE_COMMANDER</option>
                  <option value="LOGISTICS_OFFICER">LOGISTICS_OFFICER</option>
                </select>
              </div>

              {formData.role !== 'ADMIN' && (
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">Base ID</label>
                  <input
                    type="number"
                    required
                    value={formData.baseId}
                    onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5"
                    placeholder="e.g. 1"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {submitting ? 'Registering...' : 'Register User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
