import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { MaintenanceRequest } from '../types/index.ts';
import {
  Wrench,
  Search,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  Filter,
} from 'lucide-react';
import { ComplaintModal } from '../components/common/ComplaintModal.tsx';

export const MaintenancePage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getMaintenance();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, currentStatus: string) => {
    const nextStatusMap: Record<string, string> = {
      submitted: 'assigned',
      assigned: 'in_progress',
      in_progress: 'resolved',
    };
    const nextStatus = nextStatusMap[currentStatus] || 'resolved';

    const assignedTo =
      currentStatus === 'submitted'
        ? prompt('Assign to technician / contractor:', 'Campus Estate Technician')
        : undefined;

    if (currentStatus === 'submitted' && assignedTo === null) return;

    try {
      await api.updateMaintenanceStatus(ticketId, {
        status: nextStatus,
        assignedTo: assignedTo || undefined,
        remarks: `Updated to ${nextStatus} by ${user?.name}`,
      });
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket status');
    }
  };

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isStaff = user?.role === 'warden' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Maintenance Requests & Facility Repair Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Module D · Electrical, plumbing, carpentry, Wi-Fi, and facility maintenance dispatch workflow.
          </p>
        </div>

        <button
          onClick={() => setShowComplaintModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Lodge New Complaint
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ticket, room, issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-stretch sm:self-auto overflow-x-auto">
          {['all', 'submitted', 'assigned', 'in_progress', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize whitespace-nowrap ${
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

      {/* Maintenance Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Hostel & Room</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Status</th>
                {isStaff && <th className="py-3 px-4 text-right">Workflow</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading maintenance requests...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No maintenance tickets match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">Room {t.roomNumber}</p>
                      <p className="text-[11px] text-slate-500">{t.hostelName}</p>
                      <p className="text-[11px] text-slate-400 font-medium">By: {t.studentName}</p>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-800">{t.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{t.description}</p>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-700">
                      {t.category}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          t.priority === 'urgent'
                            ? 'bg-red-50 text-red-700'
                            : t.priority === 'high'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {t.assignedTo || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          t.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : t.status === 'in_progress'
                            ? 'bg-indigo-50 text-indigo-700'
                            : t.status === 'assigned'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    {isStaff && (
                      <td className="py-3 px-4 text-right">
                        {t.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateStatus(t._id, t.status)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-medium transition-colors whitespace-nowrap"
                          >
                            {t.status === 'submitted'
                              ? 'Assign'
                              : t.status === 'assigned'
                              ? 'Start Work'
                              : 'Mark Resolved'}
                          </button>
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

      {/* Complaint Modal */}
      <ComplaintModal
        isOpen={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        onSuccess={() => {
          setShowComplaintModal(false);
          loadRequests();
        }}
      />
    </div>
  );
};
