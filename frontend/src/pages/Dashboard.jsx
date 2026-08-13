import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { StatCard } from '../components/StatCard';
import { NetMoveModal } from '../components/NetMoveModal';
import { Box, ArrowRightLeft, UserCheck, Flame, Archive } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await API.get('/assets/dashboard-metrics');
      setMetrics(response.data.metrics);
    } catch (err) {
      console.error("Failed to load metrics", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Loading Dashboard Metrics...</div>;
  }

  const chartData = [
    { name: 'Purchases', value: parseInt(metrics?.total_purchases || 0, 10) },
    { name: 'Transfers In', value: parseInt(metrics?.total_transfers_in || 0, 10) },
    { name: 'Transfers Out', value: parseInt(metrics?.total_transfers_out || 0, 10) },
    { name: 'Assigned', value: parseInt(metrics?.total_assigned || 0, 10) },
    { name: 'Expended', value: parseInt(metrics?.total_expended || 0, 10) }
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Asset Inventory Overview</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time balances across registered military locations</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Purchases (Inflow)"
          value={metrics?.total_purchases}
          icon={Box}
          color="blue"
        />
        <StatCard
          title="Net Movement"
          value={metrics?.net_movement}
          icon={ArrowRightLeft}
          color="emerald"
          clickable={true}
          onClick={() => setIsModalOpen(true)}
        />
        <StatCard
          title="Active Assignments"
          value={metrics?.total_assigned}
          icon={UserCheck}
          color="amber"
        />
        <StatCard
          title="Closing Balance"
          value={metrics?.closing_balance}
          icon={Archive}
          color="indigo"
        />
      </div>

      {/* Visual Analytics */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-base font-bold text-white mb-6">Movement & Consumption Dynamics</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <NetMoveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        metrics={metrics}
      />
    </div>
  );
};