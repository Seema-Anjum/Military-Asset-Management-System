import React, { useState, useEffect } from 'react';
import { Plus, X, Undo2 } from 'lucide-react';
import API from '../services/api';

export const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    baseId: '',
    equipmentTypeId: '',
    quantity: '',
    assignedTo: ''
  });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [returningId, setReturningId] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const response = await API.get('/assignments');
      setAssignments(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ baseId: '', equipmentTypeId: '', quantity: '', assignedTo: '' });
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
      await API.post('/assignments', formData);
      setStatusMsg({ type: 'success', text: 'Assignment recorded successfully!' });
      await loadAssignments();
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 800);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Assignment logging failed.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (id) => {
    setReturningId(id);
    try {
      await API.patch(`/assignments/${id}/return`);
      await loadAssignments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to mark as returned.');
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Personnel Assignments</h1>
          <p className="text-xs text-slate-400 mt-1">Assign equipment to personnel and track returns</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add Assignment
        </button>
      </div>

      {/* Assignment History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="font-bold text-white text-base">Assignment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Base</th>
                <th className="px-6 py-3">Equipment</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Assigned To</th>
                <th className="px-6 py-3">Assigned By</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-6 text-center text-slate-500">
                    No assignments recorded yet.
                  </td>
                </tr>
              )}
              {assignments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-3 font-mono text-xs">#{item.id}</td>
                  <td className="px-6 py-3">{item.base_name}</td>
                  <td className="px-6 py-3">{item.equipment_name}</td>
                  <td className="px-6 py-3 font-bold">{item.quantity}</td>
                  <td className="px-6 py-3">{item.assigned_to}</td>
                  <td className="px-6 py-3">{item.assigned_by || '—'}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs border ${
                        item.status === 'ACTIVE'
                          ? 'bg-blue-950 text-blue-400 border-blue-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs text-slate-400">
                    {new Date(item.assigned_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    {item.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleReturn(item.id)}
                        disabled={returningId === item.id}
                        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50 border border-amber-800/60 hover:border-amber-700 px-2 py-1 rounded-lg transition"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        {returningId === item.id ? 'Returning...' : 'Mark Returned'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Assign Equipment</h2>
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
                <label className="block text-slate-400 text-xs font-semibold mb-1">Assigned To</label>
                <input
                  type="text"
                  required
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5"
                  placeholder="e.g. Sgt. Rajesh Kumar"
                />
              </div>

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

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Equipment Type ID</label>
                <input
                  type="number"
                  required
                  value={formData.equipmentTypeId}
                  onChange={(e) => setFormData({ ...formData, equipmentTypeId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5"
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5"
                  placeholder="Quantity"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};