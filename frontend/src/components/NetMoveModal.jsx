import React from 'react';
import { X, ArrowDownRight, ArrowUpRight, ShoppingCart } from 'lucide-react';

export const NetMoveModal = ({ isOpen, onClose, metrics }) => {
  if (!isOpen) return null;

  const purchases = parseInt(metrics?.total_purchases || 0, 10);
  const transfersIn = parseInt(metrics?.total_transfers_in || 0, 10);
  const transfersOut = parseInt(metrics?.total_transfers_out || 0, 10);
  const netMovement = parseInt(metrics?.net_movement || 0, 10);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Net Movement Breakdown</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-sm">
          <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/40">
            <div className="flex items-center space-x-2.5">
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300">Purchases (+)</span>
            </div>
            <span className="font-semibold text-white font-mono">+{purchases}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/40">
            <div className="flex items-center space-x-2.5">
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">Transfers In (+)</span>
            </div>
            <span className="font-semibold text-emerald-400 font-mono">+{transfersIn}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/40">
            <div className="flex items-center space-x-2.5">
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              <span className="text-slate-300">Transfers Out (-)</span>
            </div>
            <span className="font-semibold text-rose-400 font-mono">-{transfersOut}</span>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center px-1">
            <span className="font-bold text-white">Total Net Movement:</span>
            <span className={`text-base font-bold font-mono ${netMovement >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netMovement > 0 ? `+${netMovement}` : netMovement}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-slate-800 text-slate-200 hover:bg-slate-700 font-medium py-2.5 rounded-lg transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};