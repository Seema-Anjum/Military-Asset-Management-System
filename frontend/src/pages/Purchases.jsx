import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import API from '../services/api';

export const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    baseId: '',
    equipmentTypeId: '',
    quantity: ''
  });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const response = await API.get('/purchases');
      setPurchases(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ baseId: '', equipmentTypeId: '', quantity: '' });
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
      await API.post('/purchases', formData);
      setStatusMsg({ type: 'success', text: 'Purchase recorded successfully!' });
      await loadPurchases();
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 800);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Purchase logging failed.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Asset Purchases</h1>
          <p className="text-xs text-slate-400 mt-1">Log incoming stock and review purchase history</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add Purchase
        </button>
      </div>

      {/* Purchase History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="font-bold text-white text-base">Purchase History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Base</th>
                <th className="px-6 py-3">Equipment</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Recorded By</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-slate-500">
                    No purchases recorded yet.
                  </td>
                </tr>
              )}
              {purchases.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-3 font-mono text-xs">#{item.id}</td>
                  <td className="px-6 py-3">{item.base_name}</td>
                  <td className="px-6 py-3">{item.equipment_name}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-bold">{item.quantity}</td>
                  <td className="px-6 py-3">{item.recorded_by || '—'}</td>
                  <td className="px-6 py-3 text-xs text-slate-400">
                    {new Date(item.purchase_date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Log New Purchase</h2>
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
                {submitting ? 'Submitting...' : 'Submit Purchase'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};