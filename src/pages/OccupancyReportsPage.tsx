import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { OccupancyStats } from '../types/index.ts';
import {
  PieChart,
  Building,
  BedDouble,
  Printer,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

export const OccupancyReportsPage: React.FC = () => {
  const [stats, setStats] = useState<OccupancyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getOccupancyStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !stats) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Calculating live occupancy intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Hostel Occupancy Intelligence & Capacity Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Module F · Live bed census, hostel block utilization rates, and institutional capacity distribution.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="no-print px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          Export / Print Report
        </button>
      </div>

      {/* Primary KPI Row (Tabular Numerals) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Hostel Residence Halls</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            {stats.totalHostels}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Institutional blocks</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Total Rooms</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            {stats.totalRooms}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">All campus blocks</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Total Capacity Beds</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            {stats.totalBeds}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Maximum residents</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Occupied Beds</span>
          <p className="text-2xl font-bold font-mono text-indigo-700 mt-2 tabular-nums">
            {stats.occupiedBeds}
          </p>
          <span className="text-[11px] text-indigo-600 mt-1 font-semibold block">
            {stats.occupancyRate}% Utilization
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Vacant Beds Available</span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-2 tabular-nums">
            {stats.availableBeds}
          </p>
          <span className="text-[11px] text-emerald-600 mt-1 block">Ready for admission</span>
        </div>
      </div>

      {/* Residence Hall Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Hostel-Wise Bed Census & Utilization
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Hostel Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Residence Type</th>
                <th className="py-3 px-4 text-right">Rooms</th>
                <th className="py-3 px-4 text-right">Total Beds</th>
                <th className="py-3 px-4 text-right">Occupied Beds</th>
                <th className="py-3 px-4 text-right">Available Beds</th>
                <th className="py-3 px-4 text-right">Occupancy %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.hostelBreakdown.map((h) => (
                <tr key={h.hostelId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {h.hostelName}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-600">
                    {h.code}
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-700">
                    {h.type}
                  </td>
                  <td className="py-3 px-4 font-mono text-right text-slate-700 tabular-nums">
                    {h.totalRooms}
                  </td>
                  <td className="py-3 px-4 font-mono text-right font-semibold text-slate-900 tabular-nums">
                    {h.totalBeds}
                  </td>
                  <td className="py-3 px-4 font-mono text-right text-indigo-700 font-semibold tabular-nums">
                    {h.occupiedBeds}
                  </td>
                  <td className="py-3 px-4 font-mono text-right text-emerald-700 font-semibold tabular-nums">
                    {h.availableBeds}
                  </td>
                  <td className="py-3 px-4 font-mono text-right font-bold text-slate-900 tabular-nums">
                    {h.occupancyRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Type Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Room Configuration & Sharing Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {stats.roomTypeBreakdown.map((rt) => {
            const utilization = rt.totalBeds > 0 ? Math.round((rt.occupied / rt.totalBeds) * 100) : 0;
            return (
              <div key={rt.type} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-xs font-semibold capitalize text-slate-700 block">
                  {rt.type} Rooms ({rt.count})
                </span>
                <p className="text-xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
                  {rt.occupied} / {rt.totalBeds} Beds
                </p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${utilization}%` }} />
                </div>
                <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                  {utilization}% Occupied
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
