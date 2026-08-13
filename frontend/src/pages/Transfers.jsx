import React, { useState, useEffect } from 'react';
import API from '../services/api';

export const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [formData, setFormData] = useState({
    sourceBaseId: '',
    destinationBaseId: '',
    equipmentTypeId: '',
    quantity: ''
  });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    try {
      const response = await API.get('/transfers');
      setTransfers(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    try {
      await API.post('/transfers', formData);
      setStatusMsg({ type: 'success', text: 'Transfer logged successfully!' });
      setFormData({ sourceBaseId: '', destinationBaseId: '', equipmentTypeId: '', quantity: '' });
      loadTransfers();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Transfer failed.' });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Cross-Base Asset Transfers</h1>
        <p className="text-xs text-slate-400 mt-1">Initiate and review movement of assets between bases</p>
      </div>

      {/* Transfer Form */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xl">
        <h2 className="text-base font-bold text-white mb-4">Initiate Asset Transfer</h2>

        {statusMsg.text && (
          <div className={`mb-4 p-3 rounded-lg text-xs border ${
            statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Source Base ID</label>
              <input
                type="number"
                required
                value={formData.sourceBaseId}
                onChange={(e) => setFormData({ ...formData, sourceBaseId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5"
                placeholder="e.g. 1"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Destination Base ID</label>
              <input
                type="number"
                required
                value={formData.destinationBaseId}
                onChange={(e) => setFormData({ ...formData, destinationBaseId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5"
                placeholder="e.g. 2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Submit Transfer Request
          </button>
        </form>
      </div>

      {/* Movement Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="font-bold text-white text-base">Historical Asset Transfers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Destination</th>
                <th className="px-6 py-3">Equipment</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transfers.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-3 font-mono text-xs">#{item.id}</td>
                  <td className="px-6 py-3">{item.source_base_name}</td>
                  <td className="px-6 py-3">{item.destination_base_name}</td>
                  <td className="px-6 py-3">{item.equipment_name}</td>
                  <td className="px-6 py-3 font-bold">{item.quantity}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};