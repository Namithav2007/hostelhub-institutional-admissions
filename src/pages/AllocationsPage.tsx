import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { RoomAllocation } from '../types/index.ts';
import {
  BedDouble,
  Search,
  Plus,
  ArrowRightLeft,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { AllocationModal } from '../components/common/AllocationModal.tsx';
import { TransferModal } from '../components/common/TransferModal.tsx';

export const AllocationsPage: React.FC = () => {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<RoomAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'transferred' | 'vacated'>('active');
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedForTransfer, setSelectedForTransfer] = useState<RoomAllocation | null>(null);

  useEffect(() => {
    loadAllocations();
  }, [user]);

  const loadAllocations = async () => {
    setLoading(true);
    try {
      const data = await api.getAllocations();
      setAllocations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVacate = async (allocId: string, studentName: string, roomNumber: string) => {
    const remarks = prompt(
      `Confirm vacating student ${studentName} from Room ${roomNumber}. Enter vacating reason:`,
      'Graduated / Term checkout cleared by Warden'
    );
    if (remarks === null) return;

    try {
      await api.vacateBed(allocId, { remarks });
      loadAllocations();
    } catch (err: any) {
      alert(err.message || 'Failed to vacate bed');
    }
  };

  const filtered = allocations.filter((a) => {
    const matchesSearch =
      a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.studentRegisterNo.toLowerCase().includes(search.toLowerCase()) ||
      a.hostelName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isStaff = user?.role === 'warden' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Room Allocations & Bed Transfers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Module B · Active student residential allocations, capacity constraints, transfers, and checkout records.
          </p>
        </div>

        {isStaff && (
          <button
            onClick={() => setShowAllocateModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Bed Allocation
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student, room, reg no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-stretch sm:self-auto">
          {(['active', 'transferred', 'vacated', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Allocations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Resident Student</th>
                <th className="py-3 px-4">Register No</th>
                <th className="py-3 px-4">Hostel & Room</th>
                <th className="py-3 px-4">Bed</th>
                <th className="py-3 px-4">Allocated Date</th>
                <th className="py-3 px-4">Status</th>
                {isStaff && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading allocations...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No room allocations match your query.
                  </td>
                </tr>
              ) : (
                filtered.map((alloc) => (
                  <tr key={alloc._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {alloc.studentName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {alloc.studentRegisterNo}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{alloc.roomNumber}</p>
                      <p className="text-[11px] text-slate-500">{alloc.hostelName}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-indigo-700">
                      {alloc.bedNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                      {alloc.allocatedDate}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          alloc.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : alloc.status === 'transferred'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {alloc.status}
                      </span>
                      {alloc.remarks && (
                        <p className="text-[10px] text-slate-400 mt-1 max-w-xs truncate" title={alloc.remarks}>
                          {alloc.remarks}
                        </p>
                      )}
                    </td>
                    {isStaff && (
                      <td className="py-3 px-4 text-right">
                        {alloc.status === 'active' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedForTransfer(alloc)}
                              className="px-2.5 py-1 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors flex items-center gap-1 font-medium"
                              title="Transfer Room"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              Transfer
                            </button>
                            <button
                              onClick={() => handleVacate(alloc._id, alloc.studentName, alloc.roomNumber)}
                              className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1 font-medium"
                              title="Vacate Bed"
                            >
                              <LogOut className="w-3 h-3" />
                              Vacate
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocation Modal */}
      <AllocationModal
        isOpen={showAllocateModal}
        onClose={() => setShowAllocateModal(false)}
        onSuccess={() => {
          setShowAllocateModal(false);
          loadAllocations();
        }}
      />

      {/* Transfer Modal */}
      {selectedForTransfer && (
        <TransferModal
          allocation={selectedForTransfer}
          onClose={() => setSelectedForTransfer(null)}
          onSuccess={() => {
            setSelectedForTransfer(null);
            loadAllocations();
          }}
        />
      )}
    </div>
  );
};
