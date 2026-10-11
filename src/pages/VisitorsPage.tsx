import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { VisitorRecord } from '../types/index.ts';
import {
  Users2,
  Search,
  Plus,
  QrCode,
  LogOut,
  Shield,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { VisitorModal } from '../components/common/VisitorModal.tsx';
import { VisitorPassModal } from '../components/common/VisitorPassModal.tsx';

export const VisitorsPage: React.FC = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'checked_out'>('all');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedPassVisitor, setSelectedPassVisitor] = useState<VisitorRecord | null>(null);

  useEffect(() => {
    loadVisitors();
  }, [user]);

  const loadVisitors = async () => {
    setLoading(true);
    try {
      const data = await api.getVisitors();
      setVisitors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (visitorId: string, visitorName: string) => {
    if (!confirm(`Confirm security check-out for visitor ${visitorName}?`)) return;

    try {
      await api.checkOutVisitor(visitorId);
      loadVisitors();
    } catch (err: any) {
      alert(err.message || 'Failed to check-out visitor');
    }
  };

  const filtered = visitors.filter((v) => {
    const matchesSearch =
      v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.passNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.studentRoom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isStaff = user?.role === 'warden' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Hostel Visitor Management & QR Gate Passes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Module E · Visitor check-in registration, digital QR gate passes, student escort tracking, and checkout logs.
          </p>
        </div>

        <button
          onClick={() => setShowCheckInModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Register Visitor Check-In
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search visitor, host student, room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-stretch sm:self-auto">
          {(['all', 'checked_in', 'checked_out'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Visitors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Pass Number</th>
                <th className="py-3 px-4">Visitor Information</th>
                <th className="py-3 px-4">Host Student Resident</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Check-in Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Gate Pass & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading visitor records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No visitor records found.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {v.passNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{v.visitorName}</p>
                      <p className="text-slate-500 font-mono text-[11px]">{v.visitorPhone}</p>
                      <p className="text-[10px] text-slate-400">{v.idProofType}: {v.idProofNumber}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{v.studentName}</p>
                      <p className="text-indigo-600 font-mono font-medium text-[11px]">
                        Room: {v.studentRoom}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={v.purpose}>
                      {v.purpose}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                      {new Date(v.checkInTime).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          v.status === 'checked_in'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPassVisitor(v)}
                          className="px-2.5 py-1 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                          title="View Digital QR Gate Pass"
                        >
                          <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                          QR Pass
                        </button>

                        {isStaff && v.status === 'checked_in' && (
                          <button
                            onClick={() => handleCheckOut(v._id, v.visitorName)}
                            className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                            title="Check-Out Visitor"
                          >
                            <LogOut className="w-3 h-3" />
                            Check-Out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check In Modal */}
      <VisitorModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSuccess={(newVisitor) => {
          setShowCheckInModal(false);
          loadVisitors();
          setSelectedPassVisitor(newVisitor);
        }}
      />

      {/* QR Pass Modal */}
      {selectedPassVisitor && (
        <VisitorPassModal
          visitor={selectedPassVisitor}
          onClose={() => setSelectedPassVisitor(null)}
        />
      )}
    </div>
  );
};
